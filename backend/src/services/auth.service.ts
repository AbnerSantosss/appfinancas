import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { emailService } from './email.service';

export class AuthService {
  /**
   * Autentica um usuário e retorna o JWT + dados públicos.
   */
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Credenciais inválidas.');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Credenciais inválidas.');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Registra um novo usuário (apenas master pode criar).
   */
  async register(email: string, password: string, name?: string, role: string = 'user') {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('Email já cadastrado.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  /**
   * Cadastro de novos usuários (público).
   * Requer que o SMTP esteja configurado pelo master.
   */
  async signup(email: string, password: string, name?: string) {
    const isSmtpConfigured = await emailService.checkConfigured();
    if (!isSmtpConfigured) {
      throw new Error('O sistema ainda está em construção. O provedor de e-mail não foi configurado pelo administrador.');
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('Email já cadastrado.');
    }

    if (!password || password.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: 'user',
        // Um usuário recém cadastrado não tem familyId (é o head da própria família)
      },
    });

    await emailService.sendWelcomeEmail(email, password, name);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Convida um novo usuário: cria a conta e envia email com credenciais.
   * O admin define a senha. Se SMTP estiver configurado, envia por email.
   */
  async inviteUser(email: string, password: string, name?: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('Este email já está cadastrado no sistema.');
    }

    if (!password || password.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: 'user',
      },
    });

    // Tenta enviar email com as credenciais
    const emailSent = await emailService.sendInviteEmail(email, password, name);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      emailSent,
    };
  }

  /**
   * Convida um membro da família.
   * Cria a conta vinculada ao familyId do usuário que convidou e envia email.
   */
  async inviteFamilyMember(email: string, password: string, name: string, familyId: string) {
    const isSmtpConfigured = await emailService.checkConfigured();
    if (!isSmtpConfigured) {
      throw new Error('O sistema não possui provedor de e-mail configurado para convidar novos membros.');
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('Este email já está cadastrado no sistema.');
    }

    if (!password || password.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: 'user',
        familyId,
      },
    });

    const emailSent = await emailService.sendInviteEmail(email, password, name);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        familyId: user.familyId,
        createdAt: user.createdAt,
      },
      emailSent,
    };
  }

  /**
   * Reseta a senha de um usuário. Gera nova senha aleatória.
   * Retorna a nova senha para o admin visualizar (caso email falhe).
   */
  async resetUserPassword(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    // Gera senha aleatória segura de 10 caracteres
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let newPassword = '';
    for (let i = 0; i < 10; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Tenta enviar email com a nova senha
    const emailSent = await emailService.sendPasswordResetEmail(user.email, newPassword);

    return {
      newPassword,
      emailSent,
      userEmail: user.email,
    };
  }

  /**
   * Lista todos os usuários (sem retornar o hash da senha).
   */
  async listUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { expenses: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
      expenseCount: u._count.expenses,
    }));
  }

  /**
   * Lista os membros da família (incluindo o head).
   */
  async listFamilyMembers(effectiveFamilyId: string) {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { id: effectiveFamilyId },
          { familyId: effectiveFamilyId }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        familyId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return users;
  }

  /**
   * Remove um usuário e todas as suas despesas (cascade).
   * Não permite remover o próprio admin logado.
   */
  async deleteUser(userId: string, requesterId: string) {
    if (userId === requesterId) {
      throw new Error('Você não pode remover sua própria conta.');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    // Cascade delete está configurado no schema, remove despesas automaticamente
    await prisma.user.delete({ where: { id: userId } });

    return { success: true, deletedEmail: user.email };
  }

  /**
   * Atualiza o nome do usuário logado.
   */
  async updateProfile(userId: string, name: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name },
    });

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
    };
  }

  /**
   * Altera a senha do usuário logado (requer senha atual).
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      throw new Error('Senha atual incorreta.');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('A nova senha deve ter pelo menos 6 caracteres.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true };
  }

  /**
   * Retorna dados públicos do usuário pelo ID.
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  /**
   * Redefine a senha de um usuário através do e-mail.
   * Envia uma nova senha gerada aleatoriamente por email.
   * Requer que o SMTP esteja devidamente configurado.
   */
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('E-mail não encontrado no sistema.');
    }

    // Verifica se SMTP está configurado (DB ou env)
    const isSmtpConfigured = await emailService.checkConfigured();
    if (!isSmtpConfigured) {
      throw new Error(
        'O serviço de e-mail (SMTP) não foi configurado pelo administrador. Por favor, solicite a redefinição de senha diretamente a ele.'
      );
    }

    // Gera senha aleatória segura de 10 caracteres
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let newPassword = '';
    for (let i = 0; i < 10; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Envia email com a nova senha
    const emailSent = await emailService.sendPasswordResetEmail(user.email, newPassword);
    if (!emailSent) {
      throw new Error('Falha ao enviar e-mail. Por favor, tente novamente mais tarde.');
    }

    return { success: true, message: 'Uma nova senha temporária foi enviada para o seu e-mail.' };
  }
}

export const authService = new AuthService();
