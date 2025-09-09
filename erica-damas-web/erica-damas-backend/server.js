const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const multer = require("multer");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const http = require("http");
const { Server } = require("socket.io");

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configuração do Firebase (ajustada para Vercel)
let bucket;
try {
  const admin = require("firebase-admin");

  let serviceAccount;

  // Para produção (Vercel), usar variáveis de ambiente
  if (process.env.NODE_ENV === "production") {
    serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };
  } else {
    // Para desenvolvimento local, usar arquivo JSON
    serviceAccount = require("./firebase-key.json");
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }

  bucket = admin.storage().bucket();
} catch (error) {}

// Importar modelo do Produto
const Produto = require("./models/Produto");

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

const Contrato = mongoose.model("Contrato", contratoSchema);

// Conectar ao MongoDB (otimizado para Vercel)
const connectDB = async () => {
  // Se já conectado, não reconectar
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
  } catch (error) {
    // Na Vercel, não fazer exit, apenas logar o erro
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  }
};

// Conectar ao banco
connectDB();

// Configuração do multer para armazenar arquivos na memória
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
});

// ✅ Lista de origens permitidas ATUALIZADA
const allowedOrigins = [
  // Produção
  "https://erica-damas-com-br-e5w2.vercel.app",
  "https://erica-damas-com-br-e5w2-git-main-pedros-projects-f4fedec9.vercel.app",

  // ✅ NOVO DOMÍNIO ADICIONADO:
  "https://www.ericadamas.com",
  "https://ericadamas.com",

  // Desenvolvimento
  "http://localhost:3000",
  "http://localhost:5000",
  // Codespaces
  "https://ominous-orbit-g4qq7vw57qj5c6jr-3000.app.github.dev",
  "https://ominous-orbit-g4qq7vw57qj5c6jr-5000.app.github.dev",
];

// Configuração CORS (mais permissiva para Render)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Bloqueado pelo CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false,
  })
);

// Configuração do WebSocket
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: "/ws",
});

// Middleware adicional para CORS (IMPORTANTE!)
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization,X-Requested-With"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Middleware para parsing JSON
app.use(express.json());

// Credenciais do .env
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ericadamas.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Eri@D4m4s!2024#Adm";
const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_padrao";

