const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const multer = require("multer");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

dotenv.config();

const app = express();

// ============ CONFIGURAÇÃO DO FIREBASE ============
let bucket;
try {
  const admin = require("firebase-admin");
  let serviceAccount;

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
    serviceAccount = require("./firebase-key.json");
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }

  bucket = admin.storage().bucket();
} catch (error) {
  console.error("Erro ao inicializar Firebase:", error.message);
}

// ============ MODELOS ============
const Produto = require("./models/Produto");

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

// ============ CONEXÃO MONGODB OTIMIZADA ============
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 30000, // ✅ Aumentado de 5s para 30s
      socketTimeoutMS: 60000, // ✅ Aumentado para 60s
      family: 4, // ✅ Forçar IPv4
      bufferCommands: false,
    });

    cachedConnection = connection;
    console.log("✅ MongoDB conectado");
    return connection;
  } catch (error) {
    console.error("❌ Erro ao conectar MongoDB:", error.message);
    throw error;
  }
};

// ✅ Conectar uma vez no início
connectDB().catch(console.error);

// ============ MULTER ============
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ============ CORS SIMPLIFICADO ============
const allowedOrigins = [
  "https://erica-damas-com-br-e5w2.vercel.app",
  "https://erica-damas-com-br-e5w2-git-main-pedros-projects-f4fedec9.vercel.app",
  "https://www.ericadamas.com",
  "https://ericadamas.com",
  "http://localhost:3000",
  "http://localhost:5000",
  "https://ominous-orbit-g4qq7vw57qj5c6jr-3000.app.github.dev",
  "https://ominous-orbit-g4qq7vw57qj5c6jr-5000.app.github.dev",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false); // ✅ Não bloquear com erro, apenas negar
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// ============ CREDENCIAIS ============
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ericadamas.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Eri@D4m4s!2024#Adm";
const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_padrao";

// ============ MIDDLEWARE DE AUTENTICAÇÃO ============
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  try {
    const verificado = jwt.verify(token, JWT_SECRET);
    req.user = verificado;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido ou expirado" });
  }
};

// ============ FUNÇÃO DE UPLOAD ============
const uploadImageToFirebase = async (file) => {
  if (!file || !bucket) return null;

  const fileName = `${uuidv4()}-${file.originalname.replace(/\s+/g, "-")}`;
  const fileUpload = bucket.file(`produtos/${fileName}`);

  const blobStream = fileUpload.createWriteStream({
    metadata: { contentType: file.mimetype },
  });

  return new Promise((resolve, reject) => {
    blobStream.on("error", reject);
    blobStream.on("finish", async () => {
      try {
        await fileUpload.makePublic();
        resolve(
          `https://storage.googleapis.com/${bucket.name}/produtos/${fileName}`
        );
      } catch (error) {
        reject(error);
      }
    });
    blobStream.end(file.buffer);
  });
};

// ============ ROTAS ============

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    message: "✅ API Erica Damas Online",
    timestamp: new Date().toISOString(),
    mongodb:
      mongoose.connection.readyState === 1 ? "Conectado" : "Desconectado",
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "API funcionando",
    mongodb: mongoose.connection.readyState === 1 ? "OK" : "ERRO",
  });
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (email === ADMIN_EMAIL && senha === ADMIN_PASSWORD) {
      const token = jwt.sign({ id: "admin", email: ADMIN_EMAIL }, JWT_SECRET, {
        expiresIn: "24h",
      });

      return res.json({
        success: true,
        token,
        user: { name: "Administrador" },
      });
    }

    res.status(401).json({
      success: false,
      message: "Email ou senha incorretos",
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ success: false, message: "Erro no servidor" });
  }
});

// Verificar autenticação
app.get("/api/admin/verificar", verificarToken, (req, res) => {
  res.json({
    success: true,
    user: { email: req.user.email },
  });
});

// ============ ROTAS DE PRODUTOS ============

// Buscar produtos por tipo (PÚBLICA)
app.get("/api/produtos/:tipo", async (req, res) => {
  try {
    const { tipo } = req.params;
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 12;
    const skip = (pagina - 1) * limite;

    if (!["vestidos", "ternos", "debutantes"].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: "Tipo inválido",
      });
    }

    const [total, produtos] = await Promise.all([
      Produto.countDocuments({ tipo, ativo: true }),
      Produto.find({ tipo, ativo: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limite)
        .lean(), // ✅ Mais rápido
    ]);

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
    res.status(500).json({ success: false, message: error.message });
  }
});

