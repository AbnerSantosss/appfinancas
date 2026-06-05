import { Router } from 'express';
import { expenseService } from '../services/expense.service';
import { requireAuth, requireRole, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas de expenses requerem autenticação
router.use(requireAuth);

/**
 * GET /api/expenses
 * Lista todas as despesas do usuário autenticado.
 */
router.get('/', async (req: AuthRequest, res) => {
  try {
    const expenses = await expenseService.list(req.user!.id);
    res.json(expenses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/expenses
 * Cria uma nova despesa.
 */
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { description, value, totalValue, type, installments, startMonth, category, paidMonths, notes } = req.body;

    if (!description || value === undefined || !type || !startMonth) {
      res.status(400).json({ error: 'Campos obrigatórios: description, value, type, startMonth.' });
      return;
    }

    const expense = await expenseService.create({
      description,
      value: parseFloat(value),
      totalValue: totalValue ? parseFloat(totalValue) : undefined,
      type,
      installments: installments ? parseInt(installments) : undefined,
      startMonth,
      category: category || 'Geral',
      paidMonths: paidMonths || [],
      notes,
      userId: req.user!.id,
    });

    res.status(201).json(expense);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/expenses/:id
 * Atualiza uma despesa existente.
 */
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { description, value, totalValue, type, installments, startMonth, category, paidMonths, notes } = req.body;

    const expense = await expenseService.update(req.params.id as string, req.user!.id, {
      description,
      value: value !== undefined ? parseFloat(value) : undefined,
      totalValue: totalValue !== undefined ? parseFloat(totalValue) : undefined,
      type,
      installments: installments !== undefined ? parseInt(installments) : undefined,
      startMonth,
      category,
      paidMonths,
      notes,
    });

    res.json(expense);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * DELETE /api/expenses/:id
 * Exclui uma despesa.
 */
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await expenseService.delete(req.params.id as string, req.user!.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * PATCH /api/expenses/:id/toggle-paid
 * Alterna o status de pagamento de um mês específico.
 */
router.patch('/:id/toggle-paid', async (req: AuthRequest, res) => {
  try {
    const { monthISO } = req.body;
    if (!monthISO) {
      res.status(400).json({ error: 'Campo monthISO é obrigatório.' });
      return;
    }

    const expense = await expenseService.togglePaid(req.params.id as string, req.user!.id, monthISO);
    res.json(expense);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * POST /api/expenses/mark-all-paid
 * Marca todas as despesas ativas como pagas no mês.
 */
router.post('/mark-all-paid', async (req: AuthRequest, res) => {
  try {
    const { monthISO } = req.body;
    if (!monthISO) {
      res.status(400).json({ error: 'Campo monthISO é obrigatório.' });
      return;
    }

    const result = await expenseService.markAllPaid(req.user!.id, monthISO);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/expenses/reset
 * Reseta (exclui) todas as despesas do usuário. Requer role master.
 */
router.delete('/reset', requireRole('master'), async (req: AuthRequest, res) => {
  try {
    await expenseService.resetAll(req.user!.id);
    res.json({ success: true, message: 'Banco de despesas resetado com sucesso.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
