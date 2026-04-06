import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();
    const body = req.method !== "GET" ? await req.json() : null;

    // POST /n8n-webhook - create or update lead
    if (action === "lead" && req.method === "POST") {
      const { name, email, phone, company, position, source, status, urgency, score, notes, tags } = body;
      if (!name) {
        return new Response(JSON.stringify({ error: "name is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase.from("leads").insert({
        name, email, phone, company, position,
        source: source || "whatsapp",
        status: status || "novo",
        urgency: urgency || "baixa",
        score: score || 0,
        notes: notes || "",
        tags: tags || [],
        last_contact: new Date().toISOString(),
      }).select().single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, lead: data }), {
        status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /n8n-webhook/message - add message to conversation
    if (action === "message" && req.method === "POST") {
      const { lead_id, content, sender, lead_name } = body;
      if (!lead_id || !content) {
        return new Response(JSON.stringify({ error: "lead_id and content are required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find or create conversation
      let { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("lead_id", lead_id)
        .eq("status", "ativa")
        .maybeSingle();

      if (!conv) {
        const convName = lead_name || "Lead";
        const { data: newConv, error: convErr } = await supabase
          .from("conversations")
          .insert({ lead_id, lead_name: convName, status: "ativa" })
          .select()
          .single();
        if (convErr) throw convErr;
        conv = newConv;
      }

      // Insert message
      const { data: msg, error: msgErr } = await supabase.from("messages").insert({
        conversation_id: conv.id,
        lead_id,
        content,
        sender: sender || "lead",
      }).select().single();
      if (msgErr) throw msgErr;

      // Update conversation last_message
      await supabase.from("conversations")
        .update({ last_message: new Date().toISOString() })
        .eq("id", conv.id);

      // Update lead last_contact
      await supabase.from("leads")
        .update({ last_contact: new Date().toISOString() })
        .eq("id", lead_id);

      return new Response(JSON.stringify({ success: true, message: msg, conversation_id: conv.id }), {
        status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /n8n-webhook/event - create schedule event
    if (action === "event" && req.method === "POST") {
      const { title, event_date, event_time, type, lead_name, lead_id } = body;
      if (!title || !event_date || !event_time) {
        return new Response(JSON.stringify({ error: "title, event_date, event_time are required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase.from("schedule_events").insert({
        title, event_date, event_time, type: type || "meeting", lead_name, lead_id,
      }).select().single();
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, event: data }), {
        status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PATCH /n8n-webhook/lead-update - update lead status/score
    if (action === "lead-update" && req.method === "PATCH") {
      const { id, ...updates } = body;
      if (!id) {
        return new Response(JSON.stringify({ error: "id is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase.from("leads").update(updates).eq("id", id).select().single();
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, lead: data }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action. Use: /lead, /message, /event, /lead-update" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
