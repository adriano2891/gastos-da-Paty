
import React from 'react';
import { Expense } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDeleteExpense }) => {
  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <p className="text-slate-400 italic">Nenhum gasto registrado este mês.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">Histórico de Gastos</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase font-medium">
              <th className="px-6 py-3">Data</th>
              <th className="px-6 py-3">Descrição</th>
              <th className="px-6 py-3 text-right">Valor</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                  {formatDate(expense.date)}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">
                  {expense.description}
                </td>
                <td className="px-6 py-4 text-sm text-slate-900 font-semibold text-right whitespace-nowrap">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-6 py-4 text-right w-10">
                  <button 
                    onClick={() => onDeleteExpense(expense.id)}
                    className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseList;
