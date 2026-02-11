# KAIDA Tracker

An open-source affiliate link tracker with real-time analytics and automated alerts. Self-hosted, privacy-focused, and completely free.

## ✨ Features

- **Link Tracking** – Create shortened affiliate links with custom slugs
- **Real-time Analytics** – Track clicks, unique visitors, referrers, geographic data
- **Auto-alerts** – Get notified via Discord, Slack, or email when links hit thresholds
- **Conversion Tracking** – Monitor sales and commissions
- **REST API** – Integrate with your existing tools and workflows
- **Privacy-first** – No third-party tracking, you own all data

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Python 3.9+
- PostgreSQL 14+
- Redis (optional, for rate limiting)

### 1. Clone and install
```bash
git clone https://github.com/StoneLoner/KAIDA---Tracker
cd KAIDA---Tracker
npm install
# or: pip install -r requirements.txt
# Create PostgreSQL database
createdb kaida_tracker

# Run migrations
npm run migrate
# or: python manage.py migrate
cp .env.example .env
# Edit .env with your database credentials
nano .env
npm run dev
# or: python app.py
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url": "https://amazon.com/dp/B08N5WRWNW?tag=affiliate123", "slug": "summer-deal"}'
{
  "id": "link_123",
  "tracking_url": "http://localhost:3000/go/summer-deal",
  "clicks": 0,
  "created": "2024-01-15T10:30:00Z"
}
{
  "id": "link_123",
  "tracking_url": "http://localhost:3000/go/summer-deal",
  "clicks": 0,
  "created": "2024-01-15T10:30:00Z"
}
curl -X POST http://localhost:3000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "link_id": "link_123",
    "threshold": 100,
    "webhook": "https://discord.com/api/webhooks/your-webhook-url"
  }'
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/kaida_tracker
JWT_SECRET=your-secure-random-key-here
PORT=3000

# Optional - Alerts
DISCORD_WEBHOOK_URL=
SLACK_WEBHOOK_URL=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ALERT_EMAIL=alerts@yourdomain.com

# Optional - Analytics
ENABLE_GEO_IP=true
IP_API_KEY=your-api-key
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
KAIDA---Tracker/
├── src/
│   ├── api/          # API endpoints
│   ├── services/     # Business logic
│   ├── models/       # Database models
│   └── utils/        # Helpers
├── public/           # Static files
├── tests/           # Test suites
├── .env.example     # Environment template
├── docker-compose.yml
└── package.json
