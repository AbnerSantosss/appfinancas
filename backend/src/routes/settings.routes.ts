import { Router } from 'express';
import { settingsService } from '../services/settings.service';
import { requireAuth, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas de settings requerem autenticação
router.use(requireAuth);

/**
 * GET /api/settings/salary
 * Retorna o salário base configurado.
 */
router.get('/salary', async (_req: AuthRequest, res) => {
  try {
    const salary = await settingsService.getSalary();
    res.json({ salary });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/settings/salary
 * Atualiza o salário base.
 */
router.put('/salary', async (req: AuthRequest, res) => {
  try {
    const { salary } = req.body;

    if (salary === undefined || salary === null) {
      res.status(400).json({ error: 'Campo salary é obrigatório.' });
      return;
    }

    await settingsService.updateSalary(parseFloat(salary));
    res.json({ success: true, salary: parseFloat(salary) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
