import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { getCivicInformation, AddressInputSchema } from './civicApi';

// Mock fetch globally with proper typing — NIST PR.PS-03: no any types
global.fetch = vi.fn() as MockedFunction<typeof fetch>;
const mockedFetch = global.fetch as MockedFunction<typeof fetch>;

describe('Civic API Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_CIVIC_API_KEY = 'test-api-key';
  });

  describe('AddressInputSchema', () => {
    it('should validate a correct address', () => {
      const result = AddressInputSchema.safeParse({ address: '1600 Amphitheatre Pkwy, Mountain View, CA' });
      expect(result.success).toBe(true);
    });

    it('should reject a too short address', () => {
      const result = AddressInputSchema.safeParse({ address: 'a' });
      expect(result.success).toBe(false);
    });
  });

  describe('getCivicInformation', () => {
    it('should throw an error if API key is missing', async () => {
      delete process.env.GOOGLE_CIVIC_API_KEY;
      await expect(getCivicInformation('123 Main St')).rejects.toThrow('GOOGLE_CIVIC_API_KEY is not defined');
    });

    it('should return graceful fallback on 404', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: { message: 'Not found' } }),
      } as Response);

      const response = await getCivicInformation('Fake Address');
      expect(response.success).toBe(false);
      expect(response.message).toContain('I cannot find verified data');
    });

    it('should return data successfully on 200 OK', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ kind: 'civicinfo#voterInfoResponse', state: [] }),
      } as Response);

      const response = await getCivicInformation('123 Main St');
      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('kind');
    });
  });
});
