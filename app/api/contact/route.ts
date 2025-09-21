import { NextResponse } from 'next/server'

type ContactPayload = {
  name: string
  email: string
  message: string
}

export async function POST(req: Request) {
  try {
    const data: ContactPayload = await req.json()
    const apiKey = process.env.SENDGRID_API_KEY
    const recipient = process.env.CONTACT_RECIPIENT || 'bryondevelops@gmail.com'
    const senderEmail = process.env.SENDGRID_SENDER_EMAIL
    const senderName = process.env.SENDGRID_SENDER_NAME || 'Website Contact'

    // Require API key and a verified sender email in production.
    if (!apiKey || !senderEmail) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[contact] SENDGRID_API_KEY or SENDGRID_SENDER_EMAIL not set — simulating send in development')
        console.info('[contact] payload:', JSON.stringify(data))
        return NextResponse.json({ ok: true, simulated: true })
      }

      return NextResponse.json({ error: 'Mail provider not configured (missing SENDGRID_API_KEY or SENDGRID_SENDER_EMAIL)' }, { status: 500 })
    }

    const payload = {
      personalizations: [{ to: [{ email: recipient }] }],
      from: { email: senderEmail, name: senderName },
      subject: `Website contact from ${data.name}`,
      content: [{ type: 'text/plain', value: data.message }],
      reply_to: { email: data.email, name: data.name },
    }

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('[contact] SendGrid responded with non-OK status', res.status, body)

      let details = body
      if (res.status === 403) {
        details = `${body} — SendGrid 403: the 'from' address must be a verified Sender Identity. See https://sendgrid.com/docs/for-developers/sending-email/sender-identity/`
      }

      return NextResponse.json({ error: 'Failed to send email', details }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message || 'Unknown error' }, { status: 500 })
  }
}
