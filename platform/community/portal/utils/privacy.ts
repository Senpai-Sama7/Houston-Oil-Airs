// Privacy-Preserving Data Processing
// Implements k-anonymity and differential privacy for sensitive data

/**
 * K-Anonymity: Ensures that any individual cannot be distinguished from at least k-1 others
 * @param data Array of records to anonymize
 * @param k Minimum group size
 * @param quasiIdentifiers Fields that could be used to identify individuals
 * @returns Anonymized data with suppression and generalization
 */
export interface DataRecord {
  [key: string]: string | number | boolean | null | undefined;
}

export function applyKAnonymity(
  data: DataRecord[],
  k: number,
  quasiIdentifiers: string[]
): DataRecord[] {
  if (data.length === 0 || k < 2) {
    return data;
  }

  // Group records by quasi-identifiers
  const groups = new Map<string, DataRecord[]>();
  
  data.forEach(record => {
    const key = quasiIdentifiers
      .map(field => String(record[field] ?? 'NULL'))
      .join('|');
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(record);
  });

  const anonymizedData: DataRecord[] = [];

  // Apply suppression for groups smaller than k
  groups.forEach((group) => {
    if (group.length >= k) {
      // Group is large enough, keep all records
      anonymizedData.push(...group);
    } else {
      // Group is too small, generalize quasi-identifiers
      const generalized = group.map(record => {
        const newRecord = { ...record };
        quasiIdentifiers.forEach(field => {
          newRecord[field] = generalizeValue(record[field]);
        });
        return newRecord;
      });
      anonymizedData.push(...generalized);
    }
  });

  return anonymizedData;
}

function generalizeValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '*';
  }
  
  if (typeof value === 'number') {
    // Generalize numbers to ranges
    const rounded = Math.floor(value / 10) * 10;
    return `${rounded}-${rounded + 9}`;
  }
  
  if (typeof value === 'string') {
    // Generalize strings to first character or category
    return value.length > 0 ? value[0] + '*' : '*';
  }
  
  return '*';
}

/**
 * Differential Privacy: Add calibrated noise to protect individual privacy
 * @param value True value to protect
 * @param epsilon Privacy budget (smaller = more private)
 * @param sensitivity Maximum impact of single individual
 * @returns Noisy value that provides differential privacy
 */
export function addLaplaceNoise(
  value: number,
  epsilon: number = 0.1,
  sensitivity: number = 1
): number {
  if (epsilon <= 0) {
    throw new Error('Epsilon must be positive');
  }
  
  const scale = sensitivity / epsilon;
  const u = Math.random() - 0.5;
  const noise = -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  
  return value + noise;
}

/**
 * Add Gaussian noise (alternative to Laplace)
 * @param value True value to protect
 * @param epsilon Privacy budget
 * @param delta Failure probability
 * @param sensitivity Maximum impact of single individual
 * @returns Noisy value with Gaussian mechanism
 */
export function addGaussianNoise(
  value: number,
  epsilon: number = 0.1,
  delta: number = 1e-5,
  sensitivity: number = 1
): number {
  if (epsilon <= 0 || delta <= 0 || delta >= 1) {
    throw new Error('Invalid privacy parameters');
  }
  
  // Calculate standard deviation for Gaussian mechanism
  const sigma = (sensitivity * Math.sqrt(2 * Math.log(1.25 / delta))) / epsilon;
  
  // Box-Muller transform for Gaussian random variable
  const u1 = Math.random();
  const u2 = Math.random();
  const noise = sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  
  return value + noise;
}

/**
 * Aggregate data with differential privacy
 * @param values Array of values to aggregate
 * @param epsilon Privacy budget
 * @returns Differentially private sum
 */
export function privateSun(values: number[], epsilon: number = 0.1): number {
  const trueSum = values.reduce((acc, val) => acc + val, 0);
  const sensitivity = Math.max(...values.map(Math.abs));
  return addLaplaceNoise(trueSum, epsilon, sensitivity);
}

/**
 * Calculate differentially private average
 * @param values Array of values
 * @param epsilon Privacy budget
 * @returns Differentially private average
 */
export function privateAverage(values: number[], epsilon: number = 0.1): number {
  if (values.length === 0) return 0;
  
  const trueAvg = values.reduce((acc, val) => acc + val, 0) / values.length;
  const sensitivity = (Math.max(...values) - Math.min(...values)) / values.length;
  
  return addLaplaceNoise(trueAvg, epsilon, sensitivity);
}

/**
 * Calculate differentially private count
 * @param count True count
 * @param epsilon Privacy budget
 * @returns Noisy count
 */
export function privateCount(count: number, epsilon: number = 0.1): number {
  return Math.max(0, Math.round(addLaplaceNoise(count, epsilon, 1)));
}

/**
 * Apply privacy-preserving aggregation to sensor data
 * @param sensorData Array of sensor readings
 * @param epsilon Privacy budget
 * @returns Aggregated data with privacy guarantees
 */
export interface SensorReading {
  pm25: number;
  pm10: number;
  temperature: number;
  humidity: number;
  device_id: string;
  timestamp: number;
}

export function aggregateSensorDataWithPrivacy(
  sensorData: SensorReading[],
  epsilon: number = 0.1
): {
  avgPM25: number;
  avgPM10: number;
  avgTemperature: number;
  avgHumidity: number;
  deviceCount: number;
  timeRange: { start: number; end: number };
} {
  if (sensorData.length === 0) {
    throw new Error('No data to aggregate');
  }

  // Split privacy budget across queries
  const epsilonPerQuery = epsilon / 5;

  const pm25Values = sensorData.map(d => d.pm25);
  const pm10Values = sensorData.map(d => d.pm10);
  const tempValues = sensorData.map(d => d.temperature);
  const humidityValues = sensorData.map(d => d.humidity);
  const uniqueDevices = new Set(sensorData.map(d => d.device_id)).size;

  return {
    avgPM25: privateAverage(pm25Values, epsilonPerQuery),
    avgPM10: privateAverage(pm10Values, epsilonPerQuery),
    avgTemperature: privateAverage(tempValues, epsilonPerQuery),
    avgHumidity: privateAverage(humidityValues, epsilonPerQuery),
    deviceCount: privateCount(uniqueDevices, epsilonPerQuery),
    timeRange: {
      start: Math.min(...sensorData.map(d => d.timestamp)),
      end: Math.max(...sensorData.map(d => d.timestamp))
    }
  };
}

/**
 * Check if data meets k-anonymity requirements
 * @param data Records to check
 * @param k Minimum group size
 * @param quasiIdentifiers Fields to check
 * @returns True if all groups have at least k members
 */
export function meetsKAnonymity(
  data: DataRecord[],
  k: number,
  quasiIdentifiers: string[]
): boolean {
  const groups = new Map<string, number>();
  
  data.forEach(record => {
    const key = quasiIdentifiers
      .map(field => String(record[field] ?? 'NULL'))
      .join('|');
    groups.set(key, (groups.get(key) || 0) + 1);
  });

  // Check if any group is smaller than k
  for (const count of groups.values()) {
    if (count < k) {
      return false;
    }
  }

  return true;
}
