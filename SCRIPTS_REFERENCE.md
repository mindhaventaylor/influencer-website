# 📋 Scripts Reference

This document provides details about all available scripts in the project.

## 🚀 Main Commands

### `npm run setup`
**Complete automated setup for new influencer**
- Runs the full setup process
- Creates influencer configuration
- Sets up database records
- Generates environment files
- Runs complete system setup

### `npm run configure`
**Interactive influencer configuration**
- Guides you through influencer setup
- Creates configuration files
- Sets up branding and plans

### `npm run dev`
**Start development server**
- Runs Next.js development server on port 3002
- Hot reloading enabled
- Development environment

### `npm run build`
**Build for production**
- Creates optimized production build
- Uses Turbopack for faster builds
- Ready for deployment

### `npm run deploy`
**Deploy to Hostinger**
- Deploys the built application
- Uploads files to Hostinger
- Configures production environment

## 🗄️ Database Commands

### `npm run db:studio`
**Open database studio**
- Opens Drizzle Studio
- Visual database browser
- Query and edit data

## 🎫 Token Management

### `npm run tokens:add`
**Add tokens to user (admin)**
- Interactive script to add tokens
- Shows current token balances
- Allows adding tokens to specific users

### `npm run tokens:test`
**Test token system**
- Tests token functionality
- Verifies token operations
- Debug token issues

## 🔧 Additional Scripts

### Available in `scripts/` folder:

| Script | Description |
|--------|-------------|
| `create-influencer-template.js` | Create influencer template |
| `create-second-influencer-example.js` | Create example for second influencer |
| `setup-complete-system.js` | Complete system setup |
| `setup-new-influencer-site.js` | New influencer site setup |
| `configure-influencer.js` | Interactive configuration |
| `deploy-hostinger.js` | Hostinger deployment |
| `generate-env.js` | Generate environment files |
| `add-tokens-to-user.js` | Add tokens to user |
| `test-token-system.js` | Test token system |
| `manage-stripe-influencers.js` | Manage Stripe data |
| `update-project-info.js` | Update project information |
| `cleanup-auth-user.js` | Cleanup auth user data |

## 🎯 Usage Examples

### Setting up a new influencer:
```bash
npm run setup
```

### Adding tokens for testing:
```bash
npm run tokens:add
```

### Checking database:
```bash
npm run db:studio
```

### Deploying to production:
```bash
npm run build
npm run deploy
```

## ⚠️ Important Notes

- **Always test locally** before deploying
- **Backup your data** before running scripts
- **Use staging** for testing new configurations
- **Check logs** if scripts fail

## 🆘 Troubleshooting

If a script fails:
1. Check the error message
2. Verify your configuration
3. Check database connectivity
4. Verify API keys
5. Check file permissions
