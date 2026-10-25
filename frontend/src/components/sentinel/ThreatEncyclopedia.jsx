import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Bug, 
  ShieldCheck, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  AlertTriangle, 
  Layers, 
  Sparkles,
  RotateCcw,
  Check
} from 'lucide-react';

import ConceptBanner from '../ui/ConceptBanner';
import LearningOutcome from '../ui/LearningOutcome';
import { useToast } from '../ui/ToastContext';

export default function ThreatEncyclopedia({ demoTrigger, onNavigateNext }) {
  const [threats, setThreats] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Interactive Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const { success, warning, error, info } = useToast();

  useEffect(() => {
    setLoading(true);
    fetch('/api/threats/encyclopedia')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch threat database');
        return res.json();
      })
      .then(data => {
        setThreats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const quizQuestions = [
    {
      id: 'q1',
      question: 'What is the primary architectural difference between a computer virus and a worm?',
      options: [
        'Viruses require an existing host program and user trigger; worms self-replicate autonomously across networks without human intervention.',
        'Worms only infect emails while viruses only infect the Master Boot Record.',
        'Viruses are always polymorphic, whereas worms cannot alter their source code.',
        'Worms require root privileges, whereas viruses can run in unprivileged user space.'
      ],
      correctIndex: 0,
      explanation: 'A virus attaches itself to executable files or documents and needs host execution to propagate. A worm is an autonomous program that scans networks for vulnerabilities and spreads independently.'
    },
    {
      id: 'q2',
      question: 'Why are polymorphic and metamorphic viruses particularly challenging for traditional antivirus scanners?',
      options: [
        'They delete the hard drive before the antivirus starts scanning.',
        'They mutate their encryption routine, opcode sequence, and byte patterns with every infection, evading static signature matching.',
        'They disable the computer CPU instruction cache.',
        'They communicate with a C2 server via satellite link.'
      ],
      correctIndex: 1,
      explanation: 'Polymorphic viruses mutate their decryptor stub and encryption key, while metamorphic viruses rewrite their internal body code using instruction reordering and register substitution, breaking static byte-pattern signatures.'
    },
    {
      id: 'q3',
      question: 'How did the Stuxnet worm successfully jump the physical "air-gap" to infiltrate Iranian nuclear centrifuges?',
      options: [
        'Through an unencrypted public Wi-Fi network.',
        'Via infected USB flash drives utilizing LNK shortcut zero-day vulnerabilities (CVE-2010-2568).',
        'By brute-forcing remote SSH credentials over the public Internet.',
        'By impersonating a DNS root nameserver.'
      ],
      correctIndex: 1,
      explanation: 'Stuxnet weaponized USB flash drives using four 0-day exploits (including Windows shell shortcut handling) so that inserting a drive into an air-gapped engineering workstation executed the payload automatically.'
    }
  ];

  // Demo Mode Trigger
  useEffect(() => {
    if (demoTrigger > 0) {
      setFilterCategory('Worms');
      setSearchQuery('');
      setQuizAnswers({ q1: 0, q2: 1, q3: 1 });
      setQuizSubmitted(true);
      info('Demo Mode: Filtered threat database to autonomous worms & scored 100% on the mastery quiz!');
    }
  }, [demoTrigger]);

  const filteredThreats = threats.filter(t => {
    const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.mechanism.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.aliases && t.aliases.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    const correctCount = quizQuestions.filter(q => quizAnswers[q.id] === q.correctIndex).length;
    if (correctCount === quizQuestions.length) {
      success(`Mastery Confirmed: ${correctCount}/${quizQuestions.length} correct! Outstanding grasp of malware mechanisms.`);
    } else {
      warning(`Quiz Evaluated: ${correctCount}/${quizQuestions.length} correct. Review explanations below to strengthen concepts.`);
    }
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    info('Knowledge check quiz reset.');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Concept Header */}
      <ConceptBanner
        title="Malicious Software, Parasitic Viruses, Autonomous Worms & Defense-in-Depth"
        chapter="Stallings Chapter 21: Malicious Software & Chapter 22: Intrusion Detection"
        description="Malware taxonomy is classified by infection vector (parasitic host-file attachment vs autonomous network scanning), evasion mechanics (polymorphic decryptor generation and metamorphic instruction reordering), and payload consequence. Modern protection mandates defense-in-depth: combining cryptographic integrity verification, next-gen firewalls, endpoint behavior heuristics (EDR/AMSI), and real-time anomaly surveillance."
        badges={[
          'NIST SP 800-83',
          'Virus vs. Worm Taxonomy',
          'Polymorphic Mutation',
          'Metamorphic Rewriting',
          'Air-Gap Penetration',
          'MITRE ATT&CK Framework'
        ]}
      />

      {/* Search & Category Filter Toolbar */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          {['All', 'Viruses', 'Worms', 'Defenses'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                filterCategory === cat 
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search threats, mechanisms, CVEs..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Threat Encyclopedia Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 h-64 animate-pulse space-y-4">
              <div className="h-4 bg-slate-800 rounded w-1/3" />
              <div className="h-6 bg-slate-800 rounded w-3/4" />
              <div className="h-16 bg-slate-800/60 rounded" />
            </div>
          ))}
        </div>
      ) : filteredThreats.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
          <Bug className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-mono text-slate-300 font-bold">No threats matching criteria</h4>
          <p className="text-xs text-slate-500 font-mono mt-1">Try broadening your search term or select "All" categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredThreats.map((threat) => (
            <div
              key={threat.id}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-amber-500/50 p-6 shadow-xl flex flex-col justify-between transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-amber-500/5"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                    threat.category === 'Viruses' ? 'bg-red-950/80 text-red-400 border border-red-800/60' :
                    threat.category === 'Worms' ? 'bg-orange-950/80 text-orange-400 border border-orange-800/60' :
                    'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                  }`}>
                    {threat.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 truncate max-w-[140px]" title={threat.target}>
                    {threat.target}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white group-hover:text-amber-300 font-mono transition-colors">
                  {threat.title}
                </h4>

                {threat.aliases && (
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Aliases: {threat.aliases.join(', ')}
                  </div>
                )}

                <p className="text-xs text-slate-400 mt-3 line-clamp-3 leading-relaxed">
                  {threat.mechanism}
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-4 mt-4 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">
                  {threat.famous_examples ? `${threat.famous_examples.length} famous incidents` : 'Technical guide'}
                </span>
                <button
                  onClick={() => {
                    setSelectedArticle(threat);
                    info(`Inspecting dossier: ${threat.title}`);
                  }}
                  className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center space-x-1.5 cursor-pointer font-bold transition-colors"
                >
                  <span>Read Full Article</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Mastery Quiz Section */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                Interactive Knowledge Check: Malware Architecture & Countermeasures
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Verify theoretical comprehension of polymorphic mutation, self-replication, and perimeter bypasses.
              </p>
            </div>
          </div>
          {quizSubmitted && (
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Score: {quizQuestions.filter(q => quizAnswers[q.id] === q.correctIndex).length} / {quizQuestions.length}
            </span>
          )}
        </div>

        <div className="space-y-6">
          {quizQuestions.map((q, qIndex) => {
            const selectedOpt = quizAnswers[q.id];
            const isCorrect = selectedOpt === q.correctIndex;

            return (
              <div key={q.id} className="p-5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-3 text-xs font-mono">
                <span className="text-slate-200 font-bold block text-sm">
                  {qIndex + 1}. {q.question}
                </span>

                <div className="space-y-2">
                  {q.options.map((opt, optIndex) => {
                    let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700';
                    if (quizSubmitted) {
                      if (optIndex === q.correctIndex) {
                        btnStyle = 'bg-emerald-950/80 border-emerald-600 text-emerald-300 font-bold shadow-sm shadow-emerald-500/10';
                      } else if (selectedOpt === optIndex) {
                        btnStyle = 'bg-rose-950/80 border-rose-600 text-rose-300';
                      }
                    } else if (selectedOpt === optIndex) {
                      btnStyle = 'bg-indigo-950/90 border-indigo-500 text-white font-bold shadow-sm shadow-indigo-500/20';
                    }

                    return (
                      <button
                        key={optIndex}
                        onClick={() => {
                          if (!quizSubmitted) {
                            setQuizAnswers({ ...quizAnswers, [q.id]: optIndex });
                          }
                        }}
                        className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer flex items-start space-x-2.5 ${btnStyle}`}
                      >
                        <span className="font-bold mr-1 shrink-0 text-slate-400">{String.fromCharCode(65 + optIndex)}.</span>
                        <span className="leading-relaxed">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div className={`p-3 rounded-lg border text-[11px] leading-relaxed ${
                    isCorrect ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300' : 'bg-rose-950/30 border-rose-800 text-rose-300'
                  }`}>
                    <strong>{isCorrect ? '✓ Correct! ' : '✗ Incorrect. '}</strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-end space-x-3 pt-2">
            {quizSubmitted && (
              <button
                onClick={handleResetQuiz}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer flex items-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Quiz</span>
              </button>
            )}
            <button
              onClick={handleQuizSubmit}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center space-x-2 transition-all hover:scale-[1.02]"
            >
              <Check className="w-4 h-4" />
              <span>Submit Answers & Verify</span>
            </button>
          </div>
        </div>
      </div>

      {/* Article Deep Dive Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                  {selectedArticle.category}
                </span>
                <h3 className="text-base font-bold text-white font-mono">{selectedArticle.title}</h3>
              </div>
              <button onClick={() => setSelectedArticle(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer">✕</button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Infection Vector / Target:</span>
                <span className="text-cyan-300 text-sm font-semibold">{selectedArticle.target}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Mechanism of Action:</span>
                <p className="text-slate-300 mt-1 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  {selectedArticle.mechanism}
                </p>
              </div>

              {selectedArticle.subtypes && (
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1.5 tracking-wider">Subtypes & Variants:</span>
                  <div className="space-y-2">
                    {selectedArticle.subtypes.map((sub, i) => (
                      <div key={i} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                        <span className="text-amber-400 font-bold">{sub.name}: </span>
                        <span className="text-slate-300">{sub.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedArticle.famous_examples && (
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1.5 tracking-wider">Famous Real-World Incidents:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.famous_examples.map((ex, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-cyan-300 text-[11px] font-mono">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-emerald-400 block text-[10px] uppercase font-bold mb-1.5 tracking-wider">Recommended Countermeasures:</span>
                <ul className="space-y-1.5 text-slate-300">
                  {selectedArticle.countermeasures.map((c, i) => (
                    <li key={i} className="flex items-start space-x-2 bg-slate-950/60 p-2 rounded border border-slate-800/60">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold cursor-pointer transition-colors"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Learning Outcome */}
      <LearningOutcome
        title="Curricular Competencies: Malware Taxonomy & Mitigation Engineering"
        outcomes={[
          'Differentiate structural and behavioral characteristics of viruses (parasitic host-dependent execution) and worms (autonomous replication over network protocols).',
          'Analyze evasion techniques including polymorphic decryptor mutation and metamorphic code restructuring designed to defeat static byte signature scanners.',
          'Evaluate multi-layered defensive architectures combining cryptographic code signing, application whitelisting, network isolation, and behavioral heuristic monitoring.'
        ]}
        nextModule="Suite Overview Dashboard"
        onNavigateNext={onNavigateNext}
      />
    </div>
  );
}
