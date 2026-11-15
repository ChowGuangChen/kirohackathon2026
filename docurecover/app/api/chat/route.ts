import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

const HARDCODED_KNOWLEDGE_BASE = `
OFFICIAL MALAYSIAN DOCUMENT RECOVERY KNOWLEDGE BASE:
- MyKad (JPN): Replace at any JPN branch or UTC center. Requires: police report (specifying flood/fire disaster loss), original birth cert or secondary ID if available. Standard fee is RM10 for damaged card; fee exemption is granted for registered disaster victims with police report & PPS/NADMA confirmation. Website: www.jpn.gov.my. Phone: 1-300-80-0100 / 03-8000 8000.
- Birth Certificate / Sijil Kelahiran (JPN): Apply at any JPN branch or UTC. Application for Certified Extract (Cabutan Sijil Kelahiran JPN.LM12). Requires: applicant MyKad or parent IC copy, police report, or statutory declaration if records require verification. Standard search/extract fee: RM5 to RM10. Website: www.jpn.gov.my. Phone: 03-8000 8000.
- Passport (Immigration Dept / JIM): Apply at nearest immigration office or UTC. NOTE: MyKad must be recovered first before passport replacement! Requires: police report citing disaster loss/damage, MyKad, 2 passport photos (or taken at counter), damaged passport remnants if available, Form IM.42c. Standard fee: RM200 (5 years adult) / RM100 (seniors/children). Lost passport penalties (RM300-RM1200) can be waived for disaster victims upon committee review with police/bomba report. Website: www.imi.gov.my. Phone: 03-8000-8000 / 03-8880 1555.
- Driving Licence / Lesen Memandu (JPJ): Replace at any JPJ branch, UTC, or use digital licence. Requires: MyKad copy / temporary slip, police report, RM20 physical card fee. The digital driving licence (e-LMM) is completely FREE via the MyJPJ mobile application. Website: www.jpj.gov.my. Phone: 1-800-88-8664 / 03-8000 8000.
- Academic Certificate (SPM/STPM/Degree): For SPM/STAM: Visit e-Lembaga Peperiksaan portal (elpp.moe.gov.my) or LPM Putrajaya counter (RM30 fee). For STPM: Visit Majlis Peperiksaan Malaysia portal (www.mpm.edu.my). For University degrees: Contact your institution's registrar office directly with MyKad, police report, and completed transcript request form. Fees vary by institution.
- Disaster Relief & Fee Waivers (NADMA / Government Circulars): Malaysian disaster victims (flood, fire, landslide) who obtain an official PDRM police report stating disaster damage are eligible for penalty waivers for replacement of lost identity documents.
`;

const AUTHORITY_SOURCES_MAP: Record<string, string> = {
  JPN: 'Jabatan Pendaftaran Negara (JPN) — www.jpn.gov.my (1-300-80-0100)',
  JPJ: 'Jabatan Pengangkutan Jalan (JPJ) — www.jpj.gov.my (1-800-88-8664)',
  JIM: 'Jabatan Imigresen Malaysia (JIM) — www.imi.gov.my (03-8000-8000)',
  Immigration: 'Jabatan Imigresen Malaysia (JIM) — www.imi.gov.my (03-8000-8000)',
  LPM: 'Lembaga Peperiksaan Malaysia (LPM) — elpp.moe.gov.my (03-8884 3785)',
  NADMA: 'Agensi Pengurusan Bencana Negara (NADMA) — www.nadma.gov.my',
  PDRM: 'Polis Diraja Malaysia (PDRM) — www.rmp.gov.my',
  SSM: 'Suruhanjaya Syarikat Malaysia (SSM) — www.ssm.com.my',
};

