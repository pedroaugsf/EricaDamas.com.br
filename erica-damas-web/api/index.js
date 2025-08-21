const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// CORS
app.use(
  cors({
    origin: ["https://erica-damas-com-br-e5w2.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());

// Conectar MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
  });
};

// Credenciais
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ericadamas.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Eri@D4m4s!2024#Adm";
const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_padrao";

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    message: "API Erica Damas funcionando na Vercel",
    timestamp: new Date().toISOString(),
    environment: "production",
  });
});

// Rota de login
app.post("/login", async (req, res) => {
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
    console.error("Erro no login:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
});

// Rota de produtos temporária
app.get("/produtos/:tipo", async (req, res) => {
  try {
    await connectDB();
    const { tipo } = req.params;

    // MODIFICADO: Incluído "debutantes" na lista de tipos válidos
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
    console.error("Erro:", error);
    res.status(500).json({ success: false, message: "Erro interno" });
  }
});

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

// Rota de verificação de auth
app.get("/admin/verificar", verificarToken, (req, res) => {
  res.json({
    success: true,
    message: "Autenticado com sucesso",
    user: { email: req.user.email },
  });
});

// Rota admin produtos
app.get("/admin/produtos", verificarToken, (req, res) => {
  res.json({
    success: true,
    produtos: [],
    total: 0,
    message: "Admin funcionando - produtos em breve",
  });
});

module.exports = app;
