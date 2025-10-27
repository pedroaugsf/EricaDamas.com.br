const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const multer = require("multer");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// ============ CONFIGURAÇÕES INICIAIS RÁPIDAS ============

// CORS primeiro (mais rápido)
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
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// Multer config
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ============ VARIÁVEIS GLOBAIS PARA LAZY LOADING ============

let dbInitialized = false;
let firebaseInitialized = false;
let bucket = null;
let Produto = null;
let Contrato = null;

// ============ HEALTH CHECK SUPER RÁPIDO ============

// Health check que responde INSTANTANEAMENTE (sem dependências)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    server: "Erica Damas API",
    coldStart: !dbInitialized,
  });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "✅ API Erica Damas Online",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "2.0.0",
    initialized: dbInitialized && firebaseInitialized,
  });
});

// ============ INICIALIZAÇÃO LAZY DAS DEPENDÊNCIAS ============

const initializeDependencies = async () => {
  if (dbInitialized && firebaseInitialized) return;

  console.log("⚡ Inicializando dependências pesadas...");

  try {
    // 1. Inicializar MongoDB
    if (!dbInitialized) {
      await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 5,
        minPoolSize: 1,
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 30000,
        family: 4,
      });

      // Carregar modelos só depois da conexão
      Produto = require("./models/Produto");

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

      Contrato = mongoose.model("Contrato", contratoSchema);

      dbInitialized = true;
      console.log("✅ MongoDB conectado (lazy)");
    }

    // 2. Inicializar Firebase
    if (!firebaseInitialized) {
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
          auth_provider_x509_cert_url:
            "https://www.googleapis.com/oauth2/v1/certs",
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
      firebaseInitialized = true;
      console.log("✅ Firebase inicializado (lazy)");
    }
  } catch (error) {
    console.error("❌ Erro na inicialização lazy:", error.message);
    // Não throw error - permite que o servidor continue funcionando
  }
};

// ============ MIDDLEWARE DE INICIALIZAÇÃO LAZY ============

app.use(async (req, res, next) => {
  // Skip para health checks e OPTIONS
  if (req.path === "/health" || req.path === "/" || req.method === "OPTIONS") {
    return next();
  }

  // Para todas as outras rotas, inicializa dependências se necessário
  if (!dbInitialized || !firebaseInitialized) {
    await initializeDependencies();
  }

  next();
});

// ============ CONFIGURAÇÕES APÓS INICIALIZAÇÃO ============

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ericadamas.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Eri@D4m4s!2024#Adm";
const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_padrao";

// ============ MIDDLEWARE DE AUTENTICAÇÃO ============

const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token não fornecido",
    });
  }

  try {
    const verificado = jwt.verify(token, JWT_SECRET);
    req.user = verificado;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token inválido ou expirado",
    });
  }
};

// ============ FUNÇÃO DE UPLOAD FIREBASE OTIMIZADA ============

