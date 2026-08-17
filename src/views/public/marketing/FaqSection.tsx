import React, { useState } from 'react';
import { 
  ChevronDown, 
  HelpCircle, 
  Sparkles, 
  ArrowRight,
  MessageCircleQuestion
} from 'lucide-react';

interface FaqSectionProps {
  onOpenDemoModal: () => void;
}

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'What is Davetech ERP?',
    answer: 'Davetech ERP is a unified, multi-tenant cloud enterprise resource planning platform. It connects all critical business operations — including accounting & finance, point of sale (POS), inventory, human resources, higher education, healthcare, retail, hospitality, churches, and cooperatives — into one cohesive, secure system.'
  },
  {
    question: 'What industries does Davetech ERP support?',
    answer: 'Davetech ERP provides purpose-built modules for Higher Education & TVETs, Retail Supermarkets & Bookshops, Healthcare & Hospitals, Hospitality & Restaurants, SACCOs & Chamas, Churches & Faith Organizations, Wholesale Distributors, and General Enterprise Corporations.'
  },
  {
    question: 'Is Davetech ERP multi-tenant?',
    answer: 'Yes. Davetech ERP is architected from the ground up as a secure multi-tenant platform. Every organization operates within a strictly isolated logical partition, ensuring that data, users, and transactions never bleed across institutional boundaries.'
  },
  {
    question: 'Can each organization have its own branding?',
    answer: 'Absolutely. Every tenant organization can configure its own logo, primary and secondary brand colors, currency symbol, address, tax registration number, and custom public landing portal without touching source code.'
  },
  {
    question: 'Can modules be enabled per organization?',
    answer: 'Yes. Platform administrators can enable or disable specific modules for each tenant. For example, an educational institute can enable Student Admissions, Timetables, and Fee Billing without seeing retail POS modules, while a supermarket chain can focus entirely on POS, Inventory, and Supplier Purchasing.'
  },
  {
    question: 'Can I use a custom domain?',
    answer: 'Yes. Tenants can operate on a dedicated subdomain (e.g. yourcampus.davetech.co.ke) or map their own verified custom domain (e.g. erp.yourinstitution.org) with automatic SSL certificate provisioning.'
  },
  {
    question: 'Can I book a demo?',
    answer: 'Yes! You can request a personalized 1-on-1 walkthrough tailored to your industry and organization size by clicking "Book a Live Demo" anywhere on this page.'
  }
];

export const FaqSection: React.FC<FaqSectionProps> = ({
  onOpenDemoModal
}) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <MessageCircleQuestion className="w-4 h-4 text-blue-600" />
            <span>Frequently Asked Questions</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 uppercase">
            COMMON QUESTIONS
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Everything you need to know about Davetech ERP deployment, security, and architecture.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none hover:bg-slate-100/60 transition-colors"
                >
                  <span className="font-extrabold text-sm sm:text-base text-slate-900">
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-blue-50 border-blue-200 text-blue-600' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Help Note */}
        <div className="text-center pt-4 text-xs text-slate-500">
          <span>Have a specific architectural or compliance question? </span>
          <button 
            onClick={onOpenDemoModal}
            className="text-blue-600 font-bold hover:underline ml-1"
          >
            Speak with an Enterprise Solution Architect →
          </button>
        </div>

      </div>
    </section>
  );
};
