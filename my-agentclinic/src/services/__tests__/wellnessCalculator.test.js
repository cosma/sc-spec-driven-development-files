import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calculateWellnessScore,
  calculateTherapyDiversity,
  calculateCompletionRate,
  getTherapiesCompleted,
  getAilmentResolutionRate,
  getActiveAilments,
  getPerformanceMetrics
} from '../wellnessCalculator.js';

describe('Wellness Calculator', () => {
  let mockDbAll;

  beforeEach(() => {
    mockDbAll = vi.fn();
  });

  describe('calculateTherapyDiversity', () => {
    it('should return 0 when agent has no therapies', async () => {
      mockDbAll
        .mockResolvedValueOnce([]) // no completed therapies
        .mockResolvedValueOnce([]); // no total therapies

      const result = await calculateTherapyDiversity(mockDbAll, 'agent1');
      expect(result).toBe(0);
    });

    it('should calculate therapy diversity correctly', async () => {
      mockDbAll
        .mockResolvedValueOnce([{ id: 't1' }, { id: 't2' }]) // 2 unique completed therapies
        .mockResolvedValueOnce([{ id: 't1' }, { id: 't2' }, { id: 't3' }, { id: 't4' }]); // 4 total therapies

      const result = await calculateTherapyDiversity(mockDbAll, 'agent1');
      expect(result).toBe(50); // 2/4 * 100 = 50
    });

    it('should cap diversity at 100', async () => {
      mockDbAll
        .mockResolvedValueOnce([{ id: 't1' }]) // 1 completed therapy
        .mockResolvedValueOnce([{ id: 't1' }]); // 1 total therapy

      const result = await calculateTherapyDiversity(mockDbAll, 'agent1');
      expect(result).toBe(100);
    });
  });

  describe('calculateCompletionRate', () => {
    it('should return 0 when agent has no appointments', async () => {
      mockDbAll.mockResolvedValueOnce([{ totalAppointments: 0, completedAppointments: 0 }]);

      const result = await calculateCompletionRate(mockDbAll, 'agent1');
      expect(result).toBe(0);
    });

    it('should calculate completion rate correctly', async () => {
      mockDbAll.mockResolvedValueOnce([
        { totalAppointments: 10, completedAppointments: 8 }
      ]);

      const result = await calculateCompletionRate(mockDbAll, 'agent1');
      expect(result).toBe(80); // 8/10 * 100 = 80
    });

    it('should cap completion rate at 100', async () => {
      mockDbAll.mockResolvedValueOnce([
        { totalAppointments: 5, completedAppointments: 5 }
      ]);

      const result = await calculateCompletionRate(mockDbAll, 'agent1');
      expect(result).toBe(100);
    });
  });

  describe('calculateWellnessScore', () => {
    it('should return 0 when agent has no appointments or therapies', async () => {
      mockDbAll
        .mockResolvedValueOnce([]) // no completed therapies
        .mockResolvedValueOnce([]) // no total therapies
        .mockResolvedValueOnce([{ totalAppointments: 0, completedAppointments: 0 }]); // no appointments

      const result = await calculateWellnessScore(mockDbAll, 'agent1');
      expect(result).toBe(0);
    });

    it('should calculate wellness score using formula: (diversity * completion) / 100', async () => {
      mockDbAll
        .mockResolvedValueOnce([{ id: 't1' }, { id: 't2' }]) // 2 therapies completed
        .mockResolvedValueOnce([{ id: 't1' }, { id: 't2' }, { id: 't3' }, { id: 't4' }]) // 4 total therapies (50% diversity)
        .mockResolvedValueOnce([{ totalAppointments: 10, completedAppointments: 8 }]); // 80% completion

      const result = await calculateWellnessScore(mockDbAll, 'agent1');
      // (50 * 80) / 100 = 40
      expect(result).toBe(40);
    });

    it('should calculate wellness score with different metrics', async () => {
      mockDbAll
        .mockResolvedValueOnce([{ id: 't1' }, { id: 't2' }, { id: 't3' }]) // 3 therapies completed
        .mockResolvedValueOnce([{ id: 't1' }, { id: 't2' }, { id: 't3' }]) // 3 total therapies (100% diversity)
        .mockResolvedValueOnce([{ totalAppointments: 5, completedAppointments: 5 }]); // 100% completion

      const result = await calculateWellnessScore(mockDbAll, 'agent1');
      // (100 * 100) / 100 = 100
      expect(result).toBe(100);
    });

    it('should round wellness score to nearest integer', async () => {
      mockDbAll
        .mockResolvedValueOnce([{ id: 't1' }]) // 1 therapy completed
        .mockResolvedValueOnce([{ id: 't1' }, { id: 't2' }, { id: 't3' }]) // 3 total therapies (~33.33% diversity)
        .mockResolvedValueOnce([{ totalAppointments: 10, completedAppointments: 7 }]); // 70% completion

      const result = await calculateWellnessScore(mockDbAll, 'agent1');
      // (33.33 * 70) / 100 = 23.33 -> rounds to 23
      expect(result).toBe(23);
    });
  });

  describe('getTherapiesCompleted', () => {
    it('should return 0 when agent has no completed therapies', async () => {
      mockDbAll.mockResolvedValueOnce([{ count: 0 }]);

      const result = await getTherapiesCompleted(mockDbAll, 'agent1');
      expect(result).toBe(0);
    });

    it('should return count of completed therapies', async () => {
      mockDbAll.mockResolvedValueOnce([{ count: 5 }]);

      const result = await getTherapiesCompleted(mockDbAll, 'agent1');
      expect(result).toBe(5);
    });
  });

  describe('getAilmentResolutionRate', () => {
    it('should return 0 when agent has no ailments', async () => {
      mockDbAll
        .mockResolvedValueOnce([]) // no ailments
        .mockResolvedValueOnce([]); // no resolved ailments

      const result = await getAilmentResolutionRate(mockDbAll, 'agent1');
      expect(result).toBe(0);
    });

    it('should calculate ailment resolution rate', async () => {
      mockDbAll
        .mockResolvedValueOnce([{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }, { id: 'a4' }]) // 4 ailments
        .mockResolvedValueOnce([{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }]); // 3 resolved

      const result = await getAilmentResolutionRate(mockDbAll, 'agent1');
      expect(result).toBe(75); // 3/4 * 100 = 75
    });

    it('should round resolution rate to nearest integer', async () => {
      mockDbAll
        .mockResolvedValueOnce([{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }]) // 3 ailments
        .mockResolvedValueOnce([{ id: 'a1' }]); // 1 resolved

      const result = await getAilmentResolutionRate(mockDbAll, 'agent1');
      expect(result).toBe(33); // 1/3 * 100 = 33.33 -> rounds to 33
    });
  });

  describe('getActiveAilments', () => {
    it('should return 0 when agent has no active ailments', async () => {
      mockDbAll.mockResolvedValueOnce([]);

      const result = await getActiveAilments(mockDbAll, 'agent1');
      expect(result).toBe(0);
    });

    it('should count active ailments correctly', async () => {
      mockDbAll.mockResolvedValueOnce([{ id: 'a1' }, { id: 'a2' }]);

      const result = await getActiveAilments(mockDbAll, 'agent1');
      expect(result).toBe(2);
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should return all performance metrics', async () => {
      mockDbAll
        .mockResolvedValueOnce([{ count: 5 }]) // therapies completed
        .mockResolvedValueOnce([{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }, { id: 'a4' }]) // all ailments
        .mockResolvedValueOnce([{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }]) // resolved ailments
        .mockResolvedValueOnce([{ id: 'a5' }, { id: 'a6' }]); // active ailments

      const result = await getPerformanceMetrics(mockDbAll, 'agent1');

      expect(result).toEqual({
        therapiesCompleted: 5,
        ailmentResolutionRate: 75,
        activeAilments: 2
      });
    });
  });
});
