const axios = require('axios');
const db = require('./db');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendEmailAlert(message) {
  if (!process.env.SMTP_HOST || !process.env.ALERT_EMAIL) return;

  try {
    await transporter.sendMail({
      from: `"KAIDA Tracker" <${process.env.SMTP_USER}>`,
      to: process.env.ALERT_EMAIL,
      subject: 'KAIDA Alert: Link Down',
      text: message
    });
    console.log('Alert email sent');
  } catch (err) {
    console.error('Failed to send alert email:', err.message);
  }
}

async function checkLinks() {
  const links = db.prepare('SELECT id, original_url FROM links').all();

  for (const link of links) {
    let status = 'active';
    try {
      // We use a timeout to avoid hanging
      const response = await axios.get(link.original_url, { timeout: 5000, validateStatus: (s) => s < 400 });
      status = 'active';
    } catch (err) {
      status = 'down';
      console.warn(`Link ${link.original_url} is down: ${err.message}`);

      // Create an alert if the status was active or if it's a new failure
      const alertMsg = `Link down: ${link.original_url} (${err.message})`;
      db.prepare('INSERT INTO alerts (link_id, message) VALUES (?, ?)')
        .run(link.id, alertMsg);

      await sendEmailAlert(alertMsg);
    }

    db.prepare('UPDATE links SET status = ?, last_checked = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, link.id);
  }
}

module.exports = { checkLinks };
