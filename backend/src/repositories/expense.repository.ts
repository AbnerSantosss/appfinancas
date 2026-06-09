import { prisma } from '../lib/prisma';

export class ExpenseRepository {
  async findAll(userIds: string[]) {
    return prisma.expense.findMany({
      where: { userId: { in: userIds } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.expense.findUnique({ where: { id } });
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
    return prisma.expense.create({ data });
  }

  async update(id: string, data: {
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
    return prisma.expense.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.expense.delete({ where: { id } });
  }

  async deleteAllByUser(userIds: string[]) {
    return prisma.expense.deleteMany({ where: { userId: { in: userIds } } });
  }

  async updatePaidMonths(id: string, paidMonths: string[]) {
    return prisma.expense.update({
      where: { id },
      data: { paidMonths },
    });
  }
}

export const expenseRepository = new ExpenseRepository();
