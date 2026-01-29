
import React, { useState } from 'react';
import { ConsolidatedExpense, Expense } from '../types';
import { formatCurrency, formatDateTime } from '../utils/helpers';

interface ConsolidatedTableProps {
  consolidated: ConsolidatedExpense[];
  allExpenses: Expense[];
}

const ConsolidatedTable: React.FC<ConsolidatedTableProps> = ({ consolidated, allExpenses }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  if (consolidated.length === 0) return null;

  const toggleCategory = (description: string) => {
    setExpandedCategory(expandedCategory === description ? null : description);
  };

  const getSubItems = (description: string) => {
    return allExpenses.filter(
      (exp) => exp.description.trim().toLowerCase() === description.toLowerCase()
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 overflow-hidden mt-8">
      <div className="p-4 border-b border-indigo-100 bg-indigo-100/30">
        <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-tight flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Consolidado (Clique para detalhes)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-indigo-600/60 text-xs uppercase font-semibold">
              <th className="px-6 py-3">Descrição</th>
              <th className="px-6 py-3 text-center">Frequência</th>
              <th className="px-6 py-3 text-right">Total Acumulado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-100">
            {consolidated.map((item, idx) => {
              const isExpanded = expandedCategory === item.description;
              const subItems = isExpanded ? getSubItems(item.description) : [];

              return (
                <React.Fragment key={idx}>
                  <tr 
                    onClick={() => toggleCategory(item.description)}
                    className={`cursor-pointer transition-colors ${isExpanded ? 'bg-indigo-100/50' : 'hover:bg-white/50'}`}
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-4 w-4 text-indigo-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 text-center">
                      {item.count}x
                    </td>
                    <td className="px-6 py-4 text-sm text-indigo-700 font-bold text-right whitespace-nowrap">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-indigo-50/30">
                      <td colSpan={3} className="px-8 py-0">
                        <div className="border-l-2 border-indigo-200 ml-2 mb-4 mt-2">
                          {subItems.map((sub, sIdx) => (
                            <div key={sub.id} className="flex justify-between items-center py-2 px-4 hover:bg-white/40 rounded-r-lg transition-colors border-b border-indigo-100 last:border-0">
                              <span className="text-xs font-medium text-slate-500">
                                {formatDateTime(sub.date)}
                              </span>
                              <span className="text-sm font-semibold text-indigo-600">
                                {formatCurrency(sub.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConsolidatedTable;
