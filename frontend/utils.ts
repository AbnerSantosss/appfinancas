
import { format, addMonths, isSameMonth, isAfter, isBefore, startOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Expense } from './types';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatMonth = (date: Date) => {
  const monthName = format(date, "MMM", { locale: ptBR });
  const yearShort = date.getFullYear().toString().slice(-2);
  return `${monthName} ${yearShort}`;
};

export const formatFullMonth = (date: Date) => {
  const monthName = format(date, "MMMM", { locale: ptBR });
  const year = date.getFullYear();
  return `${monthName} ${year}`;
};

export const getInstallmentInfo = (expense: Expense, targetMonth: Date) => {
  if (expense.type !== 'INSTALLMENT') return null;
  
  const start = startOfMonth(parseISO(expense.startMonth));
  const target = startOfMonth(targetMonth);
  const total = expense.installments || 1;
  
  const monthDiff = (target.getFullYear() - start.getFullYear()) * 12 + (target.getMonth() - start.getMonth());
  
  if (monthDiff < 0 || monthDiff >= total) return null;
  
  return {
    current: monthDiff + 1,
    total,
    isLast: monthDiff + 1 === total
  };
};

export const getExpenseProgress = (expense: Expense) => {
  if (expense.type === 'FIXED') return null;
  if (expense.type === 'ONCE') {
    const isPaid = (expense.paidMonths?.length || 0) > 0;
    return {
      paidCount: isPaid ? 1 : 0,
      total: 1,
      isFinished: isPaid,
      percentage: isPaid ? 100 : 0,
      endDate: parseISO(expense.startMonth)
    };
  }
  
  const paidCount = expense.paidMonths?.length || 0;
  const total = expense.installments || 1;
  const isFinished = paidCount >= total;
  const percentage = Math.min(Math.round((paidCount / total) * 100), 100);
  
  const startDate = parseISO(expense.startMonth);
  const endDate = addMonths(startDate, total - 1);

  return {
    paidCount,
    total,
    isFinished,
    percentage,
    endDate
  };
};

export const isExpenseActiveInMonth = (expense: Expense, targetMonth: Date): boolean => {
  const target = startOfMonth(targetMonth);
  const start = startOfMonth(parseISO(expense.startMonth));

  if (expense.type === 'ONCE') {
    return isSameMonth(target, start);
  }

  if (expense.type === 'FIXED') {
    return !isBefore(target, start);
  }

  const total = expense.installments || 1;
  const end = addMonths(start, total - 1);
  
  return (isSameMonth(target, start) || isAfter(target, start)) && 
         (isSameMonth(target, end) || isBefore(target, end));
};

export const isMonthPaid = (expense: Expense, targetMonth: Date): boolean => {
  if (!expense.paidMonths) return false;
  const targetISO = startOfMonth(targetMonth).toISOString();
  return expense.paidMonths.includes(targetISO);
};

export const calculateMonthTotal = (expenses: Expense[], targetMonth: Date, onlyUnpaid = false) => {
  return expenses
    .filter(e => isExpenseActiveInMonth(e, targetMonth))
    .filter(e => !onlyUnpaid || !isMonthPaid(e, targetMonth))
    .reduce((sum, e) => sum + e.value, 0);
};
