# DocuRecover - Where Data is Stored

## Current Storage: Browser LocalStorage

### What is LocalStorage?

LocalStorage is a **client-side storage** built into web browsers. It stores data as key-value pairs **on the user's computer**, not on a server.

---

## Storage Location

### Physical Location on Your Computer

**Windows:**
- **Chrome:** `C:\Users\[YourUsername]\AppData\Local\Google\Chrome\User Data\Default\Local Storage\leveldb\`
- **Edge:** `C:\Users\[YourUsername]\AppData\Local\Microsoft\Edge\User Data\Default\Local Storage\leveldb\`
- **Firefox:** `C:\Users\[YourUsername]\AppData\Roaming\Mozilla\Firefox\Profiles\[profile]\storage\default\http+++localhost+3000\`

**Mac:**
- **Chrome:** `~/Library/Application Support/Google/Chrome/Default/Local Storage/leveldb/`
- **Safari:** `~/Library/Safari/LocalStorage/`

**Linux:**
- **Chrome:** `~/.config/google-chrome/Default/Local Storage/leveldb/`
- **Firefox:** `~/.mozilla/firefox/[profile]/storage/default/`

---

## How to View Data in Browser

### Chrome / Edge
1. Open http://localhost:3000
2. Press `F12` or Right-click → Inspect
3. Go to **Application** tab
4. Left sidebar: **Local Storage** → **http://localhost:3000**
5. You'll see all stored tracking IDs

### Firefox
1. Open http://localhost:3000
2. Press `F12` or Right-click → Inspect Element
3. Go to **Storage** tab
4. Left sidebar: **Local Storage** → **http://localhost:3000**
5. View all stored data

### Safari
1. Safari → Preferences → Advanced → Check "Show Develop menu"
2. Develop → Show Web Inspector
3. Go to **Storage** tab
4. Click **Local Storage**

---

## What Gets Stored

### Example Entry

**Key:** `request_DRMWHDO6UF`

**Value:**
```json
{
  "trackingId": "DRMWHDO6UF",
  "submissionDate": "2024-01-15T10:30:45.123Z",
  "fullName": "Ahmad bin Abdullah",
  "icNumber": "900101-01-1234",
  "phoneNumber": "+60 12-345 6789",
  "email": "ahmad@example.com",
  "address": "123, Jalan Merdeka, 50000 Kuala Lumpur",
  "disasterType": "flood",
  "documentsLost": ["mykad", "driving-license", "birth-cert"],
  "status": "processing",
  "currentStep": 3
}
```

---

## Storage Characteristics

### ✅ Advantages
- **Fast** - Instant read/write
- **No server needed** - Works offline
- **Free** - No hosting costs
- **Simple** - Easy to implement
- **Private** - Data stays on user's device

### ❌ Limitations
- **5-10 MB limit** per domain
- **Browser-specific** - Data doesn't sync across devices
- **No backup** - Lost if cache cleared
- **Insecure** - Anyone with access to browser can read
- **No server-side processing** - Can't integrate with government APIs

---

## Data Lifecycle

### 1. User Submits Request
```
Browser (Client)
     ↓
Create request object
     ↓
Generate tracking ID
     ↓
localStorage.setItem('request_DRXXXXXXXXXX', JSON.stringify(data))
     ↓
Data saved in browser
```

### 2. User Tracks Request
```
User enters tracking ID
     ↓
localStorage.getItem('request_DRXXXXXXXXXX')
     ↓
Parse JSON data
     ↓
