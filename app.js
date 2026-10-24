import express from 'express';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'node:url';

const escapeHtml = value => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function createApp({ env = process.env, sendMail } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  app.use(express.urlencoded({ extended: false, limit: '16kb' }));
  const preview = env.MAIL_MODE === 'preview';
  const configured = env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.MAIL_TO;
  const transport = configured ? nodemailer.createTransport({
    host: env.SMTP_HOST, port: Number(env.SMTP_PORT || 587),
    secure: Number(env.SMTP_PORT || 587) === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000
  }) : null;
  const deliver = sendMail || (transport && (mail => transport.sendMail(mail)));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', mailMode: preview ? 'preview' : 'smtp' }));
  for (const kind of ['hero', 'contact']) {
    app.all([`/api/${kind}`, `/send-${kind}-form.php`], async (req, res) => {
      if (req.method === 'OPTIONS') return res.set('Allow', 'POST, OPTIONS').sendStatus(204);
      if (req.method !== 'POST') return res.set('Allow', 'POST, OPTIONS').status(405).json({ message: 'Method not allowed.' });
      const data = req.body;
      if (!data || typeof data !== 'object' || Array.isArray(data)) return res.status(400).json({ message: 'Invalid form data.' });
      const fields = {};
      for (const key of ['name', 'phone', 'service', 'email', 'message']) {
        if (data[key] !== undefined && typeof data[key] !== 'string') return res.status(400).json({ message: 'Invalid form fields.' });
        fields[key] = (data[key] || '').trim();
        if (fields[key].length > (key === 'message' ? 5000 : 254)) return res.status(400).json({ message: 'Form field is too long.' });
      }
      const { name, phone, service, email, message } = fields;
      if (!name || !phone || !service || (kind === 'contact' && !email)) return res.status(400).json({ message: 'Please fill all required fields.' });
      if (!/^\d{10}$/.test(phone)) return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
      if ((email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) || /[\r\n]/.test(name + email)) return res.status(400).json({ message: 'Invalid name or email.' });
      if (preview) return res.json({ success: true, preview: true, message: 'Preview request successful. No email was sent.' });
      if (!deliver) return res.status(503).json({ message: 'Email is not configured. Please contact us by phone.' });
      const entries = Object.entries(fields).filter(([, value]) => value);
      try {
        await deliver({
          from: { name: 'KDB Printers Website', address: env.SMTP_USER },
          to: env.MAIL_TO.split(',').map(value => value.trim()).filter(Boolean),
          ...(email ? { replyTo: email } : {}),
          subject: `New ${kind === 'hero' ? 'Callback' : 'Contact'} Request from ${name}`,
          text: entries.map(([key, value]) => `${key}: ${value}`).join('\n'),
          html: `<h2>New ${kind === 'hero' ? 'Callback' : 'Contact'} Request</h2>` + entries.map(([key, value]) => `<p><b>${key}:</b> ${escapeHtml(value).replace(/\n/g, '<br>')}</p>`).join('')
        });
        res.json({ success: true, message: 'Request sent successfully.' });
      } catch {
        console.error('Email delivery failed. Check SMTP configuration and provider logs.');
        res.status(502).json({ message: 'Unable to send email. Please try again or contact us by phone.' });
      }
    });
  }
  app.use(express.static(fileURLToPath(new URL('./public/', import.meta.url)), { dotfiles: 'deny' }));
  app.use((_req, res) => res.status(404).json({ message: 'Not found.' }));
  app.use((err, _req, res, _next) => res.status(err.status === 413 ? 413 : 400).json({ message: err.status === 413 ? 'Request too large.' : 'Invalid request.' }));
  return app;
}
