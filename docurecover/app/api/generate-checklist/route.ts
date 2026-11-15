import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { DocumentType, RecoveryTask } from '@/app/_lib/types';
import { generateId } from '@/app/_lib/utils/documentHelpers';

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

interface ChecklistRequestBody {
  documentTypes?: string[];
  documentNames?: string[];
  language?: string;
}

interface GeminiStep {
  title: string;
  description: string;
  link?: string | null;
}

interface GeminiDocGroup {
  documentType: string;
  documentName?: string;
  steps: GeminiStep[];
}

interface GeminiChecklistResponse {
  tasks: GeminiDocGroup[];
}

export async function POST(req: NextRequest) {
  try {
    const body: ChecklistRequestBody = await req.json().catch(() => ({}));
    const { documentTypes = [], documentNames = [], language = 'en' } = body;

    // Normalize types
    const validTypes: DocumentType[] = [
      'mykad',
      'birth-certificate',
      'passport',
      'driving-licence',
      'academic-certificate',
    ];

    const targetTypes: DocumentType[] = documentTypes.filter((t): t is DocumentType =>
      validTypes.includes(t as DocumentType)
    );

    // If no specific valid types provided, default to core identity docs
    const resolvedTypes: DocumentType[] =
      targetTypes.length > 0 ? targetTypes : ['mykad', 'driving-licence'];

    const isMalay = language === 'ms';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined. Using knowledge base fallback generator.');
      const fallbackTasks = generateFallbackChecklist(resolvedTypes, documentNames, isMalay);
      return NextResponse.json({ tasks: fallbackTasks }, { headers: corsHeaders });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are an AI disaster recovery coordinator for Malaysia. Generate a structured recovery checklist for a Malaysian disaster victim who needs to recover their lost or damaged official documents.
For each document, provide exactly 5 to 6 actionable, practical steps.
Each step must have: "title", "description", and an optional "link" (use real Malaysian gov portals like www.jpn.gov.my, www.jpj.gov.my, www.imi.gov.my, elpp.moe.gov.my).

Important Rules:
- Include instructions about filing a disaster police report to obtain fee exemptions.
- Note that MyKad must be recovered first before a passport can be replaced.
- Mention the free digital driving licence in MyJPJ app.
- Provide the content in ${isMalay ? 'Bahasa Malaysia' : 'English'}.

Return ONLY valid JSON in this exact structure:
{
  "tasks": [
    {
      "documentType": "mykad",
      "documentName": "${isMalay ? 'MyKad (Kad Pengenalan)' : 'MyKad (Identity Card)'}",
      "steps": [
        {
          "title": "File Police Disaster Report",
          "description": "Visit the nearest PDRM station...",
          "link": "https://ereporting.rmp.gov.my"
        }
      ]
    }
  ]
}`;

    const promptUserContent = `Generate recovery checklist for the following Malaysian documents:
${resolvedTypes
  .map((type, idx) => `- Document Type: ${type} (Label: ${documentNames[idx] || type})`)
  .join('\n')}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: promptUserContent,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const rawText = response.text || '';
    const parsed = parseGeminiChecklist(rawText, resolvedTypes, documentNames, isMalay);

    if (parsed && parsed.length > 0) {
      return NextResponse.json({ tasks: parsed }, { headers: corsHeaders });
    }

    // Fallback if parsing fails
    const fallbackTasks = generateFallbackChecklist(resolvedTypes, documentNames, isMalay);
    return NextResponse.json({ tasks: fallbackTasks }, { headers: corsHeaders });
  } catch (error: unknown) {
    console.error('Error in /api/generate-checklist:', error);

    const isMalay = false;
    const fallbackTasks = generateFallbackChecklist(['mykad'], ['MyKad'], isMalay);
    return NextResponse.json({ tasks: fallbackTasks }, { status: 200, headers: corsHeaders });
  }
}

/**
 * Parses Gemini JSON response into flattened RecoveryTask[]
 */
