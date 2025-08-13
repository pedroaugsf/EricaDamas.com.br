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

  // Função para obter token de autenticação
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Detectar URL da API
  const getApiUrl = () => {
    const isCodespaces = window.location.hostname.includes(".app.github.dev");
    if (isCodespaces) {
      const codespacePrefix = window.location.hostname.split("-3000")[0];
      return `https://${codespacePrefix}-5000.app.github.dev`;
    }
    return process.env.REACT_APP_API_URL || "http://localhost:5000";
  };

  // Carregar produtos da API
  const carregarProdutos = async () => {
    try {
      setCarregando(true);
      const API_URL = getApiUrl();

      console.log(
        "Carregando produtos da API:",
        `${API_URL}/api/produtos/${config.colecao}`
      );

      const response = await fetch(`${API_URL}/api/produtos/${config.colecao}`);
      const result = await response.json();

      if (result.success) {
        setProdutos(result.produtos);
        console.log(`✅ ${result.produtos.length} produtos carregados`);
      } else {
        setErro("Erro ao carregar produtos: " + result.message);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      setErro("Erro ao conectar com o servidor");
    } finally {
      setCarregando(false);
    }
  };

  // Carregar produtos ao iniciar
  useEffect(() => {
    carregarProdutos();
  }, [config.colecao]);

  // Função para criar produto
  const criarProduto = async (dadosProduto, arquivosImagem) => {
    const token = getAuthToken();
    const API_URL = getApiUrl();

    console.log("=== CRIANDO PRODUTO ===");
    console.log("Dados:", dadosProduto);
    console.log("Imagens:", arquivosImagem.length);

    const formData = new FormData();
    formData.append("nome", dadosProduto.nome);
    formData.append("descricao", dadosProduto.descricao);
    formData.append("tipo", config.colecao);

    arquivosImagem.forEach((arquivo) => {
      formData.append("imagens", arquivo);
    });

    const response = await fetch(`${API_URL}/api/produtos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return response.json();
  };

  // Função para atualizar produto
  const atualizarProduto = async (id, dadosProduto, arquivosImagem = []) => {
    const token = getAuthToken();
    const API_URL = getApiUrl();

    console.log("=== ATUALIZANDO PRODUTO ===");
    console.log("ID:", id);
    console.log("Dados:", dadosProduto);
    console.log("Novas imagens:", arquivosImagem.length);

    const formData = new FormData();
    formData.append("nome", dadosProduto.nome);
    formData.append("descricao", dadosProduto.descricao);

    arquivosImagem.forEach((arquivo) => {
      formData.append("imagens", arquivo);
    });

    const response = await fetch(`${API_URL}/api/produtos/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return response.json();
  };

  // Função para excluir produto
  const excluirProduto = async (id) => {
    const token = getAuthToken();
    const API_URL = getApiUrl();

    console.log("=== EXCLUINDO PRODUTO ===");
    console.log("ID:", id);

    const response = await fetch(`${API_URL}/api/produtos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.json();
  };

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
    setImagens([]);
    setImagensPreview([]);
    setEditandoId(null);
    const fileInput = document.getElementById("imagens");
    if (fileInput) fileInput.value = "";
  };

  // Carregar produto para edição
  const handleEditar = (produto) => {
    setNome(produto.nome);
    setDescricao(produto.descricao);
    setImagensPreview(produto.imagens || []);
    setEditandoId(produto._id); // ✅ Usando _id do MongoDB
    setImagens([]);
    window.scrollTo(0, 0);
  };

  // Excluir produto
  const handleExcluir = async (id) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir este ${config.tituloSingular.toLowerCase()}?`
      )
    ) {
      try {
        setCarregando(true);
        const result = await excluirProduto(id);

        if (result.success) {
          console.log("✅ Produto excluído com sucesso");
          await carregarProdutos(); // Recarregar lista
        } else {
          setErro("Erro ao excluir produto: " + result.message);
        }
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
        setErro("Erro ao excluir produto: " + error.message);
      } finally {
        setCarregando(false);
      }
    }
  };

  // Enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    try {
      const dadosProduto = {
        nome: nome.trim(),
        descricao: descricao.trim(),
      };

      let result;

      if (editandoId) {
        // Atualizar produto existente
        result = await atualizarProduto(editandoId, dadosProduto, imagens);
      } else {
        // Criar novo produto
        if (imagens.length === 0) {
          throw new Error("Pelo menos uma imagem é obrigatória");
        }
        result = await criarProduto(dadosProduto, imagens);
      }

      if (result.success) {
        console.log("✅ Produto salvo com sucesso:", result.produto);
        resetarFormulario();
        await carregarProdutos(); // Recarregar lista
      } else {
        throw new Error(result.message || "Erro ao salvar produto");
      }
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
      setErro(
        `Erro ao salvar ${config.tituloSingular.toLowerCase()}: ${err.message}`
      );
    } finally {
      setCarregando(false);
    }
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

      {erro && (
        <div style={styles.erro}>
          {erro}
          <button onClick={() => setErro("")} style={styles.closeErrorButton}>
            ×
          </button>
        </div>
      )}

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
              disabled={carregando}
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
              disabled={carregando}
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
              disabled={carregando}
            />
            <small style={styles.helperText}>
              {editandoId
                ? "Selecione novas imagens para substituir as existentes (opcional)"
                : "Selecione uma ou mais imagens (máximo 5MB cada)"}
            </small>
          </div>

          {imagensPreview.length > 0 && (
            <div style={styles.previewContainer}>
              <h4>Preview das Imagens:</h4>
              <div style={styles.previewGrid}>
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
            </div>
          )}

          <div style={styles.buttonGroup}>
            <button
              type="submit"
              disabled={carregando}
              style={{
                ...styles.submitButton,
                opacity: carregando ? 0.6 : 1,
                cursor: carregando ? "not-allowed" : "pointer",
              }}
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
                disabled={carregando}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={styles.productListContainer}>
        <h2 style={styles.subtitulo}>
          {config.titulo} Cadastrados
          {produtos.length > 0 && (
            <span style={styles.productCount}>({produtos.length})</span>
          )}
        </h2>

        {carregando && produtos.length === 0 ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p>Carregando produtos...</p>
          </div>
        ) : produtos.length === 0 ? (
          <div style={styles.emptyMessage}>
            <p>Nenhum {config.tituloSingular.toLowerCase()} cadastrado.</p>
            <small>
              Adicione o primeiro produto usando o formulário acima.
            </small>
          </div>
        ) : (
          <div style={styles.productGrid}>
            {produtos.map((produto) => (
              <div key={produto._id} style={styles.productCard}>
                {produto.imagens && produto.imagens[0] && (
                  <div style={styles.productImageContainer}>
                    <img
                      src={produto.imagens[0]}
                      alt={produto.nome}
                      style={styles.productImage}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div style={styles.productInfo}>
                  <h3 style={styles.productName}>{produto.nome}</h3>
                  <p style={styles.productDescription}>
                    {produto.descricao.length > 100
                      ? produto.descricao.substring(0, 100) + "..."
                      : produto.descricao}
                  </p>
                  {produto.imagens && produto.imagens.length > 1 && (
                    <small style={styles.imageCount}>
                      {produto.imagens.length} imagens
                    </small>
                  )}
                  <small style={styles.productDate}>
                    Criado em:{" "}
                    {new Date(produto.createdAt).toLocaleDateString("pt-BR")}
                  </small>
                </div>

                <div style={styles.productActions}>
                  <button
                    onClick={() => handleEditar(produto)}
                    style={styles.editButton}
                    disabled={carregando}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(produto._id)}
                    style={styles.deleteButton}
                    disabled={carregando}
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

// Estilos atualizados
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
    transition: "background-color 0.3s",
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
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productCount: {
    fontSize: "1rem",
    color: "#666",
    fontWeight: "normal",
  },
  erro: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "1rem",
    borderRadius: "4px",
    marginBottom: "1rem",
    border: "1px solid #ffcdd2",
    position: "relative",
  },
  closeErrorButton: {
    position: "absolute",
    top: "0.5rem",
    right: "0.5rem",
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    color: "#c62828",
    cursor: "pointer",
  },
  loading: {
    textAlign: "center",
    padding: "2rem 0",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #b6a06a",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 1rem",
  },
  emptyMessage: {
    textAlign: "center",
    padding: "2rem",
    backgroundColor: "#f9f9f9",
    borderRadius: "4px",
    color: "#666",
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
    transition: "border-color 0.3s",
  },
  textarea: {
    padding: "0.75rem",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    minHeight: "150px",
    resize: "vertical",
    transition: "border-color 0.3s",
  },
  fileInput: {
    padding: "0.5rem 0",
  },
  helperText: {
    color: "#666",
    fontSize: "0.85rem",
  },
  previewContainer: {
    marginTop: "1rem",
  },
  previewGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    marginTop: "0.5rem",
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
    transition: "background-color 0.3s",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    color: "#333",
    border: "1px solid #ddd",
    padding: "0.75rem 1.5rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background-color 0.3s",
  },
  productListContainer: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "5px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  productCard: {
    border: "1px solid #eee",
    borderRadius: "4px",
    overflow: "hidden",
    transition: "box-shadow 0.3s",
  },
  productImageContainer: {
    height: "200px",
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
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
    color: "#333",
  },
  productDescription: {
    fontSize: "0.9rem",
    color: "#666",
    marginBottom: "0.5rem",
    lineHeight: "1.4",
  },
  imageCount: {
    color: "#999",
    fontSize: "0.8rem",
    display: "block",
    marginBottom: "0.25rem",
  },
  productDate: {
    color: "#999",
    fontSize: "0.8rem",
    display: "block",
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
    transition: "background-color 0.3s",
  },
  deleteButton: {
    flex: "1",
    padding: "0.75rem",
    border: "none",
    backgroundColor: "#f5f5f5",
    color: "#d32f2f",
    cursor: "pointer",
    borderLeft: "1px solid #eee",
    transition: "background-color 0.3s",
  },
};

export default GerenciadorProdutos;
