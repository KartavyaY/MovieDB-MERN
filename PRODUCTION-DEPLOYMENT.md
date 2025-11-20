# Self-Hosting MovieDB MERN Application with kartavyayadav.in

## Overview

This guide explains how to self-host your MovieDB MERN application using your domain `kartavyayadav.in` with Cloudflare proxy setup.

## Current Setup

- **Domain**: `kartavyayadav.in`
- **Frontend**: Cloudflare redirects `kartavyayadav.in` → `localhost:5173`
- **Backend API**: Cloudflare redirects `kartavyayadav.in/api` → `localhost:5001`
- **Database**: MongoDB (local instance)
- **Authentication**: Firebase Auth

## Prerequisites

### 1. Required Software
- ✅ Node.js (v16 or higher)
- ✅ MongoDB (local instance or MongoDB Atlas)
- ✅ Git (for version control)

### 2. Domain & DNS Setup
- ✅ Domain: `kartavyayadav.in` 
- ✅ Cloudflare proxy configuration:
  - Root domain → `localhost:5173`
  - `/api` path → `localhost:5001`

### 3. Firebase Configuration
- ✅ Firebase project: `movie-app-mern`
- ✅ Authentication enabled (email/password + Google)
- ✅ Service account credentials configured

## Quick Start (Production)

### 1. Start the Application

**Option A: Using the batch file (Easiest)**
```cmd
# Double-click or run from command prompt
start-production.bat
```

**Option B: Using PowerShell**
```powershell
# Run from the project root directory
.\start-production.ps1
```

**Option C: Manual startup**
```powershell
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Access Your Application
- 🌍 **Production URL**: https://kartavyayadav.in
- 🔧 **Local Frontend**: http://localhost:5173
- 📡 **Local Backend**: http://localhost:5001
- ❤️ **Health Check**: https://kartavyayadav.in/api/health

## Configuration Details

### Backend Configuration (`backend/.env`)
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://localhost:27017/movie-browser
FRONTEND_URL=https://kartavyayadav.in
FRONTEND_URL_DEV=http://localhost:5173
PRODUCTION_DOMAIN=https://kartavyayadav.in
PRODUCTION_API=https://kartavyayadav.in/api
```

### Frontend Configuration (`frontend/.env`)
```env
VITE_API_BASE_URL=/api  # Uses relative path due to Cloudflare proxy
```

### CORS Setup
The backend is configured to accept requests from:
- `https://kartavyayadav.in`
- `https://www.kartavyayadav.in`
- `http://localhost:5173` (for local development)

## MongoDB Setup

### Local MongoDB
```bash
# Start MongoDB service
mongod

# Seed the database (first time only)
cd backend
npm run seed
```

### MongoDB Atlas (Cloud Option)
If you prefer cloud MongoDB:
1. Create account at https://cloud.mongodb.com
2. Create a cluster
3. Update `MONGODB_URI` in `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movie-browser
   ```

## Troubleshooting

### Common Issues

**1. Port Already in Use**
```powershell
# Check what's using the ports
Get-NetTCPConnection -LocalPort 5001,5173

# Kill processes if needed
Stop-Process -Id [ProcessID]
```

**2. MongoDB Not Running**
```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ismaster')"

# Start MongoDB
mongod
```

**3. Firewall Issues**
Make sure Windows Firewall allows:
- Port 5001 (Backend)
- Port 5173 (Frontend)

**4. Cloudflare Issues**
- Check Cloudflare proxy settings
- Ensure SSL/TLS is set to "Flexible" or "Full"
- Verify DNS records point to your server IP

### Logs and Debugging

**Backend Logs**
```powershell
cd backend
npm run dev  # Development mode with detailed logs
```

**Frontend Logs**
- Check browser console for errors
- Vite dev server logs in terminal

**MongoDB Logs**
```bash
# View MongoDB logs
mongod --logpath /path/to/mongodb.log
```

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use strong Firebase credentials
- Rotate secrets regularly

### 2. Firewall Configuration
```powershell
# Allow specific ports (run as administrator)
New-NetFirewallRule -DisplayName "MovieDB Backend" -Direction Inbound -Port 5001 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "MovieDB Frontend" -Direction Inbound -Port 5173 -Protocol TCP -Action Allow
```

### 3. HTTPS Setup
- Cloudflare provides SSL termination
- Consider using Let's Encrypt for direct HTTPS if not using Cloudflare

## Monitoring and Maintenance

### Health Checks
- Frontend: https://kartavyayadav.in
- Backend: https://kartavyayadav.in/api/health
- Database: Check MongoDB connection in backend logs

### Regular Maintenance
- Update dependencies monthly: `npm update`
- Monitor MongoDB disk usage
- Check Cloudflare analytics for traffic patterns
- Backup MongoDB data regularly

### Performance Optimization
- Monitor memory usage with Task Manager
- Consider using PM2 for process management in production
- Implement caching strategies if needed

## Backup Strategy

### 1. Database Backup
```bash
# Create MongoDB backup
mongodump --db movie-browser --out ./backups/

# Restore from backup
mongorestore --db movie-browser ./backups/movie-browser/
```

### 2. Application Backup
- Backup entire project directory
- Store environment files securely
- Version control with Git

## Support

### Useful Commands
```powershell
# Check application status
Get-Process | Where-Object {$_.Name -like "*node*"}

# View port usage
netstat -an | findstr "5001\|5173"

# MongoDB status
sc query MongoDB

# Restart application
.\start-production.ps1
```

### Log Locations
- Backend logs: Terminal output
- Frontend logs: Browser console + terminal
- MongoDB logs: MongoDB log directory
- Windows Event Logs: Event Viewer

## Next Steps

Consider these improvements for production:
1. **Process Manager**: Use PM2 or similar for auto-restart
2. **Reverse Proxy**: Consider nginx for better performance
3. **SSL Certificates**: Direct HTTPS without Cloudflare dependency
4. **Database Clustering**: MongoDB replica sets for high availability
5. **CDN**: Static asset optimization
6. **Monitoring**: Application performance monitoring tools

---

**Your application is now ready for self-hosting with kartavyayadav.in!** 🎉

For support, check the troubleshooting section or review the application logs.