function parseGeminiChecklist(
  rawText: string,
  requestedTypes: DocumentType[],
  documentNames: string[],
  isMalay: boolean
): RecoveryTask[] | null {
  try {
    let cleanText = rawText.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }

    const startIdx = cleanText.indexOf('{');
    const endIdx = cleanText.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      cleanText = cleanText.substring(startIdx, endIdx + 1);
    }

    const data: GeminiChecklistResponse = JSON.parse(cleanText);

    if (!data.tasks || !Array.isArray(data.tasks)) {
      return null;
    }

    const flattened: RecoveryTask[] = [];

    data.tasks.forEach((docGroup, docIdx) => {
      // Normalize document type
      let docType = (docGroup.documentType || '').toLowerCase().trim() as DocumentType;
      if (!requestedTypes.includes(docType)) {
        if (docType.includes('mykad') || docType.includes('ic')) docType = 'mykad';
        else if (docType.includes('birth') || docType.includes('kelahiran')) docType = 'birth-certificate';
        else if (docType.includes('passport') || docType.includes('pasport')) docType = 'passport';
        else if (docType.includes('driv') || docType.includes('lesen')) docType = 'driving-licence';
        else if (docType.includes('academic') || docType.includes('sijil')) docType = 'academic-certificate';
        else docType = requestedTypes[docIdx] || 'mykad';
      }

      const docId = `doc-${docType}-${generateId().substring(0, 8)}`;
      const docName =
        docGroup.documentName ||
        documentNames[docIdx] ||
        getDefaultDocName(docType, isMalay);

      if (Array.isArray(docGroup.steps)) {
        docGroup.steps.forEach((step, stepIdx) => {
          flattened.push({
            id: `task-${generateId().substring(0, 10)}`,
            documentId: docId,
            documentType: docType,
            documentName: docName,
            title: step.title || `Step ${stepIdx + 1}`,
            description: step.description || '',
            completed: false,
            link: step.link || undefined,
            stepNumber: stepIdx + 1,
          });
        });
      }
    });

    return flattened.length > 0 ? flattened : null;
  } catch (err) {
    console.error('Failed to parse checklist JSON from Gemini:', err, rawText);
    return null;
  }
}

/**
 * Returns human-friendly default name for documents
 */
function getDefaultDocName(type: DocumentType, isMalay: boolean): string {
  switch (type) {
    case 'mykad':
      return isMalay ? 'MyKad (Kad Pengenalan)' : 'MyKad (National Identity Card)';
    case 'birth-certificate':
      return isMalay ? 'Sijil Kelahiran (Surat Beranak)' : 'Birth Certificate';
    case 'passport':
      return isMalay ? 'Pasport Malaysia' : 'Malaysian Passport';
    case 'driving-licence':
      return isMalay ? 'Lesen Memandu Malaysia (LMM)' : 'Driving Licence';
    case 'academic-certificate':
      return isMalay ? 'Sijil SPM / Pengajian Tinggi' : 'Academic Certificate';
    default:
      return type;
  }
}

/**
 * Generates verified Malaysian standard recovery tasks for each document type
 */
function generateFallbackChecklist(
  types: DocumentType[],
  names: string[],
  isMalay: boolean
): RecoveryTask[] {
  const result: RecoveryTask[] = [];

  types.forEach((type, index) => {
    const docId = `doc-${type}-${Date.now().toString(36)}-${index}`;
    const docName = names[index] || getDefaultDocName(type, isMalay);

    const steps = getStandardStepsForType(type, isMalay);

    steps.forEach((step, sIdx) => {
      result.push({
        id: `task-${type}-${sIdx + 1}-${generateId().substring(0, 6)}`,
        documentId: docId,
        documentType: type,
        documentName: docName,
        title: step.title,
        description: step.description,
        completed: false,
        link: step.link,
        stepNumber: sIdx + 1,
      });
    });
  });

  return result;
}

