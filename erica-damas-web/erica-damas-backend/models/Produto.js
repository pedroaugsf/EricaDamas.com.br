const mongoose = require("mongoose");

const produtoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "Nome é obrigatório"],
      trim: true,
      maxlength: [100, "Nome não pode ter mais de 100 caracteres"],
    },
    descricao: {
      type: String,
      required: [true, "Descrição é obrigatória"],
      maxlength: [1000, "Descrição não pode ter mais de 1000 caracteres"],
    },
    imagens: [
      {
        type: String,
        required: true,
      },
    ],
    tipo: {
      type: String,
      enum: {
        values: ["vestidos", "ternos", "debutantes"], // ✅ ADICIONE "debutantes"
        message: "Tipo deve ser vestidos, ternos ou debutantes", // ✅ ATUALIZE a mensagem
      },
      required: [true, "Tipo é obrigatório"],
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Produto", produtoSchema);
