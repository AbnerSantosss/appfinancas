import { expenseRepository } from '../repositories/expense.repository';
import { prisma } from '../lib/prisma';

export class ExpenseService {
  private async getFamilyUserIds(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return [userId];
    const effectiveFamilyId = user.familyId || user.id;
    const users = await prisma.user.findMany({
      where: {
        OR: [{ id: effectiveFamilyId }, { familyId: effectiveFamilyId }]
      },
      select: { id: true }
    });
    return users.map(u => u.id);
  }

  async list(userId: string) {
    const userIds = await this.getFamilyUserIds(userId);
    return expenseRepository.findAll(userIds);
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
    const userIds = await this.getFamilyUserIds(userId);
    const expense = await expenseRepository.findById(id);
    if (!expense || !userIds.includes(expense.userId)) {
      throw new Error('Despesa não encontrada ou sem permissão.');
    }

    return expenseRepository.update(id, data);
  }

  async delete(id: string, userId: string) {
    const userIds = await this.getFamilyUserIds(userId);
    const expense = await expenseRepository.findById(id);
    if (!expense || !userIds.includes(expense.userId)) {
      throw new Error('Despesa não encontrada ou sem permissão.');
    }

    return expenseRepository.delete(id);
  }

  async togglePaid(id: string, userId: string, monthISO: string) {
    const userIds = await this.getFamilyUserIds(userId);
    const expense = await expenseRepository.findById(id);
    if (!expense || !userIds.includes(expense.userId)) {
      throw new Error('Despesa não encontrada ou sem permissão.');
    }

    const currentPaid = expense.paidMonths || [];
    const isPaid = currentPaid.includes(monthISO);
    const newPaid = isPaid
      ? currentPaid.filter((m) => m !== monthISO)
      : [...currentPaid, monthISO];

    return expenseRepository.updatePaidMonths(id, newPaid);
  }

  async markAllPaid(userId: string, monthISO: string) {
    const userIds = await this.getFamilyUserIds(userId);
    const expenses = await expenseRepository.findAll(userIds);

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
    const userIds = await this.getFamilyUserIds(userId);
    return expenseRepository.deleteAllByUser(userIds);
  }
}

export const expenseService = new ExpenseService();
