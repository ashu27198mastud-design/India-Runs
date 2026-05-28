"use client";

import React, { useState } from 'react';
import { Download, FileText, AlertTriangle, Briefcase, Eye, Loader2, Play, Info } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Tooltip = ({ children, content }: { children: React.ReactNode, content: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div 
      className="relative flex items-center gap-1 cursor-help group"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <Info size={14} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 rounded-xl bg-slate-800/90 backdrop-blur-xl border border-white/10 shadow-2xl text-xs text-slate-200 z-50 animate-fade-in-up text-center font-normal tracking-wide">
          {content}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-slate-800/90"></div>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAIRanking = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const res = await fetch('/api/rank', { signal: controller.signal });
      clearTimeout(timeout);

      const json = await res.json();
      
      if (!res.ok || !json.success) {
        throw new Error(json.error || `API error ${res.status}`);
      }
      
      setCandidates(json.data);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out. The AI is taking longer than expected. Please try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = () => {
    if (candidates.length === 0) {
      alert("No candidates to export. Please run the AI ranking first.");
      return;
    }

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text("RANKFORGE AI - Candidate Report", 14, 22);
    
    // Subtitle
    doc.setFontSize(11);
    doc.text("Role: Senior GRC Analyst", 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

    // Table
    const tableColumn = ["Rank", "Name", "Role", "Fit", "Risk", "Evidence"];
    const tableRows: any[] = [];

    candidates.forEach(candidate => {
      const candidateData = [
        candidate.rank,
        candidate.candidateName,
        candidate.currentRole,
        `${candidate.overallFitScore}%`,
        `${candidate.riskScore}%`,
        candidate.keyEvidence.substring(0, 50) + "..."
      ];
      tableRows.push(candidateData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [16, 185, 129] } // Emerald color
    });

    doc.save("RANKFORGE_AI_Candidates.pdf");
  };

  return (
    <div className="min-h-screen bg-mesh-dark text-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Navbar - Glassmorphism */}
      <header className="border-b border-white/5 bg-slate-950/40 backdrop-blur-xl sticky top-0 z-40 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 hover:scale-105 transition-transform duration-300 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-400 p-[1px] shadow-lg shadow-indigo-500/30">
              <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center font-bold text-lg text-white">
                R
              </div>
            </div>
            <h1 className="font-bold text-xl tracking-tight">RANKFORGE <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">AI</span></h1>
          </div>
          <div className="flex gap-6">
            <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Dashboard</button>
            <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Jobs</button>
            <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Audit Logs</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        
        {/* Header Section - 3D Hover & Glass */}
        <section className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden group">
          {/* Subtle background glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-emerald-500/0 group-hover:from-indigo-500/5 group-hover:to-emerald-500/5 transition-all duration-700 pointer-events-none rounded-2xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full shadow-inner">
                Active Job
              </span>
              <span className="text-slate-400 text-sm font-medium">Created 2 days ago</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-3 tracking-tight">Senior GRC Analyst</h2>
            <p className="text-slate-400 max-w-2xl leading-relaxed text-sm">
              SOC 2, ISO 27001, vendor risk, BFSI exposure, client communication, control testing, audit report writing, and stakeholder management.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 md:flex md:flex-row gap-3 min-w-[300px] relative z-10">
            <button 
              onClick={runAIRanking}
              disabled={isLoading}
              className="group flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:-translate-y-0.5"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} className="group-hover:scale-110 transition-transform" />}
              {isLoading ? "AI Processing..." : "Run Intelligence"}
            </button>
            <button 
              onClick={exportToPDF}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium rounded-xl transition-all hover:-translate-y-0.5 backdrop-blur-md"
            >
              <Download size={16} className="text-emerald-400" />
              Export
            </button>
            <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium rounded-xl transition-all hover:-translate-y-0.5 backdrop-blur-md">
              <Briefcase size={16} className="text-indigo-400" />
              Brief
            </button>
          </div>
        </section>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-950/40 backdrop-blur-md border border-red-500/30 rounded-xl text-red-300 shadow-lg shadow-red-900/20 animate-fade-in-up">
            <div className="flex items-center gap-2 font-medium"><AlertTriangle size={16} /> Analysis Failed</div>
            <div className="mt-1 text-sm opacity-90">{error}</div>
          </div>
        )}

        {/* Table Section - Glassmorphism & 3D */}
        <section className="bg-slate-900/30 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
          <div className="px-8 py-5 border-b border-white/10 bg-white/[0.02] flex justify-between items-center">
            <h3 className="font-bold text-xl flex items-center gap-3">
              AI-Ranked Pipeline
              {isLoading && <Loader2 size={18} className="animate-spin text-indigo-400" />}
            </h3>
            <span className="text-sm font-medium bg-white/5 px-3 py-1 rounded-full border border-white/10 text-slate-300">
              {candidates.length > 0 ? `${candidates.length} Profiles Analyzed` : "Awaiting Data"}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-black/20 text-slate-300 border-b border-white/10">
                <tr>
                  <th className="px-8 py-5 font-semibold">
                    <Tooltip content="The candidate's absolute ranking from 1 to N based on the AI's holistic analysis.">Rank</Tooltip>
                  </th>
                  <th className="px-8 py-5 font-semibold">
                    <Tooltip content="Candidate profile including name, current role, and total years of experience.">Candidate</Tooltip>
                  </th>
                  <th className="px-8 py-5 font-semibold">
                    <Tooltip content="Overall match percentage factoring in skills, experience, and trajectory vs the job description.">Overall Fit</Tooltip>
                  </th>
                  <th className="px-8 py-5 font-semibold">
                    <Tooltip content="Score based strictly on verifiable project outcomes and past achievements.">Evidence Score</Tooltip>
                  </th>
                  <th className="px-8 py-5 font-semibold">
                    <Tooltip content="AI prediction of flight risk, keyword stuffing (overfit), or culture mismatch. Lower is better.">Risk Score</Tooltip>
                  </th>
                  <th className="px-8 py-5 font-semibold">
                    <Tooltip content="The AI's recommended next step (e.g. Interview, Hold, Reject) and justification.">Action</Tooltip>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                
                {isLoading && Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse bg-white/[0.01]">
                    <td className="px-8 py-6"><div className="w-10 h-10 bg-white/10 rounded-full"></div></td>
                    <td className="px-8 py-6"><div className="w-40 h-5 bg-white/10 rounded-md mb-3"></div><div className="w-24 h-3 bg-white/5 rounded"></div></td>
                    <td className="px-8 py-6"><div className="w-28 h-2.5 bg-white/10 rounded-full"></div></td>
                    <td className="px-8 py-6"><div className="w-16 h-5 bg-white/10 rounded"></div></td>
                    <td className="px-8 py-6"><div className="w-16 h-5 bg-white/10 rounded"></div></td>
                    <td className="px-8 py-6"><div className="w-32 h-10 bg-white/10 rounded-xl"></div></td>
                  </tr>
                ))}

                {!isLoading && candidates.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="inline-flex flex-col items-center justify-center p-8 rounded-2xl bg-white/5 border border-white/10 border-dashed backdrop-blur-sm">
                        <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-400">
                          <AlertTriangle size={24} />
                        </div>
                        <p className="mb-3 text-slate-300 font-medium text-lg">Intelligence Engine Idle</p>
                        <button 
                          onClick={runAIRanking}
                          className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline decoration-2 underline-offset-4 transition-all"
                        >
                          Initialize AI Ranking Sequence
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {!isLoading && candidates.map((candidate, idx) => (
                  <tr key={idx} className="group hover:bg-white/[0.04] transition-all duration-300 cursor-default hover:shadow-[inset_4px_0_0_0_rgba(99,102,241,0.5)]">
                    <td className="px-8 py-5">
                      <span className={`flex items-center justify-center w-10 h-10 rounded-full font-extrabold text-base border transition-all duration-300 group-hover:scale-110 shadow-lg ${
                        idx === 0 ? 'bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 text-emerald-400 border-emerald-500/50 shadow-emerald-500/20' : 
                        idx === 1 ? 'bg-gradient-to-br from-indigo-400/20 to-indigo-600/20 text-indigo-400 border-indigo-500/50 shadow-indigo-500/20' : 
                        idx === 2 ? 'bg-gradient-to-br from-amber-400/20 to-amber-600/20 text-amber-400 border-amber-500/50 shadow-amber-500/20' : 
                        'bg-white/5 text-slate-300 border-white/10 shadow-black/20'
                      }`}>
                        {candidate.rank}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-bold text-white text-base mb-1">{candidate.candidateName}</p>
                      <p className="text-slate-400 text-xs font-medium bg-black/20 inline-block px-2 py-1 rounded border border-white/5">
                        {candidate.currentRole} • {candidate.totalExperienceYears} Yrs
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-lg ${candidate.overallFitScore >= 90 ? 'text-emerald-400' : candidate.overallFitScore >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                          {candidate.overallFitScore}%
                        </span>
                        <div className="w-24 h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                          <div 
                            className={`h-full relative overflow-hidden ${candidate.overallFitScore >= 90 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : candidate.overallFitScore >= 70 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-red-500 to-red-400'}`}
                            style={{ width: `${candidate.overallFitScore}%` }}
                          >
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                        {candidate.evidenceScore}%
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-semibold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                        {candidate.riskScore}%
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <Tooltip content={candidate.keyEvidence}>
                        <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl transition-all duration-300 text-white hover:shadow-lg hover:-translate-y-0.5">
                          <FileText size={14} className="text-indigo-400" />
                          View Proof
                        </button>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {candidates.length > 0 && (
            <div className="px-8 py-4 border-t border-white/10 bg-black/20 flex justify-between items-center">
              <p className="text-xs text-slate-400 font-medium">Processing completed via Gemini 2.5 Flash architecture.</p>
              <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">System Optimal</span>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
