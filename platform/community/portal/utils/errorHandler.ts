// Houston EJ-AI Platform - Production Error Handling
// Comprehensive error handling with logging and user feedback

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string, public originalError?: Error) {
    super(message, 500, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

export class BlockchainError extends ApiError {
  constructor(message: string, public transactionHash?: string) {
    super(message, 500, 'BLOCKCHAIN_ERROR');
    this.name = 'BlockchainError';
  }
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    // Database connection errors
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connection')) {
      return new DatabaseError('Database connection failed', error);
    }

    // Blockchain/network errors
    if (error.message.includes('network') || error.message.includes('timeout')) {
      return new BlockchainError('Network request failed', undefined);
    }

    // Generic error
    return new ApiError(error.message, 500);
  }

  return new ApiError('An unexpected error occurred', 500);
}

export function logError(error: ApiError, context?: Record<string, any>): void {
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      stack: error.stack,
    },
    context,
  };

  // In production, this would go to a proper logging service
  console.error('API Error:', JSON.stringify(logData, null, 2));
}

export function createErrorResponse(error: ApiError): { success: false; error: string; code?: string; timestamp: number } {
  return {
    success: false,
    error: error.message,
    code: error.code,
    timestamp: Date.now(),
  };
}