// Buscar todos os produtos (ADMIN)
app.get("/api/admin/produtos", verificarToken, async (req, res) => {
  try {
    const produtos = await Produto.find().sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      produtos,
      total: produtos.length,
    });
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Criar produto
app.post(
  "/api/produtos",
  verificarToken,
  upload.array("imagens", 5),
  async (req, res) => {
    try {
      const { nome, descricao, tipo } = req.body;

      if (!nome || !descricao || !tipo) {
        return res
          .status(400)
          .json({ success: false, message: "Campos obrigatórios faltando" });
      }

      if (!["vestidos", "ternos", "debutantes"].includes(tipo)) {
        return res
          .status(400)
          .json({ success: false, message: "Tipo inválido" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Pelo menos uma imagem é obrigatória",
        });
      }

      // Upload paralelo das imagens
      const imageUrls = await Promise.all(
        req.files.map((file) => uploadImageToFirebase(file))
      );

      const validImageUrls = imageUrls.filter(Boolean);

      if (validImageUrls.length === 0) {
        return res.status(500).json({
          success: false,
          message: "Erro ao fazer upload das imagens",
        });
      }

      const novoProduto = new Produto({
        nome: nome.trim(),
        descricao: descricao.trim(),
        tipo,
        imagens: validImageUrls,
      });

      await novoProduto.save();

      res.status(201).json({
        success: true,
        produto: novoProduto,
        message: "Produto criado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Atualizar produto
app.put(
  "/api/produtos/:id",
  verificarToken,
  upload.array("imagens", 5),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, descricao } = req.body;

      const produto = await Produto.findById(id);

      if (!produto) {
        return res
          .status(404)
          .json({ success: false, message: "Produto não encontrado" });
      }

      if (nome?.trim()) produto.nome = nome.trim();
      if (descricao?.trim()) produto.descricao = descricao.trim();

      if (req.files && req.files.length > 0) {
        const imageUrls = await Promise.all(
          req.files.map((file) => uploadImageToFirebase(file))
        );
        const validImageUrls = imageUrls.filter(Boolean);

        if (validImageUrls.length > 0) {
          produto.imagens = validImageUrls;
        }
      }

      await produto.save();

      res.json({
        success: true,
        produto,
        message: "Produto atualizado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Excluir produto
app.delete("/api/produtos/:id", verificarToken, async (req, res) => {
  try {
    const { id } = req.params;

    const produto = await Produto.findByIdAndDelete(id);

    if (!produto) {
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado" });
    }

    res.json({
      success: true,
      message: "Produto excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ROTAS DE CONTRATOS ============

// Buscar contratos
app.get("/api/contratos", verificarToken, async (req, res) => {
  try {
    const contratos = await Contrato.find().sort({ dataCriacao: -1 }).lean();

    res.json({
      success: true,
      contratos,
      total: contratos.length,
    });
  } catch (error) {
    console.error("Erro ao buscar contratos:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Criar contrato
app.post("/api/contratos", verificarToken, async (req, res) => {
  try {
    const novoContrato = new Contrato(req.body);
    await novoContrato.save();

    res.status(201).json({
      success: true,
      contrato: novoContrato,
      message: "Contrato criado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao criar contrato:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Atualizar contrato
app.put("/api/contratos/:id", verificarToken, async (req, res) => {
  try {
    const { id } = req.params;

    const contrato = await Contrato.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!contrato) {
      return res
        .status(404)
        .json({ success: false, message: "Contrato não encontrado" });
    }

    res.json({
      success: true,
      contrato,
      message: "Contrato atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar contrato:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Excluir contrato
app.delete("/api/contratos/:id", verificarToken, async (req, res) => {
  try {
    const { id } = req.params;

    const contrato = await Contrato.findByIdAndDelete(id);

    if (!contrato) {
      return res
        .status(404)
        .json({ success: false, message: "Contrato não encontrado" });
    }

    res.json({
      success: true,
      message: "Contrato excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir contrato:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ TRATAMENTO DE ERROS ============
app.use((error, req, res, next) => {
  console.error("Erro não tratado:", error);
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production" ? "Erro interno" : error.message,
  });
});

// ============ EXPORT ============
module.exports = app;
