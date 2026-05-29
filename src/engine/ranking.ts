import { Schema } from '@google/genai';
import { getGenAIClient } from './googleGenAI';
import { logger } from '../utils/logger';
import candidatesData from '../data/mockDataset.json';

const JOB_DESCRIPTION = `Senior GRC Analyst with SOC 2, ISO 27001, vendor risk, BFSI exposure, client communication, control testing, audit report writing, and stakeholder management.`;

// Primary and fallback models — NIST AI RMF MANAGE / F-006 remediation
const PRIMARY_MODEL = 'gemini-2.5-pro';
const FALLBACK_MODEL = 'gemini-2.5-flash';

export interface RoleBlueprint {
  coreCapabilities: string[];
  proofRequired: string[];
  hiddenRequirements: string[];
  dealBreakers: string[];
  seniorityExpectations: string;
  riskIfWrongHire: string;
}

export interface RankedCandidate {
  rank: number;
  candidateName: string;
  currentRole: string;
  totalExperienceYears: number;
  location: string;
  proofOfSuccessScore: number;
  claimMatchScore: number;
  evidenceStrength: number;
  contextFit: number;
  trajectoryScore: number;
  riskGapScore: number;
  confidenceLevel: string;
  candidateType: 'HIDDEN_GEM' | 'RESUME_INFLATED' | 'STRONG_EVIDENCE' | 'STANDARD';
  keyMatchingSkills: string[];
  evidenceTrail: string[];
  keyConcernGap: string;
  proofValidationQuestions: string[];
  recommendedAction: string;
  atsRank?: number;
}

// Typed candidate data structure
interface CandidateRecord {
  id: string;
  name: string;
  currentRole: string;
  totalExperienceYears: number;
  location: string;
  skills: string[];
  activitySignals: string;
  projects: string[];
}

const candidates: CandidateRecord[] = candidatesData as CandidateRecord[];

const RANKING_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      rank: { type: 'INTEGER', description: 'RankForge evidence-based rank from 1 (best) to N' },
      candidateName: { type: 'STRING' },
      currentRole: { type: 'STRING' },
      totalExperienceYears: { type: 'INTEGER' },
      location: { type: 'STRING' },
      proofOfSuccessScore: { type: 'INTEGER', description: 'Overall Proof-of-Success score 0-100.' },
      claimMatchScore: { type: 'INTEGER', description: 'Keyword match to JD 0-100.' },
      evidenceStrength: { type: 'INTEGER', description: 'Proof backing claims 0-100.' },
      contextFit: { type: 'INTEGER', description: 'Domain/context match 0-100.' },
      trajectoryScore: { type: 'INTEGER', description: 'Career trajectory toward this role 0-100.' },
      riskGapScore: { type: 'INTEGER', description: 'Risk of hiring failure 0-100. Lower is better.' },
      confidenceLevel: { type: 'STRING', description: 'High, Medium, or Low' },
      candidateType: { type: 'STRING', description: 'HIDDEN_GEM | RESUME_INFLATED | STRONG_EVIDENCE | STANDARD' },
      keyMatchingSkills: { type: 'ARRAY', items: { type: 'STRING' } },
      evidenceTrail: { type: 'ARRAY', items: { type: 'STRING' }, description: '3-4 proof points.' },
      keyConcernGap: { type: 'STRING', description: 'Single most important gap or risk.' },
      proofValidationQuestions: { type: 'ARRAY', items: { type: 'STRING' }, description: '2-3 interview questions.' },
      recommendedAction: { type: 'STRING', description: 'Fast-Track Interview | Interview with Validation | Hold for Review | Reject' },
      atsRank: { type: 'INTEGER', description: 'Where a keyword-only ATS would rank this candidate.' },
    },
    required: ['rank', 'candidateName', 'currentRole', 'totalExperienceYears', 'location',
      'proofOfSuccessScore', 'claimMatchScore', 'evidenceStrength', 'contextFit',
      'trajectoryScore', 'riskGapScore', 'confidenceLevel', 'candidateType',
      'keyMatchingSkills', 'evidenceTrail', 'keyConcernGap', 'proofValidationQuestions',
      'recommendedAction', 'atsRank'],
  },
} as any as Schema;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BLUEPRINT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    coreCapabilities: { type: 'ARRAY', items: { type: 'STRING' } },
    proofRequired: { type: 'ARRAY', items: { type: 'STRING' } },
    hiddenRequirements: { type: 'ARRAY', items: { type: 'STRING' } },
    dealBreakers: { type: 'ARRAY', items: { type: 'STRING' } },
    seniorityExpectations: { type: 'STRING' },
    riskIfWrongHire: { type: 'STRING' },
  },
  required: ['coreCapabilities', 'proofRequired', 'hiddenRequirements', 'dealBreakers', 'seniorityExpectations', 'riskIfWrongHire'],
} as any as Schema;

