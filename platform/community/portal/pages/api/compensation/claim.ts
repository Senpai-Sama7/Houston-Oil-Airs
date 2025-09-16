// API endpoint for compensation claims
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface ClaimRequest {
  walletAddress: string;
  amount: number;
  timestamp: number;
}

interface ClaimResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ClaimResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { walletAddress, amount, timestamp }: ClaimRequest = req.body;

    // Validate request
    if (!walletAddress || !amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid wallet address or amount' 
      });
    }

    // Log the claim (in production, this would interact with blockchain)
    const claimLog = {
      walletAddress,
      amount,
      timestamp,
      transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending'
    };

    // Save to claims log
    const claimsPath = path.join(process.cwd(), 'data');
    if (!fs.existsSync(claimsPath)) {
      fs.mkdirSync(claimsPath, { recursive: true });
    }

    const claimsFile = path.join(claimsPath, 'compensation_claims.json');
    let claims = [];
    
    if (fs.existsSync(claimsFile)) {
      const existingClaims = fs.readFileSync(claimsFile, 'utf-8');
      claims = JSON.parse(existingClaims);
    }

    claims.push(claimLog);
    fs.writeFileSync(claimsFile, JSON.stringify(claims, null, 2));

    console.log(`Compensation claim: ${walletAddress} - $${amount}`);

    res.status(200).json({
      success: true,
      transactionId: claimLog.transactionId
    });

  } catch (error) {
    console.error('Error processing claim:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process claim' 
    });
  }
}