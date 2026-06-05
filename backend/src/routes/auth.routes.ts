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

export default router;
