# 🎭 Dynamic Configuration System

This guide explains how the `influencer.config.js` dynamically updates your entire project, including display names, branding, and project information.

## 🚀 How It Works

### **📋 What Gets Updated Automatically:**

When you change `influencer.config.js`, the following gets updated:

| Component | What Changes | When It Updates |
|-----------|--------------|-----------------|
| **Package Name** | `package.json` name field | After running `npm run update:project` |
| **Project Title** | Browser tab title, SEO title | Immediately (dynamic) |
| **Meta Description** | SEO description, social sharing | Immediately (dynamic) |
| **Colors & Branding** | CSS variables, theme colors | Immediately (dynamic) |
| **Favicon** | Browser icon | Immediately (dynamic) |
| **Social Media Cards** | Open Graph, Twitter cards | Immediately (dynamic) |
| **README.md** | Project documentation | After running `npm run update:project` |
| **CSS Variables** | Custom CSS classes | Immediately (dynamic) |

## 🔧 Usage

### **1. Update Configuration**

Edit `influencer.config.js`:
```javascript
module.exports = {
  influencer: {
    name: 'Taylor Swift',
    displayName: 'Taylor Swift', // ← Change this
    bio: 'Singer-songwriter, multi-Grammy winner, and global superstar', // ← Change this
    handle: 'taylorswift',
    // ...
  },
  branding: {
    primaryColor: '#E91E63', // ← Change this
    secondaryColor: '#9C27B0', // ← Change this
    // ...
  },
  // ...
};
```

### **2. Update Project Files**

Run the update script:
```bash
npm run update:project
```

This updates:
- `package.json` (project name, description)
- `README.md` (project documentation)
- `src/app/globals.css` (CSS variables)

### **3. Dynamic Updates (No Restart Needed)**

These update immediately without restarting:
- Browser title and meta tags
- CSS variables and colors
- Social media sharing cards
- Favicon and theme colors

## 🎨 Dynamic Components

### **Using Influencer Info in Components**

```typescript
import { getInfluencerInfo, getBranding } from '@/lib/config';

function MyComponent() {
  const influencer = getInfluencerInfo();
  const branding = getBranding();

  return (
    <div style={{ color: branding.primaryColor }}>
      <h1>Chat with {influencer.displayName}</h1>
      <p>{influencer.bio}</p>
    </div>
  );
}
```

### **Pre-built Components**

Use the pre-built components for consistent branding:

```typescript
import { InfluencerInfo, InfluencerHeader, InfluencerFooter } from '@/components/InfluencerInfo';

// Full influencer info with avatar, bio, social media
<InfluencerInfo showSocialMedia={true} showBio={true} />

// Header with avatar and name
<InfluencerHeader />

// Footer with official website link
<InfluencerFooter />
```

### **CSS Classes**

Use the dynamic CSS classes:

```css
/* Gradient background with influencer colors */
.influencer-gradient

/* Text with primary color */
.influencer-text-primary

/* Full branding system */
.influencer-branding
```

## 📱 What Changes in Your App

### **Before (Generic)**
- Title: "Influencer Chat App"
- Colors: Default blue/gray
- Favicon: Generic icon
- Description: "Chat with AI influencers"

### **After (Taylor Swift)**
- Title: "Taylor Swift AI Chat"
- Colors: Pink (#E91E63) and Purple (#9C27B0)
- Favicon: Taylor Swift avatar
- Description: "Chat with Taylor Swift - Singer-songwriter, multi-Grammy winner, and global superstar"

### **After (Drake)**
- Title: "Drake AI Chat"
- Colors: Custom Drake colors
- Favicon: Drake avatar
- Description: "Chat with Drake - Rapper, singer, and producer"

## 🔄 Workflow

### **For New Influencer:**

1. **Create influencer template:**
   ```bash
   npm run create:influencer
   ```

2. **Update project files:**
   ```bash
   npm run update:project
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

### **For Existing Influencer:**

1. **Edit configuration:**
   ```javascript
   // influencer.config.js
   influencer: {
     displayName: 'New Name', // ← Change
     bio: 'New bio...', // ← Change
   }
   ```

2. **Update project files:**
   ```bash
   npm run update:project
   ```

3. **Restart if needed:**
   ```bash
   npm run dev
   ```

## 🎯 Configuration Options

### **Influencer Information**
```javascript
influencer: {
  name: 'Taylor Swift',           // Internal name
  displayName: 'Taylor Swift',    // Display name
  handle: 'taylorswift',          // @handle
  bio: 'Singer-songwriter...',    // Description
  avatarUrl: '/images/avatar.jpg', // Avatar image
  websiteUrl: 'https://taylorswift.com', // Official website
  socialMedia: {                  // Social links
    instagram: 'https://instagram.com/taylorswift',
    twitter: 'https://twitter.com/taylorswift',
    tiktok: 'https://tiktok.com/@taylorswift'
  }
}
```

### **Branding**
```javascript
branding: {
  primaryColor: '#E91E63',        // Main color
  secondaryColor: '#9C27B0',      // Secondary color
  accentColor: '#FF4081',         // Accent color
  logoUrl: '/images/logo.png',    // Logo image
  faviconUrl: '/images/favicon.ico', // Favicon
  customCss: `                    // Custom CSS
    .custom-class {
      color: #E91E63;
    }
  `
}
```

### **Deployment**
```javascript
deployment: {
  domain: 'taylor-swift-ai.com',  // Domain name
  baseUrl: 'https://taylor-swift-ai.com', // Full URL
  environment: 'production',      // Environment
  hostinger: {
    publicHtmlPath: '/public_html/taylor-swift-ai', // Hostinger path
    sslEnabled: true              // SSL enabled
  }
}
```

## 🌟 Benefits

✅ **One Config, Everything Updates**: Change one file, update entire project
✅ **Dynamic Metadata**: SEO and social sharing update automatically
✅ **Consistent Branding**: Colors and styling applied everywhere
✅ **Easy Multi-Influencer**: Create unlimited influencer websites
✅ **Type-Safe**: TypeScript interfaces ensure correct configuration
✅ **No Code Changes**: Update appearance without touching React code

## 🚀 Advanced Usage

### **Custom CSS Variables**

Access influencer colors in your CSS:
```css
.my-component {
  background-color: var(--influencer-primary);
  color: var(--influencer-secondary);
  border: 1px solid var(--influencer-accent);
}
```

### **Dynamic Content**

Use influencer info in any component:
```typescript
const influencer = getInfluencerInfo();

// Dynamic content
<h1>Welcome to {influencer.displayName}'s AI Chat</h1>
<p>Follow {influencer.displayName} on social media:</p>
<a href={influencer.socialMedia.instagram}>Instagram</a>
```

### **Environment Variables**

The config also generates environment variables:
```bash
NEXT_PUBLIC_INFLUENCER_NAME=Taylor Swift
NEXT_PUBLIC_INFLUENCER_HANDLE=taylorswift
NEXT_PUBLIC_PRIMARY_COLOR=#E91E63
```

## 🎉 Result

With this system, you can:

1. **Change one file** (`influencer.config.js`)
2. **Run one command** (`npm run update:project`)
3. **Get a completely customized website** for any influencer

The entire project adapts to the influencer - from the browser title to the color scheme to the social media links. It's like having a template that automatically customizes itself! 🎭✨
