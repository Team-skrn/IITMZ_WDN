# 🚀 Migration Guide: Old Files to New SPA Architecture

## What Changed?

### Old Structure (DEPRECATED)
```
index.html               → Home page with static buttons
reservoir.html          → Hardcoded Reservoir dashboard
overhead-tank.html      → Hardcoded Overhead Tank dashboard
config spread across files → API keys in each HTML file
```

### New Structure (CURRENT)
```
index.html              → Dynamic home with buttons from config.js
app.html                → Single dynamic dashboard for all pages
config.js               → Central configuration hub
- Change 1 place → Updates entire app
```

---

## Migration Steps

### Step 1: Keep Old Files as Backup (Optional)
```bash
# You can delete these or keep as archive
reservoir.html          → DELETE or ARCHIVE
overhead-tank.html      → DELETE or ARCHIVE
```

### Step 2: Update Links
**If you have external links, update them:**
```
❌ OLD: https://yoursite.com/reservoir.html
✅ NEW: https://yoursite.com/app.html?page=reservoir

❌ OLD: https://yoursite.com/overhead-tank.html
✅ NEW: https://yoursite.com/app.html?page=overheadTank
```

### Step 3: Update Service Worker (if needed)
The service worker still works! It caches:
- `index.html`
- `app.html` (replaces both old HTML files)
- `config.js`
- All resources

---

## Adding a New Page (Example: Sumps)

### Step 1: Edit `config.js`
Add to the `pages` object:
```javascript
const appConfig = {
    pages: {
        // ... existing pages ...
        sumps: {
            id: 'sumps',
            displayName: 'Sumps Monitoring',
            title: 'Sump Water Level Monitoring',
            icon: '🌊',
            sensors: {
                Sump_A: {
                    displayName: 'Sump A',
                    channelID: '3132083',
                    apiKey: '50S4XP3WORJWBWQJ',
                    field: 'field11',
                    isInteger: true,
                    limits: { warning: 200, danger: 50 }
                },
                Sump_B: {
                    displayName: 'Sump B',
                    channelID: '3132083',
                    apiKey: '50S4XP3WORJWBWQJ',
                    field: 'field12',
                    isInteger: true,
                    limits: { warning: 200, danger: 50 }
                }
            }
        }
    }
};
```

### Step 2: Done! ✅
The app automatically:
- ✅ Adds button to index.html home page
- ✅ Creates dashboard at `app.html?page=sumps`
- ✅ Initializes alert thresholds
- ✅ Sets up data fetching
- ✅ Enables all features (notifications, charts, etc.)

---

## Modifying Existing Page (Example: Change Reservoir Threshold)

### Before (Old Way)
1. Open `reservoir.html`
2. Find the hardcoded limit: `limits: { warning: 150, danger: 60 }`
3. Change it
4. Repeat for any other pages that share this sensor
5. ❌ Inconsistent if you forget to update all places

### After (New Way)
1. Open `config.js`
2. Find `Reservoir` sensor
3. Change: `limits: { warning: 200, danger: 80 }`
4. Save
5. ✅ All pages instantly updated (global change)

---

## Updating API Keys

### Before (Old Way)
Edit in `reservoir.html`, `overhead-tank.html`, `app.js`
Risk: Might miss some files → Inconsistent behavior

### After (New Way)
Edit only in `config.js`:
```javascript
Reservoir: {
    displayName: 'Reservoir',
    channelID: '3132083',     // ← Change here
    apiKey: 'NEW_API_KEY',    // ← Change here
    field: 'field3',
    ...
}
```
✅ All pages use new credentials immediately

---

## Translation Keys

**No changes needed!** Translation keys work the same:
- `data-i18n="water_management"`
- `data-i18n="language_label"`
- etc.

All 10 language files still work:
- ar.json (Arabic)
- en.json (English)
- es.json (Spanish)
- fr.json (French)
- gu.json (Gujarati)
- hi.json (Hindi)
- mr.json (Marathi)
- sw.json (Swahili)
- ta.json (Tamil)
- te.json (Telugu)

---

## Testing the New System

### Test 1: Dynamic Buttons
1. Open `index.html`
2. You should see:
   - 💧 Reservoir
   - 🏢 Overhead Tank
   - Buttons generated from `config.js`

