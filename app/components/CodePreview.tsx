'use client';

import { useEffect, useRef, useState } from 'react';


interface CodePreviewProps {
  code: string;
  title?: string;
}

const IFRAME_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Preview</title>
  
  <!-- React & ReactDOM -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  

  
  <!-- Babel Standalone -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <style>
    body { 
      background-color: white; 
      margin: 0; 
      padding: 0; 
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    #root { 
      width: 100%; 
      height: 100vh; 
      overflow: auto;
    }
    .error-container {
      padding: 1rem;
      color: #ef4444;
      background-color: #fef2f2;
      border-bottom: 1px solid #fee2e2;
      font-family: monospace;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script>
    // Error handler
    window.onerror = function(message, source, lineno, colno, error) {
      const root = document.getElementById('root');
      root.innerHTML = '<div class="error-container"><strong>Runtime Error:</strong><br/>' + message + '</div>';
    };

    // Message listener
    window.addEventListener('message', (event) => {
      const { code } = event.data;
      if (!code) return;

      const rootElement = document.getElementById('root');
      
      try {
        // 1. Shim module system
        const modules = {
          'react': window.React,
          'react-dom': window.ReactDOM,
          // Add more libraries here if needed
        };
        
        window.require = (name) => {
          if (modules[name]) return modules[name];
          console.warn(\`Module '\${name}' not found. Returning empty object.\`);
          return {};
        };

        // 2. Transform code using Babel
        // We use 'env' preset with modules: 'commonjs' to transform import/export to require/exports
        const compiled = Babel.transform(code, {
          presets: ['react', ['env', { modules: 'commonjs' }]],
          filename: 'preview.js'
        }).code;

        // 3. Create CommonJS environment
        const exports = {};
        const module = { exports };
        
        // 4. Execute the code
        // We wrap it in a function to provide require, module, exports
        const func = new Function('require', 'module', 'exports', compiled);
        func(window.require, module, exports);
        
        // 5. Get the exported component
        // Support both 'export default' and 'module.exports'
        const Component = module.exports.default || module.exports;
        
        if (!Component) {
          throw new Error('No component exported. Please use "export default function..."');
        }
        
        // 6. Render
        const root = ReactDOM.createRoot(rootElement);
        // If it's a function/class, render it as an element. If it's already an element, render it directly.
        const element = typeof Component === 'function' ? React.createElement(Component) : Component;
        
        root.render(element);
        
      } catch (err) {
        console.error(err);
        rootElement.innerHTML = '<div class="error-container"><strong>Compilation/Execution Error:</strong><br/>' + err.message + '</div>';
      }
    });
  </script>
</body>
</html>
`;

export default function CodePreview({ code, title = "Preview" }: CodePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize iframe content
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = IFRAME_HTML;
      // Give it a moment to load scripts
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Send code to iframe when it changes
  useEffect(() => {
    if (!isLoading && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ code }, '*');
    }
  }, [code, isLoading]);

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        {isLoading && (
          <svg className="w-4 h-4 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
      </div>
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          className="w-full h-full absolute inset-0 border-0"
          sandbox="allow-scripts allow-same-origin allow-modals allow-popups"
          title="Code Preview"
        />
      </div>
    </div>
  );
}
