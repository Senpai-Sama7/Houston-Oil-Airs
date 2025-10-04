// Houston EJ-AI Platform - Input Validation
// Production-grade validation with comprehensive security checks

import { ValidationError } from './errorHandler';

export function validateWalletAddress(address: string): void {
  if (!address) {
    throw new ValidationError('Wallet address is required', 'walletAddress');
  }

  // Ethereum address validation (42 characters, starts with 0x)
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!ethAddressRegex.test(address)) {
    throw new ValidationError('Invalid wallet address format', 'walletAddress');
  }
}

export function validateCompensationAmount(amount: number): void {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new ValidationError('Amount must be a valid number', 'amount');
  }

  if (amount <= 0) {
    throw new ValidationError('Amount must be greater than 0', 'amount');
  }

  if (amount > 1.0) {
    throw new ValidationError('Amount cannot exceed $1.00', 'amount');
  }

  // Check for reasonable precision (max 2 decimal places)
  if (Math.round(amount * 100) !== amount * 100) {
    throw new ValidationError('Amount can have at most 2 decimal places', 'amount');
  }
}

export function validateSensorData(data: any): void {
  const requiredFields = ['pm25', 'pm10', 'temperature', 'humidity'];
  
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new ValidationError(`Missing required field: ${field}`, field);
    }

    const value = data[field];
    if (typeof value !== 'number' || isNaN(value)) {
      throw new ValidationError(`${field} must be a valid number`, field);
    }
  }

  // Validate sensor reading ranges
  if (data.pm25 < 0 || data.pm25 > 1000) {
    throw new ValidationError('PM2.5 must be between 0 and 1000 µg/m³', 'pm25');
  }

  if (data.pm10 < 0 || data.pm10 > 2000) {
    throw new ValidationError('PM10 must be between 0 and 2000 µg/m³', 'pm10');
  }

  if (data.temperature < -50 || data.temperature > 80) {
    throw new ValidationError('Temperature must be between -50°C and 80°C', 'temperature');
  }

  if (data.humidity < 0 || data.humidity > 100) {
    throw new ValidationError('Humidity must be between 0% and 100%', 'humidity');
  }

  // PM2.5 should not exceed PM10
  if (data.pm25 > data.pm10) {
    throw new ValidationError('PM2.5 cannot exceed PM10 levels', 'pm25');
  }
}

export function sanitizeString(input: string, maxLength: number = 255): string {
  if (typeof input !== 'string') {
    throw new ValidationError('Input must be a string');
  }

  // Remove potentially dangerous characters
  const sanitized = input
    .replace(/[<>\"'&]/g, '') // Remove HTML/XML characters
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .trim()
    .substring(0, maxLength);

  return sanitized;
}

export function validateDeviceId(deviceId: string): void {
  if (!deviceId) {
    throw new ValidationError('Device ID is required', 'deviceId');
  }

  // Device ID format: letters, numbers, underscores, hyphens only
  const deviceIdRegex = /^[a-zA-Z0-9_-]+$/;
  if (!deviceIdRegex.test(deviceId)) {
    throw new ValidationError('Device ID contains invalid characters', 'deviceId');
  }

  if (deviceId.length < 3 || deviceId.length > 50) {
    throw new ValidationError('Device ID must be between 3 and 50 characters', 'deviceId');
  }
}

export function validateTimestamp(timestamp: number): void {
  if (typeof timestamp !== 'number' || isNaN(timestamp)) {
    throw new ValidationError('Timestamp must be a valid number', 'timestamp');
  }

  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  const oneHourFromNow = now + (60 * 60 * 1000);

  if (timestamp < oneHourAgo || timestamp > oneHourFromNow) {
    throw new ValidationError('Timestamp must be within the last hour', 'timestamp');
  }
}

export function validateApiKey(apiKey: string): void {
  if (!apiKey) {
    throw new ValidationError('API key is required', 'apiKey');
  }

  // API key format validation (adjust based on your key format)
  if (apiKey.length < 32) {
    throw new ValidationError('Invalid API key format', 'apiKey');
  }
}

export function rateLimitCheck(_identifier: string, _windowMs: number = 60000, _maxRequests: number = 10): boolean {
  // In production, this would use Redis or a proper rate limiting service
  // For now, this is a placeholder that always returns true
  // TODO: Implement proper rate limiting with Redis
  return true;
}