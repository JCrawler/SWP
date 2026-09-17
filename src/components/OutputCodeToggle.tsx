import React from 'react';
import { Eye, Code2 } from 'lucide-react';

interface OutputCodeToggleProps {
  activeView: 'output' | 'code';
  onChange: (view: 'output' | 'code') => void;
}

export const OutputCodeToggle: React.FC<OutputCodeToggleProps> = ({
  activeView,
  onChange,
}) => {
  return (
    <div className="inline-flex p-1 bg-[#eeeafd] rounded-xl border border-[#e3e0f5]">
      <button
        id="toggle-code-view-btn"
        type="button"
        onClick={() => onChange('code')}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          activeView === 'code'
            ? 'bg-white text-[#3e29bd] shadow-sm'
            : 'text-[#6b6580] hover:text-[#1e1b2e]'
        }`}
      >
        <Code2 className="w-4 h-4" />
        <span>Code</span>
      </button>

      <button
        id="toggle-output-view-btn"
        type="button"
        onClick={() => onChange('output')}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          activeView === 'output'
            ? 'bg-white text-[#3e29bd] shadow-sm'
            : 'text-[#6b6580] hover:text-[#1e1b2e]'
        }`}
      >
        <Eye className="w-4 h-4" />
        <span>Output</span>
      </button>
    </div>
  );
};
