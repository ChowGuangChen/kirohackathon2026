# DocuRecover – AI Disaster Document Recovery Assistant

An AI-powered platform helping Malaysians recover lost or damaged official documents (MyKad, Passport, Birth Certificate, Driving Licence, Academic Certificates) after floods, fires, and other disasters.

## Features

- **AI Document Identification** — Upload a photo of a damaged document; Gemini Vision AI assesses the damage level and identifies the document type.
- **Recovery Guidance Chatbot** — Ask questions about JPN, JPJ, Immigration, and LPM procedures; the AI responds with verified, source-cited answers.
- **Personalised Recovery Checklist** — Auto-generated step-by-step tasks tailored to your documents and disaster type.
- **Document Inventory** — Track the status and recovery progress of each affected document.
- **Official Resource Directory** — Searchable directory of Malaysian government agencies with contact details.
- **Bilingual** — Full English and Bahasa Malaysia support.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 + Tailwind CSS 4 |
| State / Storage | React Context + localStorage |
| AI Vision | Google Gemini 2.0 Flash (`gemini-2.0-flash`) |
| AI Chatbot | Google Gemini 2.0 Flash |
| Deployment | Vercel |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.local.example` to `.env.local` and add your Gemini API key:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey).

> **Note:** The app works without an API key — all three AI features fall back to a curated local knowledge base so the demo is fully functional offline.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo

For hackathon evaluators, use the **1-Click Demo Login** button on the sign-in page to skip registration and jump straight to the onboarding flow.

**Recommended demo scenario:**
1. Sign in → select **Flood** as disaster type → enter a location → select **MyKad** and **Birth Certificate** as affected documents.
2. Go to **Upload Document** → drag in any photo → click **Identify with AI**.
3. Open **Recovery Assistant** → ask *"How do I replace my MyKad after a flood?"*
4. Check **Recovery Plan** → tick off tasks to track progress.

## Project Structure

```
app/
├── (app)/                  # Authenticated app pages
│   ├── dashboard/          # Recovery overview
│   ├── documents/          # Document inventory + upload
│   ├── assistant/          # AI chatbot
│   ├── plan/               # Recovery checklist
│   ├── resources/          # Agency directory
│   ├── onboarding/         # Disaster case setup
│   └── settings/           # Account & privacy
├── (auth)/                 # Login / signup
├── api/
│   ├── chat/               # Gemini chatbot route
│   ├── identify-document/  # Gemini Vision document assessment route
│   └── generate-checklist/ # Checklist generation route
├── _components/            # Shared UI components
└── _lib/
    ├── context/            # App-wide state (React Context)
    ├── data/               # Malaysian document knowledge base
    ├── hooks/              # useLocalStorage
    ├── i18n/               # EN/BM translations
    ├── types/              # TypeScript interfaces
    └── utils/              # Helper functions
```

## Supported Documents (MVP)

| Document | Issuing Authority |
|---|---|
| MyKad (Identity Card) | JPN |
| Birth Certificate | JPN |
| Malaysian Passport | Jabatan Imigresen (JIM) |
| Driving Licence | JPJ |
| Academic Certificates (SPM/Degree) | LPM / University |

## AI Disclaimer

AI identification and recovery guidance is **preliminary only**. It does not certify document authenticity or determine official eligibility. All procedures must be confirmed at the relevant government agency counter.
