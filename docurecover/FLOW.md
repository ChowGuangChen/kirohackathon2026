# DocuRecover - User Flow

## Overview
A minimalistic, no-signup document recovery system for Malaysian disaster victims.

## User Journey

### Landing Page (`/`)
- Simple hero section with call-to-action
- "How It Works" overview (5 steps)
- Supported documents showcase
- No authentication required
- Two main actions:
  - **Start Recovery Process** → `/recover`
  - **Track Status** → `/track`

---

## Recovery Process (`/recover`)

### Step 1: Register Information
User provides:
- Full Name (as per IC)
- IC Number
- Phone Number
- Address
- Email Address

**No account creation** - information is used only for processing

---

### Step 2: Report Disaster & Documents
User selects:
1. **Type of Disaster:**
   - Flood 🌊
   - Fire 🔥
   - Landslide ⛰️
   - Other ⚠️

2. **Documents Lost/Damaged** (multiple selection):
   - MyKad (Identity Card) 🪪
   - Malaysian Passport 🛂
   - Birth Certificate 📜
   - Driving License 🚗

---

### Step 3: Upload Proof & Verification
User uploads:
1. **Proof of Damaged/Lost Documents**
   - Photos of damaged documents
   - Police report (if available)
   - Multiple file upload supported

2. **Face Verification**
   - Camera-based selfie capture
   - Identity confirmation

---

### Step 4: Review & Confirmation
- Display summary of all entered information
- Show selected disaster type and documents
- Confirm proof uploaded and face verified
- User consent for government database access
- **Submit** button to process request

**System Actions:**
- Connects to government databases (JPN, JPJ, Immigration)
- Retrieves existing records
- Validates information
- Generates unique Tracking ID

---

### Step 5: Tracking & Status
- Display unique **Tracking ID** (format: `DRXXXXXXXXXX`)
- Show estimated timeline (14 days)
- Breakdown of process:
  1. Verify existing records (1-2 days)
  2. Process & approve (3-5 days)
  3. Print & quality check (2-3 days)
  4. Delivery (5-7 days)

- Action buttons:
  - **Track Status** → Track page with ID
  - **Home** → Return to landing

---

## Tracking Page (`/track`)

### Without Tracking ID
- Input field for Tracking ID
- Format validation
- "Start new recovery request" link

### With Tracking ID
Shows:
1. **Status Overview Card:**
   - Current status
   - Estimated delivery date
   - Days remaining

2. **Progress Timeline:**
   - ✓ Request Received
   - ✓ Verifying Records
   - ⚙️ Processing & Approval (current)
   - ⏳ Document Printing (pending)
   - ⏳ Out for Delivery (pending)

3. **Documents Requested:**
   - List of documents with agency and status

4. **Help Section:**
   - Contact information for JPN, JPJ, Immigration

---

## Key Features

### What We Removed ❌
- Sign up / Sign in pages
- User authentication system
- Navigation bar with repetitive links
- Dashboard
- Complex user management

### What We Kept ✅
- Simple, clean UI
- Essential recovery flow
- Status tracking
- Government agency integration (backend)
- 14-day delivery tracking

---

## Technical Implementation

### Pages Structure
```
app/
├── page.tsx              # Landing page
├── recover/
│   └── page.tsx          # 5-step recovery flow
├── track/
│   └── page.tsx          # Status tracking
└── layout.tsx            # Root layout (no auth provider)
```

### State Management
- Local component state (React useState)
- No global context needed
- Session data stored temporarily during flow
- Tracking ID is the only persistent identifier

### Design Principles
1. **Minimalism** - Only essential information
2. **Clarity** - Clear step-by-step guidance
3. **Accessibility** - Simple forms, clear labels
4. **Mobile-first** - Responsive design
5. **No friction** - No signup barriers

---

## Backend Integration Points

### Step 4: Confirmation & Submission
When user confirms, system should:
1. Generate unique Tracking ID
2. Store submission data in database
3. Initiate verification with:
   - JPN (MyKad, Birth Certificate)
   - JPJ (Driving License)
   - Immigration (Passport)
4. Create processing workflow
5. Set up delivery tracking

### Step 5: Tracking
- Query database by Tracking ID
- Return current status and timeline
- Update progress as agencies process

---

## Timeline Breakdown

| Step | Process | Duration | Total Days |
|------|---------|----------|------------|
| 1 | Request Received | Immediate | 0 |
| 2 | Verify Records | 1-2 days | 1-2 |
| 3 | Process & Approve | 3-5 days | 4-7 |
| 4 | Print & QC | 2-3 days | 6-10 |
| 5 | Delivery | 5-7 days | 11-17 |

**Target:** Within 14 working days

---

## Government Agencies

- **JPN (Jabatan Pendaftaran Negara)** - MyKad, Birth Certificates
- **JPJ (Jabatan Pengangkutan Jalan)** - Driving Licenses  
- **Immigration** - Passports
- **NADMA** - Fee waivers for disaster victims
