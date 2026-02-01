const { expect } = require('chai');
const nock = require('nock');
const db = require('../db');
const { checkLinks } = require('../monitor');

describe('Link Monitor', () => {
  beforeEach(() => {
    db.prepare('DELETE FROM events').run();
    db.prepare('DELETE FROM alerts').run();
    db.prepare('DELETE FROM links').run();
  });

  it('should update status to active and NOT create alert for working links', async () => {
    db.prepare('INSERT INTO links (original_url, slug, status) VALUES (?, ?, ?)')
      .run('https://good-link.com', 'good', 'down');

    nock('https://good-link.com').get('/').reply(200);

    await checkLinks();

    const link = db.prepare('SELECT status FROM links WHERE slug = ?').get('good');
    expect(link.status).to.equal('active');

    const alerts = db.prepare('SELECT * FROM alerts').all();
    expect(alerts.length).to.equal(0);
  });

  it('should update status to down and create alert for broken links', async () => {
    db.prepare('INSERT INTO links (original_url, slug, status) VALUES (?, ?, ?)')
      .run('https://bad-link.com', 'bad', 'active');

    nock('https://bad-link.com').get('/').reply(404);

    await checkLinks();

    const link = db.prepare('SELECT status FROM links WHERE slug = ?').get('bad');
    expect(link.status).to.equal('down');

    const alerts = db.prepare('SELECT * FROM alerts').all();
    expect(alerts.length).to.equal(1);
    expect(alerts[0].message).to.contain('Link down');
  });
});
