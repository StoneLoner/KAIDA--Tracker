# KAIDA Tracker Deployment Guide

This guide provides detailed instructions for deploying KAIDA Tracker to various platforms.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Docker Deployment](#docker-deployment)
4. [Platform-Specific Deployments](#platform-specific-deployments)
5. [Post-Deployment Steps](#post-deployment-steps)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying KAIDA Tracker, ensure you have:

- Node.js 18+ installed (for local development)
- Git installed
- A platform account (Heroku, Render, Railway, etc.) OR
- Docker installed (for containerized deployment) OR
- A VPS/Cloud server with SSH access

## Environment Variables

KAIDA Tracker requires the following environment variables:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port the server runs on | `3000` |

### Optional Variables (for Email Alerts)

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username/email | `yourapp@gmail.com` |
| `SMTP_PASS` | SMTP password or app password | `your-app-password` |
| `ALERT_EMAIL` | Email to receive alerts | `admin@example.com` |

**Note**: Without email configuration, link monitoring alerts will be logged but not sent via email.

### Email Configuration Examples

#### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ALERT_EMAIL=admin@example.com
```

**Note**: For Gmail, you need to use an [App Password](https://support.google.com/accounts/answer/185833?hl=en), not your regular password.

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
ALERT_EMAIL=admin@example.com
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
ALERT_EMAIL=admin@example.com
```

## Docker Deployment

### Quick Start with Docker

1. **Build the Docker image:**
   ```bash
   docker build -t kaida-tracker .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     -p 3000:3000 \
     -e SMTP_HOST=smtp.gmail.com \
     -e SMTP_PORT=587 \
     -e SMTP_USER=your-email@gmail.com \
     -e SMTP_PASS=your-app-password \
     -e ALERT_EMAIL=admin@example.com \
     --name kaida-tracker \
     kaida-tracker
   ```

3. **Access the application:**
   Open your browser to `http://localhost:3000`

### Using Docker Compose

1. **Create a `.env` file** in the project root:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ALERT_EMAIL=admin@example.com
   ```

2. **Start the application:**
   ```bash
   docker-compose up -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Stop the application:**
   ```bash
   docker-compose down
   ```

## Platform-Specific Deployments

### Heroku

1. **Install Heroku CLI:**
   ```bash
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login to Heroku:**
   ```bash
   heroku login
   ```

3. **Create a new app:**
   ```bash
   heroku create your-app-name
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set SMTP_HOST=smtp.gmail.com
   heroku config:set SMTP_PORT=587
   heroku config:set SMTP_USER=your-email@gmail.com
   heroku config:set SMTP_PASS=your-app-password
   heroku config:set ALERT_EMAIL=admin@example.com
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

6. **Open your app:**
   ```bash
   heroku open
   ```

### Render.com

1. **Fork or push this repository** to your GitHub account

2. **Create a new Web Service** on [Render](https://render.com):
   - Connect your GitHub repository
   - Render will auto-detect the `render.yaml` configuration
   - Select the branch to deploy

3. **Add environment variables** in the Render dashboard:
   - Go to your service settings
   - Add each environment variable from the list above

4. **Deploy:**
   - Render will automatically deploy your app
   - Access it via the provided URL

### Railway.app

1. **Install Railway CLI** (optional):
   ```bash
   npm install -g @railway/cli
   ```

2. **Create a new project** on [Railway](https://railway.app):
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect the `railway.json` configuration

3. **Add environment variables:**
   - Go to your project's Variables tab
   - Add each environment variable

4. **Deploy:**
   - Railway will automatically deploy on push
   - Access via the generated domain or add a custom domain

### DigitalOcean App Platform

1. **Create a new App** on [DigitalOcean](https://cloud.digitalocean.com/apps)

2. **Connect your repository:**
   - Choose GitHub
   - Select your repository and branch

3. **Configure the app:**
   - Select Node.js as the environment
   - Build Command: `npm install`
   - Run Command: `node index.js`

4. **Add environment variables** in the app settings

5. **Deploy:**
   - Click "Deploy App"
   - Access via the provided URL

### VPS/Cloud Server (Ubuntu/Debian)

1. **SSH into your server:**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone the repository:**
   ```bash
   git clone https://github.com/StoneLoner/KAIDA---Tracker.git
   cd KAIDA---Tracker
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Create a `.env` file:**
   ```bash
   nano .env
   ```
   Add your environment variables and save (Ctrl+X, Y, Enter)

6. **Install PM2** (process manager):
   ```bash
   sudo npm install -g pm2
   ```

7. **Start the application:**
   ```bash
   pm2 start index.js --name kaida-tracker
   pm2 save
   pm2 startup
   ```

8. **Set up Nginx** as a reverse proxy (optional):
   ```bash
   sudo apt-get install nginx
   sudo nano /etc/nginx/sites-available/kaida-tracker
   ```
   
   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/kaida-tracker /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Set up SSL with Let's Encrypt** (optional):
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Post-Deployment Steps

1. **Test the application:**
   - Visit your deployed URL
   - Create a test short link
   - Verify click tracking works
   - Check that analytics are displayed

2. **Set up monitoring:**
   - Enable platform-specific monitoring (if available)
   - Set up uptime monitoring (e.g., UptimeRobot, Pingdom)
   - Monitor logs for errors

3. **Database backups:**
   - Set up regular backups of the SQLite database
   - For Docker, ensure the database volume is backed up
   - For VPS, use cron jobs for automated backups:
     ```bash
     # Add to crontab (crontab -e)
     0 2 * * * cp /path/to/KAIDA---Tracker/kaida.db /path/to/backups/kaida-$(date +\%Y\%m\%d).db
     ```

4. **Custom domain** (optional):
   - Configure DNS records to point to your deployment
   - Most platforms support custom domains in their settings

## Troubleshooting

### Application won't start

- **Check logs:**
  - Heroku: `heroku logs --tail`
  - Docker: `docker logs kaida-tracker`
  - PM2: `pm2 logs kaida-tracker`
  - Railway/Render: Check logs in the platform dashboard

- **Verify environment variables:**
  - Ensure all required variables are set
  - Check for typos in variable names

### Database issues

- **SQLite file permissions:**
  ```bash
  chmod 664 kaida.db
  ```

- **Database locked errors:**
  - Ensure only one instance is running
  - Check file permissions
  - Consider migrating to PostgreSQL for high-traffic deployments

### Email alerts not working

- **Verify SMTP credentials:**
  - Test with a simple email send script
  - Check that SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS are correct
  - For Gmail, ensure you're using an App Password

- **Check firewall:**
  - Ensure outbound connections on SMTP port are allowed
  - Some cloud providers block port 25

### Port conflicts

- **Change the PORT environment variable:**
  ```bash
  export PORT=8080
  ```

### Build failures (Docker)

- **Clear Docker cache:**
  ```bash
  docker build --no-cache -t kaida-tracker .
  ```

- **Check Dockerfile syntax:**
  - Ensure all dependencies are installed
  - Verify the base image is accessible

## Getting Help

- **GitHub Issues:** [Report a bug or request a feature](https://github.com/StoneLoner/KAIDA---Tracker/issues)
- **Discussions:** Check existing discussions or start a new one
- **Documentation:** Review the main [README](README.md) for additional information

## Performance Tips

1. **Use a CDN** for static assets
2. **Enable gzip compression** in Nginx or your platform
3. **Set up caching** for frequently accessed endpoints
4. **Monitor resource usage** and scale as needed
5. **Consider migrating to PostgreSQL** for production use with high traffic

## Security Recommendations

1. **Keep dependencies updated:**
   ```bash
   npm audit fix
   ```

2. **Use HTTPS** for all deployments

3. **Set secure environment variables** (never commit `.env` files)

4. **Enable rate limiting** to prevent abuse:
   - For production deployments, consider adding rate limiting middleware like `express-rate-limit`
   - Example implementation:
     ```bash
     npm install express-rate-limit
     ```
     Then in your app.js:
     ```javascript
     const rateLimit = require('express-rate-limit');
     
     const limiter = rateLimit({
       windowMs: 15 * 60 * 1000, // 15 minutes
       max: 100 // limit each IP to 100 requests per windowMs
     });
     
     app.use('/api/', limiter);
     ```
   - This is especially important for database access endpoints

5. **Regular security audits** of your deployment

6. **Use strong SMTP passwords** or app-specific passwords

7. **Implement authentication** for sensitive endpoints (future enhancement)

8. **Database access protection:**
   - Consider adding authentication to the admin dashboard
   - Use environment-based API keys for programmatic access
   - Monitor for unusual access patterns

---

**Last Updated:** February 2026
**Version:** 1.0.0
