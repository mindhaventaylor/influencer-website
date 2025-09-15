# 🛡️ Safe Scripts Guide

This guide lists all the **safe, non-destructive** scripts that are available in this project.

## ✅ Safe Scripts (Use These)

### 🔧 Setup & Configuration
```bash
npm run configure          # Interactive influencer setup - SAFE
npm run setup:complete     # Complete system setup - SAFE (adds data only)
npm run create:influencer  # Create influencer template - SAFE
```

### 🎨 Customization
```bash
npm run generate:env       # Generate environment variables - SAFE
npm run update:project     # Update project metadata - SAFE
```

### 💰 Stripe Management
```bash
npm run stripe:list        # List Stripe products - SAFE (read-only)
npm run stripe:report      # Generate Stripe report - SAFE (read-only)
```

### 🎫 Token Management
```bash
npm run test:tokens        # Check token system - SAFE (read-only)
npm run add:tokens         # Add tokens to user - SAFE (adds data only)
```

### 🔐 User Management
```bash
npm run cleanup:auth       # Delete auth user - SAFE (only affects auth, not database)
```

### 🚀 Deployment
```bash
npm run deploy:hostinger   # Deploy to Hostinger - SAFE (builds and deploys)
```

## ❌ Removed Dangerous Scripts

The following scripts have been **REMOVED** for safety:
- ~~`cleanup:database.js`~~ - Could delete all data
- ~~`force:cleanup-database.js`~~ - Could force delete data
- ~~`raw-cleanup-database.js`~~ - Raw database cleanup
- ~~`fix-database-tables.js`~~ - Could modify table structure
- ~~`create-simplified-schema.js`~~ - Could recreate schema
- ~~`update-apis-for-simplified-schema.js`~~ - Could break APIs
- ~~`fix-api-connection-issues.js`~~ - Could modify working APIs

## 🎯 Recommended Workflow

### For New Influencer Setup:
1. `npm run configure` - Set up influencer details
2. `npm run setup:complete` - Initialize database safely
3. `npm run dev` - Start development

### For Testing:
1. `npm run test:tokens` - Check system health
2. `npm run add:tokens` - Add test tokens if needed
3. `npm run stripe:list` - Check Stripe integration

### For Deployment:
1. `npm run generate:env` - Generate environment variables
2. `npm run deploy:hostinger` - Deploy to production

## 🛡️ Safety Guarantees

### What These Scripts Do:
- ✅ **Add data** - Never delete existing data
- ✅ **Update safely** - Only update what's needed
- ✅ **Read-only** - Many scripts only read and report
- ✅ **Error handling** - Comprehensive error checking

### What These Scripts DON'T Do:
- ❌ **Delete tables** - No table dropping
- ❌ **Clear data** - No data clearing
- ❌ **Break structure** - No schema modifications
- ❌ **Force changes** - No forced operations

## 🚨 Emergency Recovery

If something goes wrong:

1. **Check logs** - Always check terminal output first
2. **Run diagnostics** - `npm run test:tokens` for system health
3. **Re-run setup** - `npm run setup:complete` (safe to run multiple times)
4. **Check config** - Verify `influencer.config.js` is correct

## 💡 Pro Tips

- **Always backup** before major changes (even with safe scripts)
- **Test locally** before deploying
- **Use staging** environment for testing
- **Monitor logs** during script execution
- **Keep config files** in version control

---

**All remaining scripts are safe to use and won't damage your working system!** 🎉





