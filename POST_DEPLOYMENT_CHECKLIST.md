# Post-Deployment Checklist

Use this checklist after deploying to Render to verify everything is working correctly.

## ✅ Initial Deployment

### 1. Verify All Services Are Running

- [ ] Check Render Dashboard - all services show "Live" status
- [ ] API service is running at `https://blenvi-api.onrender.com`
- [ ] Web service is running at `https://blenvi-web.onrender.com`
- [ ] Docs service is running at `https://blenvi-docs.onrender.com`
- [ ] Storybook service is running at `https://blenvi-storybook.onrender.com`

### 2. Test Service Endpoints

#### API Service

```bash
# Health check
curl https://blenvi-api.onrender.com/

# Expected: 200 OK response
```

- [ ] API responds with 200 status
- [ ] No errors in API logs

#### Web Service

```bash
# Homepage
curl https://blenvi-web.onrender.com/

# Expected: Next.js HTML response
```

- [ ] Web app loads successfully
- [ ] No 404 or 500 errors
- [ ] Static assets load correctly
- [ ] Images display properly

#### Docs Service

```bash
# Documentation homepage
curl https://blenvi-docs.onrender.com/

# Expected: Documentation HTML
```

- [ ] Docs site loads successfully
- [ ] Navigation works
- [ ] Search functionality works (if implemented)

#### Storybook Service

```bash
# Storybook homepage
curl https://blenvi-storybook.onrender.com/

# Expected: Storybook static site
```

- [ ] Storybook loads successfully
- [ ] Components are visible
- [ ] Interactive controls work

### 3. Verify Environment Variables

#### Web Service

- [ ] `NODE_ENV` is set to `production`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is configured
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is configured
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is configured (server-side only)
- [ ] All custom environment variables are set

#### API Service

- [ ] `NODE_ENV` is set to `production`
- [ ] Database connection string is configured
- [ ] API keys and secrets are set
- [ ] CORS origins include web service URL

### 4. Test Build Filters

- [ ] Make a change to `apps/api` and push
  - [ ] Only API service rebuilds
- [ ] Make a change to `apps/web` and push
  - [ ] Only Web service rebuilds
- [ ] Make a change to `packages/ui` and push
  - [ ] Web and Storybook services rebuild (they depend on ui)

### 5. Check Logs

- [ ] No error messages in API logs
- [ ] No error messages in Web logs
- [ ] No error messages in Docs logs
- [ ] No error messages in Storybook logs
- [ ] No build warnings that should be addressed

## 🔐 Security Verification

### 6. Security Best Practices

- [ ] All secrets are stored in environment variables, not in code
- [ ] `.env` files are in `.gitignore`
- [ ] Service role keys are never exposed to client
- [ ] CORS is properly configured on API
- [ ] HTTPS is enabled (automatic with Render)
- [ ] Database credentials are secure

### 7. Supabase Integration (Web)

- [ ] User authentication works
- [ ] Database queries work
- [ ] Row Level Security (RLS) policies are active
- [ ] File uploads work (if using Storage)
- [ ] Real-time subscriptions work (if used)

## 🚀 Performance & Optimization

### 8. Performance Checks

- [ ] First load times are acceptable (<3s)
- [ ] Images are optimized
- [ ] CSS/JS bundles are minified
- [ ] Lighthouse score is good (>90 recommended)
- [ ] No console errors in browser

### 9. Database Performance

- [ ] Database queries are indexed
- [ ] No N+1 query problems
- [ ] Connection pooling is enabled
- [ ] Query times are reasonable (<100ms for most queries)

## 📊 Monitoring Setup

### 10. Configure Monitoring

- [ ] Enable Render notifications (email/Slack)
- [ ] Set up health check endpoints
- [ ] Configure uptime monitoring (e.g., UptimeRobot)
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure log aggregation if needed

### 11. Set Up Alerts

- [ ] Deploy failure notifications
- [ ] Service down notifications
- [ ] High error rate alerts
- [ ] Performance degradation alerts

## 🌐 Domain Configuration

### 12. Custom Domains (Optional)

If using custom domains:

- [ ] DNS records are configured
- [ ] SSL certificates are issued
- [ ] All services are accessible via custom domains
  - [ ] `api.yourdomain.com` → API service
  - [ ] `app.yourdomain.com` → Web service
  - [ ] `docs.yourdomain.com` → Docs service
  - [ ] `storybook.yourdomain.com` → Storybook service
- [ ] Redirects are configured (www to non-www, etc.)

## 🔄 CI/CD Verification

### 13. GitHub Actions (Optional)

If using GitHub Actions workflow:

- [ ] Workflow runs successfully
- [ ] Validation passes (lint, type-check)
- [ ] Deploy hooks trigger correctly
- [ ] Deploy status is reported back to GitHub

### 14. Auto-Deploy

- [ ] Push to main triggers automatic deployment
- [ ] Only affected services rebuild
- [ ] Build time is reasonable (<10 minutes)
- [ ] Zero-downtime deployment works

## 🧪 Testing

### 15. Integration Testing

- [ ] API endpoints return correct data
- [ ] Web app can communicate with API
- [ ] Authentication flow works end-to-end
- [ ] Database operations work correctly
- [ ] File uploads work (if applicable)

### 16. Cross-Browser Testing

- [ ] Works in Chrome/Edge
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Mobile responsive design works

## 📱 Mobile App (If Applicable)

### 17. React Native App

- [ ] Can connect to production API
- [ ] Authentication works
- [ ] API calls are successful
- [ ] Push notifications work (if implemented)

## 📝 Documentation

### 18. Update Documentation

- [ ] Update README with production URLs
- [ ] Document deployment process
- [ ] Document environment variables
- [ ] Update API documentation
- [ ] Create runbook for common issues

## 🎉 Final Steps

### 19. Stakeholder Communication

- [ ] Notify team of successful deployment
- [ ] Share production URLs
- [ ] Document any manual steps needed
- [ ] Schedule knowledge transfer session

### 20. Backup & Recovery

- [ ] Database backups are configured
- [ ] Backup restoration tested
- [ ] Disaster recovery plan documented
- [ ] Rollback procedure tested

## 📈 Post-Launch Monitoring

### First 24 Hours

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Address any critical issues

### First Week

- [ ] Analyze usage patterns
- [ ] Optimize based on metrics
- [ ] Address non-critical issues
- [ ] Plan next iteration

## 🐛 Common Issues & Solutions

### Issue: Service Won't Start

**Solution**: Check logs in Render Dashboard for error messages

### Issue: Environment Variables Not Working

**Solution**: Verify variables are set in Render Dashboard, not just render.yaml

### Issue: Build Takes Too Long

**Solution**:

- Review build command efficiency
- Consider using Docker for faster builds
- Enable build caching

### Issue: High Memory Usage

**Solution**:

- Upgrade to higher tier plan
- Optimize application code
- Review memory leaks

### Issue: Slow Response Times

**Solution**:

- Add caching layer (Redis)
- Optimize database queries
- Use CDN for static assets
- Upgrade to higher tier plan

## 📞 Support Resources

- **Render Status**: https://status.render.com/
- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com/
- **Render Support**: https://render.com/support

---

**Congratulations on your deployment! 🎉**

Keep this checklist handy for future deployments and updates.