interface ChatRequestBody {
  messages: Array<{ role: string; content: string }>;
  documentTypes?: string[];
  language?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json().catch(() => ({ messages: [] }));
    const { messages = [], documentTypes = [], language = 'en' } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          response:
            language === 'ms'
              ? 'Sila ajukan soalan berkenaan pemulihan dokumen anda yang hilang atau rosak akibat bencana.'
              : 'Please provide a message or question regarding your lost or damaged document recovery.',
          sources: [AUTHORITY_SOURCES_MAP.JPN, AUTHORITY_SOURCES_MAP.NADMA],
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found in environment. Returning structured fallback response.');
      return NextResponse.json(generateLocalFallbackResponse(messages, language, documentTypes), {
        headers: corsHeaders,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build system prompt with embedded knowledge base context
    const isMalay = language === 'ms';
    const systemPrompt = `You are DocuRecover Assistant, an AI-powered document recovery guide for Malaysia. You help disaster victims (floods, fires, landslides) recover their lost or damaged official documents.

${HARDCODED_KNOWLEDGE_BASE}

User Focus Documents: ${documentTypes.length > 0 ? documentTypes.join(', ') : 'All general Malaysian documents'}
Preferred Language: ${isMalay ? 'Bahasa Malaysia (Malay)' : 'English'}

Rules:
- Always provide actionable, step-by-step guidance tailored to Malaysian victims.
- Reference official Malaysian authorities (JPN, JPJ, Immigration Dept, LPM, NADMA, PDRM, SSM).
- Mention specific fees, requirements, and links when known.
- Highlight disaster victim fee exemption rights: victims with an official police report should not pay penalty fines for lost MyKad or passport.
- Clearly label what is verified information vs. what may need confirmation at the counter.
- Be compassionate and encouraging - users are going through an emotionally taxing disaster.
- If asked in Bahasa Malaysia or if preferred language is 'ms', respond fluently in polite Bahasa Malaysia.
- Never fabricate official procedures.
- End your response with a clearly labeled "Sources:" (or "Sumber:") section listing the official authorities referenced.`;

    // Format messages for Gemini API
    const formattedContents = formatConversationHistory(messages);

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: formattedContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
        maxOutputTokens: 1200,
      },
    });

    const assistantText = response.text || '';
    const sources = extractSources(assistantText, documentTypes);

    return NextResponse.json(
      {
        response: assistantText,
        sources: sources,
      },
      { headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error('Error in /api/chat:', error);

    const fallback = generateLocalFallbackResponse([], 'en', []);
    return NextResponse.json(fallback, { status: 200, headers: corsHeaders });
  }
}

/**
 * Format chat history into alternating user / model content parts
 */
function formatConversationHistory(messages: Array<{ role: string; content: string }>) {
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const msg of messages) {
    const role = msg.role === 'assistant' ? 'model' : 'user';
    const text = (msg.content || '').trim();

    if (!text) continue;

    // Merge consecutive turns with the same role if any
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += `\n\n${text}`;
    } else {
      contents.push({
        role,
        parts: [{ text }],
      });
    }
  }

  // Ensure conversation starts with a 'user' turn
  if (contents.length > 0 && contents[0].role === 'model') {
    contents.unshift({
      role: 'user',
      parts: [{ text: 'Hello, I need help recovering my documents after a disaster.' }],
    });
  }

  return contents.length > 0
    ? contents
    : [
        {
          role: 'user' as const,
          parts: [{ text: 'How do I start recovering my lost documents after a disaster in Malaysia?' }],
        },
      ];
}

/**
 * Extract source references from the generated assistant message or keywords
 */
function extractSources(text: string, documentTypes: string[] = []): string[] {
  const sourcesSet = new Set<string>();

  // Check for explicit "Sources:" or "Sumber:" section in text
  const sourcesMatch = text.match(/(?:Sources|Sumber|Rujukan Rasmi):\s*([\s\S]*)$/i);
  if (sourcesMatch && sourcesMatch[1]) {
    const lines = sourcesMatch[1].split('\n');
    for (const line of lines) {
      const trimmed = line.replace(/^[-*•\d.]+\s*/, '').trim();
      if (trimmed.length > 3 && !trimmed.toLowerCase().startsWith('disclaimer')) {
        sourcesSet.add(trimmed);
      }
    }
  }

  // Detect government agencies mentioned in text or requested documents
  const lowerText = text.toLowerCase();
  const docsJoined = documentTypes.join(' ').toLowerCase();

  if (lowerText.includes('jpn') || lowerText.includes('pendaftaran') || docsJoined.includes('mykad') || docsJoined.includes('birth')) {
    sourcesSet.add(AUTHORITY_SOURCES_MAP.JPN);
  }
  if (lowerText.includes('jpj') || lowerText.includes('pengangkutan') || lowerText.includes('lesen') || docsJoined.includes('driving')) {
    sourcesSet.add(AUTHORITY_SOURCES_MAP.JPJ);
  }
  if (lowerText.includes('imigresen') || lowerText.includes('passport') || lowerText.includes('pasport') || docsJoined.includes('passport')) {
    sourcesSet.add(AUTHORITY_SOURCES_MAP.JIM);
  }
  if (lowerText.includes('peperiksaan') || lowerText.includes('spm') || lowerText.includes('stpm') || docsJoined.includes('academic')) {
    sourcesSet.add(AUTHORITY_SOURCES_MAP.LPM);
  }
  if (lowerText.includes('nadma') || lowerText.includes('bencana') || lowerText.includes('flood') || lowerText.includes('relief')) {
    sourcesSet.add(AUTHORITY_SOURCES_MAP.NADMA);
  }
  if (lowerText.includes('polis') || lowerText.includes('pdrm') || lowerText.includes('report')) {
    sourcesSet.add(AUTHORITY_SOURCES_MAP.PDRM);
  }

  // Ensure at least one official source is present
  if (sourcesSet.size === 0) {
    sourcesSet.add(AUTHORITY_SOURCES_MAP.JPN);
    sourcesSet.add(AUTHORITY_SOURCES_MAP.NADMA);
  }

  return Array.from(sourcesSet);
}

