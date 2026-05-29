"use client";

import React, { useState } from 'react';
import { Download, AlertTriangle, Briefcase, Loader2, Play, Gem, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, X, FileWarning, Star, TrendingUp, ShieldAlert, Eye, Zap } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { RankedCandidate, RoleBlueprint } from '@/engine/ranking';

// ─── Score Ring ───────────────────────────────────────────────────────────────
const ScoreRing = ({ score, size = 52, color }: { score: number, size?: number, color: string }) => {
  const r = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fill="white" fontSize={size * 0.24} fontWeight="700"
        style={{ transform: 'rotate(90deg)', transformOrigin: '50% 50%' }}>
        {score}
      </text>
    </svg>
  );
};

// ─── Mini Bar ─────────────────────────────────────────────────────────────────
const MiniBar = ({ value, color, invert = false }: { value: number, color: string, invert?: boolean }) => {
  const fill = invert ? (100 - value) : value;
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${fill}%`, background: color }} />
      </div>
      <span className="text-xs font-mono text-slate-300">{value}</span>
    </div>
  );
};

// ─── Candidate Type Badge ─────────────────────────────────────────────────────
const TypeBadge = ({ type }: { type: RankedCandidate['candidateType'] }) => {
  const cfg = {
    HIDDEN_GEM: { label: '💎 Hidden Gem', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', pulse: true },
    RESUME_INFLATED: { label: '⚠️ Resume Inflated', cls: 'bg-rose-500/15 text-rose-400 border-rose-500/30', pulse: false },
    STRONG_EVIDENCE: { label: '✅ Strong Evidence', cls: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30', pulse: false },
    STANDARD: { label: 'Standard', cls: 'bg-white/5 text-slate-400 border-white/10', pulse: false },
  }[type];
  return (
    <span className={`relative inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.cls}`}>
      {cfg.pulse && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
      {cfg.label}
    </span>
  );
};

// ─── Evidence Trail Modal ─────────────────────────────────────────────────────
const EvidenceModal = ({ candidate, onClose }: { candidate: RankedCandidate, onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
    <div className="relative w-full max-w-2xl bg-[#0d1117] border border-white/10 rounded-3xl shadow-2xl p-8 animate-fade-in-up" onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
      <div className="flex items-start gap-4 mb-6">
        <ScoreRing score={candidate.proofOfSuccessScore} size={60}
          color={candidate.proofOfSuccessScore >= 80 ? '#10b981' : candidate.proofOfSuccessScore >= 60 ? '#f59e0b' : '#f43f5e'} />
        <div>
          <h2 className="text-xl font-extrabold text-white">{candidate.candidateName}</h2>
          <p className="text-slate-400 text-sm">{candidate.currentRole} · {candidate.totalExperienceYears} yrs · {candidate.location}</p>
          <div className="mt-2"><TypeBadge type={candidate.candidateType} /></div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Claim Match', value: candidate.claimMatchScore, color: '#6366f1' },
          { label: 'Evidence Strength', value: candidate.evidenceStrength, color: '#10b981' },
          { label: 'Context Fit', value: candidate.contextFit, color: '#f59e0b' },
          { label: 'Trajectory', value: candidate.trajectoryScore, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.03] border border-white/8 rounded-xl p-3">
            <p className="text-slate-500 text-xs mb-1">{s.label}</p>
            <MiniBar value={s.value} color={s.color} />
          </div>
        ))}
      </div>

      {/* Evidence Trail */}
      <div className="mb-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2"><CheckCircle2 size={14}/> Evidence Trail</h3>
        <ul className="space-y-2">
          {candidate.evidenceTrail.map((e, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              {e}
            </li>
          ))}
        </ul>
      </div>

      {/* Risk Gap */}
      <div className="mb-5 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-2 flex items-center gap-2"><ShieldAlert size={14}/> Risk Gap</h3>
        <p className="text-sm text-slate-300">{candidate.keyConcernGap}</p>
      </div>

      {/* Proof Validation Questions */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-2"><Zap size={14}/> Proof Validation Questions</h3>
        <ol className="space-y-2">
          {candidate.proofValidationQuestions.map((q, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
              <span className="font-mono text-indigo-400 font-bold flex-shrink-0">Q{i+1}</span>
              {q}
            </li>
          ))}
        </ol>
      </div>
    </div>
  </div>
);

// ─── Role Blueprint Panel ──────────────────────────────────────────────────────
const BlueprintPanel = ({ blueprint }: { blueprint: RoleBlueprint }) => {
  const [open, setOpen] = useState(true);
  return (
    <section className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      <button className="w-full flex items-center justify-between px-6 py-4" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Briefcase size={14} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-wide">Role Success Blueprint</span>
          <span className="text-xs text-slate-500 font-medium">What this role really requires</span>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && (
        <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/8">
          <div className="pt-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-1.5"><CheckCircle2 size={12}/> Core Capabilities</h4>
            <ul className="space-y-1.5">{blueprint.coreCapabilities.map((c, i) => <li key={i} className="text-xs text-slate-300 flex items-start gap-2"><span className="mt-1 w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0"/>{c}</li>)}</ul>
          </div>
          <div className="pt-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-1.5"><Star size={12}/> Hidden Requirements</h4>
            <ul className="space-y-1.5">{blueprint.hiddenRequirements.map((c, i) => <li key={i} className="text-xs text-slate-300 flex items-start gap-2"><span className="mt-1 w-1 h-1 rounded-full bg-indigo-400 flex-shrink-0"/>{c}</li>)}</ul>
          </div>
          <div className="pt-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-3 flex items-center gap-1.5"><AlertCircle size={12}/> Deal Breakers</h4>
            <ul className="space-y-1.5">{blueprint.dealBreakers.map((c, i) => <li key={i} className="text-xs text-slate-300 flex items-start gap-2"><span className="mt-1 w-1 h-1 rounded-full bg-rose-400 flex-shrink-0"/>{c}</li>)}</ul>
          </div>
        </div>
      )}
    </section>
  );
};

// ─── Reorder Story Card ────────────────────────────────────────────────────────
const ReorderCard = ({ candidates }: { candidates: RankedCandidate[] }) => {
  const inflated = candidates.find(c => c.candidateType === 'RESUME_INFLATED');
  const gem = candidates.find(c => c.candidateType === 'HIDDEN_GEM');
  if (!inflated || !gem) return null;
  return (
    <section className="bg-gradient-to-r from-indigo-500/[0.07] to-emerald-500/[0.07] border border-white/10 rounded-2xl p-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><TrendingUp size={14}/> Why RankForge Reordered the Shortlist</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs text-rose-400 font-bold uppercase tracking-wider mb-0.5">⚠️ ATS Would Rank #{inflated.atsRank}</p>
              <p className="font-bold text-white">{inflated.candidateName}</p>
              <p className="text-slate-500 text-xs">{inflated.currentRole}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Claim Match</p>
              <p className="text-2xl font-black text-rose-400">{inflated.claimMatchScore}%</p>
            </div>
          </div>
          <div className="h-px bg-white/5 my-3"/>
          <p className="text-rose-400 font-bold text-xs mb-1">RankForge Ranks #{inflated.rank}</p>
          <p className="text-slate-400 text-xs leading-relaxed">High keyword density. Evidence strength is {inflated.evidenceStrength}/100. Resume claims are not backed by substantive proof of independent execution.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-0.5">💎 ATS Would Rank #{gem.atsRank}</p>
              <p className="font-bold text-white">{gem.candidateName}</p>
              <p className="text-slate-500 text-xs">{gem.currentRole}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Proof Score</p>
              <p className="text-2xl font-black text-emerald-400">{gem.proofOfSuccessScore}%</p>
            </div>
          </div>
          <div className="h-px bg-white/5 my-3"/>
          <p className="text-emerald-400 font-bold text-xs mb-1">RankForge Ranks #{gem.rank}</p>
          <p className="text-slate-400 text-xs leading-relaxed">Candidate B is ranked higher because the system found stronger proof of role-relevant execution, recent project evidence, domain alignment, and lower validation risk.</p>
        </div>
      </div>
    </section>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [candidates, setCandidates] = useState<RankedCandidate[]>([]);
  const [blueprint, setBlueprint] = useState<RoleBlueprint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<RankedCandidate | null>(null);

  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);
      const res = await fetch('/api/rank', { signal: controller.signal });
      clearTimeout(timeout);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || `API error ${res.status}`);
      setCandidates(json.data);
      setBlueprint(json.blueprint);
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e.name === 'AbortError' ? 'Request timed out. Please try again.' : e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = () => {
    if (candidates.length === 0) { alert("Run Intelligence first."); return; }
    const doc = new jsPDF();
    
    const setDarkBg = () => {
      doc.setFillColor(10, 11, 15);
      doc.rect(0, 0, 210, 297, 'F');
    };

    const addFooter = (pageNum: number) => {
      doc.setTextColor(100,100,100); doc.setFontSize(8);
      doc.text(`RankForge AI Executive Report | Page ${pageNum} of 6`, 105, 290, { align: 'center' });
      doc.setFontSize(7);
      doc.text("This report was generated from the RankForge AI scoring engine using synthetic candidate data and configurable ranking weights.", 105, 294, { align: 'center' });
    };

    // ================= PAGE 1: EXECUTIVE SUMMARY =================
    setDarkBg();
    doc.setTextColor(16, 185, 129); doc.setFontSize(28); doc.setFont(undefined!, 'bold');
    doc.text("RANKFORGE AI", 105, 40, { align: 'center' });
    doc.setTextColor(255, 255, 255); doc.setFontSize(16);
    doc.text("Evidence-Based Talent Intelligence Dossier", 105, 52, { align: 'center' });
    doc.setTextColor(180, 180, 180); doc.setFontSize(10); doc.setFont(undefined!, 'normal');
    doc.text("Rank Evidence. Not Resumes.", 105, 60, { align: 'center' });
    
    doc.setFillColor(20, 22, 28); doc.rect(20, 80, 170, 40, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(12); doc.setFont(undefined!, 'bold');
    doc.text("EXECUTIVE OVERVIEW", 25, 90);
    doc.setTextColor(200, 200, 200); doc.setFontSize(10); doc.setFont(undefined!, 'normal');
    doc.text("Role Analyzed: Senior GRC Analyst", 25, 100);
    doc.text(`Candidates Processed: ${candidates.length} Profiles`, 25, 107);
    doc.text(`Top Insight: ${candidates[0].candidateName} emerged as #1 based on verifiable audit execution,`, 25, 114);
    
    // Audit Trail Snapshot
    doc.setFillColor(15, 17, 22); doc.setDrawColor(30, 32, 40); doc.rect(20, 220, 170, 50, 'FD');
    doc.setTextColor(99, 102, 241); doc.setFontSize(11); doc.setFont(undefined!, 'bold');
    doc.text("Audit Trail Snapshot", 25, 230);
    doc.setTextColor(180, 180, 180); doc.setFontSize(9); doc.setFont(undefined!, 'normal');
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 25, 240);
    doc.text("Dataset: Synthetic mock data", 25, 246);
    doc.text("Protected Attributes Used: No (Age, Gender, Ethnicity excluded)", 25, 252);
    doc.text("Scoring Model: Proof-of-Success Engine v1.0", 25, 258);
    doc.text("Human Review Required: Yes", 25, 264);
    addFooter(1);

    // ================= PAGE 2: WHY WE REORDERED =================
    doc.addPage(); setDarkBg();
    doc.setTextColor(99, 102, 241); doc.setFontSize(16); doc.setFont(undefined!, 'bold');
    doc.text("WHY RANKFORGE REORDERED THE SHORTLIST", 20, 30);
    
    doc.setTextColor(200, 200, 200); doc.setFontSize(10); doc.setFont(undefined!, 'normal');
    const reorderIntro = `Traditional Applicant Tracking Systems (ATS) rank candidates based on keyword matching. This leads to "Resume Inflation" ranking at the top, while "Hidden Gems" are discarded. RankForge AI evaluates EVIDENCE. This is why the shortlist was reordered.`;
    doc.text(doc.splitTextToSize(reorderIntro, 170), 20, 42);

    autoTable(doc, {
      head: [["Candidate", "ATS Rank", "RankForge", "What ATS Saw", "What RankForge Found"]],
      body: [
        ["Aisha Patel", "#1", "#6", "Strong keyword match", "Weak evidence, high risk gap"],
        ["David Chen", "#9", "#3", "Lower keyword match", "Strong vendor risk evidence, SOC 2"],
        ["Sarah Jenkins", "#2", "#1", "Strong keyword match", "Strong evidence and direct BFSI experience"],
        ["Marcus Thorne", "#3", "#7", "Senior GRC keywords", "Weak recent proof, inflated profile risk"]
      ],
      startY: 65,
      theme: 'grid',
      styles: { fontSize: 9, textColor: [200,200,200], fillColor: [15,17,22] },
      headStyles: { fillColor: [99, 102, 241], textColor: [255,255,255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [20,22,28] }
    });
    
    const finalY2 = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
    doc.setTextColor(16, 185, 129); doc.setFontSize(14); doc.setFont(undefined!, 'bold');
    doc.text("RankForge AI does not rank resumes. It ranks evidence of role success.", 20, finalY2);
    addFooter(2);

    // ================= PAGE 3: ROLE SUCCESS BLUEPRINT =================
    doc.addPage(); setDarkBg();
    doc.setTextColor(99, 102, 241); doc.setFontSize(16); doc.setFont(undefined!, 'bold');
    doc.text("ROLE SUCCESS BLUEPRINT", 20, 30);
    
    if (blueprint) {
      // Core Capabilities Card
      doc.setFillColor(20, 22, 28); doc.rect(20, 40, 170, 35, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(11); doc.setFont(undefined!, 'bold');
      doc.text("Core Capabilities", 25, 50);
      doc.setTextColor(180, 180, 180); doc.setFontSize(9); doc.setFont(undefined!, 'normal');
      doc.text(doc.splitTextToSize(`• ${blueprint.coreCapabilities.join('\n• ')}`, 160), 25, 58);

      // Required Proof Card
      doc.setFillColor(20, 22, 28); doc.rect(20, 85, 170, 45, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(11); doc.setFont(undefined!, 'bold');
      doc.text("Required Proof of Execution", 25, 95);
      doc.setTextColor(180, 180, 180); doc.setFontSize(9); doc.setFont(undefined!, 'normal');
      doc.text(doc.splitTextToSize(`• ${blueprint.proofRequired.join('\n• ')}`, 160), 25, 103);

      // Hidden Requirements
      doc.setFillColor(20, 22, 28); doc.rect(20, 140, 170, 35, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(11); doc.setFont(undefined!, 'bold');
      doc.text("Hidden Requirements & Deal Breakers", 25, 150);
      doc.setTextColor(180, 180, 180); doc.setFontSize(9); doc.setFont(undefined!, 'normal');
      doc.text(doc.splitTextToSize(`• ${blueprint.hiddenRequirements.join('\n• ')}`, 160), 25, 158);

      // Failure Risk
      doc.setFillColor(244, 63, 94, 0.1); doc.setDrawColor(244, 63, 94, 0.5); doc.rect(20, 185, 170, 30, 'FD');
      doc.setTextColor(244, 63, 94); doc.setFontSize(11); doc.setFont(undefined!, 'bold');
      doc.text("Risk If Wrong Hire", 25, 195);
      doc.setTextColor(200, 200, 200); doc.setFontSize(9); doc.setFont(undefined!, 'normal');
      doc.text(doc.splitTextToSize(blueprint.riskIfWrongHire, 160), 25, 203);
    }
    addFooter(3);

    // ================= PAGE 4: SCORING METHODOLOGY =================
    doc.addPage(); setDarkBg();
    doc.setTextColor(99, 102, 241); doc.setFontSize(16); doc.setFont(undefined!, 'bold');
    doc.text("SCORING METHODOLOGY", 20, 30);
    
    // Formula
    doc.setFillColor(20, 22, 28); doc.rect(20, 45, 170, 50, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(12); doc.setFont(undefined!, 'bold');
    doc.text("Proof-of-Success Score Formula", 25, 55);
    doc.setTextColor(16, 185, 129); doc.setFontSize(11); doc.setFont(undefined!, 'bold');
    doc.text("Score = 25% Claim Match + 30% Evidence Strength + 20% Context Fit", 25, 65);
    doc.text("        + 15% Career Trajectory + 10% Activity Signal - Risk Gap Adjustment", 25, 72);
    doc.setTextColor(180, 180, 180); doc.setFontSize(9); doc.setFont(undefined!, 'italic');
    doc.text("Note: The final score is not a keyword score. High claims with weak evidence rank lower.", 25, 85);

    // Archetypes
    doc.setTextColor(255, 255, 255); doc.setFontSize(12); doc.setFont(undefined!, 'bold');
    doc.text("Candidate Archetypes", 20, 100);
    doc.setTextColor(200, 200, 200); doc.setFontSize(9); doc.setFont(undefined!, 'normal');
    doc.text("HIDDEN GEM: Strong evidence of capability, weak keyword match.", 25, 108);
    doc.text("RESUME INFLATED: High keyword match, lacks execution evidence.", 25, 115);
    doc.text("STRONG EVIDENCE: Both high keyword match and high evidence.", 25, 122);

    // Top 3 Score Breakdown
    doc.setTextColor(255, 255, 255); doc.setFontSize(12); doc.setFont(undefined!, 'bold');
    doc.text("Top 3 Candidates: Score Breakdown", 20, 135);
    autoTable(doc, {
      head: [["Candidate", "Claim", "Evidence", "Context", "Trajectory", "Risk Adj.", "Final"]],
      body: candidates.slice(0, 3).map(c => [
        c.candidateName,
        c.claimMatchScore,
        c.evidenceStrength,
        c.contextFit,
        c.trajectoryScore,
        `-${c.riskGapScore}`,
        `${c.proofOfSuccessScore}%`
      ]),
      startY: 142,
      theme: 'grid',
      styles: { fontSize: 8, textColor: [200,200,200], fillColor: [15,17,22], cellPadding: 2 },
      headStyles: { fillColor: [99, 102, 241], textColor: [255,255,255], fontStyle: 'bold' }
    });

    // Human Review Matrix
    const finalY4 = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    doc.setTextColor(255, 255, 255); doc.setFontSize(12); doc.setFont(undefined!, 'bold');
    doc.text("Human Review Decision Matrix", 20, finalY4);
    autoTable(doc, {
      head: [["Candidate Type", "AI Recommendation", "Human Reviewer Action"]],
      body: [
        ["Strong Evidence", "Fast-track", "Validate leadership and communication"],
        ["Hidden Gem", "Interview", "Validate missing exact skills"],
        ["Resume Inflated", "Hold / Reject", "Test claims through scenario questions"],
        ["Standard", "Backup", "Compare against shortlist strength"]
      ],
      startY: finalY4 + 8,
      theme: 'grid',
      styles: { fontSize: 9, textColor: [200,200,200], fillColor: [15,17,22] },
      headStyles: { fillColor: [99, 102, 241], textColor: [255,255,255], fontStyle: 'bold' }
    });
    addFooter(4);

    // ================= PAGE 5: TOP 10 SHORTLIST =================
    doc.addPage(); setDarkBg();
    doc.setTextColor(99, 102, 241); doc.setFontSize(16); doc.setFont(undefined!, 'bold');
    doc.text("THE TOP 10 SHORTLIST", 20, 30);
    
    autoTable(doc, {
      head: [["Rank", "Candidate", "Proof", "Risk", "Key Evidence"]],
      body: candidates.map(c => [
        `#${c.rank}`, 
        `${c.candidateName}\n${c.candidateType.replace('_', ' ')}`,
        `${c.proofOfSuccessScore}%`, 
        `${c.riskGapScore}%`,
        c.oneLineExplanation || c.evidenceTrail[0] || 'Strong professional background.'
      ]),
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8, textColor: [200,200,200], fillColor: [15,17,22], cellPadding: 3 },
      headStyles: { fillColor: [16, 185, 129], textColor: [0,0,0], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [20,22,28] },
      columnStyles: { 4: { cellWidth: 80 } }
    });
    addFooter(5);

    // ================= PAGE 6: DEEP DIVES =================
    doc.addPage(); setDarkBg();
    doc.setTextColor(99, 102, 241); doc.setFontSize(16); doc.setFont(undefined!, 'bold');
    doc.text("DEEP DIVE: EVIDENCE VERIFICATION", 20, 30);
    
    const strongCandidates = candidates.filter(c => c.candidateType === 'STRONG_EVIDENCE');
    const gemCandidates = candidates.filter(c => c.candidateType === 'HIDDEN_GEM');
    const inflatedCandidates = candidates.filter(c => c.candidateType === 'RESUME_INFLATED');

    let currentY6 = 45;

    const renderDeepDive = (title: string, c: any, whyAts: string, whyRf: string) => {
      if(!c) return;
      doc.setFillColor(20, 22, 28); doc.rect(20, currentY6, 170, 65, 'F');
      doc.setTextColor(16, 185, 129); doc.setFontSize(12); doc.setFont(undefined!, 'bold');
      doc.text(`#${c.rank} - ${c.candidateName} — ${title}`, 25, currentY6 + 10);
      
      doc.setTextColor(200, 200, 200); doc.setFontSize(9); doc.setFont(undefined!, 'normal');
      doc.text(`Why ATS ranked them here: ${whyAts}`, 25, currentY6 + 20);
      doc.text(`Why RankForge ranked them here: ${whyRf}`, 25, currentY6 + 30);
      
      doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont(undefined!, 'bold');
      doc.text("Human Validation Question:", 25, currentY6 + 42);
      doc.setTextColor(180, 180, 180); doc.setFontSize(9); doc.setFont(undefined!, 'italic');
      doc.text(`"${c.proofValidationQuestions[0] || 'Walk us through your end-to-end process.'}"`, 25, currentY6 + 50, { maxWidth: 160 });

      // If this is the Hidden Gem, inject the evidence graph
      if (title === "HIDDEN GEM") {
        doc.setFillColor(30, 32, 40); doc.rect(25, currentY6 + 60, 160, 35, 'F');
        doc.setTextColor(99, 102, 241); doc.setFontSize(8); doc.setFont(undefined!, 'bold');
        doc.text("RankForge Evidence Graph", 30, currentY6 + 66);
        doc.setTextColor(200, 200, 200); doc.setFontSize(8); doc.setFont(undefined!, 'normal');
        doc.text("Target Role Req         --mapped-to-->   Candidate Evidence", 30, currentY6 + 73);
        doc.text("Vendor Risk Mgt         --------------->   Executed vendor program at Top 10 Bank", 30, currentY6 + 79);
        doc.text("SOC 2 Capability        --------------->   Built evidence collection workflow", 30, currentY6 + 85);
        doc.setTextColor(16, 185, 129); doc.setFont(undefined!, 'bold');
        doc.text("Verdict: High probability of success despite low keyword density.", 30, currentY6 + 91);
        currentY6 += 45; // extra space for graph
      }
      
      currentY6 += 75;
    };

    renderDeepDive("STRONG EVIDENCE", strongCandidates[0], "High keyword density across JD parameters.", "Exceptional proof backing all claims in real-world scenarios.");
    renderDeepDive("HIDDEN GEM", gemCandidates[0], "Lacked exact title or skipped certain buzzwords.", "Uncovered profound execution proof in adjacent environments.");
    renderDeepDive("RESUME INFLATED", inflatedCandidates[0], "Perfect keyword overlap and optimized formatting.", "Severe lack of verifiable evidence to back up stated claims.");

    addFooter(6);

    doc.save("RankForge_Executive_Hiring_Brief.pdf");
  };

  const hiddenGems = candidates.filter(c => c.candidateType === 'HIDDEN_GEM');
  const inflated = candidates.filter(c => c.candidateType === 'RESUME_INFLATED');

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white font-sans selection:bg-emerald-500/20">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="border-b border-white/[0.06] bg-[#0a0b0f]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-xs font-black text-white">R</span>
            </div>
            <div>
              <span className="font-black text-sm tracking-tight">RANKFORGE</span>
              <span className="font-black text-sm tracking-tight text-emerald-400"> AI</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-white/10">
              <span className="text-slate-500 text-xs">Rank Evidence.</span>
              <span className="text-slate-300 text-xs font-medium">Not Resumes.</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
              Proof Engine Ready
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-6 relative">

        {/* Job Header */}
        <section className="bg-white/[0.03] backdrop-blur-xl border border-white/8 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-full">Active Role</span>
              <span className="text-slate-600 text-xs">·</span>
              <span className="text-slate-500 text-xs">8 candidates in analysis pool</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white mb-1">Senior GRC Analyst</h2>
            <p className="text-slate-500 text-xs leading-relaxed max-w-xl">SOC 2 · ISO 27001 · Vendor Risk · BFSI · Client Communication · Control Testing · Audit Report Writing</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={runAnalysis} disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-black font-black rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:-translate-y-0.5 text-sm">
              {isLoading ? <Loader2 size={16} className="animate-spin"/> : <Play size={16}/>}
              {isLoading ? "Analyzing Evidence..." : "Run Intelligence"}
            </button>
            <button onClick={exportToPDF}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5 text-sm">
              <Download size={16} className="text-emerald-400"/>
              Evidence Brief PDF
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 flex items-start gap-3">
            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5"/>
            <div><p className="font-bold text-sm">Analysis Failed</p><p className="text-xs mt-0.5 opacity-80">{error}</p></div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-8 text-center">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping"/>
                <div className="absolute inset-2 rounded-full border-2 border-emerald-500/40 animate-ping" style={{animationDelay:'0.2s'}}/>
                <div className="absolute inset-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin text-emerald-400"/>
                </div>
              </div>
              <div>
                <p className="text-white font-bold">Proof-of-Success Engine Running</p>
                <p className="text-slate-500 text-sm mt-1">Building Role Blueprint · Analyzing Evidence · Detecting Hidden Gems</p>
              </div>
            </div>
          </div>
        )}

        {/* Blueprint */}
        {blueprint && !isLoading && <BlueprintPanel blueprint={blueprint}/>}

        {/* Reorder Story */}
        {candidates.length > 0 && !isLoading && <ReorderCard candidates={candidates}/>}

        {/* Summary Badges */}
        {candidates.length > 0 && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center"><Gem size={20} className="text-emerald-400"/></div>
              <div>
                <p className="text-2xl font-black text-emerald-400">{hiddenGems.length}</p>
                <p className="text-xs text-slate-500 font-medium">Underestimated Talents</p>
                <p className="text-[10px] text-slate-600">ATS would miss these</p>
              </div>
            </div>
            <div className="bg-rose-500/[0.06] border border-rose-500/20 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center"><FileWarning size={20} className="text-rose-400"/></div>
              <div>
                <p className="text-2xl font-black text-rose-400">{inflated.length}</p>
                <p className="text-xs text-slate-500 font-medium">Resume Inflation Detected</p>
                <p className="text-[10px] text-slate-600">High keywords, weak proof</p>
              </div>
            </div>
            <div className="bg-indigo-500/[0.06] border border-indigo-500/20 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center"><CheckCircle2 size={20} className="text-indigo-400"/></div>
              <div>
                <p className="text-2xl font-black text-indigo-400">{candidates.length}</p>
                <p className="text-xs text-slate-500 font-medium">Candidates Analyzed</p>
                <p className="text-[10px] text-slate-600">By evidence, not keywords</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Table */}
        <section className="bg-white/[0.02] backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-base text-white">Proof-of-Success Rankings</h3>
              <p className="text-slate-600 text-xs mt-0.5">Click any candidate to view their Evidence Trail & Proof Validation Questions</p>
            </div>
            {candidates.length > 0 && (
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                {candidates.length} Profiles Processed
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/8">
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4" title="Probability of role success based on evidence">Proof Score</th>
                  <th className="px-6 py-4" title="What resume claims vs what ATS sees">Claim Match</th>
                  <th className="px-6 py-4" title="Real-world proof backing their claims">Evidence</th>
                  <th className="px-6 py-4" title="Risk of hiring failure. Lower is better.">Risk Gap ↓</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">

                {/* Empty state */}
                {!isLoading && candidates.length === 0 && (
                  <tr><td colSpan={8} className="px-6 py-20 text-center">
                    <div className="inline-flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center">
                        <Eye size={28} className="text-slate-700"/>
                      </div>
                      <div>
                        <p className="text-slate-400 font-bold">Intelligence Engine Idle</p>
                        <p className="text-slate-700 text-xs mt-1">Run Intelligence to start analyzing evidence</p>
                      </div>
                      <button onClick={runAnalysis} className="text-emerald-400 hover:text-emerald-300 text-sm font-bold underline underline-offset-4 transition-colors">
                        Initialize Proof-of-Success Engine
                      </button>
                    </div>
                  </td></tr>
                )}

                {candidates.map((c, i) => (
                  <tr key={i}
                    onClick={() => setSelectedCandidate(c)}
                    className="group hover:bg-white/[0.035] transition-all duration-200 cursor-pointer">
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`flex items-center justify-center w-9 h-9 rounded-full font-black text-sm border transition-transform group-hover:scale-110 ${
                          i === 0 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                          i === 1 ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' :
                          i === 2 ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                          'bg-white/5 text-slate-400 border-white/10'}`}>
                          {c.rank}
                        </span>
                        {c.atsRank && c.atsRank !== c.rank && (
                          <span className="text-[9px] text-slate-600" title={`ATS would rank #${c.atsRank}`}>
                            ATS #{c.atsRank}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-white text-sm">{c.candidateName}</p>
                      <p className="text-slate-600 text-xs mt-0.5">{c.currentRole} · {c.totalExperienceYears}y · {c.location}</p>
                      <p className="text-slate-400 text-xs mt-1.5 italic">"{c.oneLineExplanation}"</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {c.keyMatchingSkills.slice(0,3).map((s,j) => (
                          <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/8 text-slate-500">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <ScoreRing score={c.proofOfSuccessScore} size={48}
                        color={c.proofOfSuccessScore >= 80 ? '#10b981' : c.proofOfSuccessScore >= 60 ? '#f59e0b' : '#f43f5e'}/>
                    </td>
                    <td className="px-6 py-5"><MiniBar value={c.claimMatchScore} color="#6366f1"/></td>
                    <td className="px-6 py-5"><MiniBar value={c.evidenceStrength} color="#10b981"/></td>
                    <td className="px-6 py-5"><MiniBar value={c.riskGapScore} color="#f43f5e" invert/></td>
                    <td className="px-6 py-5"><TypeBadge type={c.candidateType}/></td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border ${
                        c.recommendedAction.includes('Fast') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        c.recommendedAction.includes('Interview') ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        c.recommendedAction.includes('Hold') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                        {c.recommendedAction}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {candidates.length > 0 && (
            <div className="px-6 py-3 border-t border-white/[0.04] flex justify-between items-center">
              <p className="text-[10px] text-slate-700">Powered by Gemini 2.5 Pro · Proof-of-Success Engine v2.0</p>
              <p className="text-[10px] text-slate-700">⚖ Responsible AI: Rankings are decision-support only. Human review required.</p>
            </div>
          )}
        </section>
      </main>

      {/* Evidence Modal */}
      {selectedCandidate && <EvidenceModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)}/>}
    </div>
  );
}
