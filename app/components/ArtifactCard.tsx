'use client';

import { useState } from 'react';
import { Play, Code } from 'lucide-react';
import { ArtifactPreviewModal } from './ArtifactPreviewModal';

interface ArtifactCardProps {
  title: string;
  code: string;
}

export function ArtifactCard({ title, code }: ArtifactCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="w-full max-w-md bg-bg-component border border-border-secondary rounded-xl overflow-hidden shadow-sm my-3 transition-shadow hover:shadow-md">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-secondary bg-black/5 dark:bg-white/5">
          <div className="p-1.5 bg-primary/20 rounded-md">
            <Code className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-text-main truncate">
              {title || 'React Component'}
            </h4>
            <p className="text-[10px] text-text-tertiary uppercase tracking-wider mt-0.5">
              Artifact
            </p>
          </div>
        </div>
        
        <div className="p-4 bg-bg-component">
          <p className="text-xs text-text-secondary mb-4">
            A fully functional React component has been generated and is ready for preview.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-current" />
            Preview Component
          </button>
        </div>
      </div>

      <ArtifactPreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCode={code}
        title={title}
      />
    </>
  );
}
