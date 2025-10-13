const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const multer = require("multer");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp"); // ✅ SHARP PARA COMPRESSÃO

// Carregar variáveis de ambiente
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
  console.log("✅ Firebase inicializado com sucesso");
} catch (error) {
  console.error("❌ Erro ao inicializar Firebase:", error.message);
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

// ============ CONEXÃO MONGODB ============
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      family: 4,
    });

    console.log("✅ MongoDB conectado com sucesso");
  } catch (error) {
    console.error("❌ Erro ao conectar MongoDB:", error.message);
    process.exit(1);
  }
};

// Conectar ao banco
connectDB();

// Monitorar conexão
mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB desconectado");
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconectado");
});

// ============ MULTER ============
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB (antes da compressão)
});

// ============ CORS ============
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
        console.log(`⚠️ Origem bloqueada: ${origin}`);
        callback(null, false);
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

    // ✅ Comprimir e otimizar imagem com Sharp
    const compressedBuffer = await sharp(file.buffer)
      .resize(1200, 1200, {
        fit: "inside", // Mantém proporção
        withoutEnlargement: true, // Não aumenta imagens pequenas
      })
      .jpeg({
        quality: 85, // Qualidade ótima
        progressive: true, // Carregamento progressivo
      })
      .toBuffer();

    // Nome do arquivo único
    const fileName = `${uuidv4()}-${file.originalname
      .replace(/\s+/g, "-")
      .replace(/\.[^/.]+$/, "")}.jpg`;

    const fileUpload = bucket.file(`produtos/${fileName}`);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: "image/jpeg",
        cacheControl: "public, max-age=31536000", // Cache de 1 ano
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

// ============ ROTAS ============

// Rota raiz - Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "✅ API Erica Damas Online",
    timestamp: new Date().toISOString(),
    mongodb:
      mongoose.connection.readyState === 1 ? "Conectado" : "Desconectado",
    environment: process.env.NODE_ENV || "development",
    version: "2.0.0",
  });
});

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "API funcionando",
    mongodb: mongoose.connection.readyState === 1 ? "OK" : "ERRO",
  });
});

// Health check para Render
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    mongodb: mongoose.connection.readyState === 1,
    firebase: !!bucket,
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

      // Upload paralelo das imagens com compressão
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
  console.log(
    `📦 MongoDB: ${
      mongoose.connection.readyState === 1 ? "✅ Conectado" : "⏳ Conectando..."
    }`
  );
  console.log(`🔥 Firebase: ${bucket ? "✅ Ativo" : "❌ Inativo"}`);
  console.log(`🖼️ Sharp: ✅ Compressão ativa`);
  console.log("=".repeat(50) + "\n");
});

// Tratamento de sinais de encerramento
process.on("SIGTERM", () => {
  console.log("⚠️ SIGTERM recebido. Encerrando gracefully...");
  mongoose.connection.close(() => {
    console.log("✅ MongoDB desconectado");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("⚠️ SIGINT recebido. Encerrando gracefully...");
  mongoose.connection.close(() => {
    console.log("✅ MongoDB desconectado");
    process.exit(0);
  });
});

// ============ EXPORT (para testes) ============
module.exports = app;
