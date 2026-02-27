'use client';

import { useState } from 'react';
import CodePreview from '@/app/components/CodePreview';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const DEFAULT_CODE = `export default function Counter() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div className="p-6 border rounded-xl shadow-sm bg-white max-w-sm mx-auto mt-10 font-sans">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Interactive Counter</h2>
      <p className="mb-6 text-gray-600">
        Current count: <span className="font-mono font-bold text-blue-600 text-xl">{count}</span>
      </p>
      <div className="flex gap-3">
        <button 
          onClick={() => setCount(c => c - 1)}
          className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
        >
          Decrease
        </button>
        <button 
          onClick={() => setCount(c => c + 1)}
          className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
        >
          Increase
        </button>
      </div>
    </div>
  );
}`;

export default function PlaygroundPage() {
  const [code, setCode] = useState(DEFAULT_CODE);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Component Playground</h1>
        </div>
        <div className="text-sm text-gray-500">
          Edit the code on the left to see changes instantly
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200 min-h-[50vh] lg:min-h-0">
          <div className="bg-gray-100 px-4 py-2 border-b text-xs font-medium text-gray-500 uppercase tracking-wider">
            Editor
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full p-4 font-mono text-sm bg-white resize-none focus:outline-none focus:ring-0 text-gray-800 leading-relaxed"
            spellCheck={false}
            placeholder="Enter your React component code here..."
          />
        </div>

        <div className="flex-1 flex flex-col bg-gray-50 p-4 lg:p-8 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Live Preview</span>
            </div>
            <div className="flex-1 relative rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white">
              <CodePreview code={code} title="Result" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
