
import React, { useState, useEffect, useRef } from 'react';

interface ExpenseFormProps {
  onAddExpense: (amount: number, description: string) => void;
  suggestions: string[];
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense, suggestions }) => {
  const [displayAmount, setDisplayAmount] = useState<string>('');
  const [rawAmount, setRawAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatAsCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value === '') {
      setRawAmount(0);
      setDisplayAmount('');
      return;
    }
    const floatValue = parseFloat(value) / 100;
    setRawAmount(floatValue);
    setDisplayAmount(formatAsCurrency(floatValue));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDescription(val);
    
    if (val.trim().length > 0) {
      const filtered = suggestions.filter(s => 
        s.toLowerCase().includes(val.toLowerCase()) && 
        s.toLowerCase() !== val.toLowerCase()
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setDescription(suggestion);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rawAmount <= 0 || !description.trim()) return;

    onAddExpense(rawAmount, description.trim());
    setRawAmount(0);
    setDisplayAmount('');
    setDescription('');
    setShowSuggestions(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Adicionar Novo Gasto</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 relative" ref={suggestionRef}>
            <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Descrição</label>
            <input 
              type="text"
              value={description}
              onChange={handleDescriptionChange}
              onFocus={() => description.trim().length > 0 && filteredSuggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Ex: Uber, Almoço, Mercado..."
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              required
              autoComplete="off"
            />
            {showSuggestions && (
              <div className="absolute top-[105%] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto py-2 animate-in fade-in slide-in-from-top-1 duration-200">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-40" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Valor (R$)</label>
            <input 
              type="text"
              inputMode="numeric"
              value={displayAmount}
              onChange={handleAmountChange}
              placeholder="0,00"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              required
            />
          </div>
        </div>
        <button 
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md active:scale-[0.98]"
        >
          Registrar Gasto
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
