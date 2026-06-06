/**
 * Seed de produção — Cria o usuário master inicial.
 * Executado automaticamente no deploy via docker-compose command.
 * 
 * Variáveis de ambiente necessárias:
 *   MASTER_EMAIL    (default: admin@hubfinanceiro.com)
 *   MASTER_PASSWORD (default: Mudar@123)
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.MASTER_EMAIL || 'admin@hubfinanceiro.com';
  const rawPassword = process.env.MASTER_PASSWORD || 'Mudar@123';

  // Verifica se o master já existe
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`✅ Usuário master já existe: ${email}`);
    return;
  }

  // Cria o hash da senha
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(rawPassword, salt);

  // Cria o usuário master
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Administrador',
      role: 'master',
    },
  });

  console.log(`🚀 Usuário master criado com sucesso!`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role:  ${user.role}`);
  console.log(`   ID:    ${user.id}`);
  console.log(`\n⚠️  IMPORTANTE: Altere a senha padrão após o primeiro login!`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
