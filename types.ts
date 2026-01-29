
export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
}

export interface Budget {
  month: string; // MM/YYYY
  totalAmount: number;
}

export interface ConsolidatedExpense {
  description: string;
  total: number;
  count: number;
}
