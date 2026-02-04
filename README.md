# KAIDA Tracker

An open-source affiliate link tracker with auto-alerts and analytics.

## Features

- 🔗 **Link Shortening**: Create short, trackable links for your affiliate URLs
- 📊 **Analytics**: Track clicks, conversions, and referrer data
- 🔔 **Auto-Alerts**: Get email notifications when links go down
- 📈 **Reporting**: View detailed analytics and performance metrics
- 🎯 **Custom Slugs**: Create branded, memorable short links

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/StoneLoner/KAIDA---Tracker.git
   cd KAIDA---Tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```env
   PORT=3000
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your-email@example.com
   SMTP_PASS=your-password
   ALERT_EMAIL=admin@example.com
   ```

5. Start the application:
   ```bash
   npm start
   ```

6. Open your browser to `http://localhost:3000`

### Running Tests

```bash
npm test
```

## Deployment Options

### Docker

The easiest way to deploy KAIDA Tracker is using Docker:

```bash
# Build the image
docker build -t kaida-tracker .

# Run the container
docker run -p 3000:3000 \
  -e SMTP_HOST=smtp.example.com \
  -e SMTP_PORT=587 \
  -e SMTP_USER=your-email@example.com \
  -e SMTP_PASS=your-password \
  -e ALERT_EMAIL=admin@example.com \
  kaida-tracker
```

### Docker Compose

For a complete setup with persistent storage:

```bash
docker-compose up -d
```

Make sure to configure your environment variables in the `docker-compose.yml` file or create a `.env` file.

### Heroku

Deploy to Heroku with one click or using the CLI:

```bash
# Login to Heroku
heroku login

# Create a new app
heroku create your-app-name

# Set environment variables
heroku config:set SMTP_HOST=smtp.example.com
heroku config:set SMTP_PORT=587
heroku config:set SMTP_USER=your-email@example.com
heroku config:set SMTP_PASS=your-password
heroku config:set ALERT_EMAIL=admin@example.com

# Deploy
git push heroku main
```

### Render

1. Fork this repository
2. Create a new Web Service on [Render](https://render.com)
3. Connect your repository
4. Render will automatically detect the `render.yaml` configuration
5. Add your environment variables in the Render dashboard

### Railway

1. Fork this repository
2. Create a new project on [Railway](https://railway.app)
3. Connect your repository
4. Railway will automatically detect the `railway.json` configuration
5. Add your environment variables in the Railway dashboard

### Manual Deployment (VPS/Cloud Server)

1. SSH into your server
2. Clone the repository
3. Install Node.js and npm
4. Run the setup steps from Local Development
5. Use a process manager like PM2 to keep the app running:
   ```bash
   npm install -g pm2
   pm2 start index.js --name kaida-tracker
   pm2 save
   pm2 startup
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Port the server runs on | No (default: 3000) |
| `SMTP_HOST` | SMTP server hostname | Yes (for alerts) |
| `SMTP_PORT` | SMTP server port | Yes (for alerts) |
| `SMTP_USER` | SMTP username | Yes (for alerts) |
| `SMTP_PASS` | SMTP password | Yes (for alerts) |
| `ALERT_EMAIL` | Email to send alerts to | Yes (for alerts) |

**Note**: Email configuration is optional but required for link monitoring alerts.

## API Endpoints

### Create a short link
```
POST /api/links
Body: {
  "original_url": "https://example.com/affiliate-link",
  "custom_slug": "my-link" // optional
}
```

### Get all links
```
GET /api/links
```

### Get analytics for a link
```
GET /api/analytics/:slug
```

### Track conversion
```
GET /api/postback/:slug
```

### Get recent alerts
```
GET /api/alerts
```

### Check email configuration
```
GET /api/config-status
```

## Database

KAIDA Tracker uses SQLite for data storage. The database file (`kaida.db`) is automatically created on first run.

For production deployments with high traffic, consider:
- Using a volume mount for Docker deployments
- Migrating to PostgreSQL or MySQL for better performance
- Regular backups of the database file

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC License - see LICENSE file for details.

## Support

For issues and questions, please use the [GitHub Issues](https://github.com/StoneLoner/KAIDA---Tracker/issues) page.