Display on screen
```

### 3. Data Persistence
- Data persists until:
  - User clears browser cache
  - User deletes site data
  - Browser is uninstalled
  - User manually deletes localStorage

---

## Code Implementation

### Saving Data (in `app/recover/page.tsx`)
```typescript
const handleSubmit = () => {
  const trackingId = `DR${Date.now().toString(36).toUpperCase()}`;
  const submissionDate = new Date().toISOString();
  
  const requestData = {
    trackingId,
    submissionDate,
    fullName: formData.fullName,
    icNumber: formData.icNumber,
    phoneNumber: formData.phoneNumber,
    email: formData.email,
    address: formData.address,
    disasterType: formData.disasterType,
    documentsLost: formData.documentsLost,
    status: 'processing',
    currentStep: 3
  };
  
  // Save to localStorage
  localStorage.setItem(`request_${trackingId}`, JSON.stringify(requestData));
};
```

### Retrieving Data (in `app/track/page.tsx`)
```typescript
const loadRequestData = (id: string) => {
  // Retrieve from localStorage
  const storedData = localStorage.getItem(`request_${id}`);
  
  if (storedData) {
    const data = JSON.parse(storedData);
    setRequestData(data);
    setShowResults(true);
  } else {
    setNotFound(true);
  }
};
```

---

## Testing LocalStorage

### View All Tracking IDs
Open browser console (`F12` → Console tab) and run:
```javascript
// Get all keys
Object.keys(localStorage).filter(key => key.startsWith('request_'))

// Output: ["request_DRMWHDO6UF", "request_DRMWHDT90R", ...]
```

### View Specific Request
```javascript
const trackingId = 'DRMWHDO6UF';
const data = JSON.parse(localStorage.getItem(`request_${trackingId}`));
console.log(data);
```

### Delete a Request
```javascript
localStorage.removeItem('request_DRMWHDO6UF');
```

### Clear All Requests
```javascript
// Clear only DocuRecover requests
Object.keys(localStorage)
  .filter(key => key.startsWith('request_'))
  .forEach(key => localStorage.removeItem(key));
```

### Check Storage Usage
```javascript
// Calculate storage size
let total = 0;
for (let key in localStorage) {
  if (localStorage.hasOwnProperty(key)) {
    total += localStorage[key].length + key.length;
  }
}
console.log(`LocalStorage using: ${(total / 1024).toFixed(2)} KB`);
```

---

## Migration to Real Database

### Why You Need a Server Database

For production, you MUST move from localStorage to a server database because:

1. **Multi-Device Access**
   - User submits on phone, tracks on laptop ❌ Won't work with localStorage
   - Need server database ✅

2. **Government Integration**
   - Need to connect to JPN, JPJ, Immigration APIs
   - Can only be done server-side ✅

3. **Data Security**
   - LocalStorage is visible to anyone with browser access
   - Server database with authentication ✅

4. **Data Persistence**
   - LocalStorage cleared when browser cache cleared
   - Server database always available ✅

5. **Real-Time Updates**
   - Government agency updates status
   - Need server to push updates ✅

### Architecture Change Needed

**Current (LocalStorage):**
```
User Browser
    ↓
Submit Form
    ↓
Save to localStorage (same browser)
    ↓
Track from localStorage (same browser)
```

**Production (Server Database):**
```
User Browser (Any Device)
    ↓
Submit Form via API
    ↓
Server → Save to Database (PostgreSQL/MongoDB)
    ↓
Government APIs verify data
    ↓
User tracks from ANY device via API
    ↓
Server → Retrieve from Database
    ↓
Display on ANY browser
```

---

## Summary

### Current System
- **Location:** User's browser (localStorage)
- **File:** Not a file - stored in browser's internal database
- **Scope:** Per browser, per device
- **Capacity:** ~5-10 MB
- **Persistence:** Until cache cleared

### Where Exactly?
```
Your Computer
  └── Browser Data Folder
      └── LocalStorage
          └── http://localhost:3000
              └── request_DRXXXXXXXXXX = {JSON data}
```

### To See Your Data Right Now:
1. Open http://localhost:3000/recover
2. Submit a request
3. Press F12
4. Application tab → Local Storage → http://localhost:3000
5. Find `request_DRXXXXXXXXXX` entries
6. Click to see the full JSON data

---

## Next Steps for Production

When ready for production, you'll need to:

1. **Build Backend API** (Node.js/Express or Next.js API routes)
2. **Set up Database** (PostgreSQL recommended)
3. **Deploy Server** (AWS, Azure, DigitalOcean)
4. **Update Frontend** to call APIs instead of localStorage
5. **Secure with Authentication** (JWT tokens, API keys)

See `DATABASE_SYSTEM.md` for full production implementation guide.
