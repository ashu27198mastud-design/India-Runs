import React from 'react';
import { Download, FileText, CheckCircle, AlertTriangle, Briefcase, Eye } from 'lucide-react';

// A mock dashboard UI that fulfills the prompt requirements for UI export buttons and a premium dark theme.
export default function Home() {
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
          
          {/* Required Export Buttons */}
          <div className="grid grid-cols-2 gap-3 min-w-[300px]">
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-500/20">
              <Download size={16} />
              Export PDF
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium rounded-lg transition-colors">
              <Briefcase size={16} />
              Hiring Brief
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium rounded-lg transition-colors">
              <Eye size={16} />
              Compare
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium rounded-lg transition-colors">
              <FileText size={16} />
              Audit Log
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

        {/* Mock Candidates Table */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h3 className="font-semibold text-lg">AI-Ranked Candidates</h3>
            <span className="text-sm text-slate-400">10 Candidates Scored</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-800/50 text-slate-300">
                <tr>
                  <th className="px-6 py-4 font-medium">Rank</th>
                  <th className="px-6 py-4 font-medium">Candidate</th>
                  <th className="px-6 py-4 font-medium">Overall Fit</th>
                  <th className="px-6 py-4 font-medium">Evidence</th>
                  <th className="px-6 py-4 font-medium">Risk</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {/* Dummy Row 1 */}
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      1
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white">Alex Mercer</p>
                    <p className="text-slate-400 text-xs">Lead GRC Consultant • 8 Yrs</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full w-[95%]"></div>
                      </div>
                      <span className="font-medium text-emerald-400">95%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-emerald-400">High</td>
                  <td className="px-6 py-4 text-emerald-400">Low</td>
                  <td className="px-6 py-4">
                    <button className="text-xs font-medium bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded transition-colors text-white">
                      Review Evidence
                    </button>
                  </td>
                </tr>
                {/* Dummy Row 2 */}
                <tr className="hover:bg-slate-800/20 transition-colors bg-indigo-950/10">
                  <td className="px-6 py-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">
                      2
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white">Jamie Lin</p>
                      <span className="text-[10px] uppercase font-bold bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30">Hidden Gem</span>
                    </div>
                    <p className="text-slate-400 text-xs">InfoSec Analyst • 4 Yrs</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="bg-indigo-400 h-full w-[88%]"></div>
                      </div>
                      <span className="font-medium text-indigo-400">88%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-emerald-400">Med</td>
                  <td className="px-6 py-4 text-emerald-400">Low</td>
                  <td className="px-6 py-4">
                    <button className="text-xs font-medium bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded transition-colors text-white">
                      Review Evidence
                    </button>
                  </td>
                </tr>
                {/* Dummy Row 3 */}
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
                      3
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white">Taylor Swift</p>
                    <p className="text-slate-400 text-xs">Cyber Risk Mgr • 9 Yrs</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full w-[85%]"></div>
                      </div>
                      <span className="font-medium text-amber-400">85%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-rose-400">Low</td>
                  <td className="px-6 py-4 text-rose-400">High (Overfit)</td>
                  <td className="px-6 py-4">
                    <button className="text-xs font-medium bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded transition-colors text-white">
                      Review Evidence
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 text-center">
            <p className="text-xs text-slate-500">Showing top 3 of 10 candidates. Export full list to PDF for detailed metrics.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
