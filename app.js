const express = require('express');
const { nanoid } = require('nanoid');
const db = require('./db');
const path = require('path');
const cron = require('node-cron');
const { checkLinks } = require('./monitor');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Postback for conversion tracking
app.get('/api/postback/:slug', (req, res) => {
  const { slug } = req.params;
  try {
    const link = db.prepare('SELECT id FROM links WHERE slug = ?').get(slug);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    db.prepare('UPDATE links SET conversions = conversions + 1 WHERE id = ?').run(link.id);

    // Log conversion event
    db.prepare('INSERT INTO events (link_id, type, referrer, user_agent, ip) VALUES (?, ?, ?, ?, ?)')
      .run(link.id, 'conversion', req.get('referrer'), req.get('user-agent'), req.ip);

    res.json({ success: true, message: 'Conversion tracked' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get config status
app.get('/api/config-status', (req, res) => {
  res.json({
    emailEnabled: !!(process.env.SMTP_HOST && process.env.ALERT_EMAIL)
  });
});

// Get recent alerts
app.get('/api/alerts', (req, res) => {
  try {
    const alerts = db.prepare('SELECT * FROM alerts ORDER BY created_at DESC LIMIT 10').all();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get detailed analytics for a link
app.get('/api/analytics/:slug', (req, res) => {
  const { slug } = req.params;
  try {
    const link = db.prepare('SELECT id, original_url, slug, clicks, conversions FROM links WHERE slug = ?').get(slug);
    if (!link) return res.status(404).json({ error: 'Link not found' });

    // Top referrers
    const referrers = db.prepare(`
      SELECT referrer, COUNT(*) as count
      FROM events
      WHERE link_id = ?
      GROUP BY referrer
      ORDER BY count DESC
      LIMIT 10
    `).all(link.id);

    // Clicks/Conversions by day (last 7 days)
    const dailyStats = db.prepare(`
      SELECT date(created_at) as date, type, COUNT(*) as count
      FROM events
      WHERE link_id = ? AND created_at > date('now', '-7 days')
      GROUP BY date, type
    `).all(link.id);

    res.json({
      link,
      referrers,
      dailyStats
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all links (reporting)
app.get('/api/links', (req, res) => {
  try {
    const links = db.prepare('SELECT * FROM links ORDER BY created_at DESC').all();
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Helper to validate URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Shorten a link
app.post('/api/links', (req, res) => {
  const { original_url, custom_slug } = req.body;

  if (!original_url) {
    return res.status(400).json({ error: 'original_url is required' });
  }

  if (!isValidUrl(original_url)) {
    return res.status(400).json({ error: 'Invalid original_url' });
  }

  if (custom_slug && !/^[a-zA-Z0-9_-]+$/.test(custom_slug)) {
    return res.status(400).json({ error: 'Invalid custom_slug. Only alphanumeric, underscores, and hyphens are allowed.' });
  }

  const slug = custom_slug || nanoid(7);

  try {
    const stmt = db.prepare('INSERT INTO links (original_url, slug) VALUES (?, ?)');
    const info = stmt.run(original_url, slug);
    res.status(201).json({
      id: info.lastInsertRowid,
      original_url,
      slug,
      short_url: `${req.protocol}://${req.get('host')}/${slug}`
    });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// Redirect and track clicks
app.get('/:slug', (req, res) => {
  const { slug } = req.params;

  const link = db.prepare('SELECT id, original_url FROM links WHERE slug = ?').get(slug);

  if (link) {
    db.prepare('UPDATE links SET clicks = clicks + 1 WHERE id = ?').run(link.id);

    // Log click event
    db.prepare('INSERT INTO events (link_id, type, referrer, user_agent, ip) VALUES (?, ?, ?, ?, ?)')
      .run(link.id, 'click', req.get('referrer'), req.get('user-agent'), req.ip);

    res.redirect(link.original_url);
  } else {
    res.status(404).send('Link not found');
  }
});

// Schedule health checks every hour
if (process.env.NODE_ENV !== 'test') {
  cron.schedule('0 * * * *', () => {
    console.log('Running periodic health check...');
    checkLinks();
  });
}

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
