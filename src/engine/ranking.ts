import { Schema } from '@google/genai';
import { getGenAIClient } from './googleGenAI';
import candidates from '../data/mockDataset.json';

const JOB_DESCRIPTION = `Senior GRC Analyst with SOC 2, ISO 27001, vendor risk, BFSI exposure, client communication, control testing, audit report writing, and stakeholder management.`;

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
  atsRank?: number; // What a traditional ATS would rank them
}

const RANKING_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      rank: { type: "INTEGER", description: "RankForge evidence-based rank from 1 (best) to N" },
      candidateName: { type: "STRING" },
      currentRole: { type: "STRING" },
      totalExperienceYears: { type: "INTEGER" },
      location: { type: "STRING" },
      proofOfSuccessScore: { type: "INTEGER", description: "Overall Proof-of-Success score 0-100. This is NOT keyword match. It is the probability of succeeding in this role based on evidence." },
      claimMatchScore: { type: "INTEGER", description: "How closely their resume keywords match the JD, 0-100." },
      evidenceStrength: { type: "INTEGER", description: "How strong is the actual proof backing their claims, 0-100. Low for keyword stuffers." },
      contextFit: { type: "INTEGER", description: "Does their project/domain context match this role's environment (BFSI, audit complexity), 0-100." },
      trajectoryScore: { type: "INTEGER", description: "Is their career moving toward or away from this role, 0-100." },
      riskGapScore: { type: "INTEGER", description: "Risk of hiring failure (flight risk, overfit, experience gaps), 0-100. LOWER is better." },
      confidenceLevel: { type: "STRING", description: "High, Medium, or Low — how confident is RankForge in this ranking." },
      candidateType: { type: "STRING", description: "HIDDEN_GEM (strong evidence, weaker keyword match - ATS would miss them), RESUME_INFLATED (strong keyword match, weak real evidence), STRONG_EVIDENCE (both match and evidence are strong), STANDARD (average across dimensions)" },
      keyMatchingSkills: { type: "ARRAY", items: { type: "STRING" } },
      evidenceTrail: { type: "ARRAY", items: { type: "STRING" }, description: "3-4 specific proof points from their history proving role success capability." },
      keyConcernGap: { type: "STRING", description: "The single most important missing area or risk signal." },
      proofValidationQuestions: { type: "ARRAY", items: { type: "STRING" }, description: "2-3 specific interview questions to validate or disprove their evidence." },
      recommendedAction: { type: "STRING", description: "One of: Fast-Track Interview, Interview with Validation, Hold for Review, Reject" },
      atsRank: { type: "INTEGER", description: "Estimate of where a traditional keyword-based ATS would rank this candidate. This creates the contrast story." }
    },
    required: ["rank", "candidateName", "currentRole", "totalExperienceYears", "location", "proofOfSuccessScore", "claimMatchScore", "evidenceStrength", "contextFit", "trajectoryScore", "riskGapScore", "confidenceLevel", "candidateType", "keyMatchingSkills", "evidenceTrail", "keyConcernGap", "proofValidationQuestions", "recommendedAction", "atsRank"]
  }
};

const BLUEPRINT_SCHEMA = {
  type: "OBJECT",
  properties: {
    coreCapabilities: { type: "ARRAY", items: { type: "STRING" }, description: "What this person MUST be able to DO independently." },
    proofRequired: { type: "ARRAY", items: { type: "STRING" }, description: "What specific evidence would PROVE they can do it." },
    hiddenRequirements: { type: "ARRAY", items: { type: "STRING" }, description: "What is implied but NOT explicitly written in the JD." },
    dealBreakers: { type: "ARRAY", items: { type: "STRING" }, description: "Absolute disqualifiers - what would make this hire fail." },
    seniorityExpectations: { type: "STRING", description: "What does 'Senior' really mean in this context." },
    riskIfWrongHire: { type: "STRING", description: "What is the business cost of a bad hire for this specific role." }
  },
  required: ["coreCapabilities", "proofRequired", "hiddenRequirements", "dealBreakers", "seniorityExpectations", "riskIfWrongHire"]
};

export async function generateRoleBlueprint(): Promise<RoleBlueprint> {
  const client = getGenAIClient();

  const prompt = `You are the Role Success Blueprint Engine of RankForge AI.

Your purpose: Convert job descriptions from text into business success contracts.
Most tools read a JD and extract keywords. You extract WHAT SUCCESS LOOKS LIKE.

Job Description:
${JOB_DESCRIPTION}

Analyze this deeply. Do NOT just list keywords.
Think: What does this person actually DO every day? What separates a successful hire from a failed one?
What does the hiring manager assume but did NOT write? What certifications without execution would be a red flag?

Be specific, direct, and commercially sharp.`;

  const response = await client.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: BLUEPRINT_SCHEMA as Schema,
      temperature: 0.3,
    }
  });

  return JSON.parse(response.text!) as RoleBlueprint;
}

export async function rankCandidates(): Promise<RankedCandidate[]> {
  const client = getGenAIClient();
  const candidatesToRank = candidates.slice(0, 8);

  const prompt = `You are the Proof-of-Success Ranking Engine of RankForge AI.

CORE PHILOSOPHY: 
RankForge AI does not rank resumes. It ranks EVIDENCE of role success.
The best candidate is NOT the one with the most keywords.
The best candidate is the one with the STRONGEST PROOF of succeeding in this role.

CRITICAL INSTRUCTION — THE REORDER MOMENT:
You MUST demonstrate that RankForge AI can reorder the shortlist from what a traditional ATS would do.
Specifically: If a candidate has high keyword match (claimMatchScore) but weak real-world evidence (evidenceStrength), 
they should rank LOWER than a candidate with slightly lower keyword match but stronger proof.

This contrast is the entire product value. Make it visible.

CANDIDATE TYPE RULES:
- HIDDEN_GEM: candidate who a traditional ATS (keyword-only) would rank 6th-8th, but RankForge ranks top 3 because their evidence is strong despite not having every keyword. Flag their atsRank significantly higher (worse) than their RankForge rank.
- RESUME_INFLATED: candidate who an ATS would rank top 3, but RankForge ranks lower because their evidence is weak despite keyword density. Flag their atsRank significantly lower (better) than their RankForge rank.
- STRONG_EVIDENCE: Both keyword match and evidence are strong. Rightfully at the top.
- STANDARD: Average across all dimensions.

SCORING DIMENSIONS:
1. proofOfSuccessScore (HEADLINE): Probability of role success based on ALL dimensions combined. NOT just keyword match.
2. claimMatchScore: Pure keyword/skills match to JD (what ATS would see).
3. evidenceStrength: Real proof in projects, roles, and demonstrated capabilities. Penalize "Helped with SOC 2" heavily. Reward "Led SOC 2 Type II audit for a major payment processor".
4. contextFit: BFSI environment, audit complexity, client-facing work — does their background match this specific world?
5. trajectoryScore: Is their career arc moving toward this role or drifting away?
6. riskGapScore: Flight risk (frequent job hopper), overfit signals, experience gaps. LOWER is BETTER.

Job Description:
${JOB_DESCRIPTION}

Candidates:
${JSON.stringify(candidatesToRank, null, 2)}

Remember: Make the reorder story CLEAR and VISIBLE. Judges must see that RankForge AI thinks differently from keyword matching.
`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RANKING_SCHEMA as Schema,
        temperature: 0.2,
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as RankedCandidate[];
    }
    return [];
  } catch (error) {
    console.error("Error generating ranking via Gemini:", error);
    throw error;
  }
}
