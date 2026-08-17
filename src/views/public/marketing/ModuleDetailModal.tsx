import React from 'react';
import { 
  X, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Calendar, 
  Check, 
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { 
  DAVETECH_MODULES_DETAILS, 
  DavetechModuleDetail 
} from '../../../data/davetechModulesDetails';

interface ModuleDetailModalProps {
  moduleId: string | null;
  onClose: () => void;
  onRequestDemoForModule: (moduleName: string, moduleId: string) => void;
}

export const ModuleDetailModal: React.FC<ModuleDetailModalProps> = ({
  moduleId,
  onClose,
  onRequestDemoForModule
}) => {
  if (!moduleId) return null;

  const moduleDetail = DAVETECH_MODULES_DETAILS.find(m => m.id === moduleId);
  if (!moduleDetail) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
              <span>{moduleDetail.badge}</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {moduleDetail.name}
            </h3>
            <p className="text-xs font-semibold text-blue-600">
              {moduleDetail.tagline}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              {moduleDetail.longDescription}
            </p>
          </div>

          {/* Key Capabilities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Core Engineered Capabilities
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {moduleDetail.keyFeatures.map((feat, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{feat.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pl-5">
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Workflows */}
          {moduleDetail.workflows && moduleDetail.workflows.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Automated System Flow
              </h4>
              <div className="flex flex-wrap items-center gap-1.5">
                {moduleDetail.workflows.map((wf, idx) => (
                  <React.Fragment key={idx}>
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-900 border border-blue-100">
                      {wf}
                    </span>
                    {idx < moduleDetail.workflows.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Target Audience */}
          {moduleDetail.targetAudience && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Built For
              </h4>
              <div className="flex flex-wrap gap-2">
                {moduleDetail.targetAudience.map((aud, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                    • {aud}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Multi-Tenant & Isolated Database Ready</span>
            </div>

            <button
              onClick={() => {
                onClose();
                onRequestDemoForModule(moduleDetail.name, moduleDetail.id);
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>Request Live Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
