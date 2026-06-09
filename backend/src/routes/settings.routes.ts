import { Router } from 'express';
import { settingsService } from '../services/settings.service';
import { emailService } from '../services/email.service';
import { requireAuth, requireRole, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas de settings requerem autenticação
router.use(requireAuth);

/**
 * GET /api/settings/salary
 * Retorna o salário base configurado.
 */
router.get('/salary', async (req: AuthRequest, res) => {
  try {
    const fullUser = await import('../lib/prisma').then(m => m.prisma.user.findUnique({ where: { id: req.user!.id } }));
    const effectiveFamilyId = fullUser?.familyId || fullUser?.id || req.user!.id;

    const salary = await settingsService.getSalary(effectiveFamilyId);
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

    const fullUser = await import('../lib/prisma').then(m => m.prisma.user.findUnique({ where: { id: req.user!.id } }));
    const effectiveFamilyId = fullUser?.familyId || fullUser?.id || req.user!.id;

    await settingsService.updateSalary(effectiveFamilyId, parseFloat(salary));
    res.json({ success: true, salary: parseFloat(salary) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SMTP Settings (master only) ────────────────────────

/**
 * GET /api/settings/smtp
 * Retorna a configuração SMTP (sem a senha completa).
 */
router.get('/smtp', requireRole('master'), async (_req: AuthRequest, res) => {
  try {
    const config = await settingsService.getSmtpConfig();
    if (!config) {
      res.json({ configured: false, config: null });
      return;
    }
    // Mascara a senha
    res.json({
      configured: true,
      config: {
        ...config,
        pass: config.pass ? '••••••••' : '',
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/settings/smtp
 * Salva a configuração SMTP.
 */
router.put('/smtp', requireRole('master'), async (req: AuthRequest, res) => {
  try {
    const { host, port, user, pass, from } = req.body;

    if (!host || !user || !pass) {
      res.status(400).json({ error: 'Host, usuário e senha SMTP são obrigatórios.' });
      return;
    }

    await settingsService.updateSmtpConfig({
      host,
      port: parseInt(port) || 587,
      user,
      pass,
      from: from || 'noreply@hubfinanceiro.com',
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/settings/smtp/test
 * Testa a conexão SMTP com a configuração fornecida.
 */
router.post('/smtp/test', requireRole('master'), async (req: AuthRequest, res) => {
  try {
    const { host, port, user, pass, from } = req.body;

    if (!host || !user || !pass) {
      res.status(400).json({ error: 'Host, usuário e senha SMTP são obrigatórios.' });
      return;
    }

    const result = await emailService.testConnection({
      host,
      port: parseInt(port) || 587,
      user,
      pass,
      from: from || 'noreply@hubfinanceiro.com',
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
