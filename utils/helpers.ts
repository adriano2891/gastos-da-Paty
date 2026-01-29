
import { Expense, ConsolidatedExpense } from '../types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getCurrentMonthYear = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${month}/${year}`;
};

export const getAvailableMonths = (year: number) => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months.map((name, index) => ({
    name,
    value: `${String(index + 1).padStart(2, '0')}/${year}`,
    short: name.substring(0, 3)
  }));
};

export const getAvailableYears = () => {
  // Retorna o intervalo solicitado pelo usuário: 2026 até 2030
  return [2026, 2027, 2028, 2029, 2030];
};

export const isExpenseInMonth = (expenseDate: string, monthYear: string): boolean => {
  const [m, y] = monthYear.split('/');
  const date = new Date(expenseDate);
  return (date.getMonth() + 1) === parseInt(m) && date.getFullYear() === parseInt(y);
};

export const consolidateExpenses = (expenses: Expense[]): ConsolidatedExpense[] => {
  const map = new Map<string, { total: number; count: number }>();

  expenses.forEach((exp) => {
    const desc = exp.description.trim().toLowerCase();
    const existing = map.get(desc) || { total: 0, count: 0 };
    map.set(desc, {
      total: existing.total + exp.amount,
      count: existing.count + 1,
    });
  });

  return Array.from(map.entries()).map(([description, data]) => ({
    description: description.charAt(0).toUpperCase() + description.slice(1),
    total: data.total,
    count: data.count,
  })).sort((a, b) => b.total - a.total);
};
