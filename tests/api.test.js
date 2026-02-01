const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const db = require('../db');

describe('API Endpoints', () => {
  beforeEach(() => {
    db.prepare('DELETE FROM events').run();
    db.prepare('DELETE FROM alerts').run();
    db.prepare('DELETE FROM links').run();
  });

  describe('GET /api/links', () => {
    it('should return all links', async () => {
      db.prepare('INSERT INTO links (original_url, slug) VALUES (?, ?)').run('https://a.com', 'a');
      db.prepare('INSERT INTO links (original_url, slug) VALUES (?, ?)').run('https://b.com', 'b');

      const res = await request(app).get('/api/links');
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(2);
    });
  });

  describe('POST /api/links', () => {
    it('should create a short link', async () => {
      const res = await request(app)
        .post('/api/links')
        .send({ original_url: 'https://google.com' });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('slug');
      expect(res.body.original_url).to.equal('https://google.com');
    });

    it('should return 400 for invalid URL', async () => {
      const res = await request(app)
        .post('/api/links')
        .send({ original_url: 'not-a-url' });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('Invalid original_url');
    });

    it('should return 400 for invalid custom slug', async () => {
      const res = await request(app)
        .post('/api/links')
        .send({ original_url: 'https://google.com', custom_slug: 'bad slug!' });
      expect(res.status).to.equal(400);
    });
  });

  describe('GET /api/postback/:slug', () => {
    it('should increment conversions and log event', async () => {
      db.prepare('INSERT INTO links (original_url, slug) VALUES (?, ?)').run('https://ex.com', 'ex');

      const res = await request(app).get('/api/postback/ex');
      expect(res.status).to.equal(200);

      const link = db.prepare('SELECT id, conversions FROM links WHERE slug = ?').get('ex');
      expect(link.conversions).to.equal(1);

      const event = db.prepare('SELECT * FROM events WHERE link_id = ? AND type = ?').get(link.id, 'conversion');
      expect(event).to.exist;
    });
  });

  describe('GET /api/analytics/:slug', () => {
    it('should return analytics for a link', async () => {
      const linkStmt = db.prepare('INSERT INTO links (original_url, slug) VALUES (?, ?)');
      const info = linkStmt.run('https://test.com', 'test');
      const linkId = info.lastInsertRowid;

      db.prepare('INSERT INTO events (link_id, type, referrer) VALUES (?, ?, ?)')
        .run(linkId, 'click', 'https://ref.com');

      const res = await request(app).get('/api/analytics/test');
      expect(res.status).to.equal(200);
      expect(res.body.link.slug).to.equal('test');
      expect(res.body.referrers[0].referrer).to.equal('https://ref.com');
      expect(res.body.referrers[0].count).to.equal(1);
    });
  });

  describe('GET /api/alerts', () => {
    it('should return recent alerts', async () => {
      db.prepare('INSERT INTO alerts (message) VALUES (?)').run('Test alert');
      const res = await request(app).get('/api/alerts');
      expect(res.status).to.equal(200);
      expect(res.body.length).to.equal(1);
      expect(res.body[0].message).to.equal('Test alert');
    });
  });
});
