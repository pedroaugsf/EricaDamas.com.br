import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GerenciadorContratos = () => {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  // Estados do formulário
  const [dadosCliente, setDadosCliente] = useState({
    nome: "",
    rg: "",
    cpf: "",
    nacionalidade: "Brasileira",
    dataNascimento: "",
    profissao: "",
    endereco: "",
    numero: "",
    bairro: "",
    cidade: "",
    telefone: "",
    celular: "",
  });

  const [dadosContrato, setDadosContrato] = useState({
    dataVenda: "",
    dataAjuste: "",
    dataRetirada: "",
    dataEntrega: "",
    formaPagamento: "",
    itens: [{ codigo: "", especificacao: "", valor: "" }],
    parcelas: [],
    observacoesPagamento: "",
    observacoesGerais: "",
  });

  const FORMAS_PAGAMENTO = [
    { value: "dinheiro", label: "Dinheiro" },
    { value: "cartao_credito", label: "Cartão de Crédito" },
    { value: "cartao_debito", label: "Cartão de Débito" },
    { value: "pix", label: "PIX" },
    { value: "transferencia", label: "Transferência Bancária" },
    { value: "boleto", label: "Boleto" },
    { value: "cheque", label: "Cheque" },
    { value: "misto", label: "Pagamento Misto" },
  ];

  // Carregar contratos salvos
  useEffect(() => {
    const contratosSalvos = localStorage.getItem("contratos");
    if (contratosSalvos) {
      setContratos(JSON.parse(contratosSalvos));
    }
  }, []);

  // Salvar contratos
  const salvarContratos = (novosContratos) => {
    localStorage.setItem("contratos", JSON.stringify(novosContratos));
    setContratos(novosContratos);
  };

  // Adicionar item
  const adicionarItem = () => {
    setDadosContrato({
      ...dadosContrato,
      itens: [
        ...dadosContrato.itens,
        { codigo: "", especificacao: "", valor: "" },
      ],
    });
  };

  // Remover item
  const removerItem = (index) => {
    const novosItens = dadosContrato.itens.filter((_, i) => i !== index);
    setDadosContrato({ ...dadosContrato, itens: novosItens });
  };

  // Calcular total
  const calcularTotal = () => {
    return dadosContrato.itens.reduce((total, item) => {
      return total + (parseFloat(item.valor) || 0);
    }, 0);
  };

  // Gerar parcelas
  const gerarParcelas = (numeroParcelas) => {
    const parcelas = [];
    const hoje = new Date();

    for (let i = 0; i < numeroParcelas; i++) {
      const dataVencimento = new Date(
        hoje.getFullYear(),
        hoje.getMonth() + i + 1,
        hoje.getDate()
      );

      parcelas.push({
        numero: i + 1,
        valor: "",
        vencimento: dataVencimento.toISOString().split("T")[0],
      });
    }

    setDadosContrato({
      ...dadosContrato,
      parcelas,
    });
  };

  // Função para calcular total das parcelas preenchidas
  const calcularTotalParcelas = () => {
    return dadosContrato.parcelas.reduce((total, parcela) => {
      return total + (parseFloat(parcela.valor) || 0);
    }, 0);
  };

  // Função para atualizar valor de uma parcela
  const atualizarValorParcela = (index, novoValor) => {
    const novasParcelas = [...dadosContrato.parcelas];
    novasParcelas[index].valor = novoValor;
    setDadosContrato({
      ...dadosContrato,
      parcelas: novasParcelas,
    });
  };

  // Função para distribuir valor igualmente entre as parcelas
  const distribuirValorIgualmente = () => {
    const totalItens = calcularTotal();
    const valorPorParcela = (
      totalItens / dadosContrato.parcelas.length
    ).toFixed(2);

    const novasParcelas = dadosContrato.parcelas.map((parcela) => ({
      ...parcela,
      valor: valorPorParcela,
    }));

    setDadosContrato({
      ...dadosContrato,
      parcelas: novasParcelas,
    });
  };

  // Resetar formulário
  const resetarFormulario = () => {
    setDadosCliente({
      nome: "",
      rg: "",
      cpf: "",
      nacionalidade: "Brasileira",
      dataNascimento: "",
      profissao: "",
      endereco: "",
      numero: "",
      bairro: "",
      cidade: "",
      telefone: "",
      celular: "",
    });
    setDadosContrato({
      dataVenda: "",
      dataAjuste: "",
      dataRetirada: "",
      dataEntrega: "",
      formaPagamento: "",
      itens: [{ codigo: "", especificacao: "", valor: "" }],
      parcelas: [],
      observacoesPagamento: "",
      observacoesGerais: "",
    });
    setMostrarFormulario(false);
    setEditandoId(null);
  };

  // Handler para forma de pagamento
  const handleFormaPagamentoChange = (valor) => {
    setDadosContrato({
      ...dadosContrato,
      formaPagamento: valor,
      parcelas: valor === "cartao_credito" ? dadosContrato.parcelas : [],
    });
  };

  // Salvar contrato
  const salvarContrato = () => {
    // Validações básicas
    if (!dadosCliente.nome || !dadosCliente.cpf) {
      alert("Por favor, preencha pelo menos o nome e CPF do cliente");
      return;
    }

    if (dadosContrato.itens.length === 0 || calcularTotal() <= 0) {
      alert("Adicione pelo menos um item com valor positivo");
      return;
    }

    if (
      dadosContrato.formaPagamento === "cartao_credito" &&
      (dadosContrato.parcelas.length === 0 ||
        Math.abs(calcularTotal() - calcularTotalParcelas()) > 0.01)
    ) {
      alert("Configure corretamente as parcelas para cartão de crédito");
      return;
    }

    const novoContrato = {
      id: editandoId || Date.now().toString(),
      cliente: dadosCliente,
      contrato: dadosContrato,
      total: calcularTotal(),
      dataCriacao: new Date().toISOString(),
    };

    let novosContratos;
    if (editandoId) {
      novosContratos = contratos.map((c) =>
        c.id === editandoId ? novoContrato : c
      );
    } else {
      novosContratos = [...contratos, novoContrato];
    }

    salvarContratos(novosContratos);
    resetarFormulario();
  };

  // Editar contrato
  const editarContrato = (contrato) => {
    setDadosCliente(contrato.cliente);
    setDadosContrato(contrato.contrato);
    setEditandoId(contrato.id);
    setMostrarFormulario(true);
  };

  // Excluir contrato
  const excluirContrato = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este contrato?")) {
      const novosContratos = contratos.filter((c) => c.id !== id);
      salvarContratos(novosContratos);
    }
  };

  // Função para formatar data brasileira
  const formatarDataBrasileira = (data) => {
    if (!data) return "____/____/______";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  // Função para formatar CPF
  const formatarCPF = (cpf) => {
    if (!cpf) return "";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  // Função para formatar RG
  const formatarRG = (rg) => {
    if (!rg) return "";
    return rg.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
  };

  // Função para formatar telefone
  const formatarTelefone = (telefone) => {
    if (!telefone) return "";
    return telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");
  };

  // Formatar valor monetário
  const formatarValor = (valor) => {
    return parseFloat(valor || 0)
      .toFixed(2)
      .replace(".", ",");
  };

  // Imprimir contrato
  const imprimirContrato = (contrato) => {
    const { cliente, contrato: dadosContrato, total } = contrato;

    const janela = window.open("", "_blank");
    janela.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contrato de Locação - ${cliente.nome}</title>
        <style>
          @page {
            margin: 2cm 1.5cm;
            size: A4;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            background: white;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
          }
          
          .company-name {
            font-size: 16pt;
            font-weight: bold;
            letter-spacing: 1px;
            margin-bottom: 5px;
          }
          
          .company-info {
            font-size: 10pt;
            color: #333;
          }
          
          .contract-title {
            font-size: 14pt;
            font-weight: bold;
            text-align: center;
            margin: 25px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .section {
            margin-bottom: 25px;
          }
          
          .section-title {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 15px;
            text-transform: uppercase;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
          }
          
          .parties {
            margin-bottom: 20px;
          }
          
          .party {
            margin-bottom: 15px;
          }
          
          .party-label {
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .client-info {
            margin-left: 20px;
            line-height: 1.6;
          }
          
          .dates-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          
          .dates-table td {
            padding: 8px 12px;
            border: 1px solid #333;
            font-weight: bold;
            text-align: center;
          }
          
          .dates-table .label {
            background-color: #f0f0f0;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 10pt;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          
          .items-table th {
            background-color: #333;
            color: white;
            padding: 10px 8px;
            text-align: center;
            font-size: 10pt;
            text-transform: uppercase;
            font-weight: bold;
          }
          
          .items-table td {
            padding: 8px;
            border: 1px solid #333;
            text-align: left;
            vertical-align: top;
          }
          
          .items-table .center {
            text-align: center;
          }
          
          .items-table .right {
            text-align: right;
          }
          
          .total-row {
            background-color: #f8f8f8;
            font-weight: bold;
          }
          
          .payment-section {
            background-color: #f9f9f9;
            padding: 15px;
            border: 1px solid #ccc;
            margin: 15px 0;
          }
          
          .installments-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          
          .installments-table th {
            background-color: #e0e0e0;
            padding: 8px;
            border: 1px solid #333;
            text-align: center;
            font-size: 10pt;
            font-weight: bold;
          }
          
          .installments-table td {
            padding: 6px 8px;
            border: 1px solid #333;
            text-align: center;
            font-size: 10pt;
          }
          
          .signature-section {
            margin-top: 40px;
            border-top: 1px solid #ccc;
            padding-top: 20px;
          }
          
          .signature-box {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
          }
          
          .signature-line {
            width: 45%;
            text-align: center;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
            margin-bottom: 5px;
          }
          
          .signature-label {
            font-size: 10pt;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .clause {
            text-align: justify;
            margin-bottom: 15px;
            text-indent: 20px;
          }
          
          .clause-title {
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 10px;
          }
          
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 9pt;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 15px;
          }
          
          @media print {
            body { print-color-adjust: exact; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">ÉRICA DAMAS LINO EIRELI</div>
          <div class="company-info">
            Rua Goiás, 275 - São José - Pará de Minas/MG<br>
            CNPJ: 11.791.386/0001-13 | Telefone: (37) 3231-0000
          </div>
        </div>

        <div class="contract-title">
          CONTRATO EXTRAJUDICIAL DE RESERVA E LOCAÇÃO<br>
          DE VESTIDOS, TRAJES E ACESSÓRIOS
        </div>

        <div class="section">
          <div class="section-title">1. IDENTIFICAÇÃO DAS PARTES</div>
          
          <div class="parties">
            <div class="party">
              <div class="party-label">LOCADORA:</div>
              <div style="margin-left: 20px; margin-top: 8px;">
                <strong>ÉRICA DAMAS LINO EIRELI</strong>, pessoa jurídica de direito privado, estabelecida na Rua Goiás, 275, São José, Pará de Minas/MG, inscrita no CNPJ sob nº 11.791.386/0001-13.
              </div>
            </div>
            
            <div class="party">
              <div class="party-label">LOCATÁRIO(A):</div>
              <div class="client-info">
                <strong>${cliente.nome.toUpperCase()}</strong><br>
                RG: ${formatarRG(cliente.rg)} | CPF: ${formatarCPF(
      cliente.cpf
    )}<br>
                Nacionalidade: ${
                  cliente.nacionalidade
                } | Data Nasc.: ${formatarDataBrasileira(
      cliente.dataNascimento
    )}<br>
                Profissão: ${cliente.profissao}<br>
                Endereço: ${cliente.endereco}, ${cliente.numero} - ${
      cliente.bairro
    }<br>
                Cidade: ${cliente.cidade}<br>
                Telefone: ${formatarTelefone(
                  cliente.telefone
                )} | Celular: ${formatarTelefone(cliente.celular)}
              </div>
            </div>
          </div>

          <p class="clause">
            As partes acima identificadas têm, entre si, justos e acertados o presente <strong>CONTRATO DE RESERVA E LOCAÇÃO</strong>, que se regerá pelas cláusulas seguintes e pelas condições de preço, forma e termo de pagamento descritas no presente instrumento.
          </p>

          <table class="dates-table">
            <tr>
              <td class="label">Data da Venda</td>
              <td class="label">Data do Ajuste</td>
              <td class="label">Data da Retirada</td>
              <td class="label">Data da Entrega</td>
            </tr>
            <tr>
              <td>${formatarDataBrasileira(dadosContrato.dataVenda)}</td>
              <td>${formatarDataBrasileira(dadosContrato.dataAjuste)}</td>
              <td>${formatarDataBrasileira(dadosContrato.dataRetirada)}</td>
              <td>${formatarDataBrasileira(dadosContrato.dataEntrega)}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">2. DO OBJETO DO CONTRATO</div>
          
          <p class="clause">
            <span class="clause-title">Cláusula 1ª.</span> É objeto do presente contrato a locação dos seguintes trajes e acessórios:
          </p>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 10%">CÓDIGO</th>
                <th style="width: 65%">ESPECIFICAÇÃO</th>
                <th style="width: 25%">VALOR (R$)</th>
              </tr>
            </thead>
            <tbody>
              ${dadosContrato.itens
                .map(
                  (item) => `
                <tr>
                  <td class="center">${item.codigo || "-"}</td>
                  <td>${item.especificacao || "-"}</td>
                  <td class="right">R$ ${formatarValor(item.valor)}</td>
                </tr>
              `
                )
                .join("")}
              <tr class="total-row">
                <td colspan="2" class="right"><strong>VALOR TOTAL:</strong></td>
                <td class="right"><strong>R$ ${formatarValor(
                  total
                )}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">3. FORMA DE PAGAMENTO CONTRATADA</div>
          
          <div class="payment-section">
            <p><strong>Forma de pagamento especificada:</strong> ${
              dadosContrato.formaPagamento || "A definir"
            }</p>
            
            ${
              dadosContrato.parcelas.length > 0
                ? `
              <p style="margin-top: 15px;"><strong>Parcelamento acordado:</strong></p>
              <table class="installments-table">
                <thead>
                  <tr>
                    <th>Parcela</th>
                    <th>Valor (R$)</th>
                    <th>Vencimento</th>
                  </tr>
                </thead>
                <tbody>
                  ${dadosContrato.parcelas
                    .map(
                      (parcela) => `
                    <tr>
                      <td>${parcela.numero}ª</td>
                      <td>R$ ${formatarValor(parcela.valor)}</td>
                      <td>${formatarDataBrasileira(parcela.vencimento)}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            `
                : ""
            }
          </div>
        </div>

        <div class="section">
          <div class="section-title">4. DAS OBRIGAÇÕES E RESPONSABILIDADES</div>
          
          <p class="clause">
            <span class="clause-title">Cláusula 2ª.</span> O LOCATÁRIO compromete-se a retirar a(s) peça(s) na data acordada, em perfeito estado de conservação, limpa(s) e devidamente ajustada(s).
          </p>
          
          <p class="clause">
            <span class="clause-title">Cláusula 3ª.</span> O LOCATÁRIO obriga-se a devolver a(s) peça(s) na data estabelecida, no mesmo estado em que foi(ram) retirada(s), sob pena de arcar com os custos de limpeza, reparos ou reposição.
          </p>
          
          <p class="clause">
            <span class="clause-title">Cláusula 4ª.</span> Em caso de danos, manchas ou avarias na(s) peça(s), o LOCATÁRIO será responsável pelo pagamento integral do valor de reposição da peça danificada.
          </p>
        </div>

        <div class="signature-section">
          <p style="text-align: center; margin-bottom: 20px;">
            <strong>TERMO DE RECEBIMENTO</strong>
          </p>
          
          <p class="clause">
            Declaro que recebi a(s) peça(s) conforme especificado neste contrato, em perfeito estado de conservação, limpa(s), sem danos e devidamente ajustada(s), comprometendo-me a devolvê-la(s) na data acordada.
          </p>

          <div style="display: flex; justify-content: space-between; margin-top: 40px;">
            <div style="width: 30%; text-align: center;">
              <div style="border-bottom: 1px solid #000; margin-bottom: 5px; height: 40px;"></div>
              <div class="signature-label">Data: ___/___/______</div>
            </div>
            
            <div style="width: 60%; text-align: center;">
              <div style="border-bottom: 1px solid #000; margin-bottom: 5px; height: 40px;"></div>
              <div class="signature-label">Assinatura do Locatário</div>
              <div style="font-size: 9pt; margin-top: 5px;">${
                cliente.nome
              }</div>
            </div>
          </div>

          <div style="display: flex; justify-content: center; margin-top: 40px;">
            <div style="width: 60%; text-align: center;">
              <div style="border-bottom: 1px solid #000; margin-bottom: 5px; height: 40px;"></div>
              <div class="signature-label">Érica Damas Lino Eireli</div>
              <div style="font-size: 9pt; margin-top: 5px;">Locadora</div>
            </div>
          </div>
        </div>

        <div class="footer">
          Pará de Minas/MG, ${new Date().toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}<br>
          Este contrato foi gerado eletronicamente e possui validade jurídica.
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);

    janela.document.close();
  };

  return (
    <div style={styles.container}>
      <button
        onClick={() => navigate("/admin/dashboard")}
        style={styles.backButton}
      >
        ← Voltar ao Painel
      </button>

      <h1 style={styles.titulo}>Gerenciar Contratos</h1>

      <div style={styles.actionsContainer}>
        <button
          onClick={() => setMostrarFormulario(true)}
          style={styles.newButton}
        >
          + Novo Contrato
        </button>
      </div>

      {mostrarFormulario && (
        <div style={styles.formContainer}>
          <h2 style={styles.subtitulo}>
            {editandoId ? "Editar Contrato" : "Novo Contrato"}
          </h2>

          {/* DADOS DO CLIENTE */}
          <fieldset style={styles.fieldset}>
            <legend>Dados do Cliente</legend>
            <div style={styles.formGrid}>
              <input
                type="text"
                placeholder="Nome completo"
                value={dadosCliente.nome}
                onChange={(e) =>
                  setDadosCliente({ ...dadosCliente, nome: e.target.value })
                }
                style={styles.input}
                required
              />
              <input
                type="text"
                placeholder="RG"
                value={dadosCliente.rg}
                onChange={(e) =>
                  setDadosCliente({ ...dadosCliente, rg: e.target.value })
                }
                style={styles.input}
              />
              <input
                type="text"
                placeholder="CPF"
                value={dadosCliente.cpf}
                onChange={(e) =>
                  setDadosCliente({ ...dadosCliente, cpf: e.target.value })
                }
                style={styles.input}
                required
              />
              <input
                type="text"
                placeholder="Nacionalidade"
                value={dadosCliente.nacionalidade}
                onChange={(e) =>
                  setDadosCliente({
                    ...dadosCliente,
                    nacionalidade: e.target.value,
                  })
                }
                style={styles.input}
              />
              <input
                type="date"
                placeholder="Data de Nascimento"
                value={dadosCliente.dataNascimento}
                onChange={(e) =>
                  setDadosCliente({
                    ...dadosCliente,
                    dataNascimento: e.target.value,
                  })
                }
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Profissão"
                value={dadosCliente.profissao}
                onChange={(e) =>
                  setDadosCliente({
                    ...dadosCliente,
                    profissao: e.target.value,
                  })
                }
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Endereço"
                value={dadosCliente.endereco}
                onChange={(e) =>
                  setDadosCliente({ ...dadosCliente, endereco: e.target.value })
                }
                style={styles.inputWide}
              />
              <input
                type="text"
                placeholder="Número"
                value={dadosCliente.numero}
                onChange={(e) =>
                  setDadosCliente({ ...dadosCliente, numero: e.target.value })
                }
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Bairro"
                value={dadosCliente.bairro}
                onChange={(e) =>
                  setDadosCliente({ ...dadosCliente, bairro: e.target.value })
                }
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Cidade"
                value={dadosCliente.cidade}
                onChange={(e) =>
                  setDadosCliente({ ...dadosCliente, cidade: e.target.value })
                }
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Telefone"
                value={dadosCliente.telefone}
                onChange={(e) =>
                  setDadosCliente({ ...dadosCliente, telefone: e.target.value })
                }
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Celular"
                value={dadosCliente.celular}
                onChange={(e) =>
                  setDadosCliente({ ...dadosCliente, celular: e.target.value })
                }
                style={styles.input}
              />
            </div>
          </fieldset>

          {/* DADOS DO CONTRATO */}
          <fieldset style={styles.fieldset}>
            <legend>Dados do Contrato</legend>
            <div style={styles.formGrid}>
              <div>
                <label>Data da Venda:</label>
                <input
                  type="date"
                  value={dadosContrato.dataVenda}
                  onChange={(e) =>
                    setDadosContrato({
                      ...dadosContrato,
                      dataVenda: e.target.value,
                    })
                  }
                  style={styles.input}
                />
              </div>
              <div>
                <label>Data do Ajuste:</label>
                <input
                  type="date"
                  value={dadosContrato.dataAjuste}
                  onChange={(e) =>
                    setDadosContrato({
                      ...dadosContrato,
                      dataAjuste: e.target.value,
                    })
                  }
                  style={styles.input}
                />
              </div>
              <div>
                <label>Data da Retirada:</label>
                <input
                  type="date"
                  value={dadosContrato.dataRetirada}
                  onChange={(e) =>
                    setDadosContrato({
                      ...dadosContrato,
                      dataRetirada: e.target.value,
                    })
                  }
                  style={styles.input}
                />
              </div>
              <div>
                <label>Data da Entrega:</label>
                <input
                  type="date"
                  value={dadosContrato.dataEntrega}
                  onChange={(e) =>
                    setDadosContrato({
                      ...dadosContrato,
                      dataEntrega: e.target.value,
                    })
                  }
                  style={styles.input}
                />
              </div>
            </div>
          </fieldset>

          {/* ITENS */}
          <fieldset style={styles.fieldset}>
            <legend>Itens do Contrato</legend>
            {dadosContrato.itens.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <input
                  type="text"
                  placeholder="Código"
                  value={item.codigo}
                  onChange={(e) => {
                    const novosItens = [...dadosContrato.itens];
                    novosItens[index].codigo = e.target.value;
                    setDadosContrato({ ...dadosContrato, itens: novosItens });
                  }}
                  style={styles.inputSmall}
                />
                <input
                  type="text"
                  placeholder="Especificação"
                  value={item.especificacao}
                  onChange={(e) => {
                    const novosItens = [...dadosContrato.itens];
                    novosItens[index].especificacao = e.target.value;
                    setDadosContrato({ ...dadosContrato, itens: novosItens });
                  }}
                  style={styles.inputWide}
                />
                <input
                  type="number"
                  placeholder="Valor"
                  value={item.valor}
                  onChange={(e) => {
                    const novosItens = [...dadosContrato.itens];
                    novosItens[index].valor = e.target.value;
                    setDadosContrato({ ...dadosContrato, itens: novosItens });
                  }}
                  style={styles.inputSmall}
                  min="0"
                  step="0.01"
                />
                {dadosContrato.itens.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removerItem(index)}
                    style={styles.removeButton}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={adicionarItem}
              style={styles.addButton}
            >
              + Adicionar Item
            </button>
            <div style={styles.total}>
              <strong>Total: R$ {formatarValor(calcularTotal())}</strong>
            </div>
          </fieldset>

          {/* PAGAMENTO */}
          <fieldset style={styles.fieldset}>
            <legend>Forma de Pagamento</legend>

            <div style={styles.formGrid}>
              <div style={styles.inputWide}>
                <label>Forma de Pagamento:</label>
                <select
                  value={dadosContrato.formaPagamento}
                  onChange={(e) => handleFormaPagamentoChange(e.target.value)}
                  style={styles.select}
                  required
                >
                  <option value="">Selecione uma opção</option>
                  {FORMAS_PAGAMENTO.map((forma) => (
                    <option key={forma.value} value={forma.value}>
                      {forma.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mostrar opções de parcelamento para cartão de crédito */}
            {dadosContrato.formaPagamento === "cartao_credito" && (
              <div style={styles.creditCardSection}>
                <h4 style={{ color: "#5d4037", marginBottom: "1rem" }}>
                  💳 Parcelamento no Cartão de Crédito
                </h4>

                <div style={styles.parcelasContainer}>
                  <label>Número de parcelas:</label>
                  <select
                    onChange={(e) => {
                      const num = parseInt(e.target.value);
                      if (num > 0) gerarParcelas(num);
                    }}
                    style={styles.select}
                  >
                    <option value="">Selecione</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                      <option key={n} value={n}>
                        {n}x {n === 1 ? "(à vista)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {dadosContrato.parcelas.length > 0 && (
                  <div style={styles.parcelasList}>
                    <div style={styles.resumoPagamento}>
                      <div style={styles.resumoHeader}>
                        <h4>Definir Valores das Parcelas:</h4>
                        <button
                          type="button"
                          onClick={distribuirValorIgualmente}
                          style={styles.distribuirButton}
                          title="Dividir o valor total igualmente entre as parcelas"
                        >
                          ⚖️ Distribuir Igualmente
                        </button>
                      </div>

                      <div style={styles.totaisInfo}>
                        <div style={styles.totalItem}>
                          <strong>Valor dos Itens:</strong> R${" "}
                          {formatarValor(calcularTotal())}
                        </div>
                        <div style={styles.totalItem}>
                          <strong>Total das Parcelas:</strong> R${" "}
                          {formatarValor(calcularTotalParcelas())}
                        </div>
                        <div style={styles.totalItem}>
                          <strong>Diferença:</strong>
                          <span
                            style={{
                              color:
                                Math.abs(
                                  calcularTotal() - calcularTotalParcelas()
                                ) < 0.01
                                  ? "#28a745"
                                  : "#dc3545",
                              fontWeight: "bold",
                            }}
                          >
                            R${" "}
                            {formatarValor(
                              calcularTotalParcelas() - calcularTotal()
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={styles.parcelasTable}>
                      <div style={styles.parcelasHeader}>
                        <span>Parcela</span>
                        <span>Valor (R$)</span>
                        <span>Vencimento</span>
                      </div>

                      {dadosContrato.parcelas.map((parcela, index) => (
                        <div key={index} style={styles.parcelaRow}>
                          <span style={styles.parcelaNumero}>
                            {parcela.numero}ª parcela
                          </span>

                          <div style={styles.valorInputContainer}>
                            <span style={styles.moedaSimbolo}>R$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0,00"
                              value={parcela.valor}
                              onChange={(e) =>
                                atualizarValorParcela(index, e.target.value)
                              }
                              style={styles.valorInput}
                            />
                          </div>

                          <input
                            type="date"
                            value={parcela.vencimento}
                            onChange={(e) => {
                              const novasParcelas = [...dadosContrato.parcelas];
                              novasParcelas[index].vencimento = e.target.value;
                              setDadosContrato({
                                ...dadosContrato,
                                parcelas: novasParcelas,
                              });
                            }}
                            style={styles.dateInput}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Alerta se os valores não batem */}
                    {Math.abs(calcularTotal() - calcularTotalParcelas()) >
                      0.01 && (
                      <div style={styles.alertaValores}>
                        ⚠️ <strong>Atenção:</strong> A soma das parcelas não
                        confere com o valor total dos itens.
                        <br />
                        <small>
                          Valor dos itens: R$ {formatarValor(calcularTotal())} |
                          Soma das parcelas: R${" "}
                          {formatarValor(calcularTotalParcelas())}
                        </small>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Informações para outras formas de pagamento */}
            {dadosContrato.formaPagamento &&
              dadosContrato.formaPagamento !== "cartao_credito" && (
                <div style={styles.paymentInfo}>
                  {dadosContrato.formaPagamento === "dinheiro" && (
                    <div style={styles.infoBox}>
                      💰 <strong>Pagamento em Dinheiro:</strong> Pagamento à
                      vista no momento da retirada.
                      <br />
                      Valor total: R$ {formatarValor(calcularTotal())}
                    </div>
                  )}

                  {dadosContrato.formaPagamento === "pix" && (
                    <div style={styles.infoBox}>
                      📱 <strong>Pagamento via PIX:</strong> Chave PIX será
                      fornecida para pagamento.
                      <br />
                      Valor total: R$ {formatarValor(calcularTotal())}
                    </div>
                  )}

                  {dadosContrato.formaPagamento === "cartao_debito" && (
                    <div style={styles.infoBox}>
                      💳 <strong>Cartão de Débito:</strong> Pagamento à vista no
                      débito.
                      <br />
                      Valor total: R$ {formatarValor(calcularTotal())}
                    </div>
                  )}

                  {dadosContrato.formaPagamento === "transferencia" && (
                    <div style={styles.infoBox}>
                      🏦 <strong>Transferência Bancária:</strong> Dados
                      bancários serão fornecidos.
                      <br />
                      Valor total: R$ {formatarValor(calcularTotal())}
                    </div>
                  )}

                  {dadosContrato.formaPagamento === "cheque" && (
                    <div style={styles.infoBox}>
                      📝 <strong>Pagamento em Cheque:</strong> Cheque pré-datado
                      conforme acordado.
                      <br />
                      Valor total: R$ {formatarValor(calcularTotal())}
                    </div>
                  )}

                  {dadosContrato.formaPagamento === "boleto" && (
                    <div style={styles.infoBox}>
                      🧾 <strong>Boleto Bancário:</strong> Boleto será enviado
                      por email.
                      <br />
                      Valor total: R$ {formatarValor(calcularTotal())}
                    </div>
                  )}

                  {dadosContrato.formaPagamento === "misto" && (
                    <div style={styles.infoBox}>
                      🔄 <strong>Pagamento Misto:</strong> Especificar as formas
                      de pagamento:
                      <textarea
                        placeholder="Descreva como será dividido o pagamento (ex: R$ 500,00 dinheiro + R$ 300,00 cartão)"
                        style={styles.textarea}
                        value={dadosContrato.observacoesPagamento || ""}
                        onChange={(e) =>
                          setDadosContrato({
                            ...dadosContrato,
                            observacoesPagamento: e.target.value,
                          })
                        }
                      />
                      <div style={{ marginTop: "0.5rem", fontWeight: "bold" }}>
                        Valor total: R$ {formatarValor(calcularTotal())}
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* Campo adicional de observações para qualquer forma de pagamento */}
            {dadosContrato.formaPagamento && (
              <div style={styles.observacoesContainer}>
                <label>Observações adicionais sobre o pagamento:</label>
                <textarea
                  placeholder="Informações extras sobre condições de pagamento, descontos, etc."
                  style={styles.textarea}
                  value={dadosContrato.observacoesGerais || ""}
                  onChange={(e) =>
                    setDadosContrato({
                      ...dadosContrato,
                      observacoesGerais: e.target.value,
                    })
                  }
                />
              </div>
            )}
          </fieldset>

          <div style={styles.buttonGroup}>
            <button onClick={salvarContrato} style={styles.saveButton}>
              {editandoId ? "Atualizar" : "Salvar"} Contrato
            </button>
            <button onClick={resetarFormulario} style={styles.cancelButton}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* LISTA DE CONTRATOS */}
      <div style={styles.contractsList}>
        <h2 style={styles.subtitulo}>Contratos Salvos ({contratos.length})</h2>

        {contratos.length === 0 ? (
          <p>Nenhum contrato cadastrado.</p>
        ) : (
          contratos.map((contrato) => (
            <div key={contrato.id} style={styles.contractCard}>
              <div style={styles.contractHeader}>
                <h3>{contrato.cliente.nome}</h3>
                <span style={styles.contractTotal}>
                  R$ {formatarValor(contrato.total)}
                </span>
              </div>
              <div style={styles.contractInfo}>
                <p>
                  <strong>Retirada:</strong>{" "}
                  {formatarDataBrasileira(contrato.contrato.dataRetirada)}
                </p>
                <p>
                  <strong>Entrega:</strong>{" "}
                  {formatarDataBrasileira(contrato.contrato.dataEntrega)}
                </p>
                <p>
                  <strong>Itens:</strong> {contrato.contrato.itens.length}
                </p>
              </div>
              <div style={styles.contractActions}>
                <button
                  onClick={() => imprimirContrato(contrato)}
                  style={styles.printButton}
                >
                  🖨️ Imprimir
                </button>
                <button
                  onClick={() => editarContrato(contrato)}
                  style={styles.editButton}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => excluirContrato(contrato.id)}
                  style={styles.deleteButton}
                >
                  🗑️ Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Estilos (mantidos iguais ao original)
const styles = {
  container: {
    maxWidth: "1400px",
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
  actionsContainer: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  newButton: {
    backgroundColor: "#b6a06a",
    color: "white",
    border: "none",
    padding: "1rem 2rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1.1rem",
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginBottom: "2rem",
  },
  fieldset: {
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "1rem",
    marginBottom: "2rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  },
  input: {
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
  },
  inputWide: {
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    gridColumn: "span 2",
  },
  inputSmall: {
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    width: "120px",
  },
  select: {
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
  },
  itemRow: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    marginBottom: "1rem",
  },
  removeButton: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    cursor: "pointer",
  },
  addButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
  },
  total: {
    textAlign: "right",
    fontSize: "1.2rem",
    marginTop: "1rem",
  },
  parcelasContainer: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginTop: "1rem",
  },
  parcelasList: {
    marginTop: "1rem",
  },
  parcelaItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.5rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    marginBottom: "0.5rem",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "1rem 2rem",
    borderRadius: "4px",
    cursor: "pointer",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "1rem 2rem",
    borderRadius: "4px",
    cursor: "pointer",
  },
  contractsList: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  contractCard: {
    border: "1px solid #eee",
    borderRadius: "8px",
    padding: "1.5rem",
    marginBottom: "1rem",
  },
  contractHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  contractTotal: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#b6a06a",
  },
  contractInfo: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
    marginBottom: "1rem",
  },
  contractActions: {
    display: "flex",
    gap: "0.5rem",
  },
  printButton: {
    backgroundColor: "#17a2b8",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
  },
  editButton: {
    backgroundColor: "#ffc107",
    color: "black",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
  },
  resumoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  distribuirButton: {
    backgroundColor: "#17a2b8",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  totaisInfo: {
    backgroundColor: "#f8f9fa",
    padding: "1rem",
    borderRadius: "4px",
    border: "1px solid #dee2e6",
  },
  totalItem: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
  },
  parcelasHeader: {
    display: "grid",
    gridTemplateColumns: "1fr 150px 150px",
    gap: "1rem",
    padding: "0.75rem",
    backgroundColor: "#e9ecef",
    fontWeight: "bold",
    borderBottom: "2px solid #dee2e6",
    alignItems: "center",
  },
  parcelaRow: {
    display: "grid",
    gridTemplateColumns: "1fr 150px 150px",
    gap: "1rem",
    padding: "0.75rem",
    borderBottom: "1px solid #dee2e6",
    alignItems: "center",
  },
  valorInputContainer: {
    display: "flex",
    alignItems: "center",
    position: "relative",
  },
  moedaSimbolo: {
    position: "absolute",
    left: "8px",
    color: "#666",
    fontWeight: "bold",
    zIndex: 1,
  },
  valorInput: {
    width: "100%",
    padding: "0.5rem 0.5rem 0.5rem 2rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    textAlign: "right",
  },
  dateInput: {
    padding: "0.5rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
  },
  alertaValores: {
    backgroundColor: "#fff3cd",
    color: "#856404",
    padding: "1rem",
    borderRadius: "4px",
    border: "1px solid #ffeaa7",
    marginTop: "1rem",
  },
  observacoesContainer: {
    marginTop: "1.5rem",
  },
  textarea: {
    width: "100%",
    minHeight: "80px",
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    marginTop: "0.5rem",
  },
  infoBox: {
    backgroundColor: "#f8f9fa",
    padding: "1rem",
    borderRadius: "4px",
    border: "1px solid #dee2e6",
    marginTop: "1rem",
  },
  creditCardSection: {
    marginTop: "1.5rem",
    padding: "1rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
  },
  parcelaNumero: {
    fontWeight: "500",
  },
};

export default GerenciadorContratos;
