
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Expense, Budget, ConsolidatedExpense } from './types';
import { 
  getCurrentMonthYear, 
  getAvailableMonths,
  getAvailableYears,
  isExpenseInMonth,
  consolidateExpenses 
} from './utils/helpers';
import { getFinancialAdvice } from './services/geminiService';
import BudgetHeader from './components/BudgetHeader';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ConsolidatedTable from './components/ConsolidatedTable';

const App: React.FC = () => {
  const availableYears = getAvailableYears();
  const realCurrentYear = new Date().getFullYear();
  
  const initialYear = availableYears.includes(realCurrentYear) 
    ? realCurrentYear 
    : availableYears[0];

  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(`${String(new Date().getMonth() + 1).padStart(2, '0')}/${initialYear}`);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [allBudgets, setAllBudgets] = useState<Record<string, number>>({});
  
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);
  const [isYearListOpen, setIsYearListOpen] = useState(false);
  
  // States for budget editing with mask
  const [displayBudget, setDisplayBudget] = useState('');
  const [rawBudget, setRawBudget] = useState(0);

  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  
  const yearSelectorRef = useRef<HTMLDivElement>(null);

  // Detecção simples de plataforma para ajustes de UI (ex: margem do topo no iOS)
  const isNative = useMemo(() => {
    return window.hasOwnProperty('Capacitor');
  }, []);

  const formatAsCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (yearSelectorRef.current && !yearSelectorRef.current.contains(event.target as Node)) {
        setIsYearListOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const savedExpenses = localStorage.getItem('moneyflow_all_expenses');
    const savedBudgets = localStorage.getItem('moneyflow_all_budgets');
    
    if (savedExpenses) setAllExpenses(JSON.parse(savedExpenses));
    if (savedBudgets) setAllBudgets(JSON.parse(savedBudgets));
  }, []);

  useEffect(() => {
    localStorage.setItem('moneyflow_all_expenses', JSON.stringify(allExpenses));
  }, [allExpenses]);

  useEffect(() => {
    localStorage.setItem('moneyflow_all_budgets', JSON.stringify(allBudgets));
  }, [allBudgets]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    const [month] = selectedMonth.split('/');
    setSelectedMonth(`${month}/${year}`);
    setIsYearListOpen(false);
  };

  const currentExpenses = useMemo(() => {
    return allExpenses.filter(exp => isExpenseInMonth(exp.date, selectedMonth));
  }, [allExpenses, selectedMonth]);

  const currentBudgetAmount = allBudgets[selectedMonth] || 0;

  const totalSpent = useMemo(() => {
    return currentExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [currentExpenses]);

  const consolidated = useMemo(() => {
    return consolidateExpenses(currentExpenses);
  }, [currentExpenses]);

  const suggestionList = useMemo(() => {
    const descriptions = allExpenses.map(e => e.description);
    return Array.from(new Set(descriptions)).sort();
  }, [allExpenses]);

  const handleAddExpense = (amount: number, description: string) => {
    const [m, y] = selectedMonth.split('/');
    const isCurrentRealMonthYear = selectedMonth === getCurrentMonthYear();
    
    const expenseDate = isCurrentRealMonthYear 
      ? new Date().toISOString() 
      : new Date(parseInt(y), parseInt(m) - 1, 15, 12, 0).toISOString();

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      amount,
      description,
      date: expenseDate,
    };
    setAllExpenses([newExpense, ...allExpenses]);
  };

  const handleDeleteExpense = (id: string) => {
    setAllExpenses(allExpenses.filter(e => e.id !== id));
  };

  const handleBudgetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value === '') {
      setRawBudget(0);
      setDisplayBudget('');
      return;
    }
    const floatValue = parseFloat(value) / 100;
    setRawBudget(floatValue);
    setDisplayBudget(formatAsCurrency(floatValue));
  };

  const handleUpdateBudget = () => {
    setAllBudgets({ ...allBudgets, [selectedMonth]: rawBudget });
    setIsEditBudgetOpen(false);
  };

  const openBudgetModal = () => {
    const current = allBudgets[selectedMonth] || 0;
    setRawBudget(current);
    setDisplayBudget(current > 0 ? formatAsCurrency(current) : '');
    setIsEditBudgetOpen(true);
  };

  const fetchAIAdvice = async () => {
    if (currentBudgetAmount === 0 && totalSpent === 0) return;
    setIsLoadingAdvice(true);
    const advice = await getFinancialAdvice(currentBudgetAmount, totalSpent, consolidated);
    setAiAdvice(advice);
    setIsLoadingAdvice(false);
  };

  const monthsList = getAvailableMonths(selectedYear);
  const yearsList = getAvailableYears();

  return (
    <div className={`min-h-screen bg-slate-50 pb-20 ${isNative ? 'select-none' : ''}`}>
      <header className="bg-indigo-600 text-white pt-6 pb-2 px-4 shadow-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-white p-2 rounded-lg text-indigo-600 shadow-lg shadow-indigo-900/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Gastos da Paty</h1>
            </div>

            <div className="relative" ref={yearSelectorRef}>
              <button
                onClick={() => setIsYearListOpen(!isYearListOpen)}
                className="flex items-center gap-2 bg-indigo-500/30 px-4 py-2 rounded-xl text-sm font-bold uppercase border border-white/20 hover:bg-indigo-500/50 transition-all active:scale-95"
              >
                {selectedYear}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${isYearListOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isYearListOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-xl border border-indigo-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  {yearsList.map(year => (
                    <button
                      key={year}
                      onClick={() => handleYearChange(year)}
                      className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors ${
                        selectedYear === year 
                          ? 'bg-indigo-50 text-indigo-600' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
            {monthsList.map((m) => (
              <button
                key={m.value}
                onClick={() => setSelectedMonth(m.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  selectedMonth === m.value 
                    ? 'bg-white text-indigo-600 shadow-lg scale-105' 
                    : 'text-indigo-100 hover:bg-white/10'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
        <BudgetHeader 
          totalBudget={currentBudgetAmount} 
          totalSpent={totalSpent} 
          onEditBudget={openBudgetModal}
        />

        {(aiAdvice || isLoadingAdvice) && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider">Smart Advice</span>
              </div>
              {isLoadingAdvice ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <p className="italic text-indigo-100">Analisando dados de {selectedMonth}...</p>
                </div>
              ) : (
                <p className="text-lg font-medium leading-relaxed">{aiAdvice}</p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 space-y-6">
            <ExpenseForm onAddExpense={handleAddExpense} suggestions={suggestionList} />
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-800">IA Insight</h4>
                <p className="text-sm text-slate-500 mb-4">Analise o desempenho de {selectedMonth}.</p>
                <button 
                  onClick={fetchAIAdvice}
                  disabled={isLoadingAdvice || currentExpenses.length === 0}
                  className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold px-6 py-2 rounded-xl transition-colors border border-indigo-100"
                >
                  Analisar Período
                </button>
              </div>
            </div>

            <ConsolidatedTable consolidated={consolidated} allExpenses={currentExpenses} />
          </div>

          <div className="md:col-span-7">
            <ExpenseList expenses={currentExpenses} onDeleteExpense={handleDeleteExpense} />
          </div>
        </div>
      </main>

      {isEditBudgetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Orçamento: {selectedMonth}</h3>
            <p className="text-slate-500 text-sm mb-6">Defina o limite de gastos para este período.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Valor (R$)</label>
                <input 
                  type="text"
                  inputMode="numeric"
                  value={displayBudget}
                  onChange={handleBudgetInputChange}
                  className="w-full text-2xl font-bold px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="0,00"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsEditBudgetOpen(false)}
                  className="flex-1 px-4 py-3 font-semibold text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleUpdateBudget}
                  className="flex-1 px-4 py-3 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
