# Marine Life Monitoring Platform - Deployment Guide

## 🚀 Quick Deploy to Railway

### Prerequisites
1. GitHub account with your code pushed
2. Railway account (free signup)
3. Google AI API key

### Step 1: Prepare Your Repository
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy Backend to Railway
1. Go to [Railway.app](https://railway.app)
2. Click "Deploy from GitHub repo"
3. Select your Marine_life repository
4. Choose the `/backend` folder as root
5. Railway will auto-detect it's a Python app

### Step 3: Add Environment Variables
In Railway dashboard, add these environment variables:
```
DEBUG=False
GOOGLE_API_KEY=your-actual-api-key
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=postgresql://... (Railway provides this)
REDIS_URL=redis://... (Railway provides this)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

### Step 4: Deploy Frontend
1. Create a new Railway service
2. Select your repository again
3. Choose the `/frontend` folder as root
4. Add environment variable:
```
REACT_APP_API_URL=https://your-backend-url.railway.app
```

### Step 5: Add Databases
1. In Railway, click "Add Service"
2. Add PostgreSQL database
3. Add Redis database
4. Railway will automatically provide connection URLs

## 🌐 Alternative: Google Cloud Platform

### Benefits for Your Project:
- $300 free credits
- Perfect Gemini AI integration
- Professional scaling
- Built-in monitoring

### Quick Setup:
1. Create Google Cloud Project
2. Enable Cloud Run, Cloud SQL, Cloud Storage
3. Deploy with one command:
```bash
gcloud run deploy marine-life-backend --source backend/
```

## 📊 Expected Costs (Monthly)

### Railway:
- Hobby Plan: $5/month
- Database: $5-10/month
- Storage: $5/month
- **Total: ~$15-20/month**

### Google Cloud:
- Cloud Run: $10-20/month
- Cloud SQL: $15-25/month
- Cloud Storage: $5/month
- **Total: ~$30-50/month** (but $300 free credits = 6+ months free)

## 🛡️ Production Checklist
- [ ] Set DEBUG=False
- [ ] Use strong SECRET_KEY
- [ ] Set up HTTPS
- [ ] Configure CORS properly
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Set API rate limits

## 🎯 Next Steps
1. Choose hosting platform
2. Push code to GitHub
3. Follow deployment steps
4. Configure domain name
5. Set up monitoring

Your Marine Life platform is production-ready! 🌊