const uploadImageToFirebase = async (file) => {
  if (!file || !bucket) return null;

  try {
    const originalSize = (file.size / 1024 / 1024).toFixed(2);
    console.log(`📤 Processando: ${file.originalname} (${originalSize}MB)`);

    const compressedBuffer = await sharp(file.buffer)
      .resize(1200, 1200, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 85,
        progressive: true,
      })
      .toBuffer();

    const fileName = `${uuidv4()}-${file.originalname
      .replace(/\s+/g, "-")
      .replace(/\.[^/.]+$/, "")}.jpg`;

    const fileUpload = bucket.file(`produtos/${fileName}`);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: "image/jpeg",
        cacheControl: "public, max-age=31536000",
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on("error", (error) => {
        console.error("❌ Erro no upload:", error);
        reject(error);
      });

      blobStream.on("finish", async () => {
        try {
          await fileUpload.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/produtos/${fileName}`;

          const compressedSize = (
            compressedBuffer.length /
            1024 /
            1024
          ).toFixed(2);
          console.log(
            `✅ Comprimido: ${originalSize}MB → ${compressedSize}MB | ${publicUrl}`
          );

          resolve(publicUrl);
        } catch (error) {
          console.error("❌ Erro ao tornar público:", error);
          reject(error);
        }
      });

      blobStream.end(compressedBuffer);
    });
  } catch (error) {
    console.error("❌ Erro ao processar imagem:", error);
    return null;
  }
};

// ============ ROTAS DE STATUS ============

app.get("/api/status", async (req, res) => {
  const mongodbStatus = dbInitialized && mongoose.connection.readyState === 1;
  const firebaseStatus = firebaseInitialized && !!bucket;

  res.json({
    success: true,
    dependencies: {
      mongodb: mongodbStatus,
      firebase: firebaseStatus,
      fullyInitialized: dbInitialized && firebaseInitialized,
    },
    timestamp: new Date().toISOString(),
  });
});

// ============ LOGIN ============

app.post("/api/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: "Email e senha são obrigatórios",
      });
    }

    if (email === ADMIN_EMAIL && senha === ADMIN_PASSWORD) {
      const token = jwt.sign({ id: "admin", email: ADMIN_EMAIL }, JWT_SECRET, {
        expiresIn: "24h",
      });

      return res.json({
        success: true,
        token,
        user: { name: "Administrador", email: ADMIN_EMAIL },
      });
    }

    res.status(401).json({
      success: false,
      message: "Email ou senha incorretos",
    });
  } catch (error) {
    console.error("❌ Erro no login:", error);
    res.status(500).json({
      success: false,
      message: "Erro no servidor",
    });
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
    if (!dbInitialized) {
      return res.status(503).json({
        success: false,
        message: "Serviço temporariamente indisponível",
      });
    }

    const { tipo } = req.params;
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 12;
    const skip = (pagina - 1) * limite;

    if (!["vestidos", "ternos", "debutantes"].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: "Tipo inválido. Use: vestidos, ternos ou debutantes",
      });
    }

    const [total, produtos] = await Promise.all([
      Produto.countDocuments({ tipo, ativo: true }),
      Produto.find({ tipo, ativo: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limite)
        .lean(),
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
    console.error("❌ Erro ao buscar produtos:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar produtos",
      error: error.message,
    });
  }
});

// Buscar todos os produtos (ADMIN)
app.get("/api/admin/produtos", verificarToken, async (req, res) => {
  try {
    if (!dbInitialized) {
      return res.status(503).json({
        success: false,
        message: "Serviço temporariamente indisponível",
      });
    }

    const produtos = await Produto.find().sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      produtos,
      total: produtos.length,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar produtos:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar produtos",
      error: error.message,
    });
  }
});

// Criar produto
app.post(
  "/api/produtos",
  verificarToken,
  upload.array("imagens", 5),
  async (req, res) => {
    try {
      if (!dbInitialized || !firebaseInitialized) {
        return res.status(503).json({
          success: false,
          message: "Serviço temporariamente indisponível",
        });
      }

      const { nome, descricao, tipo } = req.body;

      if (!nome || !descricao || !tipo) {
        return res.status(400).json({
          success: false,
          message: "Nome, descrição e tipo são obrigatórios",
        });
      }

      if (!["vestidos", "ternos", "debutantes"].includes(tipo)) {
        return res.status(400).json({
          success: false,
          message: "Tipo inválido",
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Pelo menos uma imagem é obrigatória",
        });
      }

      console.log(`📦 Criando produto: ${nome} (${req.files.length} imagens)`);

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

      console.log(
        `✅ Produto criado: ${novoProduto.nome} (ID: ${novoProduto._id})`
      );

      res.status(201).json({
        success: true,
        produto: novoProduto,
        message: "Produto criado com sucesso",
      });
    } catch (error) {
      console.error("❌ Erro ao criar produto:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao criar produto",
        error: error.message,
      });
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
      if (!dbInitialized || !firebaseInitialized) {
        return res.status(503).json({
          success: false,
          message: "Serviço temporariamente indisponível",
        });
      }

      const { id } = req.params;
      const { nome, descricao } = req.body;

      const produto = await Produto.findById(id);

      if (!produto) {
        return res.status(404).json({
          success: false,
          message: "Produto não encontrado",
        });
      }

      if (nome?.trim()) produto.nome = nome.trim();
      if (descricao?.trim()) produto.descricao = descricao.trim();

      if (req.files && req.files.length > 0) {
        console.log(
          `📦 Atualizando produto: ${produto.nome} (${req.files.length} novas imagens)`
        );

        const imageUrls = await Promise.all(
          req.files.map((file) => uploadImageToFirebase(file))
        );
        const validImageUrls = imageUrls.filter(Boolean);

        if (validImageUrls.length > 0) {
          produto.imagens = validImageUrls;
        }
      }

      await produto.save();

      console.log(
        `✅ Produto atualizado: ${produto.nome} (ID: ${produto._id})`
      );

      res.json({
        success: true,
        produto,
        message: "Produto atualizado com sucesso",
      });
    } catch (error) {
      console.error("❌ Erro ao atualizar produto:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao atualizar produto",
        error: error.message,
      });
    }
  }
);

// Excluir produto
app.delete("/api/produtos/:id", verificarToken, async (req, res) => {
  try {
    if (!dbInitialized) {
      return res.status(503).json({
        success: false,
        message: "Serviço temporariamente indisponível",
      });
    }

    const { id } = req.params;

    const produto = await Produto.findByIdAndDelete(id);

    if (!produto) {
      return res.status(404).json({
        success: false,
        message: "Produto não encontrado",
      });
    }

    console.log(`🗑️ Produto excluído: ${produto.nome} (ID: ${produto._id})`);

    res.json({
      success: true,
      message: "Produto excluído com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro ao excluir produto:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao excluir produto",
      error: error.message,
    });
  }
});

// ============ ROTAS DE CONTRATOS ============

// Buscar contratos
app.get("/api/contratos", verificarToken, async (req, res) => {
  try {
    if (!dbInitialized) {
      return res.status(503).json({
        success: false,
        message: "Serviço temporariamente indisponível",
      });
    }

    const contratos = await Contrato.find().sort({ dataCriacao: -1 }).lean();

    res.json({
      success: true,
      contratos,
      total: contratos.length,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar contratos:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar contratos",
      error: error.message,
    });
  }
});

// Criar contrato
app.post("/api/contratos", verificarToken, async (req, res) => {
  try {
    if (!dbInitialized) {
      return res.status(503).json({
        success: false,
        message: "Serviço temporariamente indisponível",
      });
    }

    const novoContrato = new Contrato(req.body);
    await novoContrato.save();

    console.log(`✅ Contrato criado: ${novoContrato._id}`);

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

// Atualizar contrato
app.put("/api/contratos/:id", verificarToken, async (req, res) => {
  try {
    if (!dbInitialized) {
      return res.status(503).json({
        success: false,
        message: "Serviço temporariamente indisponível",
      });
    }

    const { id } = req.params;

    const contrato = await Contrato.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!contrato) {
      return res.status(404).json({
        success: false,
        message: "Contrato não encontrado",
      });
    }

    console.log(`✅ Contrato atualizado: ${contrato._id}`);

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

// Excluir contrato
app.delete("/api/contratos/:id", verificarToken, async (req, res) => {
  try {
    if (!dbInitialized) {
      return res.status(503).json({
        success: false,
        message: "Serviço temporariamente indisponível",
      });
    }

    const { id } = req.params;

    const contrato = await Contrato.findByIdAndDelete(id);

    if (!contrato) {
      return res.status(404).json({
        success: false,
        message: "Contrato não encontrado",
      });
    }

    console.log(`🗑️ Contrato excluído: ${contrato._id}`);

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

// ============ TRATAMENTO DE ERROS ============

app.use((error, req, res, next) => {
  console.error("❌ Erro não tratado:", error);
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Erro interno do servidor"
        : error.message,
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
    path: req.path,
  });
});

// ============ INICIAR SERVIDOR ============

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("\n" + "=".repeat(50));
  console.log("🚀 SERVIDOR INICIADO COM SUCESSO!");
  console.log("=".repeat(50));
  console.log(`📡 Porta: ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log(`⚡ Modo: Lazy Loading Ativo`);
  console.log(`✅ Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 Status: http://localhost:${PORT}/api/status`);
  console.log("=".repeat(50) + "\n");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("⚠️ SIGTERM recebido. Encerrando gracefully...");
  if (mongoose.connection.readyState === 1) {
    mongoose.connection.close(() => {
      console.log("✅ MongoDB desconectado");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on("SIGINT", () => {
  console.log("⚠️ SIGINT recebido. Encerrando gracefully...");
  if (mongoose.connection.readyState === 1) {
    mongoose.connection.close(() => {
      console.log("✅ MongoDB desconectado");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

module.exports = app;
