import { expenseRepository } from '../repositories/expense.repository';

export class ExpenseService {
  async list(userId: string) {
    return expenseRepository.findAll(userId);
  }

  async create(data: {
    description: string;
    value: number;
    totalValue?: number;
    type: string;
    installments?: number;
    startMonth: string;
    category: string;
    paidMonths?: string[];
    notes?: string;
    userId: string;
  }) {
    return expenseRepository.create(data);
  }

  async update(id: string, userId: string, data: {
    description?: string;
    value?: number;
    totalValue?: number;
    type?: string;
    installments?: number;
    startMonth?: string;
    category?: string;
    paidMonths?: string[];
    notes?: string;
  }) {
    // Verifica se a expense pertence ao usuário
    const expense = await expenseRepository.findById(id);
    if (!expense || expense.userId !== userId) {
      throw new Error('Despesa não encontrada.');
    }

    return expenseRepository.update(id, data);
  }

  async delete(id: string, userId: string) {
    const expense = await expenseRepository.findById(id);
    if (!expense || expense.userId !== userId) {
      throw new Error('Despesa não encontrada.');
    }

    return expenseRepository.delete(id);
  }

  async togglePaid(id: string, userId: string, monthISO: string) {
    const expense = await expenseRepository.findById(id);
    if (!expense || expense.userId !== userId) {
      throw new Error('Despesa não encontrada.');
    }

    const currentPaid = expense.paidMonths || [];
    const isPaid = currentPaid.includes(monthISO);
    const newPaid = isPaid
      ? currentPaid.filter((m) => m !== monthISO)
      : [...currentPaid, monthISO];

    return expenseRepository.updatePaidMonths(id, newPaid);
  }

  async markAllPaid(userId: string, monthISO: string) {
    const expenses = await expenseRepository.findAll(userId);

    const updates = expenses
      .filter((e) => {
        const paid = e.paidMonths || [];
        return !paid.includes(monthISO);
      })
      .map((e) =>
        expenseRepository.updatePaidMonths(e.id, [
          ...(e.paidMonths || []),
          monthISO,
        ])
      );

    await Promise.all(updates);
    return { updated: updates.length };
  }

  async resetAll(userId: string) {
    return expenseRepository.deleteAllByUser(userId);
  }
}

export const expenseService = new ExpenseService();
