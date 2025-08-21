const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const multer = require("multer");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

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
  console.log("Firebase bucket configurado:", bucket.name);
} catch (error) {
  console.error("Erro ao configurar Firebase:", error);
}

// Importar modelo do Produto
const Produto = require("./models/Produto");

// Conectar ao MongoDB (otimizado para Vercel)
const connectDB = async () => {
  // Se já conectado, não reconectar
  if (mongoose.connection.readyState === 1) {
    console.log("✅ MongoDB já conectado!");
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
    console.log("✅ MongoDB conectado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error);
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

// Configuração CORS (mais permissiva para Render)
app.use(
  cors({
    origin: [
      // Produção
      "https://erica-damas-com-br-e5w2.vercel.app",
      "https://erica-damas-com-br-e5w2-git-main-pedros-projects-f4fedec9.vercel.app",
      // Desenvolvimento
      "http://localhost:3000",
      "http://localhost:5000",
      // Codespaces
      "https://ominous-orbit-g4qq7vw57qj5c6jr-3000.app.github.dev",
      "https://ominous-orbit-g4qq7vw57qj5c6jr-5000.app.github.dev",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false,
  })
);

// Middleware adicional para CORS (IMPORTANTE!)
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Lista de origens permitidas
  const allowedOrigins = [
    "https://erica-damas-com-br-e5w2.vercel.app",
    "https://erica-damas-com-br-e5w2-git-main-pedros-projects-f4fedec9.vercel.app",
    "http://localhost:3000",
    "http://localhost:5000",
    "https://ominous-orbit-g4qq7vw57qj5c6jr-3000.app.github.dev",
    "https://ominous-orbit-g4qq7vw57qj5c6jr-5000.app.github.dev",
  ];

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

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log("Origin:", req.headers.origin);
  next();
});

// Middleware para parsing JSON
app.use(express.json());

// Credenciais do .env
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ericadamas.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Eri@D4m4s!2024#Adm";
const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_padrao";

console.log("Credenciais configuradas:");
console.log("- Email:", ADMIN_EMAIL);
console.log("- Senha está definida:", !!ADMIN_PASSWORD);
console.log("- JWT_SECRET está definido:", !!JWT_SECRET);
console.log("- Ambiente:", process.env.NODE_ENV || "development");

// Rota de login
app.post("/api/login", async (req, res) => {
  try {
    // Garantir conexão com MongoDB
    await connectDB();

    console.log("Tentativa de login:", req.body);
    const { email, senha } = req.body;

    if (email === ADMIN_EMAIL && senha === ADMIN_PASSWORD) {
      const token = jwt.sign({ id: "admin", email: ADMIN_EMAIL }, JWT_SECRET, {
        expiresIn: "24h",
      });

      console.log("Login bem-sucedido para:", email);
      res.json({
        success: true,
        token,
        user: { name: "Administrador" },
      });
    } else {
      console.log("Login falhou para:", email);
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
  console.log("Verificando token:", token ? "Token fornecido" : "Sem token");

  if (!token) {
    return res.status(401).json({ message: "Acesso negado" });
  }

  try {
    const verificado = jwt.verify(token, JWT_SECRET);
    req.user = verificado;
    console.log("Token válido para:", verificado.email);
    next();
  } catch (error) {
    console.log("Token inválido:", error.message);
    res.status(401).json({ message: "Token inválido" });
  }
};

// Função para fazer upload de imagem para o Firebase Storage
const uploadImageToFirebase = async (file) => {
  try {
    if (!file || !bucket) return null;

    const fileName = `${uuidv4()}-${file.originalname.replace(/\s+/g, "-")}`;

    console.log("Iniciando upload para Firebase...");
    console.log("Nome do arquivo:", fileName);
    console.log("Tipo do arquivo:", file.mimetype);
    console.log("Tamanho do arquivo:", file.size);

    const fileUpload = bucket.file(`produtos/${fileName}`);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on("error", (error) => {
        console.error("Erro no upload:", error);
        reject(error);
      });

      blobStream.on("finish", async () => {
        try {
          console.log("Upload concluído, tornando arquivo público...");

          await fileUpload.makePublic();

          const publicUrl = `https://storage.googleapis.com/${bucket.name}/produtos/${fileName}`;

          console.log("URL pública gerada:", publicUrl);
          resolve(publicUrl);
        } catch (error) {
          console.error("Erro ao tornar arquivo público:", error);
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

    console.log(`Buscando produtos do tipo: ${tipo}`);

    // MODIFICADO: Incluído "debutantes" na lista de tipos válidos
    if (!["vestidos", "ternos", "debutantes"].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message:
          "Tipo de produto inválido. Use 'vestidos', 'ternos' ou 'debutantes'",
      });
    }

    const produtos = await Produto.find({
      tipo,
      ativo: true,
    }).sort({ createdAt: -1 });

    console.log(`✅ ${produtos.length} produtos encontrados do tipo ${tipo}`);

    res.json({
      success: true,
      produtos,
      total: produtos.length,
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

      console.log("=== CRIANDO NOVO PRODUTO ===");
      console.log("Dados recebidos:", { nome, descricao, tipo });
      console.log("Número de imagens:", req.files ? req.files.length : 0);

      // Validações
      if (!nome || !descricao || !tipo) {
        return res.status(400).json({
          success: false,
          message: "Nome, descrição e tipo são obrigatórios",
        });
      }

      // MODIFICADO: Incluído "debutantes" na lista de tipos válidos
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

      console.log("Fazendo upload das imagens para Firebase...");

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

      console.log("Salvando produto no MongoDB...");

      // Salvar produto no banco
      const novoProduto = new Produto({
        nome: nome.trim(),
        descricao: descricao.trim(),
        tipo,
        imagens: validImageUrls,
      });

      await novoProduto.save();

      console.log("✅ Produto criado com sucesso:", novoProduto._id);
      console.log("URLs das imagens:", validImageUrls);

      // MODIFICADO: Adicionado suporte para mensagem de "debutantes"
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

      console.log("=== ATUALIZANDO PRODUTO ===");
      console.log("ID do produto:", id);
      console.log("Novos dados:", { nome, descricao });
      console.log("Novas imagens:", req.files ? req.files.length : 0);

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
        console.log("Fazendo upload de novas imagens...");

        const uploadPromises = req.files.map((file) =>
          uploadImageToFirebase(file)
        );
        const imageUrls = await Promise.all(uploadPromises);

        const validImageUrls = imageUrls.filter((url) => url !== null);

        if (validImageUrls.length > 0) {
          produto.imagens = validImageUrls;
          console.log("Novas URLs das imagens:", validImageUrls);
        }
      }

      await produto.save();

      console.log("✅ Produto atualizado com sucesso:", produto._id);

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

    console.log("=== EXCLUINDO PRODUTO ===");
    console.log("ID do produto:", id);

    const produto = await Produto.findById(id);

    if (!produto) {
      return res.status(404).json({
        success: false,
        message: "Produto não encontrado",
      });
    }

    await Produto.findByIdAndDelete(id);

    console.log("✅ Produto excluído com sucesso:", id);

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

    console.log(`✅ Admin: ${produtos.length} produtos encontrados`);

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
    console.log("Autenticação verificada para:", req.user.email);
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
        "GET /api/produtos/debutantes", // MODIFICADO: Adicionado endpoint de debutantes
      ],
      admin: [
        "POST /api/login",
        "GET /api/admin/verificar",
        "GET /api/admin/produtos",
        "POST /api/produtos",
        "PUT /api/produtos/:id",
        "DELETE /api/produtos/:id",
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
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 Em ambiente local: http://localhost:${PORT}`);
    console.log(`☁️  No Codespaces, acesse usando o URL fornecido pelo GitHub`);
    console.log(`🔥 Firebase Storage configurado e pronto!`);
    console.log(`📊 MongoDB integrado e funcionando!`);
  });
}

// Export para Vercel (OBRIGATÓRIO!)
module.exports = app;
