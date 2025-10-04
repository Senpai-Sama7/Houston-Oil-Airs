// Unit tests for privacy utilities
import {
  applyKAnonymity,
  addLaplaceNoise,
  addGaussianNoise,
  privateAverage,
  privateCount,
  meetsKAnonymity,
  type DataRecord
} from '../../utils/privacy';

describe('Privacy Utilities', () => {
  describe('K-Anonymity', () => {
    it('should apply k-anonymity to dataset', () => {
      const data: DataRecord[] = [
        { age: 25, zip: '77001', condition: 'asthma' },
        { age: 25, zip: '77001', condition: 'copd' },
        { age: 30, zip: '77002', condition: 'asthma' }
      ];

      const anonymized = applyKAnonymity(data, 2, ['age', 'zip']);
      
      // Should return data (may be generalized)
      expect(anonymized).toHaveLength(3);
      expect(Array.isArray(anonymized)).toBe(true);
    });

    it('should check if data meets k-anonymity', () => {
      const data: DataRecord[] = [
        { age: 25, zip: '77001' },
        { age: 25, zip: '77001' },
        { age: 30, zip: '77002' },
        { age: 30, zip: '77002' }
      ];

      const meetsK = meetsKAnonymity(data, 2, ['age', 'zip']);
      expect(meetsK).toBe(true);
    });

    it('should detect k-anonymity violations', () => {
      const data: DataRecord[] = [
        { age: 25, zip: '77001' },
        { age: 30, zip: '77002' }
      ];

      const meetsK = meetsKAnonymity(data, 2, ['age', 'zip']);
      expect(meetsK).toBe(false);
    });
  });

  describe('Differential Privacy', () => {
    it('should add Laplace noise', () => {
      const value = 100;
      const noisy = addLaplaceNoise(value, 0.1, 1);
      
      // Should return a number
      expect(typeof noisy).toBe('number');
      
      // Should be different from original (with very high probability)
      expect(noisy).not.toBe(value);
      
      // Should be within reasonable range (allowing for noise)
      expect(Math.abs(noisy - value)).toBeLessThan(100);
    });

    it('should add Gaussian noise', () => {
      const value = 100;
      const noisy = addGaussianNoise(value, 0.1, 1e-5, 1);
      
      expect(typeof noisy).toBe('number');
      expect(noisy).not.toBe(value);
      expect(Math.abs(noisy - value)).toBeLessThan(100);
    });

    it('should calculate private average', () => {
      const values = [10, 20, 30, 40, 50];
      const trueAvg = 30;
      
      // Run multiple times to get average behavior
      const results = [];
      for (let i = 0; i < 20; i++) {
        results.push(privateAverage(values, 0.5));
      }
      
      // Average of noisy results should be close to true average
      const avgOfNoisy = results.reduce((a, b) => a + b, 0) / results.length;
      
      expect(typeof avgOfNoisy).toBe('number');
      
      // With higher epsilon (0.5), should be reasonably close
      expect(Math.abs(avgOfNoisy - trueAvg)).toBeLessThan(20);
    });

    it('should calculate private count', () => {
      const count = 100;
      const privateC = privateCount(count, 0.1);
      
      expect(typeof privateC).toBe('number');
      expect(privateC).toBeGreaterThanOrEqual(0);
      
      // Should be roughly close to true count
      expect(Math.abs(privateC - count)).toBeLessThan(50);
    });

    it('should handle edge cases', () => {
      expect(() => addLaplaceNoise(100, 0, 1)).toThrow();
      expect(() => addLaplaceNoise(100, -1, 1)).toThrow();
      expect(() => addGaussianNoise(100, 0, 1e-5, 1)).toThrow();
      expect(() => addGaussianNoise(100, 0.1, 0, 1)).toThrow();
      expect(() => addGaussianNoise(100, 0.1, 1, 1)).toThrow();
    });
  });

  describe('Privacy Guarantees', () => {
    it('should ensure privacy with repeated queries', () => {
      const value = 100;
      const results = [];
      
      // Run multiple queries
      for (let i = 0; i < 10; i++) {
        results.push(addLaplaceNoise(value, 0.1, 1));
      }
      
      // All results should be different (with very high probability)
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBeGreaterThan(1);
      
      // Average should be close to true value
      const avg = results.reduce((a, b) => a + b, 0) / results.length;
      expect(Math.abs(avg - value)).toBeLessThan(30);
    });
  });
});
