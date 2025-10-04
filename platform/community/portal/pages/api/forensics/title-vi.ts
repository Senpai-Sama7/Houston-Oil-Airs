// Title VI Packet Assembler - Generate civil rights violation documentation
import type { NextApiRequest, NextApiResponse } from 'next';

interface TitleVIPacket {
  id: string;
  generatedAt: number;
  jurisdiction: string;
  complainant: {
    name: string;
    address: string;
    contact: string;
  };
  respondent: {
    agency: string;
    address: string;
  };
  violation: {
    type: string;
    date: string;
    description: string;
    protectedClass: string[];
  };
  evidence: {
    airQualityData: Array<{
      date: string;
      pm25: number;
      location: string;
    }>;
    healthImpacts: Array<{
      date: string;
      type: string;
      affected: number;
    }>;
    demographicDisparity: {
      affectedCommunity: {
        minorityPercentage: number;
        incomeMedian: number;
      };
      comparatorCommunity: {
        minorityPercentage: number;
        incomeMedian: number;
      };
    };
  };
  legalBasis: string[];
  requestedRelief: string[];
}

interface PacketResponse {
  success: true;
  packet: TitleVIPacket;
  pdfUrl?: string;
}

interface ErrorResponse {
  success: false;
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PacketResponse | ErrorResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const {
      jurisdiction,
      complainant,
      respondent,
      violation,
      evidence
    } = req.body as Omit<TitleVIPacket, 'id' | 'generatedAt' | 'legalBasis' | 'requestedRelief'>;

    // Validate required fields
    if (!jurisdiction || !complainant || !respondent || !violation || !evidence) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }

    // Generate packet ID
    const id = `TVI-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Determine legal basis based on violation type
    const legalBasis = [
      'Title VI of the Civil Rights Act of 1964, 42 U.S.C. § 2000d et seq.',
      '40 C.F.R. Part 7 (EPA regulations implementing Title VI)',
      'Environmental Justice Executive Order 12898 (1994)'
    ];

    if (violation.protectedClass.includes('race') || violation.protectedClass.includes('color')) {
      legalBasis.push('42 U.S.C. § 1983 (Civil Rights Act)');
    }

    // Standard requested relief
    const requestedRelief = [
      'Immediate investigation of the discriminatory practices described herein',
      'Suspension of permits or activities causing disparate impact',
      'Implementation of corrective measures to eliminate disparate impact',
      'Enhanced air quality monitoring in affected community',
      'Compensation for affected residents',
      'Public health interventions and medical monitoring',
      'Future compliance monitoring and reporting requirements'
    ];

    const packet: TitleVIPacket = {
      id,
      generatedAt: Date.now(),
      jurisdiction,
      complainant,
      respondent,
      violation,
      evidence,
      legalBasis,
      requestedRelief
    };

    // In production, generate PDF here
    // const pdfUrl = await generatePDF(packet);

    res.status(200).json({
      success: true,
      packet,
      // pdfUrl: pdfUrl
    });
  } catch (error) {
    console.error('Title VI packet error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
