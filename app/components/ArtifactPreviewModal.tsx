'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Play } from 'lucide-react';
import CodePreview from './CodePreview';

interface ArtifactPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode: string;
  title?: string;
}

export function ArtifactPreviewModal({ isOpen, onClose, initialCode, title = 'Component' }: ArtifactPreviewModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [code, setCode] = useState(initialCode);

  useEffect(() => {
    if (isOpen) {
      setCode(initialCode);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialCode]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-y-0 right-0 left-0 md:left-64 z-[100] flex bg-black/20 backdrop-blur-sm animate-fade-in">
      <div className="w-full h-full bg-gray-50 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden animate-slide-in-right">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Play className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{title}</h2>
              <div className="text-xs text-gray-500">Live Preview & Editor</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Editor */}
          <div className="w-full lg:w-1/3 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200 min-h-[40vh] lg:min-h-0 shrink-0">
            <div className="bg-gray-100 px-4 py-2 border-b text-xs font-medium text-gray-500 uppercase tracking-wider flex justify-between items-center">
              <span>Code Editor</span>
              <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded text-gray-600">Editable</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full p-4 font-mono text-sm bg-[#1e1e1e] text-[#d4d4d4] resize-none focus:outline-none focus:ring-0 leading-relaxed"
              spellCheck={false}
              placeholder="Enter your React component code here..."
            />
          </div>

          {/* Preview */}
          <div className="flex-1 flex flex-col bg-gray-50 p-2 lg:p-4 overflow-hidden min-w-0">
            <div className="h-full flex flex-col">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Preview Result</span>
              </div>
              <div className="flex-1 relative rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white">
                <CodePreview code={code} title={title} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>,
    document.body
  );
}
