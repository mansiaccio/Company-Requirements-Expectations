
import React, { useState, useRef } from 'react';
import { analyzeInterviewContext } from './services/geminiService';
import { FullAnalysisResponse, InterviewInputs } from './types';
import { AnalysisCard } from './components/AnalysisCard';

// Icons
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const ClipboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;

declare const html2pdf: any;

const App: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [inputs, setInputs] = useState<InterviewInputs>({
    companyName: '',
    websiteUrl: '',
    linkedinUrl: '',
    jobDescription: '',
    techRoundsInfo: '',
    additionalContext: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [report, setReport] = useState<FullAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setReport(null);
    try {
      const result = await analyzeInterviewContext(inputs);
      setReport(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the report.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    
    setIsPdfGenerating(true);
    const element = reportRef.current;
    const opt = {
      margin: 10,
      filename: `Interview_Intel_${inputs.companyName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. You can still try using Ctrl+P to print to PDF.');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!report) return;

    const text = `
INTERVIEW INTELLIGENCE REPORT: ${inputs.companyName}

COMPANY INTELLIGENCE
- One-liner: ${report.intelligence.oneLiner}
- Scale: ${report.intelligence.scale}
- Presence: ${report.intelligence.indiaPresence}
- Industry: ${report.intelligence.industry}
- Orientation: ${report.intelligence.orientation}

JD REALITY CHECK
- Core Tools (Actually Used): ${report.jdBreakdown.toolsActuallyUsed.join(', ')}
- Listed but Fluff: ${report.jdBreakdown.toolsListedButLessUsed.join(', ')}
- Fresher Expectations: ${report.jdBreakdown.fresherExpectations.join('; ')}
- 90-Day Outcomes: ${report.jdBreakdown.first90DayOutcomes.join('; ')}

REJECTION ANALYZER (Brutal Honesty)
"${report.rejectionAnalyzer.brutalHonesty}"

GAPS:
- Tool Gaps: ${report.rejectionAnalyzer.toolLevelGaps.join('; ')}
- Thinking Gaps: ${report.rejectionAnalyzer.thinkingGaps.join('; ')}
- Communication Gaps: ${report.rejectionAnalyzer.communicationGaps.join('; ')}
- Resume Gaps: ${report.rejectionAnalyzer.resumeMismatch.join('; ')}
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-indigo-700 text-white py-12 px-4 shadow-lg mb-10 no-print">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight">Interview Intelligence Dashboard</h1>
          <p className="text-indigo-100 text-lg">Extract company secrets, decode JDs, and find why you might fail before you even walk in.</p>
        </div>
      </header>

      {/* Print-only Header (Used by window.print or layout logic) */}
      <div className="hidden print-only py-8 px-4 border-b-2 border-slate-200 mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Interview Intelligence Report: {inputs.companyName}</h1>
        <p className="text-slate-500 text-sm">Generated by Interview Intel Dashboard</p>
      </div>

      <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Input Form Section */}
        <section className="lg:col-span-4 no-print">
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 sticky top-10">
            <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              <ClipboardIcon /> Input Intelligence
            </h2>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Company Name</label>
                <input required name="companyName" value={inputs.companyName} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Acme Corp" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Website URL</label>
                <input name="websiteUrl" value={inputs.websiteUrl} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">LinkedIn URL</label>
                <input name="linkedinUrl" value={inputs.linkedinUrl} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://linkedin.com/company/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Job Description</label>
                <textarea required name="jobDescription" value={inputs.jobDescription} onChange={handleInputChange} rows={6} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="Paste the full JD text here..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Technical Rounds Info</label>
                <textarea name="techRoundsInfo" value={inputs.techRoundsInfo} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="e.g. 1 DSA, 1 System Design, 1 HR..." />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Extracting...
                  </>
                ) : 'Run Intelligence Extract'}
              </button>
            </form>
            {error && <p className="mt-4 text-red-600 text-sm font-medium">{error}</p>}
          </div>
        </section>

        {/* Report Section */}
        <section className="lg:col-span-8">
          {!report && !isLoading && (
            <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl h-96 flex flex-col items-center justify-center text-slate-400 p-10 text-center no-print">
              <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
              <p className="text-xl font-medium">Ready to analyze.</p>
              <p className="max-w-xs mt-2">Enter the company details and JD to generate your custom interview strategy report.</p>
            </div>
          )}

          {isLoading && (
            <div className="space-y-6 animate-pulse no-print">
              <div className="h-64 bg-slate-200 rounded-xl"></div>
              <div className="h-96 bg-slate-200 rounded-xl"></div>
              <div className="h-48 bg-slate-200 rounded-xl"></div>
            </div>
          )}

          {report && (
            <div className="space-y-8">
              {/* Action Toolbar */}
              <div className="flex justify-end gap-3 no-print">
                <button 
                  onClick={handleCopyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm"
                >
                  {isCopied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy Results</>}
                </button>
                <button 
                  onClick={handleDownloadPdf}
                  disabled={isPdfGenerating}
                  className={`flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors shadow-sm text-sm ${isPdfGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isPdfGenerating ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Generating...
                    </>
                  ) : (
                    <><DownloadIcon /> Download PDF</>
                  )}
                </button>
              </div>

              {/* Wrapper for PDF generation */}
              <div ref={reportRef} className="space-y-8 p-1 bg-white md:bg-transparent rounded-lg">
                {/* PDF Header (Only visible in PDF/Print) */}
                <div className="hidden print-only py-8 px-6 bg-indigo-700 text-white rounded-xl mb-10">
                  <h1 className="text-3xl font-bold">Interview Intel Report</h1>
                  <p className="text-indigo-100 mt-2">Company: {inputs.companyName}</p>
                  <p className="text-indigo-200 text-xs mt-1">Generated: {new Date().toLocaleDateString()}</p>
                </div>

                {/* Company Intelligence */}
                <AnalysisCard title="Company Intelligence" icon={<BuildingIcon />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                      <h4 className="text-lg font-bold text-slate-800">{report.intelligence.oneLiner}</h4>
                      <p className="text-slate-600 mt-2 leading-relaxed">{report.intelligence.expandedDescription}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Scale & Presence</span>
                      <p className="font-semibold text-slate-700">{report.intelligence.scale} • {report.intelligence.indiaPresence}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Industry</span>
                      <p className="font-semibold text-slate-700">{report.intelligence.industry} ({report.intelligence.productCategory})</p>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <span className="text-xs font-bold text-slate-400 uppercase block mb-2">Target Customers & Use Cases</span>
                      <div className="flex flex-wrap gap-2">
                        {report.intelligence.customersUseCases.map((item, i) => (
                          <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">{item}</span>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-1 md:col-span-2 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                      <span className="text-xs font-bold text-blue-400 uppercase block mb-1">Company Orientation</span>
                      <p className="font-bold text-blue-800">{report.intelligence.orientation}</p>
                    </div>
                  </div>
                </AnalysisCard>

                {/* JD Breakdown */}
                <AnalysisCard title="JD Reality Check" icon={<ClipboardIcon />}>
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" /> Reality: Tools Actually Used
                        </h4>
                        <ul className="space-y-2">
                          {report.jdBreakdown.toolsActuallyUsed.map((tool, i) => (
                            <li key={i} className="text-slate-700 text-sm flex items-center gap-2">
                              <span className="text-green-600 font-bold">✓</span> {tool}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-slate-300" /> Fluff: Listed but less used
                        </h4>
                        <ul className="space-y-2">
                          {report.jdBreakdown.toolsListedButLessUsed.map((tool, i) => (
                            <li key={i} className="text-slate-500 text-sm flex items-center gap-2 italic">
                              <span className="text-slate-300">○</span> {tool}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <hr className="border-slate-100" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Fresher Expectations</h4>
                        <ul className="list-disc list-inside space-y-2 text-slate-700 text-sm">
                          {report.jdBreakdown.fresherExpectations.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">First 90-Day Outcomes</h4>
                        <ul className="list-disc list-inside space-y-2 text-slate-700 text-sm">
                          {report.jdBreakdown.first90DayOutcomes.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-lg">
                      <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">Approximate Day-to-Day Split</h4>
                      <div className="w-full bg-slate-200 rounded-full h-8 overflow-hidden flex">
                        {report.jdBreakdown.dayToDaySplit.map((split, i) => {
                          const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500'];
                          return (
                            <div 
                              key={i} 
                              style={{ width: `${split.percentage}%` }} 
                              className={`${colors[i % colors.length]} h-full transition-all flex items-center justify-center text-[10px] text-white font-bold truncate px-1`}
                              title={`${split.activity}: ${split.percentage}%`}
                            >
                              {split.percentage > 5 ? `${split.percentage}%` : ''}
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                        {report.jdBreakdown.dayToDaySplit.map((split, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                            <div className={`w-3 h-3 rounded-sm ${['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500'][i % 5]}`} />
                            <span className="font-semibold">{split.percentage}%</span> {split.activity}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </AnalysisCard>

                {/* Rejection Analyzer */}
                <div className="bg-rose-50 border border-rose-200 rounded-xl shadow-md overflow-hidden break-inside-avoid">
                  <div className="bg-rose-600 px-6 py-4 text-white flex items-center gap-3">
                    <AlertIcon />
                    <h3 className="font-bold uppercase tracking-wider text-sm">REJECTION REASON ANALYZER</h3>
                  </div>
                  <div className="p-8">
                    <div className="mb-8 p-6 bg-white border border-rose-100 rounded-lg shadow-inner italic text-rose-900 font-medium text-lg leading-relaxed">
                      "{report.rejectionAnalyzer.brutalHonesty}"
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-sm font-bold text-rose-800 uppercase mb-4">Tool-Level Gaps</h4>
                        <ul className="space-y-3">
                          {report.rejectionAnalyzer.toolLevelGaps.map((item, i) => (
                            <li key={i} className="flex gap-3 text-slate-700 text-sm">
                              <span className="text-rose-500 shrink-0 font-bold">✕</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-rose-800 uppercase mb-4">Thinking Gaps</h4>
                        <ul className="space-y-3">
                          {report.rejectionAnalyzer.thinkingGaps.map((item, i) => (
                            <li key={i} className="flex gap-3 text-slate-700 text-sm">
                              <span className="text-rose-500 shrink-0 font-bold">✕</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-rose-800 uppercase mb-4">Communication Gaps</h4>
                        <ul className="space-y-3">
                          {report.rejectionAnalyzer.communicationGaps.map((item, i) => (
                            <li key={i} className="flex gap-3 text-slate-700 text-sm">
                              <span className="text-rose-500 shrink-0 font-bold">✕</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-rose-800 uppercase mb-4">Resume Mismatch</h4>
                        <ul className="space-y-3">
                          {report.rejectionAnalyzer.resumeMismatch.map((item, i) => (
                            <li key={i} className="flex gap-3 text-slate-700 text-sm">
                              <span className="text-rose-500 shrink-0 font-bold">✕</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="text-center py-10 text-slate-400 text-sm border-t border-slate-200 mt-20 no-print">
        <p>&copy; {new Date().getFullYear()} Interview Intelligence Dashboard • Built for Freshers with Gemini 3 Pro</p>
      </footer>
    </div>
  );
};

export default App;
