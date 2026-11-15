# DocuRecover - Database System Explanation

## Current Implementation: LocalStorage-Based Tracking

### How It Works

Each tracking ID now has its **own unique history** stored in the browser's localStorage.

### Data Flow

```
User Submits Form (Step 5)
         ↓
Generate Unique Tracking ID (DR + timestamp)
         ↓
Store Request Data in LocalStorage
         ↓
Key: "request_DRXXXXXXXXXX"
Value: {
  trackingId: "DRXXXXXXXXXX",
  submissionDate: "2024-01-15T10:30:00Z",
  fullName: "Ahmad bin Abdullah",
  icNumber: "900101-01-1234",
  phoneNumber: "+60 12-345 6789",
  email: "ahmad@example.com",
  address: "123, Jalan Merdeka...",
  disasterType: "flood",
  documentsLost: ["mykad", "driving-license"],
  status: "processing",
  currentStep: 3
}
```

### What Gets Stored

When a user submits a recovery request:

1. **Personal Information**
   - Full Name
   - IC Number
   - Phone Number
   - Email
   - Address

2. **Disaster Details**
   - Type of disaster (flood/fire/landslide/other)
   - Documents lost/damaged (array)

3. **Tracking Information**
   - Unique Tracking ID
   - Submission date (ISO format)
   - Current status
   - Current processing step

### How Tracking Works

1. **Submit Request** → Data saved with tracking ID as key
2. **Track Status** → Retrieve data using tracking ID
3. **Display Results** → Show actual documents requested by that specific user

### Example

**User 1 submits:**
- Tracking ID: `DRMWHDO6UF`
- Documents: MyKad, Driving License
- Date: Jan 15, 2024, 10:30 AM

**User 2 submits:**
- Tracking ID: `DRMWHDT90R`
- Documents: Passport, Birth Certificate, Vehicle Grant
- Date: Jan 15, 2024, 11:45 AM

Each tracking ID will show **different documents** and **different submission dates**.

---

## Limitations of Current System

### ⚠️ LocalStorage Limitations

1. **Browser-Specific**
   - Data only exists in the browser where request was made
   - Won't work on different devices/browsers
   - Data lost if browser cache is cleared

2. **No Real Database**
   - Data not synchronized across devices
   - No backup or recovery
   - Limited to ~5-10MB storage

3. **No Server Communication**
   - No actual government database connection
   - Status updates are simulated
   - Can't receive real-time updates

---

## Production Implementation Needed

For a real production system, you need:

### 1. Backend Database (Required)

**Option A: SQL Database** (PostgreSQL, MySQL)
```sql
CREATE TABLE requests (
  id UUID PRIMARY KEY,
  tracking_id VARCHAR(20) UNIQUE NOT NULL,
  submission_date TIMESTAMP NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  ic_number VARCHAR(20) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  disaster_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  current_step INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE request_documents (
  id UUID PRIMARY KEY,
  request_id UUID REFERENCES requests(id),
  document_type VARCHAR(50) NOT NULL,
  agency VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE status_history (
  id UUID PRIMARY KEY,
  request_id UUID REFERENCES requests(id),
  step INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  date TIMESTAMP NOT NULL,
  notes TEXT
);
```

**Option B: NoSQL Database** (MongoDB)
```javascript
{
  trackingId: "DRXXXXXXXXXX",
  submissionDate: ISODate("2024-01-15T10:30:00Z"),
  personalInfo: {
    fullName: "Ahmad bin Abdullah",
    icNumber: "900101-01-1234",
    phoneNumber: "+60 12-345 6789",
    email: "ahmad@example.com",
    address: "123, Jalan Merdeka..."
  },
  disaster: {
    type: "flood",
    documents: ["mykad", "driving-license"]
  },
  status: {
    current: "processing",
    step: 3,
    history: [
      { step: 1, status: "completed", date: ISODate("...") },
      { step: 2, status: "completed", date: ISODate("...") },
      { step: 3, status: "current", date: ISODate("...") }
    ]
  },
  documents: [
    {
      type: "mykad",
      agency: "JPN",
      status: "processing",
      updatedAt: ISODate("...")
    }
  ]
}
```

