const admin = require("firebase-admin");
const serviceAccount = require("./firebase-key.json");

// Inicializar o Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Use o nome correto do bucket
  storageBucket: "erica-damas-web.firebasestorage.app",
});

const bucket = admin.storage().bucket();

// Log para confirmar
console.log("Bucket configurado:", bucket.name);

module.exports = {
  bucket,
};
