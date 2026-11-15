# DocuRecover – Disaster Document Recovery

DocuRecover helps Malaysians recover documents that were lost or damaged in a flood, fire or landslide. Users don't need an account. They fill in a 5-step form, verify their identity with a face scan, and get a tracking ID to follow their request for up to 14 days. The whole app works in English and Bahasa Melayu.

> **Prototype.** Requests are saved in the browser only, and the government checks and delivery updates are simulated. See [Limitations](#limitations).

## Features

- **No sign-up.** Users start the recovery form straight from the home page.
- **5-step recovery form**
  1. **Register:** name, IC number, phone, address and email, with mandatory-field rules shown in red.
  2. **Report:** disaster type and the documents that were lost or damaged (11 types in 3 groups).
  3. **Verify identity:** upload a document that shows your face (MyKad, passport, licence, OKU card). A live camera scan then has you turn your head left and right, flashes red, green and blue light, and compares your face with the document photo.
  4. **Confirm:** review everything, then submit. A short loading bar runs while it submits.
  5. **Track:** shows the tracking ID and what happens next.
- **Request tracking.** Enter a tracking ID to see the current stage, a timeline, the estimated delivery date and the status of each document. The stages move forward based on how long ago the request was submitted.
- **EN / BM switch.** The chosen language stays when you move between pages.
- **Phone View / Website View.** On a computer screen, the Phone View button in the header shows the app inside a phone-sized frame. The Website View button above the frame switches back to the full page. On a real phone the app already uses the phone layout, so the buttons don't appear.

### Supported documents

| Group | Documents |
|---|---|
| Identity & Citizenship (JPN) | MyKad, Birth Certificate, Marriage / Divorce Certificate |
| Travel & Transport (Immigration & JPJ) | Passport, Driving Licence (LMM), Vehicle Ownership Certificate (Geran) |
| Property, Education & Finance | Land Title / House Grant, SPM / STPM / University Certificates, OKU Card, Bank Passbook, Insurance Policy Summary |

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) with React 19 and TypeScript
- [Tailwind CSS 4](https://tailwindcss.com), milk white (`#FBF8EF`) and lime green theme
- [@vladmandic/face-api](https://github.com/vladmandic/face-api) for face detection, head-turn tracking and face matching, all in the browser
- Browser `localStorage` for saved requests and the language setting

## Getting started

You need Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Other commands:

```bash
npm run build   # production build
npm start       # run the production build
npm run lint    # ESLint
```

You don't need any environment variables or API keys. The face models ship with the project in `public/face-models/`.

The camera only works on `localhost` or over HTTPS. The browser asks for camera permission when the face scan starts.

> `.env.local.example` and the routes in `app/api/` (which read `GEMINI_API_KEY`) are left over from an earlier version of the app. The current pages don't use them.

## How the face check works

1. **Document photo:** the app finds the face on the uploaded document with SSD MobileNet and turns it into a 128-number face descriptor.
2. **Live scan:** a lightweight face detector with 68 face points follows the face, measures where the nose sits between the jaw edges to detect left and right head turns, and checks that the face stays in the circle while the screen flashes red, green and blue.
3. **Match:** the app takes 3 face captures and compares them with the document descriptor. If the closest match is under 0.6 apart (face-api's usual threshold), the faces match. This is shown as at least 40% similarity.

The models (about 12 MB) are served from `public/face-models/`. Photos stay in the browser's memory. They are never uploaded or saved.

## Project structure

```
app/
├── page.tsx                  Home page
├── layout.tsx                Root layout and fonts
├── globals.css               Theme colours and animations
├── recover/
│   ├── page.tsx              5-step recovery form
│   └── FaceScan.tsx          Live camera face scan
├── track/
│   ├── page.tsx              Route entry
│   ├── TrackPageWrapper.tsx  Suspense boundary for URL search params
│   └── TrackPageClient.tsx   Tracking search and results
├── _components/
│   └── SiteHeader.tsx        Shared header with EN/BM switch
└── _lib/
    ├── documents.ts          Document and disaster lists (EN + BM), request type
    ├── face.ts               Face model loading and document face extraction
    └── useLanguage.ts        Saved EN/BM language setting
public/face-models/           Face detection and recognition models
```

## Tracking timeline

The status is calculated from the submission date:

| Stage | Days after submitting |
|---|---|
| Request received | 0 |
| Verifying records | 0–2 |
| Processing & approval | 2–7 |
| Document printing | 7–10 |
| Out for delivery | 10–14 |
| Delivered | 14+ |

## Limitations

- **Saved in the browser only.** A request can only be tracked in the same browser it was submitted from, and it's lost if site data is cleared.
- **No real government connection.** The JPN, JPJ and Immigration checks, the processing stages and delivery are simulated.
- **Basic face check.** The colour flash is a visual step only and doesn't measure light reflected off the face, so it won't catch a printed photo or a screen held up to the camera. Glare on the card or poor lighting lowers the match score.
- **Name field** accepts letters and spaces only. Names with `/`, `'` or `-` (for example "a/l") can't be typed in yet.

## Next steps for production

- A server API and database for requests
- Integration with JPN, JPJ and Immigration systems
- SMS and email status notifications
- Server-side identity verification with proper liveness (anti-spoofing) checks
- Secure, encrypted storage for uploaded documents
