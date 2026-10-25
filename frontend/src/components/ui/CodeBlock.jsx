import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode } from 'lucide-react';

export default function CodeBlock({
  code,
  language = 'text',
  title = null,
  maxHeight = 'max-h-72',
  copyable = true,
  highlightLines = []
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(typeof code === 'string' ? code : JSON.stringify(code, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeString = typeof code === 'string' ? code : JSON.stringify(code, null, 2);

  return (
    <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#070b14] shadow-inner font-mono text-xs">
      {title && (
        <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950 border-b border-slate-800/80 text-slate-400">
          <div className="flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-semibold text-slate-300">{title}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{language}</span>
            {copyable && (
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {!title && copyable && (
        <div className="relative">
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer z-10"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      <pre className={`p-3.5 overflow-x-auto text-slate-300 leading-relaxed ${maxHeight} select-all`}>
        <code>{codeString}</code>
      </pre>
    </div>
  );
}
