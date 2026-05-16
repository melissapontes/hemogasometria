import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const TO_EMAIL = 'melissa.pontes@gmail.com'
const FROM_EMAIL = 'onboarding@resend.dev'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, stack, context, url, userAgent, userId, timestamp } = await req.json()

    const html = `
      <h2 style="color:#cc0000">Bug Report — GasoVet</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:6px;font-weight:bold">Erro</td><td style="padding:6px">${message}</td></tr>
        <tr><td style="padding:6px;font-weight:bold">URL</td><td style="padding:6px">${url}</td></tr>
        <tr><td style="padding:6px;font-weight:bold">Usuário</td><td style="padding:6px">${userId ?? 'não autenticado'}</td></tr>
        <tr><td style="padding:6px;font-weight:bold">Horário</td><td style="padding:6px">${timestamp}</td></tr>
        <tr><td style="padding:6px;font-weight:bold">Dispositivo</td><td style="padding:6px">${userAgent}</td></tr>
        ${context ? `<tr><td style="padding:6px;font-weight:bold">Contexto</td><td style="padding:6px"><pre style="white-space:pre-wrap">${context}</pre></td></tr>` : ''}
      </table>
      ${stack ? `<h3>Stack trace</h3><pre style="background:#f4f4f4;padding:12px;white-space:pre-wrap;font-size:12px">${stack}</pre>` : ''}
    `.trim()

    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [TO_EMAIL],
          subject: `[GasoVet Bug] ${String(message).slice(0, 80)}`,
          html,
        }),
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
