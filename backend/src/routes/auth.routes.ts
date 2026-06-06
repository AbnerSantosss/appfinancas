import { Router } from 'express';
import { authService } from '../services/auth.service';
import { requireAuth, requireRole, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

/**
 * POST /api/auth/login
 * Autentica o usuário e retorna JWT + dados públicos.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email e senha são obrigatórios.' });
      return;
    }

    const result = await authService.login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

/**
 * POST /api/auth/forgot-password
 * Redefine e envia a nova senha por email (público).
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email é obrigatório.' });
      return;
    }

    const result = await authService.forgotPassword(email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/auth/register
 * Registra um novo usuário (apenas master).
 */
router.post('/register', requireAuth, requireRole('master'), async (req: AuthRequest, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email e senha são obrigatórios.' });
      return;
    }

    const user = await authService.register(email, password, name, role);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/auth/me
 * Retorna dados do usuário autenticado.
 */
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await authService.getProfile(req.user!.id);
    res.json(user);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * PUT /api/auth/profile
 * Atualiza o nome do usuário logado.
 */
router.put('/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body;
    const user = await authService.updateProfile(req.user!.id, name);
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /api/auth/change-password
 * Altera a senha do usuário logado (requer senha atual).
 */
router.put('/change-password', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias.' });
      return;
    }

    const result = await authService.changePassword(req.user!.id, currentPassword, newPassword);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─── Rotas Admin (master only) ──────────────────────────

/**
 * POST /api/auth/invite
 * Convida novo usuário: cria conta e envia email com credenciais.
 */
router.post('/invite', requireAuth, requireRole('master'), async (req: AuthRequest, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email e senha são obrigatórios.' });
      return;
    }

    const result = await authService.inviteUser(email, password, name);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/auth/users
 * Lista todos os usuários cadastrados (master only).
 */
router.get('/users', requireAuth, requireRole('master'), async (_req: AuthRequest, res) => {
  try {
    const users = await authService.listUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/reset-password/:userId
 * Reseta a senha de um usuário (master only).
 */
router.post('/reset-password/:userId', requireAuth, requireRole('master'), async (req: AuthRequest, res) => {
  try {
    const userId = req.params.userId as string;
    const result = await authService.resetUserPassword(userId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/auth/users/:userId
 * Remove um usuário e suas despesas (master only).
 */
router.delete('/users/:userId', requireAuth, requireRole('master'), async (req: AuthRequest, res) => {
  try {
    const userId = req.params.userId as string;
    const result = await authService.deleteUser(userId, req.user!.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
