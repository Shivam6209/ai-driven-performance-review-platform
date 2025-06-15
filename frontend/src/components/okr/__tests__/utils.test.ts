import {
  getProgressColor,
  formatDate,
  calculateAverageProgress,
  validateOKR,
  sortOKRsByPriority,
  filterOKRsByLevel,
  filterOKRsByStatus,
  findParentChain,
  findChildrenRecursive,
  getProgressTrend,
} from '../utils';
import { OKR, OKRStatus, OKRLevel, OKRPriority } from '@/types/okr';

describe('OKR Utils', () => {
  describe('getProgressColor', () => {
    it('returns correct color based on progress value', () => {
      expect(getProgressColor(100)).toBe('success');
      expect(getProgressColor(80)).toBe('primary');
      expect(getProgressColor(50)).toBe('warning');
      expect(getProgressColor(20)).toBe('error');
    });
  });

  describe('formatDate', () => {
    it('formats date string correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toBe('January 15, 2024');
    });

    it('handles invalid date', () => {
      const date = new Date('invalid');
      expect(formatDate(date)).toBe('Invalid Date');
    });

    it('handles null date', () => {
      expect(formatDate(null)).toBe('N/A');
    });
  });

  describe('calculateAverageProgress', () => {
    it('calculates average progress from OKRs', () => {
      const okrs = [
        { progress: 60 },
        { progress: 30 },
        { progress: 90 },
      ];

      expect(calculateAverageProgress(okrs)).toBe(60);
    });

    it('returns 0 for empty OKRs array', () => {
      expect(calculateAverageProgress([])).toBe(0);
    });
  });

  describe('validateOKR', () => {
    const validOKR: Partial<OKR> = {
      title: 'Test OKR',
      description: 'Test description',
      level: 'company',
      start_date: '2024-01-01',
      due_date: '2024-03-31',
      status: 'in_progress',
      priority: 'high',
      tags: [],
    };

    it('validates a complete OKR', () => {
      expect(validateOKR(validOKR)).toBe(true);
    });

    it('invalidates OKR with missing title', () => {
      const invalidOKR = { ...validOKR, title: '' };
      expect(validateOKR(invalidOKR)).toBe(false);
    });

    it('invalidates OKR with missing description', () => {
      const invalidOKR = { ...validOKR, description: '' };
      expect(validateOKR(invalidOKR)).toBe(false);
    });
  });

  describe('sortOKRsByPriority', () => {
    it('sorts OKRs by priority correctly', () => {
      const okrs = [
        { priority: 'low' as OKRPriority },
        { priority: 'critical' as OKRPriority },
        { priority: 'medium' as OKRPriority },
        { priority: 'high' as OKRPriority },
      ];

      const sorted = sortOKRsByPriority(okrs);
      expect(sorted.map(o => o.priority)).toEqual(['critical', 'high', 'medium', 'low']);
    });
  });

  describe('filterOKRsByLevel', () => {
    it('filters OKRs by level', () => {
      const okrs = [
        { level: 'company' as OKRLevel },
        { level: 'department' as OKRLevel },
        { level: 'team' as OKRLevel },
        { level: 'individual' as OKRLevel },
      ];

      const filtered = filterOKRsByLevel(okrs, 'company');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].level).toBe('company');
    });
  });

  describe('filterOKRsByStatus', () => {
    it('filters OKRs by status', () => {
      const okrs = [
        { status: 'not_started' as OKRStatus },
        { status: 'in_progress' as OKRStatus },
        { status: 'completed' as OKRStatus },
      ];

      const filtered = filterOKRsByStatus(okrs, 'in_progress');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe('in_progress');
    });
  });

  describe('findParentChain', () => {
    const mockOKRs: OKR[] = [
      {
        id: '1',
        title: 'Parent OKR',
        description: 'Parent',
        level: 'company',
        progress: 50,
        status: 'in_progress',
        priority: 'high',
        start_date: '2024-01-01',
        due_date: '2024-03-31',
        tags: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        employee: { id: 'emp1', name: 'John Doe', role: 'Manager' },
        target_value: 100,
        current_value: 50,
        unit_of_measure: '%',
        weight: 1,
        updates: [],
      },
      {
        id: '2',
        title: 'Child OKR',
        description: 'Child',
        level: 'department',
        progress: 30,
        status: 'in_progress',
        priority: 'medium',
        start_date: '2024-01-01',
        due_date: '2024-03-31',
        tags: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        employee: { id: 'emp2', name: 'Jane Smith', role: 'Director' },
        target_value: 100,
        current_value: 30,
        unit_of_measure: '%',
        weight: 1,
        updates: [],
        parent_okr: {
          id: '1',
          title: 'Parent OKR',
          description: 'Parent',
          level: 'company',
          progress: 50,
          status: 'in_progress',
          priority: 'high',
          start_date: '2024-01-01',
          due_date: '2024-03-31',
          tags: [],
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          employee: { id: 'emp1', name: 'John Doe', role: 'Manager' },
          target_value: 100,
          current_value: 50,
          unit_of_measure: '%',
          weight: 1,
          updates: [],
        },
      },
    ];

    it('finds parent chain', () => {
      const chain = findParentChain('2', mockOKRs);
      expect(chain).toHaveLength(1);
      expect(chain[0].id).toBe('1');
    });

    it('returns empty array for root OKR', () => {
      const chain = findParentChain('1', mockOKRs);
      expect(chain).toHaveLength(0);
    });
  });

  describe('findChildrenRecursive', () => {
    const mockOKRs: OKR[] = [
      {
        id: '1',
        title: 'Parent OKR',
        description: 'Parent',
        level: 'company',
        progress: 50,
        status: 'in_progress',
        priority: 'high',
        start_date: '2024-01-01',
        due_date: '2024-03-31',
        tags: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        employee: { id: 'emp1', name: 'John Doe', role: 'Manager' },
        target_value: 100,
        current_value: 50,
        unit_of_measure: '%',
        weight: 1,
        updates: [],
      },
      {
        id: '2',
        title: 'Child OKR',
        description: 'Child',
        level: 'department',
        progress: 30,
        status: 'in_progress',
        priority: 'medium',
        start_date: '2024-01-01',
        due_date: '2024-03-31',
        tags: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        employee: { id: 'emp2', name: 'Jane Smith', role: 'Director' },
        target_value: 100,
        current_value: 30,
        unit_of_measure: '%',
        weight: 1,
        updates: [],
        parent_okr: {
          id: '1',
          title: 'Parent OKR',
          description: 'Parent',
          level: 'company',
          progress: 50,
          status: 'in_progress',
          priority: 'high',
          start_date: '2024-01-01',
          due_date: '2024-03-31',
          tags: [],
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          employee: { id: 'emp1', name: 'John Doe', role: 'Manager' },
          target_value: 100,
          current_value: 50,
          unit_of_measure: '%',
          weight: 1,
          updates: [],
        },
      },
    ];

    it('finds children recursively', () => {
      const children = findChildrenRecursive('1', mockOKRs);
      expect(children).toHaveLength(1);
      expect(children[0].id).toBe('2');
    });

    it('returns empty array for leaf OKR', () => {
      const children = findChildrenRecursive('2', mockOKRs);
      expect(children).toHaveLength(0);
    });
  });
});