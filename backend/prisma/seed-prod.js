/**
 * Seed de produção — Cria os usuários iniciais do sistema.
 * Executado automaticamente no deploy via docker-compose command.
 * 
 * Variáveis de ambiente:
 *   MASTER_EMAIL    (default: admin@hubfinanceiro.com)
 *   MASTER_PASSWORD (default: Mudar@123)
 *   USER_EMAIL      (opcional — cria um segundo usuário comum)
 *   USER_PASSWORD   (default: Mudar@123)
 *   USER_NAME       (default: Usuário)
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Cria ou atualiza um usuário no banco de dados.
 * Se o e-mail já existir, atualiza a role e a senha.
 */
async function upsertUser(email, rawPassword, name, role) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(rawPassword, salt);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    // Atualiza role e senha caso o usuário já exista
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, role, name },
    });
    console.log(`🔄 Usuário atualizado: ${email} (role: ${role})`);
    return;
  }

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name, role },
  });

  console.log(`🚀 Usuário criado: ${user.email} (role: ${role})`);
}

async function main() {
  // ─── 1. Usuário Master ────────────────────────────────
  const masterEmail = process.env.MASTER_EMAIL || 'admin@hubfinanceiro.com';
  const masterPassword = process.env.MASTER_PASSWORD || 'Mudar@123';
  const masterName = process.env.MASTER_NAME || 'Administrador';

  await upsertUser(masterEmail, masterPassword, masterName, 'master');

  // ─── 2. Usuário Comum (opcional) ──────────────────────
  const userEmail = process.env.USER_EMAIL;
  if (userEmail) {
    const userPassword = process.env.USER_PASSWORD || 'Mudar@123';
    const userName = process.env.USER_NAME || 'Usuário';
    await upsertUser(userEmail, userPassword, userName, 'user');
  }

  console.log('\n✅ Seed de produção finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
