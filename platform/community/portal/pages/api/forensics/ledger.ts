// Evidence Ledger - Immutable audit trail for environmental justice documentation
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

interface EvidenceEntry {
  id: string;
  timestamp: number;
  type: 'air_quality' | 'health_event' | 'compensation' | 'policy_violation';
  data: Record<string, unknown>;
  hash: string;
  previousHash: string;
  signature?: string;
}

interface LedgerResponse {
  success: true;
  entry: EvidenceEntry;
  chainValid: boolean;
}

interface ErrorResponse {
  success: false;
  error: string;
}

// In-memory storage (in production, use database)
const evidenceLedger: EvidenceEntry[] = [];

function calculateHash(entry: Omit<EvidenceEntry, 'hash'>): string {
  const data = JSON.stringify({
    id: entry.id,
    timestamp: entry.timestamp,
    type: entry.type,
    data: entry.data,
    previousHash: entry.previousHash
  });
  return crypto.createHash('sha256').update(data).digest('hex');
}

function verifyChain(): boolean {
  for (let i = 1; i < evidenceLedger.length; i++) {
    const current = evidenceLedger[i];
    const previous = evidenceLedger[i - 1];
    
    // Verify hash integrity
    const recalculatedHash = calculateHash({
      id: current.id,
      timestamp: current.timestamp,
      type: current.type,
      data: current.data,
      previousHash: current.previousHash
    });
    
    if (current.hash !== recalculatedHash) {
      return false;
    }
    
    // Verify chain link
    if (current.previousHash !== previous.hash) {
      return false;
    }
  }
  return true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LedgerResponse | ErrorResponse | { success: true; ledger: EvidenceEntry[]; chainValid: boolean }>
): Promise<void> {
  // GET - Retrieve ledger
  if (req.method === 'GET') {
    const chainValid = evidenceLedger.length === 0 || verifyChain();
    res.status(200).json({
      success: true,
      ledger: evidenceLedger,
      chainValid
    });
    return;
  }

  // POST - Add evidence entry
  if (req.method === 'POST') {
    try {
      const { type, data } = req.body as {
        type: EvidenceEntry['type'];
        data: Record<string, unknown>;
      };

      if (!type || !data) {
        res.status(400).json({ success: false, error: 'Missing required fields' });
        return;
      }

      const id = crypto.randomUUID();
      const timestamp = Date.now();
      const previousHash = evidenceLedger.length > 0
        ? evidenceLedger[evidenceLedger.length - 1].hash
        : '0'.repeat(64);

      const entryWithoutHash: Omit<EvidenceEntry, 'hash'> = {
        id,
        timestamp,
        type,
        data,
        previousHash
      };

      const hash = calculateHash(entryWithoutHash);

      const entry: EvidenceEntry = {
        ...entryWithoutHash,
        hash
      };

      evidenceLedger.push(entry);

      res.status(201).json({
        success: true,
        entry,
        chainValid: verifyChain()
      });
    } catch (error) {
      console.error('Ledger error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
    return;
  }

  res.status(405).json({ success: false, error: 'Method not allowed' });
}
