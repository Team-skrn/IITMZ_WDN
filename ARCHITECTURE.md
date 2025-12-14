# 🎯 Dynamic Water Management System Architecture

## Overview
The application now uses a **Single Page Application (SPA)** architecture with centralized configuration. All pages, sensors, and API credentials are defined in `config.js`, making changes instantly propagate across the entire app.

## File Structure

### Core Files (Modified)
- **`config.js`** - Central configuration file for ALL pages, sensors, and API credentials
- **`app.html`** - Single dynamic application page (replaces reservoir.html & overhead-tank.html)
- **`index.html`** - Hub page with dynamically generated navigation buttons
- **`index.html?page=...`** - Navigates to specific page via `app.html?page=pageId`

### Removed Files
- ❌ `reservoir.html` - Now replaced by `app.html?page=reservoir`
- ❌ `overhead-tank.html` - Now replaced by `app.html?page=overheadTank`

### Unchanged Files
- ✅ `translation-manager.js` - Language management
- ✅ `service-worker.js` - PWA functionality
- ✅ All translation JSON files

---

## How It Works

### 1. Adding a New Page (e.g., Sumps)

**Step 1**: Add to `config.js`:
```javascript
const appConfig = {
    pages: {
        // ... existing pages ...
        sumps: {
            id: 'sumps',
            displayName: 'Sumps',
            title: 'Sump Water Level Monitoring',
            icon: '🌊',
            sensors: {
                Main_Sump: {
                    displayName: 'Main Sump',
                    channelID: '3132083',
                    apiKey: '50S4XP3WORJWBWQJ',
                    field: 'field4',
                    isInteger: true,
                    limits: { warning: 200, danger: 50 }
                },
                // ... more sensors ...
            }
        }
    }
};
```

**Result**: Automatically appears as button on index.html and gets full dashboard at `app.html?page=sumps`

---

## Configuration Structure (`config.js`)

```javascript
appConfig = {
    pages: {
        pageId: {
            id: 'pageId',              // Unique identifier
            displayName: 'Page Name',  // Shows in buttons and headers
            title: 'Full Page Title',  // Browser title
            icon: '🏢',               // Emoji icon
            sensors: {
                SensorId: {
                    displayName: 'Sensor Name',
                    channelID: '3132083',    // ThingSpeak channel
                    apiKey: 'API_KEY_HERE',  // ThingSpeak API key
                    field: 'field3',         // Field number (field1-field8)
                    isInteger: true,         // Round values?
                    limits: {
                        warning: 150,  // Yellow indicator threshold
                        danger: 60     // Red indicator threshold
                    }
                }
            }
        }
    }
};
```

---

## URL Routing

- **Home**: `index.html`
- **Dashboard**: `app.html?page=reservoir`
- **Dashboard**: `app.html?page=overheadTank`
- **Future**: `app.html?page=newPage`

---

## Global Features

All pages automatically get:
- ✅ **Language selection** (10 languages)
- ✅ **Real-time water level monitoring**
- ✅ **Visual indicators** (red/yellow/green)
- ✅ **Historical charts** from ThingSpeak
- ✅ **Customizable alert thresholds**
- ✅ **Repeating/one-time notifications**
- ✅ **Global settings sync** across pages

---

## Hiding API Keys

### Current Approach (Basic)
- Keys are in `config.js` but not directly visible in console
- Non-enumerable with `Object.defineProperty`

### Recommended Approach (For Production)
Create a **backend proxy** to hide real API keys:

**Option A: Cloudflare Workers (Free)**
```javascript
// Deploy on Cloudflare
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const channelId = url.searchParams.get('channel');
    
    // Real API key stored in Cloudflare secret
    const apiKey = THINGSPEAK_API_KEY;
    
    const response = await fetch(
      `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}`
    );
    return response;
  }
};
```

**Option B: GitHub Actions (Build-time injection)**
```yaml
# .github/workflows/build.yml
- name: Inject API Keys
  run: |
    sed -i "s/API_KEY_PLACEHOLDER/${{ secrets.THINGSPEAK_API_KEY }}/g" config.js
```

**Option C: Simple Node.js Backend**
```javascript
// server.js (host on Heroku/Railway/Render)
app.get('/api/thingspeak', async (req, res) => {
  const { channel, field } = req.query;
  const response = await fetch(
    `https://api.thingspeak.com/channels/${channel}/feeds.json?api_key=${process.env.THINGSPEAK_API_KEY}`
  );
  res.json(await response.json());
});
```

---

## Making Changes

### To Modify Alert Settings:
→ Edit toggles in any page's "⚙️ Alert Settings" modal
→ Changes sync globally across all pages

### To Add New Sensor:
→ Edit `config.js`, add sensor entry
→ Automatically appears in that page's dashboard

### To Update API Key:
→ Update in `config.js`
→ All pages immediately use new key

### To Change Thresholds:
→ Edit `limits` in `config.js`
→ All pages update on reload

### To Change Titles/Names:
→ Edit `displayName`, `title`, `icon` in `config.js`
→ All pages refresh with new content

---

## Benefits of This Architecture

1. **DRY (Don't Repeat Yourself)**: One source of truth
2. **Scalable**: Add pages by editing one config file
3. **Maintainable**: Changes propagate instantly
4. **Consistent**: All pages share same features and styling
5. **Easy Deployment**: Single `app.html` handles all pages
6. **GitHub Friendly**: Works perfectly with GitHub Pages

---

## Testing

**Test new page locally**:
```bash
# Open in browser
file:///path/to/app.html?page=reservoir
```

**Check that alerts work**:
1. Open `app.html?page=reservoir`
2. Click "⚙️ Alert Settings"
3. Enable alerts for Reservoir
4. Set Min=50, Max=180
5. Enable repeating alerts
6. Save and monitor for notifications

---

## Future Enhancements

1. **Backend Proxy** for API key security
2. **Database** for historical data (>480 records)
3. **Admin Panel** to edit config.js without code
4. **Dark Mode** toggle
5. **Mobile App** build with same config
6. **API Monitoring Dashboard**

