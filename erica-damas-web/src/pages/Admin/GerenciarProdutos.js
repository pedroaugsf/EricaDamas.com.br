import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../services/AuthService";

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

  // Carregar produtos da API
  const carregarProdutos = async () => {
    try {
      setCarregando(true);

      console.log("Carregando produtos da API:", `/produtos/${config.colecao}`);

      const response = await api.get(`/produtos/${config.colecao}`);
      const result = response.data;

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

    const response = await api.post("/produtos", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  };

  // Função para atualizar produto
  const atualizarProduto = async (id, dadosProduto, arquivosImagem = []) => {
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

    const response = await api.put(`/produtos/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  };

  // Função para excluir produto
  const excluirProduto = async (id) => {
    console.log("=== EXCLUINDO PRODUTO ===");
    console.log("ID:", id);

    const response = await api.delete(`/produtos/${id}`);
    return response.data;
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
    setEditandoId(produto._id);
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
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#e0e0e0";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#f5f5f5";
        }}
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
            <label htmlFor="nome" style={styles.label}>
              Nome:
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              style={styles.input}
              placeholder={`Nome do ${config.tituloSingular.toLowerCase()}`}
              disabled={carregando}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#b6a06a";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#ddd";
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="descricao" style={styles.label}>
              Descrição:
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              style={styles.textarea}
              placeholder={`Descrição detalhada do ${config.tituloSingular.toLowerCase()}`}
              disabled={carregando}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#b6a06a";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#ddd";
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="imagens" style={styles.label}>
              Imagens:
            </label>
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
              <h4 style={styles.previewTitle}>Preview das Imagens:</h4>
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
              onMouseEnter={(e) => {
                if (!carregando) {
                  e.currentTarget.style.backgroundColor = "#a08c5a";
                }
              }}
              onMouseLeave={(e) => {
                if (!carregando) {
                  e.currentTarget.style.backgroundColor = "#b6a06a";
                }
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e0e0e0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                }}
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
              <div
                key={produto._id}
                style={styles.productCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.15)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#e8f5e8";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#f5f5f5";
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(produto._id)}
                    style={styles.deleteButton}
                    disabled={carregando}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#ffebee";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#f5f5f5";
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem !important;
          }

          .titulo {
            font-size: 2rem !important;
          }

          .productGrid {
            grid-template-columns: 1fr !important;
          }

          .buttonGroup {
            flex-direction: column !important;
          }

          .previewGrid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }

        @media (max-width: 480px) {
          .formContainer,
          .productListContainer {
            padding: 1rem !important;
          }

          .previewGrid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};

// Estilos atualizados e melhorados
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: '"Cormorant Garamond", serif',
    backgroundColor: "#fafafa",
    minHeight: "100vh",
  },
  backButton: {
    backgroundColor: "#f5f5f5",
    border: "1px solid #ddd",
    padding: "0.75rem 1.5rem",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "1.5rem",
    transition: "all 0.3s ease",
    fontSize: "1rem",
    fontWeight: "500",
  },
  titulo: {
    fontSize: "2.5rem",
    fontWeight: "300",
    color: "#5d4037",
    textAlign: "center",
    marginBottom: "2rem",
    letterSpacing: "1px",
  },
  subtitulo: {
    fontSize: "1.8rem",
    fontWeight: "300",
    color: "#5d4037",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  productCount: {
    fontSize: "1rem",
    color: "#666",
    fontWeight: "normal",
    backgroundColor: "#f0f0f0",
    padding: "0.25rem 0.75rem",
    borderRadius: "15px",
  },
  erro: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "1rem 1.5rem",
    borderRadius: "6px",
    marginBottom: "1.5rem",
    border: "1px solid #ffcdd2",
    position: "relative",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  closeErrorButton: {
    position: "absolute",
    top: "0.75rem",
    right: "1rem",
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    color: "#c62828",
    cursor: "pointer",
    fontWeight: "bold",
  },
  loading: {
    textAlign: "center",
    padding: "3rem 0",
    color: "#666",
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
    padding: "3rem 2rem",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    color: "#666",
    border: "1px solid #eee",
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: "2.5rem",
    borderRadius: "8px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    marginBottom: "2rem",
    border: "1px solid #eee",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: "1rem",
    fontWeight: "500",
    color: "#333",
    marginBottom: "0.25rem",
  },
  input: {
    padding: "0.75rem 1rem",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    backgroundColor: "#fafafa",
  },
  textarea: {
    padding: "0.75rem 1rem",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    minHeight: "120px",
    resize: "vertical",
    transition: "all 0.3s ease",
    backgroundColor: "#fafafa",
    fontFamily: "inherit",
  },
  fileInput: {
    padding: "0.5rem 0",
    fontSize: "1rem",
  },
  helperText: {
    color: "#666",
    fontSize: "0.875rem",
    fontStyle: "italic",
  },
  previewContainer: {
    marginTop: "1rem",
    padding: "1rem",
    backgroundColor: "#f9f9f9",
    borderRadius: "6px",
    border: "1px solid #eee",
  },
  previewTitle: {
    margin: "0 0 1rem 0",
    color: "#333",
    fontSize: "1.1rem",
  },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
    gap: "1rem",
    maxWidth: "500px",
  },
  previewItem: {
    width: "100px",
    height: "100px",
    overflow: "hidden",
    borderRadius: "6px",
    border: "2px solid #ddd",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
    flexWrap: "wrap",
  },
  submitButton: {
    backgroundColor: "#b6a06a",
    color: "white",
    border: "none",
    padding: "0.875rem 2rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    color: "#333",
    border: "1px solid #ddd",
    padding: "0.875rem 2rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  productListContainer: {
    backgroundColor: "#fff",
    padding: "2.5rem",
    borderRadius: "8px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    border: "1px solid #eee",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  productCard: {
    border: "1px solid #eee",
    borderRadius: "8px",
    overflow: "hidden",
    transition: "all 0.3s ease",
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  productImageContainer: {
    height: "200px",
    overflow: "hidden",
    backgroundColor: "#f8f8f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s ease",
  },
  productInfo: {
    padding: "1.5rem",
  },
  productName: {
    fontSize: "1.3rem",
    fontWeight: "500",
    marginBottom: "0.5rem",
    color: "#333",
    lineHeight: "1.3",
  },
  productDescription: {
    fontSize: "0.95rem",
    color: "#666",
    marginBottom: "0.75rem",
    lineHeight: "1.5",
  },
  imageCount: {
    color: "#999",
    fontSize: "0.8rem",
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "500",
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
    padding: "1rem",
    border: "none",
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#2e7d32",
  },
  deleteButton: {
    flex: "1",
    padding: "1rem",
    border: "none",
    backgroundColor: "#f5f5f5",
    color: "#d32f2f",
    cursor: "pointer",
    borderLeft: "1px solid #eee",
    transition: "all 0.3s ease",
    fontSize: "0.95rem",
    fontWeight: "500",
  },
};

export default GerenciadorProdutos;
