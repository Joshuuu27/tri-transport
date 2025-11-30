# Google Maps API Setup Guide

## Steps to Fix "Something went wrong" Error

### 1. **Verify API Key is Valid**
- Go to: https://console.cloud.google.com/
- Check your API key is active (not disabled)
- Ensure it's not expired

### 2. **Enable Required APIs**
In Google Cloud Console, enable these APIs:
- ✅ Maps JavaScript API
- ✅ Directions API  
- ✅ Geocoding API
- ✅ Places API (optional, for address search)

**Steps:**
1. Go to https://console.cloud.google.com/apis/library
2. Search for each API
3. Click "Enable" button for each

### 3. **Set HTTP Referrer Restrictions**
1. Go to https://console.cloud.google.com/apis/credentials
2. Find your API key
3. Click on it to edit
4. Under "Application restrictions", select "HTTP referrers (web sites)"
5. Add these URLs:
   ```
   http://localhost:3000/*
   http://localhost:3001/*
   localhost/*
   ```
   (For production, use your actual domain)

### 4. **Test Locally**
- Your API key should work at `http://localhost:3000`
- If using `127.0.0.1`, add that to referrers too

### 5. **Common Issues & Solutions**

| Error | Cause | Solution |
|-------|-------|----------|
| "Referer not allowed" | HTTP referrer not whitelisted | Add `localhost/*` to referrers |
| "Invalid API Key" | Key is disabled or doesn't exist | Create new key in Cloud Console |
| Maps blank/not loading | API not enabled | Enable Maps JavaScript API |
| Directions not working | Directions API not enabled | Enable Directions API |

### 6. **Verify Current Setup**
Your `.env` file should have:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyA3MZQE9Q8qsxFr3_hMN0JUsXt76PVFVPc
```

### 7. **Check Browser Console**
Open DevTools (F12) → Console → Check for error messages

### Quick Fix (Development Only)
If you want to test without restrictions:
1. Create a new API key
2. Leave "Application restrictions" as "None" (not recommended for production)
3. Use that key in `.env`

---

**Need Help?**
- Official Docs: https://developers.google.com/maps/documentation/javascript/error-messages
- API Keys: https://console.cloud.google.com/apis/credentials
- Pricing: https://console.cloud.google.com/project/*/billing
