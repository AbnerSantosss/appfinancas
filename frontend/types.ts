
export type ExpenseType = 'FIXED' | 'INSTALLMENT' | 'ONCE';

export interface Expense {
  id: string;
  description: string;
  value: number; // Valor da parcela ou valor fixo mensal
  totalValue?: number; // Valor total da compra (opcional para parcelados)
  type: ExpenseType;
  installments?: number; // total number of installments
  startMonth: string; // ISO string for the first day of the starting month
  category: string;
  paidMonths?: string[]; // Array de strings ISO dos meses (startOfMonth) já pagos
  notes?: string; // Observações ou comentários adicionais
}

export interface UserSettings {
  salary: number;
}

export interface MonthForecast {
  month: string; // ISO string
  total: number;
  fixedTotal: number;
  installmentTotal: number;
}