### Test 2: Dashboard
1. Click "💧 Reservoir" button
2. URL becomes: `app.html?page=reservoir`
3. Dashboard loads with Reservoir sensors

### Test 3: Global Settings
1. On Reservoir dashboard, click "⚙️ Alert Settings"
2. Set Reservoir Min=50, Max=180
3. Enable repeating alerts
4. Save
5. Go to Overhead Tank dashboard
6. Click "⚙️ Alert Settings"
7. ✅ Settings are still there! (Global sync working)

### Test 4: Add New Page
1. Edit `config.js`, add `groundwater` page with 2 sensors
2. Refresh `index.html`
3. ✅ New button appears
4. Click it → Dashboard works automatically

---

## Troubleshooting

### Problem: Buttons not showing on index.html
**Solution**: Make sure `config.js` is loaded before buttons generate
- Check: `<script src="config.js"></script>` in `index.html`
- Check: No JavaScript errors in console (F12)

### Problem: App.html page shows wrong sensors
**Solution**: Check URL parameter
- Correct: `app.html?page=reservoir`
- Wrong: `app.html` (missing page parameter)

### Problem: Alert settings not syncing
**Solution**: Check localStorage
- Open DevTools (F12) → Application → LocalStorage
- Look for `globalAlertSettings` key
- Should contain all sensor thresholds

### Problem: Old reservoir.html links break
**Solution**: Update links in any docs/links
```
OLD: /reservoir.html
NEW: /app.html?page=reservoir
```

---

## Deployment to GitHub Pages

### Step 1: Push updated files
```bash
git add config.js app.html ARCHITECTURE.md
git add index.html  # Updated with dynamic buttons
git commit -m "Refactor: Implement dynamic SPA architecture"
git push
```

### Step 2: Update README.md
```markdown
## Access the App

- **Home**: https://yourusername.github.io/IITM-LVL-DSPLY-RT-MON-main/
- **Reservoir Dashboard**: https://yourusername.github.io/IITM-LVL-DSPLY-RT-MON-main/app.html?page=reservoir
- **Overhead Tank**: https://yourusername.github.io/IITM-LVL-DSPLY-RT-MON-main/app.html?page=overheadTank
```

### Step 3: GitHub Pages Settings
- Repository → Settings → Pages
- Source: Deploy from a branch
- Branch: `main` (or `master`)
- Folder: `/ (root)`
- ✅ Save

---

## Hiding API Keys (For Production)

### Option 1: Use Backend Proxy (Recommended)
Create a `/api/thingspeak` endpoint that proxies requests:
```javascript
// Your backend (Vercel, Cloudflare, etc.)
const apiKey = process.env.THINGSPEAK_API_KEY; // Secret env var

app.get('/api/thingspeak/:channel/:field', async (req, res) => {
  const { channel, field } = req.params;
  const response = await fetch(
    `https://api.thingspeak.com/channels/${channel}/feeds.json?api_key=${apiKey}`
  );
  res.json(await response.json());
});
```

Then in `config.js`, change fetch URL:
```javascript
// OLD:
const url = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${apiKey}`;

// NEW:
const url = `/api/thingspeak/${channelID}/${field}`;
```

### Option 2: Obfuscate Keys
```javascript
// config.js
const API_KEY = atob('NTBTNFhQM1dPUkpXQldRSg=='); // Encoded
// Still not super secure, but not visible at first glance
```

### Option 3: Environment Variables (GitHub Secrets)
```yaml
# .github/workflows/deploy.yml
- name: Build
  run: |
    sed -i "s/API_KEY_PLACEHOLDER/${{ secrets.THINGSPEAK_API_KEY }}/g" config.js
```

---

## Summary

| Aspect | Old System | New System |
|--------|-----------|-----------|
| Files | Multiple HTML files | 1 dynamic app.html |
| Configuration | Spread across files | Central config.js |
| Adding page | Create new HTML + JS | Add to config.js |
| Update API key | Edit multiple files | Edit config.js once |
| Sync settings | Manual | Automatic (global) |
| Code duplication | High | None |
| Maintainability | Hard | Easy |
| Deployment | Copy multiple files | Copy/update config |

✅ **Migration complete!** The app is now fully dynamic and scalable.
