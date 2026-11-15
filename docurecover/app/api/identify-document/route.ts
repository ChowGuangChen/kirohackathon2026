import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { AIAssessment, DamageLevel } from '@/app/_lib/types';

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

const VALID_DOC_TYPES = [
  'mykad',
  'birth-certificate',
  'passport',
  'driving-licence',
  'academic-certificate',
  'unknown',
] as const;

const VALID_DAMAGE_LEVELS: DamageLevel[] = [
  'none',
  'minor',
  'moderate',
  'severe',
  'destroyed',
];

interface IdentifyRequestBody {
  imageBase64?: string;
  mimeType?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: IdentifyRequestBody = await req.json().catch(() => ({}));
    const { imageBase64, mimeType = 'image/jpeg' } = body;

    if (!imageBase64) {
      return NextResponse.json(
        {
          error: 'Image data is required in imageBase64 format',
          documentType: 'unknown',
          confidence: 0,
          damageLevel: 'none',
          assessment: 'No image provided for analysis.',
          recommendedAction: 'Please upload a photo of the damaged document.',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Strip data URL header if present (e.g., "data:image/jpeg;base64,...")
    const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '').trim();

    // Determine normalized MIME type
    let normalizedMimeType = mimeType;
    if (imageBase64.startsWith('data:')) {
      const match = imageBase64.match(/^data:([a-zA-Z0-9/+-]+);base64,/);
      if (match && match[1]) {
        normalizedMimeType = match[1];
      }
    }
    if (!normalizedMimeType || normalizedMimeType === 'image/*') {
      normalizedMimeType = 'image/jpeg';
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined. Using local fallback assessment.');
      return NextResponse.json(getFallbackAssessment(), { headers: corsHeaders });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are an AI assistant helping disaster victims identify their damaged documents in Malaysia. Analyze the provided image and identify:
1. Document type (must be one of: mykad, birth-certificate, passport, driving-licence, academic-certificate, or 'unknown')
2. Damage level (none/minor/moderate/severe/destroyed)
3. Confidence percentage (0-100)
4. Brief assessment of the document condition
5. Recommended immediate action

Return ONLY valid JSON: { "documentType": "...", "confidence": 0-100, "damageLevel": "...", "assessment": "...", "recommendedAction": "..." }`;

    const userPrompt = `Analyze this damaged or recovered Malaysian document image. Determine whether it is a MyKad (Malaysian Identity Card), Birth Certificate (Sijil Kelahiran), Malaysian Passport, Driving Licence (Lesen Memandu), Academic Certificate (SPM/STPM/Degree), or unknown. Evaluate physical damage caused by floods (water-logging, ink smudges, mold), fire (burns, charred edges), landslides, or tears. Output strictly the requested JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: normalizedMimeType,
          },
        },
        userPrompt,
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const rawText = response.text || '';
    const parsed = parseAIResponse(rawText);

    if (parsed) {
      return NextResponse.json(parsed, { headers: corsHeaders });
    }

    // If parsing fails, return heuristic fallback
    return NextResponse.json(getFallbackAssessment(), { headers: corsHeaders });
  } catch (error: unknown) {
    console.error('Error in /api/identify-document:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown AI processing error';

    return NextResponse.json(
      {
        ...getFallbackAssessment(),
        error: errorMessage,
      },
      { status: 200, headers: corsHeaders }
    );
  }
}

function parseAIResponse(rawText: string): AIAssessment | null {
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

    const data = JSON.parse(cleanText);

    // Normalize documentType
    let docType = String(data.documentType || 'unknown').toLowerCase().trim();
    if (docType.includes('mykad') || docType.includes('ic') || docType.includes('kad pengenalan')) {
      docType = 'mykad';
    } else if (docType.includes('birth') || docType.includes('kelahiran') || docType.includes('surat beranak')) {
      docType = 'birth-certificate';
    } else if (docType.includes('passport') || docType.includes('pasport')) {
      docType = 'passport';
    } else if (docType.includes('driv') || docType.includes('lesen') || docType.includes('memandu')) {
      docType = 'driving-licence';
    } else if (docType.includes('academic') || docType.includes('degree') || docType.includes('spm') || docType.includes('sijil')) {
      docType = 'academic-certificate';
    }

    const matchedDocType = VALID_DOC_TYPES.includes(docType as any) ? docType : 'unknown';

    // Normalize damageLevel
    let damage = String(data.damageLevel || 'moderate').toLowerCase().trim();
    if (!VALID_DAMAGE_LEVELS.includes(damage as DamageLevel)) {
      if (damage.includes('none') || damage.includes('intact')) damage = 'none';
      else if (damage.includes('minor') || damage.includes('light')) damage = 'minor';
      else if (damage.includes('mod')) damage = 'moderate';
      else if (damage.includes('sev')) damage = 'severe';
      else if (damage.includes('destroy') || damage.includes('ruin')) damage = 'destroyed';
      else damage = 'moderate';
    }

    // Normalize confidence
    let confidence = Number(data.confidence);
    if (isNaN(confidence) || confidence < 0) confidence = 75;
    if (confidence > 100) confidence = 100;

    return {
      documentType: matchedDocType,
      confidence: Math.round(confidence),
      damageLevel: damage as DamageLevel,
      assessment:
        typeof data.assessment === 'string' && data.assessment.length > 0
          ? data.assessment
          : 'Document shows signs of physical disaster damage. Verification by official agency is recommended.',
      recommendedAction:
        typeof data.recommendedAction === 'string' && data.recommendedAction.length > 0
          ? data.recommendedAction
          : 'Safeguard document remains in a waterproof pouch and submit a police report for replacement.',
    };
  } catch (err) {
    console.error('Failed to parse Gemini JSON output:', err, rawText);
    return null;
  }
}

function getFallbackAssessment(): AIAssessment {
  return {
    documentType: 'unknown',
    confidence: 50,
    damageLevel: 'moderate',
    assessment:
      'The document appears damaged by flood waters or disaster conditions. Key identifying text and security features may be obscured.',
    recommendedAction:
      'Store any remaining fragments in a dry sealed plastic bag. File a police disaster report at your nearest PDRM station and visit the relevant agency counter for manual biometric verification.',
  };
}
