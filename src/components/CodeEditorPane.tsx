import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { Code, FileCode, Copy, Check } from 'lucide-react';

interface CodeEditorPaneProps {
  htmlCode: string;
  cssCode: string;
  onHtmlChange: (val: string) => void;
  onCssChange: (val: string) => void;
}

export const CodeEditorPane: React.FC<CodeEditorPaneProps> = ({
  htmlCode,
  cssCode,
  onHtmlChange,
  onCssChange,
}) => {
  const [activeTab, setActiveTab] = useState<'both' | 'html' | 'css'>('both');
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedCss, setCopiedCss] = useState(false);

  const handleCopy = (text: string, type: 'html' | 'css') => {
    navigator.clipboard.writeText(text);
    if (type === 'html') {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 1500);
    } else {
      setCopiedCss(true);
      setTimeout(() => setCopiedCss(false), 1500);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e24] text-white rounded-2xl overflow-hidden border border-[#2d2d38] shadow-sm">
      {/* Pane Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#17171c] border-b border-[#2d2d38]">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('both')}
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'both'
                ? 'bg-[#3e29bd] text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Split (HTML &amp; CSS)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('html')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'html'
                ? 'bg-[#e34f26] text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>HTML</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('css')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'css'
                ? 'bg-[#1572b6] text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>CSS</span>
          </button>
        </div>

        <div className="text-[11px] text-zinc-400 font-mono hidden sm:block">
          Auto-evaluates live
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* HTML Section */}
        {(activeTab === 'both' || activeTab === 'html') && (
          <div
            className={`flex flex-col overflow-hidden ${
              activeTab === 'both'
                ? 'flex-1 border-b md:border-b-0 md:border-r border-[#2d2d38]'
                : 'flex-1'
            }`}
          >
            <div className="flex items-center justify-between px-4 py-1.5 bg-[#1a1a20] text-zinc-300 text-xs font-mono border-b border-[#2d2d38]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#e34f26]"></span>
                <span className="font-semibold text-zinc-200">HTML</span>
                <span className="text-[10px] text-zinc-500 font-sans">(Structure)</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(htmlCode, 'html')}
                className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded hover:bg-zinc-800 transition-colors"
                title="Copy HTML"
              >
                {copiedHtml ? (
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
            <div className="flex-1 overflow-auto bg-[#1e1e24]">
              <CodeMirror
                value={htmlCode}
                height="100%"
                theme="dark"
                extensions={[html()]}
                onChange={onHtmlChange}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  highlightSpecialChars: true,
                  foldGutter: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  highlightActiveLine: true,
                  tabSize: 2,
                }}
              />
            </div>
          </div>
        )}

        {/* CSS Section */}
        {(activeTab === 'both' || activeTab === 'css') && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-1.5 bg-[#1a1a20] text-zinc-300 text-xs font-mono border-b border-[#2d2d38]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1572b6]"></span>
                <span className="font-semibold text-zinc-200">CSS</span>
                <span className="text-[10px] text-zinc-500 font-sans">(Styles)</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(cssCode, 'css')}
                className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded hover:bg-zinc-800 transition-colors"
                title="Copy CSS"
              >
                {copiedCss ? (
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
            <div className="flex-1 overflow-auto bg-[#1e1e24]">
              <CodeMirror
                value={cssCode}
                height="100%"
                theme="dark"
                extensions={[css()]}
                onChange={onCssChange}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  highlightSpecialChars: true,
                  foldGutter: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  highlightActiveLine: true,
                  tabSize: 2,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
