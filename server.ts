import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: Date.now() });
  });

  // --- ARQUITETURA BACKEND: ENDPOINTS DE SINCRONIZAÇÃO ---

  /**
   * Middleware de Segurança Multiempresa
   * Em produção, isso verificaria um Token JWT.
   */
  const authMiddleware = (req: Request, res: Response, next: () => void) => {
    const empresaId = req.headers['x-empresa-id'];
    if (!empresaId) {
      return res.status(401).json({ error: 'empresaId é obrigatório nos headers.' });
    }
    // @ts-ignore
    req.empresaId = empresaId;
    next();
  };

  /**
   * POST /api/sync
   * Recebe dados do frontend e salva no banco central.
   * Resolução de conflitos baseada em 'atualizadoEm'.
   */
  app.post('/api/sync', authMiddleware, (req, res) => {
    // @ts-ignore
    const { empresaId } = req;
    const { entities } = req.body; // { products: [...], orders: [...] }
    
    console.log(`📥 Recebendo push de ${empresaId}`);

    // Aqui aconteceria a lógica de Upsert no banco (ex: PostgreSQL)
    // SQL Exemplo: INSERT INTO products (...) ON CONFLICT (id) DO UPDATE SET ... WHERE updated_at < excluded.updated_at
    
    res.json({ status: 'success', timestamp: Date.now() });
  });

  /**
   * GET /api/sync
   * Retorna todas as alterações ocorridas após o timestamp enviado.
   */
  app.get('/api/sync', authMiddleware, (req, res) => {
    // @ts-ignore
    const { empresaId } = req;
    const updatedAfter = parseInt(req.query.updatedAfter as string) || 0;

    console.log(`📤 Enviando pull para ${empresaId} desde ${updatedAfter}`);

    // Aqui buscaríamos no banco central:
    // SELECT * FROM products WHERE empresa_id = $1 AND updated_at > $2
    
    res.json({
      timestamp: Date.now(),
      changes: {
        products: [], // Dados vindos do banco central
        orders: [],
        users: []
      }
    });
  });

  // --- MOCK PAYMENT ENDPOINTS ---

  const payments = new Map<string, { status: string }>();

  app.post('/api/pay/mcx', (req, res) => {
    const paymentId = `pay_${Date.now()}`;
    payments.set(paymentId, { status: 'PENDING' });
    
    // Simula uma aprovação após 2 segundos
    setTimeout(() => {
      payments.set(paymentId, { status: 'SUCCESS' });
    }, 2000);

    res.json({ paymentId, status: 'PENDING' });
  });

  app.get('/api/pay/status/:id', (req, res) => {
    const { id } = req.params;
    const payment = payments.get(id);
    if (!payment) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }
    res.json(payment);
  });

  app.post('/api/pay/transfer', (req, res) => {
    const paymentId = `pay_transfer_${Date.now()}`;
    res.json({ paymentId, status: 'RECEIVED' });
  });

  // --- API 404 HANDLER ---
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `Rota API não encontrada: ${req.method} ${req.url}` });
  });

  // --- CONFIGURAÇÃO VITE (Dev vs Prod) ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SaaS Backend rodando em http://localhost:${PORT}`);
  });
}

startServer();
