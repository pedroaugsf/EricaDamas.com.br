const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// CORS - Expandido para incluir mais origens
app.use(
  cors({
    origin: [
      "https://erica-damas-com-br-e5w2.vercel.app",
      "https://ominous-orbit-g4qq7vw57qj5c6jr-3000.app.github.dev",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());

// Definir modelo de Contrato
const contratoSchema = new mongoose.Schema({
  cliente: {
    nome: String,
    rg: String,
    cpf: String,
    nacionalidade: String,
    dataNascimento: String,
    profissao: String,
    endereco: String,
    numero: String,
    bairro: String,
    cidade: String,
    telefone: String,
    celular: String,
  },
  contrato: {
    dataVenda: String,
    dataAjuste: String,
    dataRetirada: String,
    dataEntrega: String,
    formaPagamento: String,
    itens: [
      {
        codigo: String,
        especificacao: String,
        valor: String,
      },
    ],
    parcelas: [
      {
        numero: Number,
        valor: String,
        vencimento: String,
      },
    ],
    observacoesPagamento: String,
    observacoesGerais: String,
  },
  total: Number,
  dataCriacao: { type: Date, default: Date.now },
});

const Contrato =
  mongoose.models.Contrato || mongoose.model("Contrato", contratoSchema);

// Conectar MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
  } catch (error) {}
};

// Credenciais
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ericadamas.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Eri@D4m4s!2024#Adm";
const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_padrao";

// Middleware de verificação de token
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Acesso negado" });

  try {
    const verificado = jwt.verify(token, JWT_SECRET);
    req.user = verificado;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido" });
  }
};

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    message: "API Erica Damas funcionando na Vercel",
    timestamp: new Date().toISOString(),
    environment: "production",
    endpoints: {
      public: [
        "GET /api/produtos/vestidos",
        "GET /api/produtos/ternos",
        "GET /api/produtos/debutantes",
      ],
      admin: [
        "POST /api/login",
        "GET /api/admin/verificar",
        "GET /api/admin/produtos",
        "GET /api/contratos",
        "POST /api/contratos",
        "PUT /api/contratos/:id",
        "DELETE /api/contratos/:id",
      ],
    },
  });
});

// Rota de login
app.post("/api/login", async (req, res) => {
  try {
    await connectDB();
    const { email, senha } = req.body;

    if (email === ADMIN_EMAIL && senha === ADMIN_PASSWORD) {
      const token = jwt.sign({ id: "admin", email }, JWT_SECRET, {
        expiresIn: "24h",
      });
      res.json({ success: true, token, user: { name: "Administrador" } });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Email ou senha incorretos" });
    }
  } catch (error) {
    "Erro no login:", error;
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
});

// Rota de produtos temporária
app.get("/api/produtos/:tipo", async (req, res) => {
  try {
    await connectDB();
    const { tipo } = req.params;

    if (!["vestidos", "ternos", "debutantes"].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: "Tipo inválido",
      });
    }

    res.json({
      success: true,
      produtos: [],
      total: 0,
      message: `API funcionando - ${tipo} em breve`,
    });
  } catch (error) {
    "Erro:", error;
    res.status(500).json({ success: false, message: "Erro interno" });
  }
});

// Rota de verificação de auth
app.get("/api/admin/verificar", verificarToken, (req, res) => {
  res.json({
    success: true,
    message: "Autenticado com sucesso",
    user: { email: req.user.email },
  });
});

// Rota admin produtos
app.get("/api/admin/produtos", verificarToken, (req, res) => {
  res.json({
    success: true,
    produtos: [],
    total: 0,
    message: "Admin funcionando - produtos em breve",
  });
});

// ==================== ROTAS DA API DE CONTRATOS ====================

// Buscar todos os contratos (rota protegida)
app.get("/api/contratos", verificarToken, async (req, res) => {
  try {
    await connectDB();
    const contratos = await Contrato.find().sort({ dataCriacao: -1 });

    res.json({
      success: true,
      contratos,
      total: contratos.length,
    });
  } catch (error) {
    "Erro ao buscar contratos:", error;
    res.status(500).json({
      success: false,
      message: "Erro ao buscar contratos",
      error: error.message,
    });
  }
});

// Criar novo contrato (rota protegida)
app.post("/api/contratos", verificarToken, async (req, res) => {
  try {
    await connectDB();

    const novoContrato = new Contrato(req.body);
    await novoContrato.save();

    res.status(201).json({
      success: true,
      contrato: novoContrato,
      message: "Contrato criado com sucesso",
    });
  } catch (error) {
    "❌ Erro ao criar contrato:", error;
    res.status(500).json({
      success: false,
      message: "Erro ao criar contrato",
      error: error.message,
    });
  }
});

// Atualizar contrato existente (rota protegida)
app.put("/api/contratos/:id", verificarToken, async (req, res) => {
  try {
    await connectDB();

    const { id } = req.params;

    const contrato = await Contrato.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!contrato) {
      return res.status(404).json({
        success: false,
        message: "Contrato não encontrado",
      });
    }

    res.json({
      success: true,
      contrato,
      message: "Contrato atualizado com sucesso",
    });
  } catch (error) {
    "❌ Erro ao atualizar contrato:", error;
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar contrato",
      error: error.message,
    });
  }
});

// Excluir contrato (rota protegida)
app.delete("/api/contratos/:id", verificarToken, async (req, res) => {
  try {
    await connectDB();

    const { id } = req.params;

    const contrato = await Contrato.findByIdAndDelete(id);

    if (!contrato) {
      return res.status(404).json({
        success: false,
        message: "Contrato não encontrado",
      });
    }

    res.json({
      success: true,
      message: "Contrato excluído com sucesso",
    });
  } catch (error) {
    "❌ Erro ao excluir contrato:", error;
    res.status(500).json({
      success: false,
      message: "Erro ao excluir contrato",
      error: error.message,
    });
  }
});

// Para desenvolvimento local
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {});
}

module.exports = app;