/**
 * Attempts to generate content using the primary model with automatic
 * fallback to the secondary model on 503 / overload errors.
 * NIST AI RMF MANAGE — F-006 remediation.
 */
async function generateWithFallback(prompt: string, schema: Schema, temperature: number): Promise<string> {
  const client = getGenAIClient();

  const attempt = async (model: string): Promise<string> => {
    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: 'application/json', responseSchema: schema, temperature },
    });
    if (!response.text) throw new Error('Empty response from model');
    return response.text;
  };

  try {
    logger.info('ranking', 'Attempting generation', { model: PRIMARY_MODEL });
    return await attempt(PRIMARY_MODEL);
  } catch (primaryError: unknown) {
    const errMsg = primaryError instanceof Error ? primaryError.message : String(primaryError);
    // 503 or overloaded → try fallback
    if (errMsg.includes('503') || errMsg.includes('overloaded') || errMsg.includes('UNAVAILABLE')) {
      logger.warn('ranking', 'Primary model unavailable, falling back', {
        primary: PRIMARY_MODEL,
        fallback: FALLBACK_MODEL,
        error: errMsg,
      });
      return await attempt(FALLBACK_MODEL);
    }
    throw primaryError;
  }
}

export async function generateRoleBlueprint(): Promise<RoleBlueprint> {
  const prompt = `You are the Role Success Blueprint Engine of RankForge AI.
Your purpose: Convert job descriptions from text into business success contracts.
Most tools read a JD and extract keywords. You extract WHAT SUCCESS LOOKS LIKE.

Job Description:
${JOB_DESCRIPTION}

Analyze this deeply. Do NOT just list keywords.
Think: What does this person actually DO every day? What separates a successful hire from a failed one?
What does the hiring manager assume but did NOT write?`;

  const text = await generateWithFallback(prompt, BLUEPRINT_SCHEMA, 0.3);
  return JSON.parse(text) as RoleBlueprint;
}

export async function rankCandidates(): Promise<RankedCandidate[]> {
  const candidatesToRank = candidates.slice(0, 8);

  const prompt = `You are the Proof-of-Success Ranking Engine of RankForge AI.

CORE PHILOSOPHY:
RankForge AI does not rank resumes. It ranks EVIDENCE of role success.
The best candidate is NOT the one with the most keywords.
The best candidate is the one with the STRONGEST PROOF of succeeding in this role.

CRITICAL INSTRUCTION — THE REORDER MOMENT:
You MUST demonstrate that RankForge AI can reorder the shortlist from what a traditional ATS would do.
If a candidate has high keyword match (claimMatchScore) but weak real-world evidence (evidenceStrength),
they should rank LOWER than a candidate with slightly lower keyword match but stronger proof.

CANDIDATE TYPE RULES:
- HIDDEN_GEM: strong evidence, weaker keyword match — ATS would miss them. atsRank must be significantly higher than rank.
- RESUME_INFLATED: strong keyword match, weak evidence — ATS favours them. atsRank must be significantly lower than rank.
- STRONG_EVIDENCE: both match and evidence are strong.
- STANDARD: average across all dimensions.

Job Description: ${JOB_DESCRIPTION}

Candidates: ${JSON.stringify(candidatesToRank, null, 2)}

Remember: Make the reorder story CLEAR and VISIBLE.`;

  try {
    const text = await generateWithFallback(prompt, RANKING_SCHEMA, 0.2);
    return JSON.parse(text) as RankedCandidate[];
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error('ranking', 'Ranking generation failed after all retries', { error: errMsg });
    throw error;
  }
}