### 2. Backend API Endpoints

```typescript
// Submit new request
POST /api/requests
Body: { fullName, icNumber, ... }
Response: { trackingId, submissionDate }

// Get request status
GET /api/requests/:trackingId
Response: { trackingId, status, documents, timeline, ... }

// Update request status (admin/system)
PATCH /api/requests/:trackingId
Body: { status, step }
Response: { success: true }

// Upload documents
POST /api/requests/:trackingId/documents
Body: FormData (files)
Response: { uploadedFiles: [...] }
```

### 3. Government API Integration

Connect to actual government systems:

```typescript
// JPN API (MyKad, Birth Certificate)
POST /api/jpn/verify
Body: { icNumber, fullName }
Response: { verified: true, records: {...} }

// JPJ API (Driving License, Vehicle Grant)
POST /api/jpj/verify
Body: { icNumber, licenseNumber }
Response: { verified: true, records: {...} }

// Immigration API (Passport)
POST /api/immigration/verify
Body: { passportNumber, icNumber }
Response: { verified: true, records: {...} }
```

### 4. Real-Time Status Updates

Implement WebSocket or Server-Sent Events:

```typescript
// WebSocket connection
const ws = new WebSocket(`wss://api.docurecover.my/track/${trackingId}`);

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  // { step: 4, status: "printing", date: "..." }
  updateUIWithNewStatus(update);
};
```

### 5. Notification System

- **SMS Notifications** (via Twilio, AWS SNS)
- **Email Notifications** (via SendGrid, AWS SES)
- **Push Notifications** (via Firebase Cloud Messaging)

```typescript
// When status changes
async function notifyUser(trackingId: string, newStatus: string) {
  const request = await db.getRequest(trackingId);
  
  // Send SMS
  await sms.send(request.phoneNumber, 
    `Your document request ${trackingId} is now ${newStatus}`);
  
  // Send Email
  await email.send(request.email, {
    subject: 'Document Recovery Status Update',
    body: `Your request has been updated to: ${newStatus}`
  });
}
```

---

## Migration Path

### Phase 1: Current (LocalStorage)
✅ Works for demo/testing
✅ Each tracking ID has unique data
❌ No persistence across devices
❌ No real government integration

### Phase 2: Backend API (Next Step)
- Set up Node.js/Express or Next.js API routes
- Use PostgreSQL or MongoDB
- Store all requests in database
- Build API endpoints for submit/track

### Phase 3: Government Integration
- Partner with JPN, JPJ, Immigration
- Obtain API access credentials
- Implement verification workflows
- Handle authentication/authorization

### Phase 4: Production Features
- SMS/Email notifications
- Admin dashboard for agencies
- Document upload to cloud storage
- Real-time tracking updates
- Mobile app integration

---

## Current System Summary

✅ **What Works Now:**
- Each tracking ID stores unique request data
- Documents shown match what user selected
- Submission date is actual date user submitted
- Multiple requests can be submitted
- Each can be tracked independently

❌ **What Needs Backend:**
- Data persistence across browsers/devices
- Real government database verification
- Actual document processing
- Status updates from agencies
- SMS/Email notifications
- Admin panel for government agencies

---

## For Development/Testing

The current localStorage system is perfect for:
- ✅ Prototyping and demo
- ✅ Testing user flow
- ✅ UI/UX development
- ✅ Showing to stakeholders

But for production launch, you **must implement** a proper backend database and API system.

---

## Next Steps for Production

1. **Choose Database:** PostgreSQL (recommended for structured data)
2. **Build Backend:** Node.js + Express or Next.js API routes
3. **Deploy:** AWS, Azure, or DigitalOcean
4. **Security:** HTTPS, JWT authentication, input validation
5. **Integration:** Work with government agencies for API access
6. **Testing:** Load testing, security audit
7. **Launch:** Soft launch → Public launch

**Estimated Timeline:** 3-6 months for full production system
