import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../app.js';

test('website, form validation, mail payload and private files', async () => {
  const mails = [];
  const app = createApp({ env: { SMTP_USER: 'sender@example.com', MAIL_TO: 'owner@example.com' }, sendMail: async mail => mails.push(mail) });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (path, data) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  try {
    assert.equal((await fetch(base)).status, 200);
    assert.equal((await fetch(base + '/images/logo.png')).status, 200);
    for (const path of ['/.env', '/app.js', '/package.json']) assert.equal((await fetch(base + path)).status, 404);
    assert.equal((await fetch(base + '/api/hero')).status, 405);
    assert.equal((await post('/api/hero', { name: 'Test', phone: '123', service: 'Printing' })).status, 400);
    const form = { name: 'Test <Name>', phone: '9876543210', service: 'Printing', email: 'visitor@example.com', message: 'Contact details <script>' };
    assert.equal((await post('/api/contact', { ...form, email: '' })).status, 400);
    assert.equal((await post('/api/contact', form)).status, 200);
    assert.equal(mails.length, 1);
    assert.equal(mails[0].replyTo, form.email);
    assert.ok(mails[0].text.includes(form.message));
    assert.ok(mails[0].html.includes('&lt;script&gt;'));
    assert.equal((await post('/send-hero-form.php', form)).status, 200);
    const malformed = await fetch(base + '/api/hero', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
    assert.equal(malformed.status, 400);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('unconfigured and failed mail never report success; preview is explicit', async () => {
  for (const [options, expected] of [[{ env: {} },503], [{ env: { MAIL_MODE: 'preview' } },200], [{ env: { MAIL_TO: 'owner@example.com' }, sendMail: async () => { throw new Error('SMTP failed'); } },502]]) {
    const server = createApp(options).listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    try {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api/hero`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Test', phone: '9876543210', service: 'Printing' }) });
      assert.equal(response.status, expected);
      const body = await response.json();
      if (expected === 200) { assert.equal(body.preview, true); assert.match(body.message, /No email was sent/); }
    } finally { await new Promise(resolve => server.close(resolve)); }
  }
});
