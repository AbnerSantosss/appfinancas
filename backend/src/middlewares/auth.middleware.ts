import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  id: string;
  role: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

import { prisma } from '../lib/prisma';

/**
 * Middleware de autenticação JWT.
 * Verifica o token Bearer no header Authorization.
 */
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de autenticação não fornecido.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    
    // Buscar usuário no banco para checar se está ativo e atualizar lastActiveAt
    const dbUser = await prisma.user.findUnique({ where: { id: decoded.id } });
    
    if (!dbUser) {
      res.status(401).json({ error: 'Usuário não encontrado.' });
      return;
    }

    if (!dbUser.isActive) {
      res.status(403).json({ error: 'Acesso bloqueado pelo administrador.' });
      return;
    }

    // Atualizar lastActiveAt de forma assíncrona (não bloquear requisição)
    prisma.user.update({
      where: { id: dbUser.id },
      data: { lastActiveAt: new Date() }
    }).catch(e => console.error('Erro ao atualizar lastActiveAt', e));

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido ou expirado.' });
    return;
  }
}

/**
 * Middleware de autorização por role.
 * Deve ser usado APÓS requireAuth.
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Permissão insuficiente.' });
      return;
    }

    next();
  };
}
