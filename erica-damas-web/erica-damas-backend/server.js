const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const multer = require("multer");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

dotenv.config();

const app = express();

// ============ CONFIGURAÇÕES GLOBAIS ============

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ericadamas.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Eri@D4m4s!2024#Adm";
const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_padrao";

// ============ CORS OTIMIZADO ============

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

// ============ VARIÁVEIS DE ESTADO ============

let initializationPromise = null;
let dbInitialized = false;
let firebaseInitialized = false;
let bucket = null;
let Produto = null;
let Contrato = null;
let keepaliveInterval = null;

// Cache em memória
let produtosCache = {
  vestidos: { data: null, timestamp: 0, loading: false },
  ternos: { data: null, timestamp: 0, loading: false },
  debutantes: { data: null, timestamp: 0, loading: false },
};

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

// ============ HEALTH CHECK INSTANTÂNEO ============

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    initialized: {
      mongodb: dbInitialized,
      firebase: firebaseInitialized,
    },
  });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "✅ Érica Damas API Online",
    timestamp: new Date().toISOString(),
    version: "3.0.0-render-optimized",
    initialized: dbInitialized && firebaseInitialized,
  });
});

// ============ INICIALIZAÇÃO SINGLETON OTIMIZADA ============

const initializeDependencies = async () => {
  if (dbInitialized && firebaseInitialized) {
    return true;
  }

  if (initializationPromise) {
    console.log("⏳ Aguardando inicialização em andamento...");
    return initializationPromise;
  }

  initializationPromise = (async () => {
    console.log("🚀 Inicializando dependências...");
    const startTime = Date.now();

    try {
      await Promise.all([
        // MongoDB
        (async () => {
          if (dbInitialized) return;

          console.log("📊 Conectando MongoDB...");
          await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4,
            retryWrites: true,
            retryReads: true,
            maxIdleTimeMS: 600000,
            // keepAlive e keepAliveInitialDelay removidos (não suportados no Mongoose 6+)
          });

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
            clausulas: mongoose.Schema.Types.Mixed,
            total: Number,
            dataCriacao: { type: Date, default: Date.now },
          });

          Contrato = mongoose.model("Contrato", contratoSchema);

          dbInitialized = true;
          console.log("✅ MongoDB conectado");
        })(),

        // Firebase
        (async () => {
          if (firebaseInitialized) return;

          console.log("🔥 Inicializando Firebase...");
          const admin = require("firebase-admin");
          let serviceAccount;

          if (process.env.NODE_ENV === "production") {
            serviceAccount = {
              type: "service_account",
              project_id: process.env.FIREBASE_PROJECT_ID,
              private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
              private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(
                /\\n/g,
                "\n"
              ),
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
          console.log("✅ Firebase inicializado");
        })(),
      ]);

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`⚡ Inicialização completa em ${totalTime}s`);

      setTimeout(() => {
        startKeepalive();
        preloadCache();
      }, 10000);

      return true;
    } catch (error) {
      console.error("❌ Erro na inicialização:", error.message);
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
};

// ============ KEEPALIVE INTERNO ============

const startKeepalive = () => {
  if (keepaliveInterval) return;

  keepaliveInterval = setInterval(async () => {
    try {
      if (dbInitialized && mongoose.connection.readyState === 1) {
        await mongoose.connection.db.admin().ping();
        console.log("💓 MongoDB keepalive");
      }
    } catch (error) {
      console.error("❌ Keepalive error:", error.message);
    }
  }, 5 * 60 * 1000);

  console.log("✅ Keepalive ativo (5min)");
};

// ============ PRE-LOAD CACHE ============

const preloadCache = async () => {
  console.log("📦 Pre-carregando cache...");

  try {
    if (!Produto) return;

    const tipos = ["vestidos", "ternos", "debutantes"];

    for (const tipo of tipos) {
      try {
        const produtos = await Produto.find({ tipo, ativo: true })
          .sort({ createdAt: -1 })
          .limit(12)
          .lean();

        produtosCache[tipo] = {
          data: {
            produtos,
            total: produtos.length,
            cached: true,
          },
          timestamp: Date.now(),
          loading: false,
        };

        console.log(`✅ Cache: ${tipo} (${produtos.length})`);
      } catch (error) {
        console.error(`❌ Cache error ${tipo}:`, error.message);
      }
    }
  } catch (error) {
    console.error("❌ Pre-load error:", error.message);
  }
};

