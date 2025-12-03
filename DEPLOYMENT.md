# Deployment Guide - Heroku

## Prerequisites
- Heroku CLI installed
- Git repository initialized
- Heroku account

## Setup Steps

### 1. Login to Heroku
```bash
heroku login
```

### 2. Create Heroku App
```bash
heroku create skincare-chatbot-frontend
```

Or use existing app:
```bash
heroku git:remote -a skincare-chatbot-frontend
```

### 3. Set Stack to Container
```bash
heroku stack:set container -a skincare-chatbot-frontend
```

### 4. Set Environment Variables
```bash
# Set backend API URL
heroku config:set REACT_APP_API_BASE_URL=https://your-backend-url.herokuapp.com/api -a skincare-chatbot-frontend

# Set LLM inference URL (if different)
heroku config:set REACT_APP_LLM_INFERENCE_URL=https://your-llm-url.herokuapp.com -a skincare-chatbot-frontend

# Verify config
heroku config -a skincare-chatbot-frontend
```

### 5. Deploy to Heroku
```bash
git add .
git commit -m "Add Dockerfile and Heroku configuration"
git push heroku main
```

If using different branch:
```bash
git push heroku your-branch:main
```

### 6. Open App
```bash
heroku open -a skincare-chatbot-frontend
```

### 7. View Logs
```bash
heroku logs --tail -a skincare-chatbot-frontend
```

## Environment Variables

Make sure to set these in Heroku:

```bash
REACT_APP_API_BASE_URL=https://skincare-chatbot-be.herokuapp.com/api
REACT_APP_LLM_INFERENCE_URL=https://your-llm-service.herokuapp.com
```

You can also set them via Heroku Dashboard:
1. Go to your app dashboard
2. Settings → Config Vars
3. Add the variables

## Build Process

The Dockerfile does the following:
1. **Build Stage**: 
   - Uses Node 18 Alpine
   - Installs dependencies
   - Builds React app (creates `build/` folder)

2. **Production Stage**:
   - Uses Nginx Alpine
   - Copies built assets
   - Configures Nginx to serve React app
   - Handles React Router with fallback to index.html

## Troubleshooting

### Build fails
```bash
# Check build logs
heroku logs --tail -a skincare-chatbot-frontend

# Rebuild without cache
heroku builds:create --source-tar <source.tar.gz> -a skincare-chatbot-frontend
```

### App crashes
```bash
# Check runtime logs
heroku logs --tail -a skincare-chatbot-frontend

# Restart app
heroku restart -a skincare-chatbot-frontend
```

### Environment variables not working
```bash
# Verify they are set
heroku config -a skincare-chatbot-frontend

# Re-deploy after setting vars
git commit --allow-empty -m "Trigger rebuild"
git push heroku main
```

### CORS issues
Make sure backend allows your frontend domain:
```python
# In backend CORS config
CORS_ORIGINS = [
    "https://skincare-chatbot-frontend.herokuapp.com",
    "http://localhost:3000"  # for local development
]
```

## Local Docker Testing

Test the Docker build locally before deploying:

```bash
# Build image
docker build -t skincare-chatbot-frontend .

# Run container
docker run -p 8080:8080 \
  -e PORT=8080 \
  -e REACT_APP_API_BASE_URL=https://your-backend.herokuapp.com/api \
  skincare-chatbot-frontend

# Access at http://localhost:8080
```

## Scaling

```bash
# Scale dynos
heroku ps:scale web=1 -a skincare-chatbot-frontend

# Check dyno status
heroku ps -a skincare-chatbot-frontend
```

## Custom Domain

```bash
# Add custom domain
heroku domains:add www.yourdomain.com -a skincare-chatbot-frontend

# Get DNS target
heroku domains -a skincare-chatbot-frontend

# Configure DNS:
# Add CNAME record pointing www.yourdomain.com to the DNS target
```

## Monitoring

```bash
# View metrics
heroku logs --tail -a skincare-chatbot-frontend

# Check app status
heroku ps -a skincare-chatbot-frontend

# View releases
heroku releases -a skincare-chatbot-frontend
```

## Rollback

```bash
# View releases
heroku releases -a skincare-chatbot-frontend

# Rollback to previous version
heroku rollback -a skincare-chatbot-frontend
```

## Notes

- Heroku free tier sleeps after 30 minutes of inactivity
- First request after sleep will be slow (cold start)
- Consider upgrading to Hobby dyno ($7/month) for always-on service
- Static files are served by Nginx (very fast)
- Build time: ~3-5 minutes
- The app uses PORT environment variable set by Heroku
