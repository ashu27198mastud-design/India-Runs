import { describe, it, expect, vi } from 'vitest';
import { rankCandidates } from './ranking';

// Mock the googleGenAI client to avoid hitting the actual API during tests
vi.mock('./googleGenAI', () => {
  return {
    getGenAIClient: () => ({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify([
            {
              rank: 1,
              candidateName: "Test Candidate",
              currentRole: "Tester",
              totalExperienceYears: 5,
              location: "Remote",
              overallFitScore: 100,
              evidenceScore: 100,
              trajectoryScore: 100,
              riskScore: 0,
              confidenceLevel: "High",
              keyMatchingSkills: ["Testing"],
              keyEvidence: "Writes great tests",
              keyConcernGap: "None",
              recommendedAction: "Hire"
            }
          ])
        })
      }
    })
  };
});

describe('Ranking Engine', () => {
  it('should call the GenAI client and return properly parsed ranked candidates', async () => {
    const results = await rankCandidates();
    expect(results).toBeInstanceOf(Array);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].candidateName).toBe("Test Candidate");
    expect(results[0].overallFitScore).toBe(100);
  });
});
