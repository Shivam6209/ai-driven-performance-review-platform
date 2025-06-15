import { OKRService } from '../okr.service';
import { OKR, OKRLevel, OKRStatus } from '@/types/okr';

describe('OKRService', () => {
  let service: OKRService;
  let mockFetch: jest.Mock;

  const mockOKR: OKR = {
    id: '1',
    title: 'Test OKR',
    description: 'Test Description',
    level: 'individual',
    employee: {
      id: 'owner1',
      name: 'John Doe',
      role: 'Developer'
    },
    target_value: 100,
    current_value: 0,
    unit_of_measure: 'percentage',
    weight: 1,
    priority: 'medium',
    start_date: '2024-01-01',
    due_date: '2024-12-31',
    status: 'not_started',
    progress: 0,
    updates: [],
    tags: ['test'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  };

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    service = OKRService.getInstance();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getOKRs', () => {
    it('fetches OKRs with filters', async () => {
      const filters = {
        level: 'individual' as OKRLevel,
        status: 'in_progress' as OKRStatus
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockOKR])
      });

      const result = await service.getOKRs(filters);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/okrs?level=individual&status=in_progress',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual([mockOKR]);
    });

    it('handles API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'API Error' })
      });

      await expect(service.getOKRs()).rejects.toThrow('HTTP error! status: undefined');
    });
  });

  describe('getOKRById', () => {
    it('fetches a single OKR by ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOKR)
      });

      const result = await service.getOKRById('1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/okrs/1',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual(mockOKR);
    });
  });

  describe('createOKR', () => {
    it('creates a new OKR', async () => {
      const { id, created_at, updated_at, ...newOKR } = mockOKR;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOKR)
      });

      const result = await service.createOKR(newOKR);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/okrs',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newOKR),
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual(mockOKR);
    });
  });

  describe('updateOKR', () => {
    it('updates an existing OKR', async () => {
      const update: Partial<OKR> = { title: 'Updated Title' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockOKR, ...update })
      });

      const result = await service.updateOKR('1', update);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/okrs/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(update),
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual({ ...mockOKR, ...update });
    });
  });

  describe('deleteOKR', () => {
    it('deletes an OKR', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });

      await service.deleteOKR('1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/okrs/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  describe('getOKRProgress', () => {
    it('fetches OKR progress', async () => {
      const progressData = {
        overall: 75,
        keyResults: [
          { id: 'kr1', progress: 80 },
          { id: 'kr2', progress: 70 }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(progressData)
      });

      const result = await service.getOKRProgress('1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/okrs/1/progress',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual(progressData);
    });
  });

  describe('getOKRAnalytics', () => {
    it('fetches OKR analytics', async () => {
      const analyticsData = {
        completionRate: 80,
        averageProgress: 75,
        atRiskCount: 2,
        onTrackCount: 8
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(analyticsData)
      });

      const result = await service.getOKRAnalytics('quarter');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/okrs/analytics?timeframe=quarter',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual(analyticsData);
    });
  });
}); 
 