import React from 'react';
import { X, ExternalLink, Terminal } from 'lucide-react';

interface SwaggerDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwaggerDocsModal: React.FC<SwaggerDocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">FastAPI Interactive Swagger UI</h3>
              <p className="text-xs text-slate-500">Live API documentation powered by OpenAPI</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href="/docs"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 flex items-center space-x-1"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded Swagger UI iframe */}
        <div className="flex-1 bg-white relative">
          <iframe
            src="/docs"
            title="FastAPI Swagger Documentation"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
};