// ============ MIDDLEWARE ============

app.use(async (req, res, next) => {
  const skipRoutes = ["/health", "/", "/api/warmup", "/api/login"];
  if (skipRoutes.includes(req.path) || req.method === "OPTIONS") {
    return next();
  }

  if (!dbInitialized || !firebaseInitialized) {
    initializeDependencies().catch((err) =>
      console.error("❌ Init error:", err.message)
    );
  }

  next();
});

// ============ WARMUP ENDPOINT ============

app.get("/api/warmup", async (req, res) => {
  console.log("🔥 Warmup request");

  res.json({
    success: true,
    message: "Warming up...",
    status: {
      mongodb: dbInitialized,
      firebase: firebaseInitialized,
    },
  });

  if (!dbInitialized || !firebaseInitialized) {
    initializeDependencies().catch((err) =>
      console.error("❌ Warmup error:", err.message)
    );
  }
});

// ============ STATUS ENDPOINT ============

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    server: "online",
    initialized: {
      mongodb: dbInitialized,
      firebase: firebaseInitialized,
      full: dbInitialized && firebaseInitialized,
    },
    cache: {
      vestidos: !!produtosCache.vestidos.data,
      ternos: !!produtosCache.ternos.data,
      debutantes: !!produtosCache.debutantes.data,
    },
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

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

// ============ UPLOAD FIREBASE ============