// Rota de login
app.post("/api/login", async (req, res) => {
  try {
    // Garantir conexão com MongoDB
    await connectDB();

    const { email, senha } = req.body;

    if (email === ADMIN_EMAIL && senha === ADMIN_PASSWORD) {
      const token = jwt.sign({ id: "admin", email: ADMIN_EMAIL }, JWT_SECRET, {
        expiresIn: "24h",
      });

      res.json({
        success: true,
        token,
        user: { name: "Administrador" },
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Email ou senha incorretos",
      });
    }
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// Middleware para verificar autenticação
const verificarToken = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Acesso negado" });
  }

  try {
    const verificado = jwt.verify(token, JWT_SECRET);
    req.user = verificado;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido" });
  }
};

// Função para fazer upload de imagem para o Firebase Storage
const uploadImageToFirebase = async (file) => {
  try {
    if (!file || !bucket) return null;

    const fileName = `${uuidv4()}-${file.originalname.replace(/\s+/g, "-")}`;
    const fileUpload = bucket.file(`produtos/${fileName}`);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on("error", (error) => {
        reject(error);
      });

      blobStream.on("finish", async () => {
        try {
          await fileUpload.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/produtos/${fileName}`;
          resolve(publicUrl);
        } catch (error) {
          reject(error);
        }
      });

      blobStream.end(file.buffer);
    });
  } catch (error) {
    console.error("Erro no upload para Firebase:", error);
    return null;
  }
};

// ==================== ROTAS DA API DE PRODUTOS ====================

// Buscar produtos por tipo (rota pública)
app.get("/api/produtos/:tipo", async (req, res) => {
  try {
    // Garantir conexão com MongoDB
    await connectDB();

    const { tipo } = req.params;
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 12;
    const skip = (pagina - 1) * limite;

    if (!["vestidos", "ternos", "debutantes"].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message:
          "Tipo de produto inválido. Use 'vestidos', 'ternos' ou 'debutantes'",
      });
    }

    // Buscar total de produtos para paginação
    const total = await Produto.countDocuments({
      tipo,
      ativo: true,
    });

    // Buscar produtos com paginação
    const produtos = await Produto.find({
      tipo,
      ativo: true,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limite);

    res.json({
      success: true,
      produtos,
      total,
      pagina,
      limite,
      paginas: Math.ceil(total / limite),
    });
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// Criar produto (rota protegida)
app.post(
  "/api/produtos",
  verificarToken,
  upload.array("imagens", 5),
  async (req, res) => {
    try {
      // Garantir conexão com MongoDB
      await connectDB();

      const { nome, descricao, tipo } = req.body;

      // Validações
      if (!nome || !descricao || !tipo) {
        return res.status(400).json({
          success: false,
          message: "Nome, descrição e tipo são obrigatórios",
        });
      }

      if (!["vestidos", "ternos", "debutantes"].includes(tipo)) {
        return res.status(400).json({
          success: false,
          message: "Tipo deve ser 'vestidos', 'ternos' ou 'debutantes'",
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Pelo menos uma imagem é obrigatória",
        });
      }

      // Upload das imagens para Firebase
      const uploadPromises = req.files.map((file) =>
        uploadImageToFirebase(file)
      );
      const imageUrls = await Promise.all(uploadPromises);

      const validImageUrls = imageUrls.filter((url) => url !== null);

      if (validImageUrls.length === 0) {
        return res.status(500).json({
          success: false,
          message: "Erro ao fazer upload das imagens",
        });
      }

      // Salvar produto no banco
      const novoProduto = new Produto({
        nome: nome.trim(),
        descricao: descricao.trim(),
        tipo,
        imagens: validImageUrls,
      });

      await novoProduto.save();

      let mensagem;
      if (tipo === "vestidos") {
        mensagem = "Vestido criado com sucesso";
      } else if (tipo === "ternos") {
        mensagem = "Terno criado com sucesso";
      } else if (tipo === "debutantes") {
        mensagem = "Vestido de debutante criado com sucesso";
      } else {
        mensagem = "Produto criado com sucesso";
      }

      // Notificar clientes via WebSocket
      io.emit("atualizacaoProdutos", {
        tipo: "novo",
        produto: novoProduto,
      });

      res.status(201).json({
        success: true,
        produto: novoProduto,
        message: mensagem,
      });
    } catch (error) {
      console.error("❌ Erro ao criar produto:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  }
);

// Atualizar produto (rota protegida)
app.put(
  "/api/produtos/:id",
  verificarToken,
  upload.array("imagens", 5),
  async (req, res) => {
    try {
      // Garantir conexão com MongoDB
      await connectDB();

      const { id } = req.params;
      const { nome, descricao } = req.body;

      const produto = await Produto.findById(id);

      if (!produto) {
        return res.status(404).json({
          success: false,
          message: "Produto não encontrado",
        });
      }

      // Atualizar dados básicos
      if (nome && nome.trim()) produto.nome = nome.trim();
      if (descricao && descricao.trim()) produto.descricao = descricao.trim();

      // Se há novas imagens, fazer upload e substituir
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map((file) =>
          uploadImageToFirebase(file)
        );
        const imageUrls = await Promise.all(uploadPromises);

        const validImageUrls = imageUrls.filter((url) => url !== null);

        if (validImageUrls.length > 0) {
          produto.imagens = validImageUrls;
        }
      }

      await produto.save();

      // Notificar clientes via WebSocket
      io.emit("atualizacaoProdutos", {
        tipo: "atualizacao",
        produto: produto,
      });

      res.json({
        success: true,
        produto,
        message: "Produto atualizado com sucesso",
      });
    } catch (error) {
      console.error("❌ Erro ao atualizar produto:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  }
);

// Excluir produto (rota protegida)
app.delete("/api/produtos/:id", verificarToken, async (req, res) => {
  try {
    // Garantir conexão com MongoDB
    await connectDB();

    const { id } = req.params;

    const produto = await Produto.findById(id);

    if (!produto) {
      return res.status(404).json({
        success: false,
        message: "Produto não encontrado",
      });
    }

    await Produto.findByIdAndDelete(id);

    // Notificar clientes via WebSocket
    io.emit("atualizacaoProdutos", {
      tipo: "exclusao",
      id: id,
    });

    res.json({
      success: true,
      message: "Produto excluído com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro ao excluir produto:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// Buscar todos os produtos (rota protegida para admin)
app.get("/api/admin/produtos", verificarToken, async (req, res) => {
  try {
    // Garantir conexão com MongoDB
    await connectDB();

    const produtos = await Produto.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      produtos,
      total: produtos.length,
    });
  } catch (error) {
    console.error("Erro ao buscar produtos para admin:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// Rota protegida para verificar autenticação
app.get("/api/admin/verificar", verificarToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Autenticado com sucesso",
      user: { email: req.user.email },
    });
  } catch (error) {
    console.error("Erro na verificação:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// ==================== ROTAS DA API DE CONTRATOS ====================

// Buscar todos os contratos (rota protegida)
app.get("/api/contratos", verificarToken, async (req, res) => {
  try {
    // Garantir conexão com MongoDB
    await connectDB();

    const contratos = await Contrato.find().sort({ dataCriacao: -1 });

    res.json({
      success: true,
      contratos,
      total: contratos.length,
    });
  } catch (error) {
    console.error("Erro ao buscar contratos:", error);
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
    // Garantir conexão com MongoDB
    await connectDB();

    const novoContrato = new Contrato(req.body);
    await novoContrato.save();

    // Notificar clientes via WebSocket
    io.emit("atualizacaoContratos", {
      tipo: "novo",
      contrato: novoContrato,
    });

    res.status(201).json({
      success: true,
      contrato: novoContrato,
      message: "Contrato criado com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro ao criar contrato:", error);
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
    // Garantir conexão com MongoDB
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

    // Notificar clientes via WebSocket
    io.emit("atualizacaoContratos", {
      tipo: "atualizacao",
      contrato: contrato,
    });

    res.json({
      success: true,
      contrato,
      message: "Contrato atualizado com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar contrato:", error);
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
    // Garantir conexão com MongoDB
    await connectDB();

    const { id } = req.params;

    const contrato = await Contrato.findByIdAndDelete(id);

    if (!contrato) {
      return res.status(404).json({
        success: false,
        message: "Contrato não encontrado",
      });
    }

    // Notificar clientes via WebSocket
    io.emit("atualizacaoContratos", {
      tipo: "exclusao",
      id: id,
    });

    res.json({
      success: true,
      message: "Contrato excluído com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro ao excluir contrato:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao excluir contrato",
      error: error.message,
    });
  }
});

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    message: "API Erica Damas está funcionando",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
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
        "POST /api/produtos",
        "PUT /api/produtos/:id",
        "DELETE /api/produtos/:id",
        "GET /api/contratos",
        "POST /api/contratos",
        "PUT /api/contratos/:id",
        "DELETE /api/contratos/:id",
      ],
    },
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "API Erica Damas está funcionando",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// WebSocket handlers
io.on("connection", (socket) => {
  socket.on("disconnect", () => {});

  // Eventos para contratos
  socket.on("novoContrato", async (data) => {
    try {
      const contrato = await Contrato.findById(data.id);
      if (contrato) {
        io.emit("atualizacaoContratos", {
          tipo: "novo",
          contrato: contrato,
        });
      }
    } catch (error) {
      console.error("Erro ao processar novoContrato:", error);
    }
  });

  socket.on("atualizacaoContrato", async (data) => {
    try {
      const contrato = await Contrato.findById(data.id);
      if (contrato) {
        io.emit("atualizacaoContratos", {
          tipo: "atualizacao",
          contrato: contrato,
        });
      }
    } catch (error) {
      console.error("Erro ao processar atualizacaoContrato:", error);
    }
  });

  socket.on("exclusaoContrato", (id) => {
    io.emit("atualizacaoContratos", {
      tipo: "exclusao",
      id: id,
    });
  });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error("Erro não tratado:", error);
  res.status(500).json({
    success: false,
    message: "Erro interno do servidor",
    error:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : error.message,
  });
});

// Para desenvolvimento local
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, "0.0.0.0", () => {});
}

// Export para Vercel (OBRIGATÓRIO!)
module.exports = app;