interface StepDefinition {
  title: string;
  description: string;
  link?: string;
}

function getStandardStepsForType(type: DocumentType, isMalay: boolean): StepDefinition[] {
  if (isMalay) {
    switch (type) {
      case 'mykad':
        return [
          {
            title: 'Lapor Kehilangan di Balai Polis (PDRM)',
            description:
              'Buat laporan polis rasmi di balai terdekat atau melalui portal e-Reporting PDRM. Nyatakan secara khusus bahawa MyKad musnah atau hilang akibat bencana alam (banjir/kebakaran).',
            link: 'https://ereporting.rmp.gov.my',
          },
          {
            title: 'Dapatkan Surat Pengesahan Bencana',
            description:
              'Dapatkan surat pengesahan mangsa bencana dari Pusat Pemindahan Sementara (PPS), Penghulu, atau Pejabat Daerah bagi melayakkan pengecualian denda gantian.',
          },
          {
            title: 'Hadir ke Cawangan JPN atau UTC',
            description:
              'Kunjungi mana-mana cawangan Jabatan Pendaftaran Negara atau pusat UTC. Ambil nombor giliran untuk Permohonan Gantian MyKad Hilang / Rosak Bencana.',
            link: 'https://www.jpn.gov.my/my/hubungi-kami/direktori-cawangan',
          },
          {
            title: 'Pengesahan Biometrik dan Cap Jari',
            description:
              'Lakukan pengesahan biometrik cap jari di kaunter JPN dan ambil gambar pasport terkini secara percuma di kaunter.',
          },
          {
            title: 'Mohon Pengecualian Bayaran Denda',
            description:
              'Kemukakan laporan polis bencana dan surat PPS kepada pegawai kaunter untuk mendapatkan pengecualian penalti kehilangan di bawah ketetapan NADMA/JPN.',
          },
          {
            title: 'Ambil MyKad Baharu',
            description:
              'Di cawangan UTC dan ibu pejabat negeri JPN, MyKad baharu anda boleh siap dan diambil dalam tempoh 30 hingga 45 minit.',
          },
        ];

      case 'birth-certificate':
        return [
          {
            title: 'Buat Laporan Polis Bencana',
            description:
              'Laporkan kehilangan sijil kelahiran akibat bencana banjir atau kebakaran di balai polis terdekat.',
            link: 'https://ereporting.rmp.gov.my',
          },
          {
            title: 'Sediakan Maklumat Pengenalan',
            description:
              'Sediakan MyKad pemohon, salinan IC ibu bapa, atau nama penuh dan nombor surat beranak lama (jika diingati).',
          },
          {
            title: 'Hadir ke Cawangan JPN / UTC',
            description:
              'Kunjungi kaunter Bahagian Kelahiran & Kematian di mana-mana cawangan JPN atau UTC terdekat.',
            link: 'https://www.jpn.gov.my/my/perkhidmatan/kelahiran',
          },
          {
            title: 'Isi Borang Permohonan JPN.LM12',
            description:
              'Lengkapkan borang permohonan Cabutan Sijil Kelahiran (JPN.LM12) yang disediakan di kaunter.',
          },
          {
            title: 'Pembayaran Fi Cabutan Carian',
            description:
              'Bayar fi rasmi RM5 untuk carian rekod dan RM5 untuk salinan cabutan rasmi yang disahkan.',
          },
          {
            title: 'Terima Cabutan Sijil Kelahiran Rasmi',
            description:
              'Cabutan sijil kelahiran berkomputer akan dicetak dan disahkan serta-merta di kaunter untuk kegunaan urusan rasmi.',
          },
        ];

      case 'passport':
        return [
          {
            title: 'Selesaikan Gantian MyKad Dahulu',
            description:
              'PENTING: Anda wajib mempunyai MyKad fizikal yang sah atau slip rasmi JPN sebelum boleh membuat permohonan pasport gantian.',
          },
          {
            title: 'Buat Laporan Polis dan Laporan Bomba',
            description:
              'Buat laporan polis mengenai pasport hilang. Jika melibatkan kebakaran, lampirkan bersama Laporan Siasatan Kebakaran daripada Jabatan Bomba.',
            link: 'https://ereporting.rmp.gov.my',
          },
          {
            title: 'Kumpulkan Bukti Bencana dan Cebisan Pasport',
            description:
              'Bawa cebisan pasport lama yang rosak (jika masih ada) dan surat pengesahan mangsa bencana dari PPS/NADMA.',
          },
          {
            title: 'Hadir ke Pejabat Imigresen (JIM) Negeri / UTC',
            description:
              'Kunjungi Pejabat Imigresen terdekat dan maklumkan permohonan gantian pasport akibat bencana alam.',
            link: 'https://www.imi.gov.my',
          },
          {
            title: 'Isi Borang Soal Selidik IM.42c & Sesi Temuduga',
            description:
              'Lengkapkan borang IM.42c dan hadiri sesi soal selidik bersama Pegawai Penguatkuasa Imigresen untuk kelulusan pengecualian denda.',
          },
          {
            title: 'Bayar Fi Pasport dan Ambil Pasport Baharu',
            description:
              'Bayar fi standard pasport RM200 (dewasa 5 tahun). Pasport baharu siap dicetak dalam tempoh 1 hingga 2 jam selepas kelulusan.',
          },
        ];

      case 'driving-licence':
        return [
          {
            title: 'Semak Lesen Digital Percuma di Aplikasi MyJPJ',
            description:
              'Muat turun aplikasi MyJPJ pada telefon pintar anda. Lesen Memandu Digital (e-LMM) anda boleh terus dipaparkan secara sah tanpa bayaran.',
            link: 'https://www.jpj.gov.my/my/web/main-site/pelesenan-pemandu',
          },
          {
            title: 'Dapatkan Gantian MyKad atau Slip JPN',
            description:
              'Dapatkan MyKad gantian atau slip pengenalan sementara daripada JPN sebelum hadir ke kaunter JPJ.',
          },
          {
            title: 'Buat Laporan Polis Bencana',
            description:
              'Laporkan kehilangan lesen memandu fizikal dalam insiden bencana alam di balai polis terdekat.',
            link: 'https://ereporting.rmp.gov.my',
          },
          {
            title: 'Hadir ke Cawangan JPJ atau UTC',
            description:
              'Kunjungi mana-mana pejabat JPJ Negeri, cawangan, atau kaunter JPJ di UTC berdekatan.',
          },
          {
            title: 'Lengkapkan Borang JPJ L1',
            description:
              'Isi Borang Permohonan Lesen Memandu (JPJ L1) untuk permohonan cetakan semula kad fizikal.',
          },
          {
            title: 'Bayar Fi RM20 dan Terima Kad Fizikal',
            description:
              'Jelaskan bayaran gantian kad fizikal RM20 (atau kemukakan bukti bencana jika tempoh moratorium pengecualian diumumkan oleh MOT).',
          },
        ];

      case 'academic-certificate':
        return [
          {
            title: 'Sediakan Salinan MyKad dan Laporan Polis',
            description:
              'Pastikan anda mempunyai slip gantian MyKad dan salinan laporan polis bencana yang menyatakan sijil akademik telah musnah.',
            link: 'https://ereporting.rmp.gov.my',
          },
          {
            title: 'Kenal Pasti Butiran Peperiksaan',
            description:
              'Semak tahun peperiksaan, jenis peperiksaan (SPM, STPM, Sijil/Diploma IPT), dan angka giliran jika ada.',
          },
          {
            title: 'Permohonan SPM Melalui Portal e-Lembaga Peperiksaan',
            description:
              'Bagi sijil SPM/STAM, layari portal e-Lembaga Peperiksaan (eLPP) untuk membuat permohonan cetakan semula salinan sijil secara dalam talian.',
            link: 'https://elpp.moe.gov.my',
          },
          {
            title: 'Permohonan STPM Melalui Majlis Peperiksaan Malaysia',
            description:
              'Bagi sijil STPM, layari portal rasmi MPM untuk mengisi borang permohonan penyata keputusan / sijil gantian.',
            link: 'https://www.mpm.edu.my',
          },
          {
            title: 'Hubungi Pejabat Pendaftar Universiti / Kolej',
            description:
              'Bagi ijazah atau diploma universiti, hubungi Bahagian Hal Ehwal Akademik IPT masing-masing bersama laporan polis.',
          },
          {
            title: 'Jelaskan Bayaran Cetakan Semula & Terima Sijil',
            description:
              'Bayar fi cetakan semula (SPM RM30, STPM RM50) dan pilih penghantaran selamat menggunakan Pos Laju ke alamat terkini anda.',
          },
        ];
    }
  }

  // English steps
  switch (type) {
    case 'mykad':
      return [
        {
          title: 'File Disaster Police Report (PDRM)',
          description:
            'Lodge an official report at the nearest PDRM station or via PDRM e-Reporting. Explicitly describe that your MyKad was lost or destroyed in the disaster (flood/fire).',
          link: 'https://ereporting.rmp.gov.my',
        },
        {
          title: 'Obtain Disaster Victim Verification',
          description:
            'Get a verification letter from your temporary evacuation centre (PPS), Village Head, or District Office to qualify for replacement penalty waivers under NADMA guidelines.',
        },
        {
          title: 'Visit Nearest JPN Office or UTC',
          description:
            'Head to any National Registration Department branch or UTC. Take a queue ticket for MyKad Disaster Replacement (Gantian Hilang Bencana).',
          link: 'https://www.jpn.gov.my/my/hubungi-kami/direktori-cawangan',
        },
        {
          title: 'Biometric Thumbprint & Photo Capture',
          description:
            'Complete your biometric thumbprint verification and have your fresh identity photograph taken directly at the JPN counter.',
        },
        {
          title: 'Claim Disaster Relief Fee Waiver',
          description:
            'Present your disaster police report and PPS certification to the counter officer so the standard lost MyKad penalty is waived.',
        },
        {
          title: 'Collect Your New MyKad',
          description:
            'At Urban Transformation Centres (UTC) and state headquarters, your replacement MyKad is typically ready for collection within 30 to 45 minutes.',
        },
      ];

    case 'birth-certificate':
      return [
        {
          title: 'Lodge Police Report for Lost Certificate',
          description:
            'File a police report detailing the loss or destruction of your birth certificate in the flood or disaster event.',
          link: 'https://ereporting.rmp.gov.my',
        },
        {
          title: 'Gather Identity Details',
          description:
            'Prepare your MyKad, parent IC details, or exact birth registration details (if remembered or noted from previous copies).',
        },
        {
          title: 'Visit JPN Births & Deaths Division',
          description:
            'Visit the Births, Deaths & Adoptions counter at any JPN district office or UTC center.',
          link: 'https://www.jpn.gov.my/my/perkhidmatan/kelahiran',
        },
        {
          title: 'Fill Up Form JPN.LM12',
          description:
            'Complete the official JPN.LM12 form (Application for Certified Extract of Birth Certificate).',
        },
        {
          title: 'Pay Nominal Extract Fee',
          description:
            'Pay RM5 for the archive record search and RM5 for the official computer-printed certified extract.',
        },
        {
          title: 'Receive Certified Extract (Cabutan Sijil Kelahiran)',
          description:
            'Collect your officially certified birth extract on security paper, valid for all government, legal, and financial institutions.',
        },
      ];

    case 'passport':
      return [
        {
          title: 'Replace Your MyKad First',
          description:
            'CRITICAL: You must possess a valid, replaced MyKad or official temporary JPN identification slip before applying for passport replacement.',
        },
        {
          title: 'Lodge Police & Fire Investigation Reports',
          description:
            'File a detailed PDRM police report. For fire disasters, obtain the official Fire Investigation Report from Jabatan Bomba dan Penyelamat.',
          link: 'https://ereporting.rmp.gov.my',
        },
        {
          title: 'Gather Passport Remnants & Disaster Letter',
          description:
            'Preserve any remnants of the damaged passport in a zip bag and bring your disaster victim confirmation letter.',
        },
        {
          title: 'Visit State Immigration Office or UTC',
          description:
            'Go to the nearest State Immigration Department (JIM) Headquarters or UTC Immigration counter.',
          link: 'https://www.imi.gov.my',
        },
        {
          title: 'Complete Form IM.42c & Loss Inquiry Interview',
          description:
            'Fill up Questionnaire Form IM.42c and attend the required inquiry interview with an Immigration Enforcement Officer to approve fee penalty waivers.',
        },
        {
          title: 'Pay Standard Fee & Collect Passport',
          description:
            'Pay the standard RM200 adult passport fee (penalty waived for disaster victims upon approval). The passport is issued within 1-2 hours of approval.',
        },
      ];

    case 'driving-licence':
      return [
        {
          title: 'View Free Digital Licence on MyJPJ App',
          description:
            'Download the official MyJPJ mobile app. Your Digital Driving Licence (e-LMM) is instantly visible and legally valid at zero cost.',
          link: 'https://www.jpj.gov.my/my/web/main-site/pelesenan-pemandu',
        },
        {
          title: 'Obtain Temporary JPN Slip or New MyKad',
          description:
            'Ensure you have your new MyKad or official JPN temporary slip ready before requesting a physical licence reprint.',
        },
        {
          title: 'File Police Disaster Report',
          description:
            'Lodge a police report noting the destruction of your physical driving licence in the disaster event.',
          link: 'https://ereporting.rmp.gov.my',
        },
        {
          title: 'Visit Nearest JPJ Office or UTC',
          description:
            'Go to any Road Transport Department (JPJ) branch, state office, or JPJ counter located within a UTC.',
        },
        {
          title: 'Submit Application Form JPJ L1',
          description:
            'Fill up the JPJ L1 driving licence replacement form at the counter.',
        },
        {
          title: 'Pay RM20 Fee & Collect Physical Card',
          description:
            'Pay the RM20 card replacement fee (or show disaster declaration if Ministry of Transport announces special fee moratorium) and collect your card.',
        },
      ];

    case 'academic-certificate':
      return [
        {
          title: 'Obtain MyKad Replacement & Police Report',
          description:
            'Secure your replaced MyKad and a certified copy of the disaster police report detailing destroyed academic credentials.',
          link: 'https://ereporting.rmp.gov.my',
        },
        {
          title: 'Identify Examination Details',
          description:
            'Note examination year, exam type (SPM/STPM/University), school or testing centre, and candidate index number (angka giliran).',
        },
        {
          title: 'Apply for SPM via e-Lembaga Peperiksaan',
          description:
            'For SPM/STAM certificates, apply directly through the official Ministry of Education eLPP portal for reprint.',
          link: 'https://elpp.moe.gov.my',
        },
        {
          title: 'Apply for STPM via Malaysian Examinations Council',
          description:
            'For STPM certificates, visit the Malaysian Examinations Council (MPM) portal to order replacement transcripts.',
          link: 'https://www.mpm.edu.my',
        },
        {
          title: 'Contact University / College Registrar',
          description:
            'For diploma and degree certificates, contact your respective university academic affairs or registrar division with police report.',
        },
        {
          title: 'Pay Reprint Fee & Receive Secure Delivery',
          description:
            'Pay the reprint fee (SPM: RM30; STPM: RM50; University varies) and opt for registered Pos Laju courier delivery to your relocation address.',
        },
      ];
  }
}