const uploadImageToFirebase = async (file) => {
  if (!file || !bucket) return null;

  try {
    const originalSize = (file.size / 1024 / 1024).toFixed(2);

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
      resumable: false,
    });

    return new Promise((resolve, reject) => {
      blobStream.on("error", reject);

      blobStream.on("finish", async () => {
        try {
          await fileUpload.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/produtos/${fileName}`;
          console.log(
            `✅ Upload: ${originalSize}MB → ${(
              compressedBuffer.length /
              1024 /
              1024
            ).toFixed(2)}MB`
          );
          resolve(publicUrl);
        } catch (error) {
          reject(error);
        }
      });

      blobStream.end(compressedBuffer);
    });
  } catch (error) {
    console.error("❌ Erro no upload:", error);
    return null;
  }
};

// ============ LOGIN ============

app.post("/api/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedSenha = String(senha || "").trim();
    const adminEmail = String(ADMIN_EMAIL || "").trim().toLowerCase();
    const adminPassword = String(ADMIN_PASSWORD || "").trim();

    if (!normalizedEmail || !normalizedSenha) {
      return res.status(400).json({
        success: false,
        message: "Email e senha são obrigatórios",
      });
    }

    if (normalizedEmail === adminEmail && normalizedSenha === adminPassword) {
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

app.get("/api/admin/verificar", verificarToken, (req, res) => {
  res.json({
    success: true,
    user: { email: req.user.email },
  });
});

// ============ PRODUTOS COM CACHE INTELIGENTE ============

app.get("/api/produtos/:tipo", async (req, res) => {
  try {
    const { tipo } = req.params;

    if (!["vestidos", "ternos", "debutantes"].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: "Tipo inválido. Use: vestidos, ternos ou debutantes",
      });
    }

    // CACHE FIRST - RESPOSTA INSTANTÂNEA
    const cached = produtosCache[tipo];
    const agora = Date.now();

    if (cached.data && agora - cached.timestamp < CACHE_DURATION) {
      console.log(`⚡ Cache HIT: ${tipo}`);
      return res.json({
        success: true,
        ...cached.data,
        fromCache: true,
        cacheAge: Math.floor((agora - cached.timestamp) / 1000),
      });
    }

    // SE NÃO TEM CACHE E DB NÃO INICIALIZADO
    if (!dbInitialized) {
      console.log(`🔄 Cache MISS: ${tipo} - Inicializando...`);

      res.json({
        success: true,
        produtos: [],
        total: 0,
        loading: true,
        message: "Servidor inicializando... Tente novamente em 5 segundos.",
      });

      initializeDependencies();
      return;
    }

    // BUSCAR DO BANCO
    console.log(`🔍 Buscando ${tipo} do banco...`);

    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 12;
    const skip = (pagina - 1) * limite;

    const [total, produtos] = await Promise.all([
      Produto.countDocuments({ tipo, ativo: true }),
      Produto.find({ tipo, ativo: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limite)
        .lean(),
    ]);

    const resultado = {
      produtos,
      total,
      pagina,
      limite,
      paginas: Math.ceil(total / limite),
    };

    produtosCache[tipo] = {
      data: resultado,
      timestamp: agora,
      loading: false,
    };

    res.json({
      success: true,
      ...resultado,
      fromCache: false,
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

// Buscar todos produtos (ADMIN)
app.get("/api/admin/produtos", verificarToken, async (req, res) => {
  try {
    await initializeDependencies();

    if (!dbInitialized) {
      return res.status(503).json({
        success: false,
        message: "Banco de dados não disponível",
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
      await initializeDependencies();

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

      console.log(`📦 Criando produto: ${nome}`);

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

      produtosCache[tipo] = { data: null, timestamp: 0, loading: false };

      console.log(`✅ Produto criado: ${novoProduto._id}`);

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
      await initializeDependencies();

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
        const imageUrls = await Promise.all(
          req.files.map((file) => uploadImageToFirebase(file))
        );
        const validImageUrls = imageUrls.filter(Boolean);

        if (validImageUrls.length > 0) {
          produto.imagens = validImageUrls;
        }
      }

      await produto.save();

      produtosCache[produto.tipo] = {
        data: null,
        timestamp: 0,
        loading: false,
      };

      console.log(`✅ Produto atualizado: ${produto._id}`);

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
    await initializeDependencies();

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

    produtosCache[produto.tipo] = { data: null, timestamp: 0, loading: false };

    console.log(`🗑️ Produto excluído: ${produto._id}`);

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

// ============ CONTRATOS ============

app.get("/api/contratos", verificarToken, async (req, res) => {
  try {
    await initializeDependencies();

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

app.post("/api/contratos", verificarToken, async (req, res) => {
  try {
    await initializeDependencies();

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

app.put("/api/contratos/:id", verificarToken, async (req, res) => {
  try {
    await initializeDependencies();

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

app.delete("/api/contratos/:id", verificarToken, async (req, res) => {
  try {
    await initializeDependencies();

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

// ============ LIMPAR CACHE ============

app.post("/api/admin/limpar-cache", verificarToken, (req, res) => {
  produtosCache = {
    vestidos: { data: null, timestamp: 0, loading: false },
    ternos: { data: null, timestamp: 0, loading: false },
    debutantes: { data: null, timestamp: 0, loading: false },
  };

  console.log("🧹 Cache limpo");

  res.json({
    success: true,
    message: "Cache limpo com sucesso",
  });
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
  console.log("\n" + "=".repeat(60));
  console.log("🚀 SERVIDOR RENDER - ULTRA OTIMIZADO");
  console.log("=".repeat(60));
  console.log(`📡 Porta: ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log(`⚡ Cold Start: MINIMIZADO`);
  console.log(`💾 Cache: ATIVO (10min)`);
  console.log(`💓 Keepalive Interno: ATIVO (5min)`);
  console.log("=".repeat(60));
  console.log(`✅ Health: http://localhost:${PORT}/health`);
  console.log(`🔥 Warmup: http://localhost:${PORT}/api/warmup`);
  console.log(`📊 Status: http://localhost:${PORT}/api/status`);
  console.log("=".repeat(60) + "\n");

  setTimeout(() => {
    console.log("🔄 Background initialization...");
    initializeDependencies().catch((err) =>
      console.error("❌ Background init error:", err.message)
    );
  }, 2000);
});

// ============ GRACEFUL SHUTDOWN ============

const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️ ${signal} recebido. Encerrando...`);

  if (keepaliveInterval) {
    clearInterval(keepaliveInterval);
    console.log("✅ Keepalive parado");
  }

  if (mongoose.connection.readyState === 1) {
    try {
      await mongoose.connection.close();
      console.log("✅ MongoDB desconectado");
    } catch (error) {
      console.error("❌ Erro ao desconectar:", error);
    }
  }

  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

module.exports = app;
