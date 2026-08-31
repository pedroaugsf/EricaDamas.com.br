/**
 * Limpeza de imagens orfas no Firebase Storage.
 *
 * Orfa = arquivo no bucket que nenhum produto do banco referencia. Elas se
 * acumularam porque, ate agosto de 2026, excluir ou trocar a imagem de um
 * produto nao removia o arquivo do Storage. As rotas ja foram corrigidas; este
 * script serve para as que ficaram para tras, e para rodar de tempos em tempos.
 *
 * Uso:
 *   node limpar-imagens-orfas.js            -> so LISTA o que seria apagado
 *   node limpar-imagens-orfas.js --apagar   -> apaga de verdade
 *
 * Le a credencial das variaveis de ambiente ou do firebase-key.json, na mesma
 * ordem que o server.js.
 */
require("dotenv").config();
const admin = require("firebase-admin");
const mongoose = require("mongoose");

const APAGAR = process.argv.includes("--apagar");

const credencial = () => {
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    return {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };
  }
  return require("./firebase-key.json");
};

const mb = (bytes) => (Number(bytes) / 1024 / 1024).toFixed(2);

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const Produto = mongoose.model(
    "Produto",
    new mongoose.Schema({}, { strict: false, collection: "produtos" })
  );

  admin.initializeApp({
    credential: admin.credential.cert(credencial()),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
  const balde = admin.storage().bucket();

  // Tudo que o banco referencia, normalizado para caminho dentro do bucket.
  const prefixo = `https://storage.googleapis.com/${balde.name}/`;
  const produtos = await Produto.find().lean();
  const emUso = new Set();
  produtos.forEach((p) =>
    (p.imagens || []).forEach((url) => {
      if (String(url).startsWith(prefixo)) {
        emUso.add(decodeURIComponent(String(url).slice(prefixo.length)));
      }
    })
  );

  const [arquivos] = await balde.getFiles();

  const orfas = arquivos.filter((f) => !emUso.has(f.name));
  const usadas = arquivos.length - orfas.length;

  console.log(`Produtos no banco: ${produtos.length}`);
  console.log(`Imagens referenciadas pelo banco: ${emUso.size}`);
  console.log(`Arquivos no bucket: ${arquivos.length}`);
  console.log(`  em uso: ${usadas}`);
  console.log(`  orfas:  ${orfas.length}`);

  if (!orfas.length) {
    console.log("\nNada a limpar.");
    process.exit(0);
  }

  const total = orfas.reduce((s, f) => s + Number(f.metadata.size || 0), 0);
  console.log(`\nOrfas (${mb(total)} MB no total):\n`);
  orfas
    .sort((a, b) => String(a.metadata.timeCreated).localeCompare(String(b.metadata.timeCreated)))
    .forEach((f) =>
      console.log(
        `  ${String(f.metadata.timeCreated).slice(0, 10)}  ${mb(f.metadata.size).padStart(7)} MB  ${f.name}`
      )
    );

  if (!APAGAR) {
    console.log("\n(nada foi apagado — rode com --apagar para remover)");
    process.exit(0);
  }

  console.log("\nApagando...");
  let ok = 0;
  for (const f of orfas) {
    try {
      await f.delete();
      ok++;
      console.log(`  apagado: ${f.name}`);
    } catch (e) {
      console.error(`  FALHOU ${f.name}: ${e.message}`);
    }
  }

  const [depois] = await balde.getFiles();
  console.log(`\n${ok} de ${orfas.length} apagadas. Arquivos no bucket agora: ${depois.length}`);
  process.exit(0);
})();
