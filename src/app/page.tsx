"use client";

import React, { useState } from 'react';
import { Download, FileText, AlertTriangle, Briefcase, Eye, Loader2, Play, Info } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    <div className="min-h-screen bg-mesh-light text-slate-800 font-sans selection:bg-indigo-500/20">
      {/* Navbar - Light Glassmorphism */}
      <header className="border-b border-white/60 bg-white/40 backdrop-blur-2xl sticky top-0 z-40 shadow-sm shadow-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 hover:scale-105 transition-transform duration-300 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-400 p-[2px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-white rounded-xl flex items-center justify-center font-bold text-lg text-slate-800">
                R
              </div>
            </div>
            <h1 className="font-extrabold text-xl tracking-tight text-slate-900">RANKFORGE <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-indigo-500">AI</span></h1>
          </div>
          <div className="flex gap-6">
            <button className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Dashboard</button>
            <button className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Jobs</button>
            <button className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Audit Logs</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        
        {/* Header Section - 3D Hover & Light Glass */}
        <section className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 backdrop-blur-2xl border border-white/80 rounded-3xl p-8 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden group">
          {/* Subtle background glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-emerald-500/0 group-hover:from-indigo-500/5 group-hover:to-emerald-500/5 transition-all duration-700 pointer-events-none rounded-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-full shadow-sm">
                Active Job
              </span>
              <span className="text-slate-500 text-sm font-medium">Created 2 days ago</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-3 tracking-tight text-slate-900 drop-shadow-sm">Senior GRC Analyst</h2>
            <p className="text-slate-600 max-w-2xl leading-relaxed text-sm font-medium">
              SOC 2, ISO 27001, vendor risk, BFSI exposure, client communication, control testing, audit report writing, and stakeholder management.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 md:flex md:flex-row gap-4 min-w-[300px] relative z-10">
            <button 
              onClick={runAIRanking}
              disabled={isLoading}
              className="group flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-[0_8px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_30px_rgba(99,102,241,0.5)] hover:-translate-y-1"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} className="group-hover:scale-110 transition-transform" />}
              {isLoading ? "AI Processing..." : "Run Intelligence"}
            </button>
            <button 
              onClick={exportToPDF}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/80 hover:bg-white border border-slate-200/60 hover:border-slate-300 text-slate-700 font-semibold rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 backdrop-blur-xl"
            >
              <Download size={16} className="text-emerald-500" />
              Export
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white/80 hover:bg-white border border-slate-200/60 hover:border-slate-300 text-slate-700 font-semibold rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 backdrop-blur-xl">
              <Briefcase size={16} className="text-indigo-500" />
              Brief
            </button>
          </div>
        </section>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50/80 backdrop-blur-md border border-red-200 rounded-2xl text-red-700 shadow-xl shadow-red-100/50 animate-fade-in-up">
            <div className="flex items-center gap-2 font-bold"><AlertTriangle size={18} /> Analysis Failed</div>
            <div className="mt-1 text-sm font-medium">{error}</div>
          </div>
        )}

        {/* Table Section - Light Glassmorphism & 3D */}
        <section className="bg-white/50 backdrop-blur-3xl border border-white/80 rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)] animate-float relative">
          
          <div className="px-8 py-6 border-b border-white/60 bg-white/40 flex justify-between items-center">
            <h3 className="font-extrabold text-2xl flex items-center gap-3 text-slate-900">
              AI-Ranked Pipeline
              {isLoading && <Loader2 size={20} className="animate-spin text-indigo-500" />}
            </h3>
            <span className="text-sm font-bold bg-white/80 px-4 py-1.5 rounded-full border border-slate-200 text-slate-600 shadow-sm">
              {candidates.length > 0 ? `${candidates.length} Profiles Analyzed` : "Awaiting Data"}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 text-slate-600 border-b border-slate-200/60">
                <tr>
                  <th className="px-8 py-5 font-bold uppercase tracking-wider text-xs cursor-help" title="The candidate's absolute ranking from 1 to N based on the AI's holistic analysis.">
                    <div className="flex items-center gap-1.5">Rank <Info size={14} className="text-slate-400" /></div>
                  </th>
                  <th className="px-8 py-5 font-bold uppercase tracking-wider text-xs cursor-help" title="Candidate profile including name, current role, and total years of experience.">
                    <div className="flex items-center gap-1.5">Candidate <Info size={14} className="text-slate-400" /></div>
                  </th>
                  <th className="px-8 py-5 font-bold uppercase tracking-wider text-xs cursor-help" title="Overall match percentage factoring in skills, experience, and trajectory vs the job description.">
                    <div className="flex items-center gap-1.5">Overall Fit <Info size={14} className="text-slate-400" /></div>
                  </th>
                  <th className="px-8 py-5 font-bold uppercase tracking-wider text-xs cursor-help" title="Score based strictly on verifiable project outcomes and past achievements.">
                    <div className="flex items-center gap-1.5">Evidence Score <Info size={14} className="text-slate-400" /></div>
                  </th>
                  <th className="px-8 py-5 font-bold uppercase tracking-wider text-xs cursor-help" title="AI prediction of flight risk, keyword stuffing (overfit), or culture mismatch. Lower is better.">
                    <div className="flex items-center gap-1.5">Risk Score <Info size={14} className="text-slate-400" /></div>
                  </th>
                  <th className="px-8 py-5 font-bold uppercase tracking-wider text-xs cursor-help" title="The AI's recommended next step (e.g. Interview, Hold, Reject) and justification.">
                    <div className="flex items-center gap-1.5">Action <Info size={14} className="text-slate-400" /></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                
                {isLoading && Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse bg-white/30">
                    {/* Highly visible skeleton loader for light mode */}
                    <td className="px-8 py-6"><div className="w-10 h-10 bg-slate-200 rounded-full shadow-inner"></div></td>
                    <td className="px-8 py-6"><div className="w-40 h-5 bg-slate-200 rounded-md mb-3"></div><div className="w-24 h-3 bg-slate-100 rounded"></div></td>
                    <td className="px-8 py-6"><div className="w-28 h-3 bg-slate-200 rounded-full shadow-inner"></div></td>
                    <td className="px-8 py-6"><div className="w-16 h-6 bg-slate-200 rounded-md"></div></td>
                    <td className="px-8 py-6"><div className="w-16 h-6 bg-slate-200 rounded-md"></div></td>
                    <td className="px-8 py-6"><div className="w-32 h-10 bg-slate-200 rounded-xl"></div></td>
                  </tr>
                ))}

                {!isLoading && candidates.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-24 text-center">
                      <div className="inline-flex flex-col items-center justify-center p-10 rounded-3xl bg-white/60 border-2 border-dashed border-slate-300 backdrop-blur-md shadow-sm transition-transform hover:scale-105 duration-300">
                        <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5 text-indigo-500 shadow-inner">
                          <AlertTriangle size={32} />
                        </div>
                        <p className="mb-3 text-slate-700 font-bold text-xl">Intelligence Engine Idle</p>
                        <button 
                          onClick={runAIRanking}
                          className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline decoration-2 underline-offset-4 transition-all"
                        >
                          Initialize AI Ranking Sequence
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {!isLoading && candidates.map((candidate, idx) => (
                  <tr key={idx} className="group hover:bg-white/80 transition-all duration-300 cursor-default hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative z-0 hover:z-10 bg-white/20">
                    <td className="px-8 py-5">
                      <span className={`flex items-center justify-center w-10 h-10 rounded-full font-extrabold text-base border-2 transition-all duration-300 group-hover:scale-110 shadow-md ${
                        idx === 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-emerald-100' : 
                        idx === 1 ? 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-indigo-100' : 
                        idx === 2 ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-amber-100' : 
                        'bg-white text-slate-500 border-slate-200 shadow-sm'
                      }`}>
                        {candidate.rank}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-extrabold text-slate-900 text-base mb-1">{candidate.candidateName}</p>
                      <p className="text-slate-500 text-xs font-bold bg-slate-100 inline-block px-2.5 py-1 rounded-md border border-slate-200/60 shadow-inner">
                        {candidate.currentRole} • {candidate.totalExperienceYears} Yrs
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <span className={`font-extrabold text-lg ${candidate.overallFitScore >= 90 ? 'text-emerald-600' : candidate.overallFitScore >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                          {candidate.overallFitScore}%
                        </span>
                        <div className="w-24 h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300/50 shadow-inner">
                          <div 
                            className={`h-full relative overflow-hidden shadow-sm ${candidate.overallFitScore >= 90 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : candidate.overallFitScore >= 70 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}
                            style={{ width: `${candidate.overallFitScore}%` }}
                          >
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)] -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-sm">
                        {candidate.evidenceScore}%
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-bold text-rose-700 bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 shadow-sm">
                        {candidate.riskScore}%
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <button 
                        title={candidate.keyEvidence}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md px-5 py-2.5 rounded-xl transition-all duration-300 text-slate-700 hover:-translate-y-1 cursor-help"
                      >
                        <FileText size={16} className="text-indigo-500" />
                        View Proof
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {candidates.length > 0 && (
            <div className="px-8 py-4 border-t border-white/60 bg-white/40 flex justify-between items-center backdrop-blur-md">
              <p className="text-xs text-slate-500 font-bold">Processing completed via Gemini 2.5 Pro architecture.</p>
              <div className="flex gap-2 items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                <span className="text-[10px] uppercase font-extrabold text-emerald-600 tracking-wider">System Optimal</span>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
