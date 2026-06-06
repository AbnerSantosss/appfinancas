import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';

import authRoutes from './routes/auth.routes';
import expenseRoutes from './routes/expense.routes';
import settingsRoutes from './routes/settings.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middlewares Globais ────────────────────────────────

// CORS — aceita origens configuradas ou qualquer (dev)
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim())
  : ['*'];

app.use(
  cors({
    origin: corsOrigins.includes('*') ? true : corsOrigins,
    credentials: true,
  })
);

// Parse JSON body (limite de 10mb para uploads futuros)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir arquivos de upload estáticos
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Rotas da API ───────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '5.0.0',
  });
});

// ─── Inicialização ──────────────────────────────────────

app.listen(PORT, () => {
  console.log('');
  console.log('══════════════════════════════════════════');
  console.log('  🚀 HUB FINANCEIRO API');
  console.log(`  📡 Rodando na porta ${PORT}`);
  console.log(`  🌍 CORS: ${corsOrigins.join(', ')}`);
  console.log(`  🕐 ${new Date().toLocaleString('pt-BR')}`);
  console.log('══════════════════════════════════════════');
  console.log('');
});

export default app;
