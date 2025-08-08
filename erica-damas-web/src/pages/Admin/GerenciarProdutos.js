import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const GerenciadorProdutos = () => {
  const { tipoProduto } = useParams();
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  // Estado do formulário
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [imagens, setImagens] = useState([]);
  const [imagensPreview, setImagensPreview] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  // Configurações baseadas no tipo de produto
  const configProduto = {
    vestidos: {
      titulo: "Vestidos de Noiva",
      tituloSingular: "Vestido de Noiva",
      colecao: "vestidos",
    },
    ternos: {
      titulo: "Ternos",
      tituloSingular: "Terno",
      colecao: "ternos",
    },
  };

  // Obter configuração atual
  const config = configProduto[tipoProduto] || configProduto.vestidos;

  // Carregar produtos do localStorage ao iniciar
  useEffect(() => {
    const produtosArmazenados = localStorage.getItem(
      `produtos_${config.colecao}`
    );
    if (produtosArmazenados) {
      setProdutos(JSON.parse(produtosArmazenados));
    }
  }, [config.colecao]);

  // Salvar produtos no localStorage quando houver alterações
  useEffect(() => {
    if (produtos.length > 0) {
      localStorage.setItem(
        `produtos_${config.colecao}`,
        JSON.stringify(produtos)
      );
    }
  }, [produtos, config.colecao]);

  // Lidar com upload de imagens
  const handleImagemChange = (e) => {
    if (e.target.files) {
      const arquivos = Array.from(e.target.files);
      setImagens(arquivos);

      // Criar previews das imagens
      const previews = arquivos.map((arquivo) => URL.createObjectURL(arquivo));
      setImagensPreview(previews);
    }
  };

  // Resetar formulário
  const resetarFormulario = () => {
    setNome("");
    setDescricao("");
    setPreco("");
    setImagens([]);
    setImagensPreview([]);
    setEditandoId(null);
  };

  // Carregar produto para edição
  const handleEditar = (produto) => {
    setNome(produto.nome);
    setDescricao(produto.descricao);
    setPreco(produto.preco);
    setImagensPreview(produto.imagens || []);
    setEditandoId(produto.id);
    window.scrollTo(0, 0);
  };

  // Excluir produto
  const handleExcluir = (id) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir este ${config.tituloSingular.toLowerCase()}?`
      )
    ) {
      setProdutos(produtos.filter((produto) => produto.id !== id));
    }
  };

  // Enviar formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      // Converter imagens para Base64 para armazenamento local
      const processarImagens = async () => {
        let imagensBase64 = [];

        // Se estiver editando e não houver novas imagens, manter as existentes
        if (editandoId && imagens.length === 0) {
          const produtoExistente = produtos.find((p) => p.id === editandoId);
          imagensBase64 = produtoExistente.imagens || [];
        }
        // Se houver novas imagens, processá-las
        else if (imagens.length > 0) {
          for (const imagem of imagens) {
            const base64 = await converterParaBase64(imagem);
            imagensBase64.push(base64);
          }
        }

        const dadosProduto = {
          nome,
          descricao,
          preco: parseFloat(preco),
          imagens: imagensBase64,
          dataAtualizacao: new Date().toISOString(),
        };

        if (editandoId) {
          // Atualizar produto existente
          setProdutos(
            produtos.map((produto) =>
              produto.id === editandoId
                ? { ...produto, ...dadosProduto, id: editandoId }
                : produto
            )
          );
        } else {
          // Adicionar novo produto
          const novoProduto = {
            ...dadosProduto,
            id: Date.now().toString(),
            dataCriacao: new Date().toISOString(),
          };
          setProdutos([...produtos, novoProduto]);
        }

        resetarFormulario();
        setCarregando(false);
      };

      processarImagens();
    } catch (err) {
      setErro(
        `Erro ao salvar ${config.tituloSingular.toLowerCase()}: ${err.message}`
      );
      setCarregando(false);
    }
  };

  // Função para converter imagem para Base64
  const converterParaBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div style={styles.container}>
      <button
        onClick={() => navigate("/admin/dashboard")}
        style={styles.backButton}
      >
        ← Voltar ao Painel
      </button>

      <h1 style={styles.titulo}>Gerenciar {config.titulo}</h1>

      {erro && <div style={styles.erro}>{erro}</div>}

      <div style={styles.formContainer}>
        <h2 style={styles.subtitulo}>
          {editandoId
            ? `Editar ${config.tituloSingular}`
            : `Adicionar Novo ${config.tituloSingular}`}
        </h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="nome">Nome:</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              style={styles.input}
              placeholder={`Nome do ${config.tituloSingular.toLowerCase()}`}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="descricao">Descrição:</label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              style={styles.textarea}
              placeholder={`Descrição detalhada do ${config.tituloSingular.toLowerCase()}`}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="preco">Preço (R$):</label>
            <input
              type="number"
              id="preco"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              step="0.01"
              required
              style={styles.input}
              placeholder="0.00"
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="imagens">Imagens:</label>
            <input
              type="file"
              id="imagens"
              onChange={handleImagemChange}
              multiple
              accept="image/*"
              style={styles.fileInput}
            />
            <small style={styles.helperText}>
              {editandoId
                ? "Selecione novas imagens para substituir as existentes (opcional)"
                : "Selecione uma ou mais imagens"}
            </small>
          </div>

          {imagensPreview.length > 0 && (
            <div style={styles.previewContainer}>
              {imagensPreview.map((preview, index) => (
                <div key={index} style={styles.previewItem}>
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    style={styles.previewImage}
                  />
                </div>
              ))}
            </div>
          )}

          <div style={styles.buttonGroup}>
            <button
              type="submit"
              disabled={carregando}
              style={styles.submitButton}
            >
              {carregando
                ? "Salvando..."
                : editandoId
                ? "Atualizar"
                : "Adicionar"}
            </button>

            {editandoId && (
              <button
                type="button"
                onClick={resetarFormulario}
                style={styles.cancelButton}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={styles.productListContainer}>
        <h2 style={styles.subtitulo}>{config.titulo} Cadastrados</h2>

        {produtos.length === 0 ? (
          <p>Nenhum {config.tituloSingular.toLowerCase()} cadastrado.</p>
        ) : (
          <div style={styles.productGrid}>
            {produtos.map((produto) => (
              <div key={produto.id} style={styles.productCard}>
                {produto.imagens && produto.imagens[0] && (
                  <div style={styles.productImageContainer}>
                    <img
                      src={produto.imagens[0]}
                      alt={produto.nome}
                      style={styles.productImage}
                    />
                  </div>
                )}

                <div style={styles.productInfo}>
                  <h3 style={styles.productName}>{produto.nome}</h3>
                  <p style={styles.productPrice}>
                    R$ {parseFloat(produto.preco).toFixed(2).replace(".", ",")}
                  </p>
                </div>

                <div style={styles.productActions}>
                  <button
                    onClick={() => handleEditar(produto)}
                    style={styles.editButton}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(produto.id)}
                    style={styles.deleteButton}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: '"Cormorant Garamond", serif',
  },
  backButton: {
    backgroundColor: "#f5f5f5",
    border: "1px solid #ddd",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
    marginBottom: "1rem",
  },
  titulo: {
    fontSize: "2.5rem",
    fontWeight: "300",
    color: "#5d4037",
    textAlign: "center",
    marginBottom: "2rem",
  },
  subtitulo: {
    fontSize: "1.8rem",
    fontWeight: "300",
    color: "#5d4037",
    marginBottom: "1.5rem",
  },
  erro: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "1rem",
    borderRadius: "4px",
    marginBottom: "1rem",
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "5px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "2rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  input: {
    padding: "0.75rem",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "1rem",
  },
  textarea: {
    padding: "0.75rem",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    minHeight: "150px",
    resize: "vertical",
  },
  fileInput: {
    padding: "0.5rem 0",
  },
  helperText: {
    color: "#666",
    fontSize: "0.85rem",
  },
  previewContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    marginTop: "1rem",
  },
  previewItem: {
    width: "100px",
    height: "100px",
    overflow: "hidden",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
  },
  submitButton: {
    backgroundColor: "#b6a06a",
    color: "white",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    color: "#333",
    border: "1px solid #ddd",
    padding: "0.75rem 1.5rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  productListContainer: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "5px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "1.5rem",
  },
  productCard: {
    border: "1px solid #eee",
    borderRadius: "4px",
    overflow: "hidden",
  },
  productImageContainer: {
    height: "200px",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  productInfo: {
    padding: "1rem",
  },
  productName: {
    fontSize: "1.2rem",
    fontWeight: "500",
    marginBottom: "0.5rem",
  },
  productPrice: {
    fontSize: "1.1rem",
    color: "#b6a06a",
    fontWeight: "500",
  },
  productActions: {
    display: "flex",
    borderTop: "1px solid #eee",
  },
  editButton: {
    flex: "1",
    padding: "0.75rem",
    border: "none",
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
  },
  deleteButton: {
    flex: "1",
    padding: "0.75rem",
    border: "none",
    backgroundColor: "#f5f5f5",
    color: "#d32f2f",
    cursor: "pointer",
    borderLeft: "1px solid #eee",
  },
};

export default GerenciadorProdutos;
