import { Schema } from '@google/genai';
import { getGenAIClient } from './googleGenAI';
import candidates from '../data/mockDataset.json';

const JOB_DESCRIPTION = `Senior GRC Analyst with SOC 2, ISO 27001, vendor risk, BFSI exposure, client communication, control testing, audit report writing, and stakeholder management.`;

export interface RankedCandidate {
  rank: number;
  candidateName: string;
  currentRole: string;
  totalExperienceYears: number;
  location: string;
  overallFitScore: number;
  evidenceScore: number;
  trajectoryScore: number;
  riskScore: number;
  confidenceLevel: string;
  keyMatchingSkills: string[];
  keyEvidence: string;
  keyConcernGap: string;
  recommendedAction: string;
}

export async function rankCandidates(): Promise<RankedCandidate[]> {
  const client = getGenAIClient();
  
  // Define the schema for structured output to guarantee format
  const responseSchema = {
    type: "ARRAY",
    items: {
      type: "OBJECT",
      properties: {
        rank: { type: "INTEGER", description: "Rank of the candidate from 1 to N" },
        candidateName: { type: "STRING" },
        currentRole: { type: "STRING" },
        totalExperienceYears: { type: "INTEGER" },
        location: { type: "STRING" },
        overallFitScore: { type: "INTEGER", description: "Score out of 100" },
        evidenceScore: { type: "INTEGER", description: "Score out of 100 based on project evidence" },
        trajectoryScore: { type: "INTEGER", description: "Score out of 100 based on career growth" },
        riskScore: { type: "INTEGER", description: "Score out of 100 based on overfit or flight risk" },
        confidenceLevel: { type: "STRING", description: "High, Medium, or Low" },
        keyMatchingSkills: { type: "ARRAY", items: { type: "STRING" } },
        keyEvidence: { type: "STRING", description: "Strongest piece of evidence" },
        keyConcernGap: { type: "STRING", description: "Missing or weak area" },
        recommendedAction: { type: "STRING", description: "E.g., Proceed to Interview, Hold, Reject" }
      },
      required: ["rank", "candidateName", "currentRole", "totalExperienceYears", "location", "overallFitScore", "evidenceScore", "trajectoryScore", "riskScore", "confidenceLevel", "keyMatchingSkills", "keyEvidence", "keyConcernGap", "recommendedAction"]
    }
  };

  const prompt = `
  You are the core intelligence engine of RANKFORGE AI.
  Your task is to rank the following candidates against the given job description.
  Use Candidate DNA, Semantic Fit, and Activity Signals.
  Be aware of "Hidden Gems" (candidates with high trajectory but maybe missing exact keywords)
  and "Overfit" candidates (candidates who stuffed keywords but lack deep evidence).
  
  Job Description:
  ${JOB_DESCRIPTION}
  
  Candidates JSON:
  ${JSON.stringify(candidates.slice(0, 15), null, 2)}
  
  Rank ALL of them from 1 (best) to N (worst) and provide scores and explanations for each.
  Strictly follow the JSON schema provided.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as Schema,
        temperature: 0.2, // Low temperature for consistent scoring
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as RankedCandidate[];
    }
    return [];
  } catch (error) {
    console.error("Error generating ranking via Gemini:", error);
    throw error; // Propagate so the API route returns a proper error to the frontend
  }
}
