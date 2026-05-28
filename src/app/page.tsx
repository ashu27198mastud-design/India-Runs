"use client";

import React, { useState } from 'react';
import { Download, FileText, AlertTriangle, Briefcase, Eye, Loader2, Play } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center font-bold text-lg">
              R
            </div>
            <h1 className="font-bold text-xl tracking-tight">RANKFORGE <span className="text-emerald-400">AI</span></h1>
          </div>
          <div className="flex gap-4">
            <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Dashboard</button>
            <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Jobs</button>
            <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Audit Logs</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                Active Job
              </span>
              <span className="text-slate-400 text-sm">Created 2 days ago</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Senior GRC Analyst</h2>
            <p className="text-slate-400 max-w-2xl">
              SOC 2, ISO 27001, vendor risk, BFSI exposure, client communication, control testing, audit report writing, and stakeholder management.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 md:flex md:flex-row gap-3 min-w-[300px]">
            <button 
              onClick={runAIRanking}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all shadow-lg shadow-indigo-500/20"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              {isLoading ? "AI is Thinking..." : "Run AI Ranking"}
            </button>
            <button 
              onClick={exportToPDF}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
            >
              <Download size={16} />
              Export PDF
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium rounded-lg transition-colors">
              <Briefcase size={16} />
              Brief
            </button>
          </div>
        </section>

        {/* AI Disclaimer */}
        <div className="flex items-start gap-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg p-4 text-indigo-200 text-sm">
          <AlertTriangle size={20} className="shrink-0 text-indigo-400" />
          <p>
            <strong>Responsible AI Notice:</strong> This ranked output is generated for decision-support purposes only. 
            Final hiring decisions must be made by authorized human reviewers. The ranking excludes protected attributes 
            and is based only on job-relevant synthetic candidate data.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-950/30 border border-red-500/50 rounded-lg text-red-400">
            Error: {error}
          </div>
        )}

        {/* Mock Candidates Table */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              AI-Ranked Candidates
              {isLoading && <Loader2 size={16} className="animate-spin text-emerald-400" />}
            </h3>
            <span className="text-sm text-slate-400">
              {candidates.length > 0 ? `${candidates.length} Candidates Scored` : "Awaiting AI Execution"}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-800/50 text-slate-300">
                <tr>
                  <th className="px-6 py-4 font-medium">Rank</th>
                  <th className="px-6 py-4 font-medium">Candidate</th>
                  <th className="px-6 py-4 font-medium">Overall Fit</th>
                  <th className="px-6 py-4 font-medium">Evidence Score</th>
                  <th className="px-6 py-4 font-medium">Risk Score</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                
                {isLoading && Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="w-8 h-8 bg-slate-800 rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="w-32 h-4 bg-slate-800 rounded mb-2"></div><div className="w-24 h-3 bg-slate-800 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-24 h-2 bg-slate-800 rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="w-12 h-4 bg-slate-800 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-12 h-4 bg-slate-800 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-24 h-8 bg-slate-800 rounded"></div></td>
                  </tr>
                ))}

                {!isLoading && candidates.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <p className="mb-2">No candidates ranked yet.</p>
                      <button 
                        onClick={runAIRanking}
                        className="text-indigo-400 hover:text-indigo-300 underline font-medium"
                      >
                        Click here to run the intelligence engine
                      </button>
                    </td>
                  </tr>
                )}

                {!isLoading && candidates.map((candidate, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold border ${
                        idx === 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                        idx === 1 ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {candidate.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{candidate.candidateName}</p>
                      <p className="text-slate-400 text-xs">{candidate.currentRole} • {candidate.totalExperienceYears} Yrs</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${candidate.overallFitScore >= 90 ? 'bg-emerald-400' : candidate.overallFitScore >= 70 ? 'bg-amber-400' : 'bg-red-400'}`}
                            style={{ width: `${candidate.overallFitScore}%` }}
                          ></div>
                        </div>
                        <span className={`font-medium ${candidate.overallFitScore >= 90 ? 'text-emerald-400' : candidate.overallFitScore >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                          {candidate.overallFitScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-emerald-400">{candidate.evidenceScore}%</td>
                    <td className="px-6 py-4 text-rose-400">{candidate.riskScore}%</td>
                    <td className="px-6 py-4">
                      <button 
                        className="text-xs font-medium bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded transition-colors text-white"
                        title={candidate.keyEvidence}
                      >
                        Review Evidence
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {candidates.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 text-center">
              <p className="text-xs text-slate-500">Showing all {candidates.length} processed candidates. Review generated PDF for deep insights.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
