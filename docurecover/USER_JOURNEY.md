# DocuRecover - User Journey Diagram

## Visual Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        LANDING PAGE (/)                          │
│                                                                  │
│  🏠 DocuRecover - Recover Documents After Disaster              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ✓ No Signup Required                                    │  │
│  │  ✓ 5 Simple Steps                                        │  │
│  │  ✓ 14-Day Delivery                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│         [Start Recovery Process]  [Track Status]                │
│                    │                      │                      │
└────────────────────┼──────────────────────┼──────────────────────┘
                     │                      │
                     ▼                      ▼
        ┌─────────────────────┐   ┌─────────────────────┐
        │  RECOVERY FLOW      │   │   TRACKING PAGE     │
        │     (/recover)      │   │     (/track)        │
        └─────────────────────┘   └─────────────────────┘
                 │                          │
                 ▼                          │
┌────────────────────────────────────────────────────────────────┐
│                      STEP 1: REGISTER INFO                      │
│                                                                 │
│  📝 Personal Information (No Account Creation)                 │
│     • Full Name                                                │
│     • IC Number                                                │
│     • Phone Number                                             │
│     • Address                                                  │
│     • Email                                                    │
│                                                                 │
│                      [Continue →]                               │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│              STEP 2: REPORT DISASTER & DOCUMENTS               │
│                                                                 │
│  ⚠️  Type of Disaster:                                         │
│     [ 🌊 Flood ]  [ 🔥 Fire ]  [ ⛰️ Landslide ]  [ ⚠️ Other ]  │
│                                                                 │
│  📋 Documents Lost/Damaged (Select all):                       │
│     [ ] 🪪 MyKad (Identity Card)                               │
│     [ ] 🛂 Malaysian Passport                                  │
│     [ ] 📜 Birth Certificate                                   │
│     [ ] 🚗 Driving License                                     │
│                                                                 │
│                [← Back]  [Continue →]                           │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│            STEP 3: UPLOAD PROOF & VERIFICATION                 │
│                                                                 │
│  📸 Upload Proof of Damaged/Lost Documents:                    │
│     ┌────────────────────────────────────┐                     │
│     │  [Click to upload photos]          │                     │
│     │  PNG, JPG up to 10MB               │                     │
│     └────────────────────────────────────┘                     │
│                                                                 │
│  📷 Face Verification:                                          │
│     ┌────────────────────────────────────┐                     │
│     │  [Start Camera]                    │                     │
│     │  Verify your identity              │                     │
│     └────────────────────────────────────┘                     │
│                                                                 │
│                [← Back]  [Continue →]                           │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│                STEP 4: REVIEW & CONFIRMATION                    │
│                                                                 │
│  ✓ Personal Information                                        │
│    Ahmad bin Abdullah                                          │
│    900101-01-1234                                              │
│    +60 12-345 6789                                             │
│                                                                 │
│  ✓ Disaster Type: Flood                                        │
│                                                                 │
│  ✓ Documents to Recover:                                       │
│    • MyKad                                                     │
│    • Driving License                                           │
│                                                                 │
│  ✓ Proof Uploaded                                              │
│  ✓ Face Verified                                               │
│                                                                 │
│  ℹ️  By submitting, you authorize government agencies         │
│     to retrieve your records and process your request          │
│                                                                 │
│                [← Back]  [Confirm & Submit]                     │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
                    ⚙️ SYSTEM ACTIONS
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   [Connect to]       [Retrieve]        [Generate]
   Government DB      Records           Tracking ID
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
┌────────────────────────────────────────────────────────────────┐
│                   STEP 5: SUCCESS & TRACKING                    │
│                                                                 │
│                       ✅ Success!                               │
│                                                                 │
│        Your Tracking ID: DRXXXXXXXXXX                          │
│                                                                 │
│  📦 What happens next?                                          │
│     1. Verify records (1-2 days)                               │
│     2. Process & approve (3-5 days)                            │
│     3. Print & QC (2-3 days)                                   │
│     4. Delivery (5-7 days)                                     │
│                                                                 │
│     Total: Within 14 working days                              │
│                                                                 │
│              [Track Status]  [Home]                             │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│                    TRACKING PAGE (/track)                       │
│                                                                 │
│  🔍 Track Your Request                                          │
│                                                                 │
│     Tracking ID: DRXXXXXXXXXX                                  │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Current Status: Processing & Approval ⚙️               │   │
│  │  Estimated Delivery: 28 Dec 2024                       │   │
│  │  Days Remaining: 13 days                               │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Progress Timeline:                                            │
│     ✅ 1. Request Received        (15 Dec, 10:30 AM)          │
│     ✅ 2. Verifying Records       (16 Dec, 2:15 PM)           │
│     ⚙️  3. Processing & Approval  (In Progress)               │
│     ⏳ 4. Document Printing       (Pending)                   │
│     ⏳ 5. Out for Delivery        (Pending)                   │
│                                                                 │
│  Documents Requested:                                          │
│     • MyKad (JPN) - Processing                                │
│     • Driving License (JPJ) - Processing                      │
│                                                                 │
│  💬 Need Help?                                                 │
│     • JPN: 1-300-88-1300                                      │
│     • JPJ: 03-8000 8000                                       │
│     • Immigration: 03-8880 1000                               │
│                                                                 │
│         [Track Another Request]  [Home]                        │
└────────────────────────────────────────────────────────────────┘
```

## Key Features

### 🚀 No Barriers
- ✅ **No signup required** - Start immediately
- ✅ **No login needed** - Direct access
- ✅ **Single purpose** - One clear goal

### 📱 Simple & Clean
- ✅ **5 progressive steps** - Clear path forward
- ✅ **Minimal UI** - Only essential information
- ✅ **Mobile-friendly** - Works on any device

### 📊 Progress Tracking
- ✅ **Unique Tracking ID** - Easy to remember format
- ✅ **Real-time status** - See current progress
- ✅ **14-day timeline** - Clear expectations

### 🏛️ Government Integration
- ✅ **JPN** - MyKad, Birth Certificates
- ✅ **JPJ** - Driving Licenses
- ✅ **Immigration** - Passports
- ✅ **NADMA** - Fee waivers

## User Experience

### Time to Complete
- **Step 1-2:** 2-3 minutes (Basic info + disaster type)
- **Step 3:** 1-2 minutes (Upload photos + face verification)
- **Step 4:** 30 seconds (Review + confirm)
- **Step 5:** Instant (Get tracking ID)

**Total: ~5 minutes** from start to tracking ID

### After Submission
- Documents processed: **14 working days**
- Can track anytime with Tracking ID
- No account management needed
- No password to remember

## Mobile Experience

All pages are optimized for mobile:
- Large touch targets
- Easy form inputs
- Camera integration for verification
- Responsive layouts
- Fast loading

## Accessibility

- Clear labels for all inputs
- High contrast text
- Keyboard navigation
- Screen reader friendly
- Simple language

---

**This is the complete user journey from landing to delivery tracking!** 🎉