/**
 * Intelligent local fallback response if external AI call is unavailable
 */
function generateLocalFallbackResponse(
  messages: Array<{ role: string; content: string }>,
  language: string,
  documentTypes: string[]
) {
  const lastUserMsg = messages
    .filter((m) => m.role === 'user')
    .pop()?.content.toLowerCase() || '';

  const isMalay = language === 'ms' || lastUserMsg.includes('apa') || lastUserMsg.includes('bagaimana') || lastUserMsg.includes('tolong');

  if (isMalay) {
    let reply = `Salam sejahtera. Kami bersimpati atas ujian bencana yang menimpa anda. Berikut adalah panduan langkah segera untuk menggantikan dokumen anda:

1. **Buat Laporan Polis Segera (PDRM)**
   - Kunjungi balai polis terdekat atau buat laporan secara e-Reporting.
   - Nyatakan dengan jelas bahawa dokumen hilang/musnah akibat bencana (Banjir/Kebakaran) untuk melayakkan anda menerima **pengecualian bayaran denda**.

2. **Dapatkan Pengesahan Mangsa Bencana**
   - Ambil surat pengesahan daripada Pusat Pemindahan Sementara (PPS), Jawatankuasa Bencana Daerah, atau NADMA.

3. **Gantikan MyKad Dahulu di JPN**
   - Hadir ke mana-mana cawangan JPN atau UTC. Bawa laporan polis. MyKad siap dalam masa 30-45 minit di kebanyakan UTC.

4. **Urusan Pasport & Lesen Memandu**
   - **Lesen Memandu:** Boleh diakses serta-merta secara PERCUMA melalui aplikasi MyJPJ.
   - **Pasport:** Hadir ke Imigresen selepas MyKad anda siap.

Sumber:
- Jabatan Pendaftaran Negara (JPN) — www.jpn.gov.my
- Jabatan Pengangkutan Jalan (JPJ) — www.jpj.gov.my
- Jabatan Imigresen Malaysia (JIM) — www.imi.gov.my
- Agensi Pengurusan Bencana Negara (NADMA) — www.nadma.gov.my`;

    return {
      response: reply,
      sources: [
        AUTHORITY_SOURCES_MAP.JPN,
        AUTHORITY_SOURCES_MAP.JPJ,
        AUTHORITY_SOURCES_MAP.JIM,
        AUTHORITY_SOURCES_MAP.NADMA,
      ],
    };
  }

  let reply = `I am very sorry to hear about the disaster you are facing. Please be assured that Malaysian government agencies have special relief protocols for disaster victims. Here is the step-by-step procedure to recover your documents:

1. **File an Official Police Report (PDRM)**
   - Visit the nearest police station or use PDRM e-Reporting.
   - Explicitly mention that your documents were lost or destroyed due to natural disaster (flood/fire/landslide). This police report is mandatory and qualifies you for replacement penalty fee waivers.

2. **Obtain Disaster Verification**
   - Secure a verification certificate from your Evacuation Centre (PPS), District Office, or NADMA representative.

3. **Replace Your MyKad First (JPN)**
   - Visit any JPN office or Urban Transformation Centre (UTC).
   - Your MyKad is usually printed within 30 to 45 minutes at UTC counters. Having your MyKad is essential before replacing passports or driving licences.

4. **Replace Driving Licence & Passport**
   - **Driving Licence (JPJ):** You can immediately access your digital driving licence (e-LMM) for FREE via the MyJPJ mobile app. For physical card, fee is RM20 at JPJ/UTC.
   - **Passport (Immigration):** Bring your new MyKad, police report, and damaged passport remains (if any) to the Immigration office.

Sources:
- Jabatan Pendaftaran Negara (JPN) — www.jpn.gov.my
- Jabatan Pengangkutan Jalan (JPJ) — www.jpj.gov.my
- Jabatan Imigresen Malaysia (JIM) — www.imi.gov.my
- Agensi Pengurusan Bencana Negara (NADMA) — www.nadma.gov.my`;

  return {
    response: reply,
    sources: [
      AUTHORITY_SOURCES_MAP.JPN,
      AUTHORITY_SOURCES_MAP.JPJ,
      AUTHORITY_SOURCES_MAP.JIM,
      AUTHORITY_SOURCES_MAP.NADMA,
    ],
  };
}
