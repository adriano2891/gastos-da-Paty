
import React from 'react';
import { formatCurrency } from '../utils/helpers';

interface BudgetHeaderProps {
  totalBudget: number;
  totalSpent: number;
  onEditBudget: () => void;
}

const BudgetHeader: React.FC<BudgetHeaderProps> = ({ totalBudget, totalSpent, onEditBudget }) => {
  const balance = totalBudget - totalSpent;
  const percentageSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  const getStatusColor = () => {
    if (percentageSpent >= 90) return 'text-red-600';
    if (percentageSpent >= 70) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const getProgressColor = () => {
    if (percentageSpent >= 90) return 'bg-red-500';
    if (percentageSpent >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const renderAlert = () => {
    if (totalBudget <= 0) return null;

    if (percentageSpent >= 90) {
      return (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm font-bold">LIMITE CRÍTICO: {percentageSpent.toFixed(0)}% utilizado!</span>
        </div>
      );
    }

    if (percentageSpent >= 70) {
      const isExtreme = percentageSpent >= 85;
      return (
        <div className={`mt-4 p-3 rounded-xl flex items-center gap-3 transition-colors ${isExtreme ? 'bg-amber-100 border-amber-400 text-amber-900' : 'bg-amber-50 border-amber-200 text-amber-800'} border`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-bold">ALERTA: {percentageSpent.toFixed(0)}% do orçamento consumido!</span>
        </div>
      );
    }

    return null;
  };

  // O tremor agora inicia aos 70%, intensificando o alerta visual.
  const shouldShake = percentageSpent >= 70;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-6 md:p-8 transition-all duration-300 ${
      shouldShake 
        ? 'animate-shake border-amber-400 shadow-lg shadow-amber-100' 
        : 'border-slate-200'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Orçamento Mensal</h2>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-slate-900">{formatCurrency(totalBudget)}</span>
            <button 
              onClick={onEditBudget}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-indigo-600"
              title="Editar Orçamento"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex flex-col md:text-right">
          <h2 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Saldo Restante</h2>
          <span className={`text-3xl font-bold transition-colors duration-300 ${getStatusColor()}`}>{formatCurrency(balance)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-slate-600">Total Gasto: {formatCurrency(totalSpent)}</span>
          <span className={`transition-colors duration-300 ${getStatusColor()}`}>{percentageSpent.toFixed(0)}% utilizado</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ease-out ${getProgressColor()}`} 
            style={{ width: `${Math.min(percentageSpent, 100)}%` }}
          />
        </div>
      </div>

      {renderAlert()}
    </div>
  );
};

export default BudgetHeader;
