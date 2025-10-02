import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/AuthService";

const GerenciadorContratos = () => {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // Estados para paginação e filtros
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [filtroData, setFiltroData] = useState("semana"); // todos, semana, mes
  const [pesquisa, setPesquisa] = useState("");
  const [mostrarContratos, setMostrarContratos] = useState(false);

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

  // Carregar contratos do banco de dados
  const carregarContratos = async () => {
    try {
      setCarregando(true);
      setErro("");

      // Chamada à API para buscar contratos
      const response = await api.get("/contratos");

      if (response.data.success) {
        setContratos(response.data.contratos);
        `✅ ${response.data.contratos.length} contratos carregados`;
      } else {
        throw new Error(response.data.message || "Erro ao carregar contratos");
      }
    } catch (error) {
      "Erro ao carregar contratos:", error;
      setErro("Falha ao carregar contratos. " + (error.message || ""));

      // Fallback para localStorage se a API falhar
      const contratosSalvos = localStorage.getItem("contratos");
      if (contratosSalvos) {
        setContratos(JSON.parse(contratosSalvos));
        ("⚠️ Usando contratos do localStorage como fallback");
      }
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarContratos();
  }, []);

  const toggleMostrarContratos = () => {
    setMostrarContratos(!mostrarContratos);
  };

  // Salvar contratos no banco de dados e localStorage
  const salvarContratos = async (novoContrato, isUpdate = false) => {
    try {
      setCarregando(true);

      let response;

      if (isUpdate) {
        // Atualizar contrato existente
        response = await api.put(`/contratos/${novoContrato.id}`, novoContrato);
      } else {
        // Criar novo contrato
        response = await api.post("/contratos", novoContrato);
      }

      if (response.data.success) {
        // Recarregar a lista de contratos
        await carregarContratos();
        `✅ Contrato ${isUpdate ? "atualizado" : "criado"} com sucesso`;
      } else {
        throw new Error(response.data.message || "Erro ao salvar contrato");
      }
    } catch (error) {
      `Erro ao ${isUpdate ? "atualizar" : "criar"} contrato:`, error;
      setErro(
        `Falha ao ${isUpdate ? "atualizar" : "criar"} contrato. ${
          error.message || ""
        }`
      );

      // Fallback para localStorage se a API falhar
      const contratosSalvos = localStorage.getItem("contratos")
        ? JSON.parse(localStorage.getItem("contratos"))
        : [];

      let novosContratos;

      if (isUpdate) {
        novosContratos = contratosSalvos.map((c) =>
          c.id === novoContrato.id ? novoContrato : c
        );
      } else {
        novosContratos = [...contratosSalvos, novoContrato];
      }

      localStorage.setItem("contratos", JSON.stringify(novosContratos));
      setContratos(novosContratos);
      ("⚠️ Salvando no localStorage como fallback");
    } finally {
      setCarregando(false);
    }
  };

  // Excluir contrato
  const excluirContrato = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este contrato?")) {
      try {
        setCarregando(true);

        const response = await api.delete(`/contratos/${id}`);

        if (response.data.success) {
          await carregarContratos();
          ("✅ Contrato excluído com sucesso");
        } else {
          throw new Error(response.data.message || "Erro ao excluir contrato");
        }
      } catch (error) {
        "Erro ao excluir contrato:", error;
        setErro("Falha ao excluir contrato. " + (error.message || ""));

        // Fallback para localStorage se a API falhar
        const contratosSalvos = localStorage.getItem("contratos")
          ? JSON.parse(localStorage.getItem("contratos"))
          : [];

        const novosContratos = contratosSalvos.filter((c) => c.id !== id);
        localStorage.setItem("contratos", JSON.stringify(novosContratos));
        setContratos(novosContratos);
        ("⚠️ Excluindo do localStorage como fallback");
      } finally {
        setCarregando(false);
      }
    }
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

    // Salvar no banco de dados (e localStorage como fallback)
    salvarContratos(novoContrato, !!editandoId);
    resetarFormulario();
  };

  // Editar contrato
  const editarContrato = (contrato) => {
    setDadosCliente(contrato.cliente);
    setDadosContrato(contrato.contrato);
    setEditandoId(contrato.id);
    setMostrarFormulario(true);
    window.scrollTo(0, 0);
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

  // Filtrar contratos por data
  const filtrarContratosPorData = () => {
    if (filtroData === "todos") {
      return contratos;
    }

    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay()); // Domingo da semana atual

    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    return contratos.filter((contrato) => {
      const dataContrato = new Date(contrato.dataCriacao);

      if (filtroData === "semana") {
        return dataContrato >= inicioSemana;
      } else if (filtroData === "mes") {
        return dataContrato >= inicioMes;
      }

      return true;
    });
  };

  // Filtrar contratos por pesquisa
  const filtrarContratosPorPesquisa = (contratosFiltrados) => {
    if (!pesquisa) return contratosFiltrados;

    const termoPesquisa = pesquisa.toLowerCase();

    return contratosFiltrados.filter(
      (contrato) =>
        contrato.cliente.nome.toLowerCase().includes(termoPesquisa) ||
        contrato.cliente.cpf.includes(termoPesquisa) ||
        contrato.contrato.itens.some((item) =>
          item.especificacao.toLowerCase().includes(termoPesquisa)
        )
    );
  };

  // Contratos filtrados e paginados
  const getContratosFiltrados = () => {
    const contratosFiltradosPorData = filtrarContratosPorData();
    const contratosFiltrados = filtrarContratosPorPesquisa(
      contratosFiltradosPorData
    );

    // Ordenar por data de criação (mais recentes primeiro)
    const contratosOrdenados = [...contratosFiltrados].sort(
      (a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao)
    );

    // Calcular índices para paginação
    const indexInicial = (paginaAtual - 1) * itensPorPagina;
    const indexFinal = indexInicial + itensPorPagina;

    return {
      contratos: contratosOrdenados.slice(indexInicial, indexFinal),
      total: contratosOrdenados.length,
    };
  };

  const { contratos: contratosPaginados, total: totalContratos } =
    getContratosFiltrados();
  const totalPaginas = Math.ceil(totalContratos / itensPorPagina);

  // Imprimir contrato - ESTRUTURA EXATA SOLICITADA EM 2 FOLHAS
  // Imprimir contrato - ESTRUTURA EXATA SOLICITADA EM 2 FOLHAS
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
          margin: 1.2cm;
          size: A4;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Times New Roman', serif;
          font-size: 9.5pt;
          line-height: 1.15;
          color: #000;
          background: white;
          padding: 10px;
        }
        
        .contract-title {
          font-size: 11pt;
          font-weight: bold;
          text-align: center;
          margin: 3px 0 8px 0;
          text-transform: uppercase;
          border-bottom: 1px solid #000;
          padding-bottom: 3px;
        }
        
        .section {
          margin-bottom: 8px;
        }
        
        .party {
          margin-bottom: 6px;
          text-align: justify;
          font-size: 9.5pt;
        }
        
        .underline {
          border-bottom: 1px solid #000;
          display: inline-block;
          min-width: 160px;
          margin: 0 2px;
          height: 12px;
        }
        
        .underline-small {
          border-bottom: 1px solid #000;
          display: inline-block;
          min-width: 60px;
          margin: 0 2px;
          height: 12px;
        }
        
        .underline-large {
          border-bottom: 1px solid #000;
          display: inline-block;
          min-width: 250px;
          margin: 0 2px;
          height: 12px;
        }
        
        .dates-line {
          margin: 4px 0;
          font-size: 9.5pt;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 6px 0;
          font-size: 8.5pt;
        }
        
        .items-table th {
          padding: 3px;
          text-align: left;
          font-weight: bold;
          border-bottom: 1px solid #000;
          background-color: #f5f5f5;
        }
        
        .items-table td {
          padding: 3px;
          text-align: left;
          vertical-align: top;
          border-bottom: 1px solid #ddd;
        }
        
        .clause-title {
          font-weight: bold;
          margin: 8px 0 3px 0;
          text-decoration: underline;
          font-size: 9.5pt;
        }
        
        .clause-content {
          text-align: justify;
          margin-bottom: 4px;
          line-height: 1.2;
          font-size: 9pt;
        }
        
        .signature-section {
          margin: 10px 0;
        }
        
        .signature-line {
          margin: 15px 0;
          font-size: 9.5pt;
        }
        
        .witness-section {
          margin-top: 20px;
        }
        
        .witness {
          margin-bottom: 12px;
          font-size: 8.5pt;
        }
        
        .page-break {
          page-break-before: always;
          margin-top: 15px;
        }
        
        .compact-text {
          font-size: 9pt;
          line-height: 1.15;
        }
        
        .no-spacing {
          margin: 0;
          padding: 0;
        }
        
        .tight-section {
          margin-bottom: 6px;
        }
        
        .ultra-compact {
          font-size: 8.5pt;
          line-height: 1.1;
        }

        @media print {
          body { 
            print-color-adjust: exact;
            font-size: 9pt;
          }
        }
      </style>
    </head>
    <body>
      <!-- PRIMEIRA FOLHA -->
      <div class="contract-title">
        CONTRATO EXTRAJUDICIAL DE RESERVA E LOCAÇÃO
      </div>

      <div class="section tight-section">
        <div class="party ultra-compact">
          Pelo presente instrumento particular de contrato de locação, as partes a seguir identificadas:
        </div>
        
        <div class="party ultra-compact">
          <strong>LOCADORA:</strong> Érica Damas Lino EIRELI, pessoa jurídica de direito privado, inscrita no CNPJ sob nº 11.791386/0001-13, com sede na cidade de Pará de Minas/MG, a Rua Goiás, 275, Bairro: São José, doravante denominada "LOCADORA";
        </div>
        
        <div class="party ultra-compact">
          <strong>LOCATÁRIO</strong>
          <span class="underline-large">${cliente.nome.toUpperCase()}</span>
          , Nacionalidade: 
          <span class="underline">${
            cliente.nacionalidade || "Brasileira"
          }</span>
          , Profissão: 
          <span class="underline">${cliente.profissao || ""}</span>
          , portador(a) do CPF nº 
          <span class="underline">${formatarCPF(cliente.cpf)}</span>
          , residente e domiciliado(a) à Rua 
          <span class="underline">${cliente.endereco || ""}</span>
          Nº 
          <span class="underline-small">${cliente.numero || ""}</span>
          , Bairro: 
          <span class="underline">${cliente.bairro || ""}</span>
          , Cidade: 
          <span class="underline">${cliente.cidade || ""}</span>
          , Estado: MG, doravante denominado(a) "LOCATÁRIO";
        </div>

        <div class="party ultra-compact">
          As partes identificadas acima têm, entre si, justos e acertados o presente CONTRATO EXTRAJUDICIAL DE RESERVA E LOCAÇÃO, que se regerá pelas cláusulas seguintes e pelas condições de preço, forma e termo de pagamentos descritas no presente.
        </div>

        <div class="dates-line ultra-compact">
          <strong>DATA VENDA:</strong> <span class="underline">${formatarDataBrasileira(
            dadosContrato.dataVenda
          )}</span>
        </div>
        <div class="dates-line ultra-compact">
          <strong>DATA AJUSTE:</strong> <span class="underline">${formatarDataBrasileira(
            dadosContrato.dataAjuste
          )}</span>
        </div>
        <div class="dates-line ultra-compact">
          <strong>DATA DA RETIRADA DA LOCAÇÃO:</strong> <span class="underline">${formatarDataBrasileira(
            dadosContrato.dataRetirada
          )}</span>
        </div>
        <div class="dates-line ultra-compact">
          <strong>DATA DA ENTREGA (DEVOLUÇÃO) DA LOCAÇÃO:</strong> <span class="underline">${formatarDataBrasileira(
            dadosContrato.dataEntrega
          )}</span>
        </div>
      </div>

      <div class="section tight-section">
        <div class="clause-title">2. DO OBJETO DO CONTRATO</div>
        <div class="clause-content ultra-compact">
          <strong>Cláusula 1ª.</strong> É objeto do presente contrato a locação dos seguintes trajes e acessórios.
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 15%">CÓDIGO</th>
              <th style="width: 55%">ESPECIFICAÇÃO</th>
              <th style="width: 30%">VALOR</th>
            </tr>
          </thead>
          <tbody>
            ${dadosContrato.itens
              .map(
                (item) => `
              <tr>
                <td>${item.codigo || ""}</td>
                <td>${item.especificacao || ""}</td>
                <td>R$ ${formatarValor(item.valor)}</td>
              </tr>
            `
              )
              .join("")}
            <tr style="background-color: #f8f8f8;">
              <td colspan="2" style="text-align: right;"><strong>Total bruto: R$</strong></td>
              <td><strong>${formatarValor(total)}</strong></td>
            </tr>
            <tr>
              <td colspan="2" style="text-align: right;"><strong>Desconto aplicado: R$</strong></td>
              <td><strong>0,00</strong></td>
            </tr>
            <tr style="background-color: #f0f0f0;">
              <td colspan="2" style="text-align: right;"><strong>Total liquido da locação: R$</strong></td>
              <td><strong>${formatarValor(total)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section tight-section">
        <div class="clause-title">3. FORMA DE PAGAMENTO CONTRATADA:</div>
        <div class="clause-content ultra-compact">
          Especificar: <span class="underline-large">${
            FORMAS_PAGAMENTO.find(
              (f) => f.value === dadosContrato.formaPagamento
            )?.label ||
            dadosContrato.formaPagamento ||
            ""
          }</span>
        </div>
        
        <div class="clause-content ultra-compact">
          Observação: <span class="underline-large">${
            dadosContrato.observacoesPagamento || ""
          }</span>
        </div>

        <div class="clause-content ultra-compact no-spacing">
          Todos os ajustes foram feitos na hora, aprovados e conferidos pela cliente, a mesma efetuou os ajustes e está levando o vestido de imediato.
        </div>
        
        <div class="clause-content ultra-compact no-spacing">
          Recebi a peça conforme combinado, com ajustes, limpa, sem danos e na data combinada.
        </div>

        <div class="signature-section tight-section">
          <div class="clause-content ultra-compact no-spacing">
            Pará de Minas – MG, 
            <span class="underline-small">${new Date().getDate()}</span>
            de 
            <span class="underline-small">${new Date().toLocaleDateString(
              "pt-BR",
              { month: "long" }
            )}</span>
            de 
            <span class="underline-small">${new Date().getFullYear()}</span>
          </div>
          
          <div class="clause-content ultra-compact no-spacing">
            Assinatura do cliente recebedor: <span class="underline-large"></span>
          </div>
        </div>

        <div class="clause-content ultra-compact no-spacing">
          têm entre si justo e contratado o que segue, com base nas cláusulas e condições abaixo:
        </div>
      </div>

      <!-- CLÁUSULAS 1-4 NA PRIMEIRA FOLHA -->
      <div class="section tight-section">
        <div class="clause-title">CLÁUSULA 1 – OBJETO</div>
        <div class="clause-content ultra-compact">
          1.1 O presente contrato tem por objeto a locação de trajes e acessórios, conforme especificações acordadas entre as partes no ato da contratação.
        </div>
      </div>

      <div class="section tight-section">
        <div class="clause-title">CLÁUSULA 2 – OBRIGAÇÕES DO LOCATÁRIO</div>
        <div class="clause-content ultra-compact">
          2.1 Informações e Ajustes: O LOCATÁRIO deverá fornecer todas as informações necessárias para a locação e comparecer na data agendada para prova e ajuste das peças, utilizando os sapatos que usará no evento. A ausência ou descumprimento dessas obrigações isenta a LOCADORA de possíveis falhas ao realizar os ajustes, ou até mesmo de realizar os ajustes.
        </div>
        <div class="clause-content ultra-compact">
          2.2 Limitações dos Ajustes: Os ajustes realizados são simples, manuais e sem corte de tecido, consistindo apenas em dobras costuradas à mão. Tais ajustes podem apresentar marcas aparentes, folgas ou papos, sendo considerados provisórios. Costuras manuais não têm a mesma resistência das feitas à máquina e podem se soltar durante o uso.
        </div>
        <div class="clause-content ultra-compact">
          2.3 Estado das Peças: As peças locadas são adaptadas ao cliente para uso único, sem garantia de ajuste perfeito. Não são realizados rebordados ou alterações estruturais, apenas ajustes simples.
        </div>
        <div class="clause-content ultra-compact">
          2.4 Primeiro Aluguel: A LOCADORA não realiza nem garante primeiro aluguel em peças prontas para locação.
        </div>
        <div class="clause-content ultra-compact">
          2.5 Responsabilidade por Acessórios: Os acessórios entregues (bolsas, sapatos, cintos, cabides, capas etc.) serão fornecidos em perfeitas condições. O LOCATÁRIO responderá pelo valor de reposição em caso de danos ou extravio.
        </div>
      </div>

      <!-- SEGUNDA FOLHA -->
      <div class="page-break"></div>

      <!-- CONTINUAÇÃO CLÁUSULA 2 -->
      <div class="section tight-section">
        <div class="clause-content ultra-compact">
          2.6 Proibição de Alterações Não Autorizadas: É vedado ao LOCATÁRIO realizar qualquer alteração nos ajustes feitos pela LOCADORA sem autorização expressa e por escrito. O descumprimento implicará multa de até 5 (cinco) vezes o valor da locação.
        </div>
        <div class="clause-content ultra-compact">
          2.7 Conferência e Aceite das Peças: Todas as peças devem ser conferidas ao todo, higienização das peças, fechos, zíper, ajustes efetuados, barras, costuras no geral e outros mais, e apenas após provadas, efetuar a assinatura do termo de retirada,(assinatura do cliente recebedor).
        </div>
        <div class="clause-content ultra-compact">
          O LOCATÁRIO assume integral responsabilidade pela guarda, conservação e devolução das peças, não sendo aceitas reclamações posteriores.
        </div>
        <div class="clause-content ultra-compact">
          2.8 Pagamento: A liberação dos itens locados está condicionada à quitação total do valor contratual até a data da retirada. São aceitas as seguintes formas de pagamento: Pix, dinheiro e cartão de crédito (bandeiras Visa e Mastercard).Na falta da quitação total da retirada, valores pagos anteriores serão retidos a título de reserva e não serão devolvidos.
        </div>
      </div>

      <div class="section tight-section">
        <div class="clause-title">CLÁUSULA 3 – OBRIGAÇÕES DA LOCADORA</div>
        <div class="clause-content ultra-compact">
          3.1 Disponibilidade: A LOCADORA disponibilizará a loja para retirada e devolução de peças de segunda a sexta-feira, das 9h às 18h, e aos sábados das 9h às 12h, exceto feriados.
        </div>
        <div class="clause-content ultra-compact">
          3.2 Retirada de Itens: O LOCATÁRIO compromete-se a retirar os itens na data estipulada. A LOCADORA não se responsabiliza por peças não retiradas, sendo devido o valor integral da locação, ainda que a peça não tenha sido utilizada.
        </div>
        <div class="clause-content ultra-compact">
          3.3 Substituição de Peças: A LOCADORA poderá substituir peças por similares, de acordo com a disponibilidade ou necessidade estética, sem necessidade de autorização prévia.
        </div>
      </div>

      <div class="section tight-section">
        <div class="clause-title">CLÁUSULA 4 – CANCELAMENTO, MULTAS, TROCAS E CRÉDITO</div>
        <div class="clause-content ultra-compact">
          4.1 Rescisão: O contrato poderá ser rescindido por qualquer das partes mediante aviso prévio por escrito. Aplicam-se as seguintes penalidades:
        </div>
        <div class="clause-content ultra-compact">
          20% (vinte por cento) do valor total do contrato, no caso de peças sem ajustes;
        </div>
        <div class="clause-content ultra-compact">
          100% (cem por cento) do valor total, no caso de peças ajustadas ou não retiradas na data combinada.
        </div>
        <div class="clause-content ultra-compact">
          4.2 Sinal (Arras): Após o pagamento do sinal, não haverá devolução do valor em caso de cancelamento por parte do LOCATÁRIO. O valor poderá ser convertido em crédito, válido por 365 dias, descontadas eventuais penalidades. Após esse prazo, o crédito perderá a validade.
        </div>
        <div class="clause-content ultra-compact">
          4.3 Cancelamento pela LOCADORA: No caso de cancelamento por parte da LOCADORA, serão devolvidos ao LOCATÁRIO os valores referentes aos serviços não prestados.
        </div>
        <div class="clause-content ultra-compact">
          4.4 Troca de Reserva: A troca de reserva estará sujeita a cobrança de taxa correspondente a 10% (dez por cento) do valor da peça retirada do contrato.
        </div>
      </div>

      <div class="section tight-section">
        <div class="clause-title">CLÁUSULA 5 – CONDIÇÕES GERAIS, CUIDADOS E MULTAS</div>
        <div class="clause-content ultra-compact">
          5.1 Sujeira e Manchas: Será aplicada multa de R$ 50,00 (cinquenta reais) por peça devolvida com sujeira excessiva, manchas ou arrasto de barra.
        </div>
        <div class="clause-content ultra-compact">
          5.2 Danos e Extravio: Em caso de danos irreparáveis ou extravio, o LOCATÁRIO pagará indenização correspondente a 5 (cinco) vezes o valor da locação do item.
        </div>
        <div class="clause-content ultra-compact">
          5.3 Atraso na Devolução: A devolução fora do prazo gerará multa diária de 10% (dez por cento) sobre o valor da locação.
        </div>
        <div class="clause-content ultra-compact">
          5.4 Extravio: A não devolução após 10 (dez) dias será considerada extravio, sujeitando o LOCATÁRIO à indenização de 5 (cinco) vezes o valor da peça, com prazo de pagamento de até 30 dias.
        </div>
        <div class="clause-content ultra-compact">
          5.5 Avaliação das Peças: A LOCADORA terá o prazo de até 10 (dez) dias úteis, a contar da data da devolução, para realizar a avaliação das peças. Em caso de constatação de danos, o LOCATÁRIO será notificado.
        </div>
        <div class="clause-content ultra-compact">
          5.6 Alterações Proibidas: É terminantemente proibida qualquer modificação física nas peças locadas, tais como corte, bainha, costura ou outras intervenções.
        </div>
      </div>

      <div class="section tight-section">
        <div class="clause-title">CLÁUSULA 6 – USO DE IMAGEM</div>
        <div class="clause-content ultra-compact">
          6.1 O LOCATÁRIO autoriza, de forma gratuita e irrevogável, o uso de sua imagem, decorrente do uso das peças locadas, para fins de divulgação da LOCADORA, em quaisquer meios de comunicação, físicos ou digitais.
        </div>
      </div>

      <div class="section tight-section">
        <div class="clause-title">CLÁUSULA 7 – TÍTULO EXECUTIVO</div>
        <div class="clause-content ultra-compact">
          7.1 Este contrato constitui título executivo extrajudicial, nos termos do artigo 784, inciso III, do Código de Processo Civil, para fins de cobrança de valores não pagos, bem como de indenizações por danos ou extravios dos itens locados.
        </div>
      </div>

      <div class="section tight-section">
        <div class="clause-title">CLÁUSULA 8 – FORO</div>
        <div class="clause-content ultra-compact">
          8.1 Para dirimir quaisquer controvérsias oriundas deste contrato, as partes elegem o foro da Comarca de Pará de Minas/MG, renunciando a qualquer outro, por mais privilegiado que seja.
        </div>
      </div>

      <div class="section tight-section">
        <div class="clause-content ultra-compact">
          E, por estarem justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor, juntamente com as testemunhas abaixo.
        </div>
        
        <div class="clause-content ultra-compact">
          Pará de Minas/MG, 
          <span class="underline-small">${new Date().getDate()}</span>
          de 
          <span class="underline-small">${new Date().toLocaleDateString(
            "pt-BR",
            { month: "long" }
          )}</span>
          de 
          <span class="underline-small">20${new Date()
            .getFullYear()
            .toString()
            .slice(-2)}</span>
        </div>
      </div>

      <div class="signature-section tight-section">
        <div class="signature-line ultra-compact">
          <strong>LOCADORA:</strong><br>
          Érica Damas Lino Eireli<br>
          Representante Legal: <span class="underline-large"></span>
        </div>
        
        <div class="signature-line ultra-compact">
          <strong>LOCATÁRIO:</strong><span class="underline-large"></span><br>
          Nome: <span class="underline">${
            cliente.nome
          }</span> CPF: <span class="underline">${formatarCPF(
      cliente.cpf
    )}</span>
        </div>
      </div>

      <div class="witness-section">
        <div class="witness ultra-compact">
          <strong>TESTEMUNHA 1:</strong><br>
          Nome:<br>
          CPF:<br>
          Assinatura: <span class="underline-large"></span>
        </div>
        
        <div class="witness ultra-compact">
          <strong>TESTEMUNHA 2:</strong><br>
          Nome:<br>
          CPF:<br>
          Assinatura: <span class="underline-large"></span>
        </div>
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

      {erro && (
        <div style={styles.erro}>
          {erro}
          <button onClick={() => setErro("")} style={styles.closeErrorButton}>
            ×
          </button>
        </div>
      )}

      <div style={styles.actionsContainer}>
        <button
          onClick={() => setMostrarFormulario(true)}
          style={styles.newButton}
          disabled={carregando}
        >
          + Novo Contrato
        </button>

        <button
          onClick={toggleMostrarContratos}
          style={{
            ...styles.newButton,
            backgroundColor: mostrarContratos ? "#6c757d" : "#b6a06a",
            position: "relative",
          }}
          disabled={carregando}
        >
          {mostrarContratos ? "Ocultar Contratos" : "Ver Contratos Feitos"}
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
            <button
              onClick={salvarContrato}
              style={styles.saveButton}
              disabled={carregando}
            >
              {carregando ? "Salvando..." : editandoId ? "Atualizar" : "Salvar"}{" "}
              Contrato
            </button>
            <button
              onClick={resetarFormulario}
              style={styles.cancelButton}
              disabled={carregando}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ⭐⭐ ENVOLVER TODO O BLOCO DE CONTRATOS ⭐⭐ */}
      {mostrarContratos && (
        <div style={styles.contractsSection}>
          {/* FILTROS E PESQUISA */}
          <div style={styles.filtrosContainer}>
            <div style={styles.filtroItem}>
              <label>Período:</label>
              <select
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                style={styles.filtroSelect}
              >
                <option value="semana">Esta semana</option>
                <option value="mes">Este mês</option>
                <option value="todos">Todos</option>
              </select>
            </div>

            <div style={styles.filtroItem}>
              <label>Itens por página:</label>
              <select
                value={itensPorPagina}
                onChange={(e) => setItensPorPagina(Number(e.target.value))}
                style={styles.filtroSelect}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            <div style={styles.pesquisaContainer}>
              <input
                type="text"
                placeholder="Pesquisar por nome, CPF ou item..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                style={styles.pesquisaInput}
              />
            </div>
          </div>

          {/* LISTA DE CONTRATOS */}
          <div style={styles.contractsList}>
            <h2 style={styles.subtitulo}>
              Contratos{" "}
              {filtroData === "semana"
                ? "da Semana"
                : filtroData === "mes"
                ? "do Mês"
                : ""}
              <span style={styles.contratosCount}>
                {totalContratos}{" "}
                {totalContratos === 1 ? "contrato" : "contratos"}
              </span>
            </h2>

            {carregando && (
              <div style={styles.loading}>
                <div style={styles.spinner}></div>
                <p>Carregando contratos...</p>
              </div>
            )}

            {!carregando && contratosPaginados.length === 0 ? (
              <div style={styles.emptyMessage}>
                <p>Nenhum contrato encontrado para os filtros selecionados.</p>
              </div>
            ) : (
              <div style={styles.compactContractsList}>
                {contratosPaginados.map((contrato) => (
                  <div key={contrato.id} style={styles.compactContractCard}>
                    <div style={styles.compactContractInfo}>
                      <div style={styles.compactContractHeader}>
                        <h3 style={styles.compactContractName}>
                          {contrato.cliente.nome}
                        </h3>
                        <span style={styles.compactContractTotal}>
                          R$ {formatarValor(contrato.total)}
                        </span>
                      </div>

                      <div style={styles.compactContractDetails}>
                        <div style={styles.compactContractDetail}>
                          <span style={styles.detailLabel}>Retirada:</span>
                          <span>
                            {formatarDataBrasileira(
                              contrato.contrato.dataRetirada
                            )}
                          </span>
                        </div>
                        <div style={styles.compactContractDetail}>
                          <span style={styles.detailLabel}>Entrega:</span>
                          <span>
                            {formatarDataBrasileira(
                              contrato.contrato.dataEntrega
                            )}
                          </span>
                        </div>
                        <div style={styles.compactContractDetail}>
                          <span style={styles.detailLabel}>Itens:</span>
                          <span>{contrato.contrato.itens.length}</span>
                        </div>
                      </div>
                    </div>

                    <div style={styles.compactContractActions}>
                      <button
                        onClick={() => imprimirContrato(contrato)}
                        style={styles.compactActionButton}
                        title="Imprimir Contrato"
                      >
                        🖨️
                      </button>
                      <button
                        onClick={() => editarContrato(contrato)}
                        style={styles.compactActionButton}
                        title="Editar Contrato"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => excluirContrato(contrato.id)}
                        style={styles.compactActionButton}
                        title="Excluir Contrato"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PAGINAÇÃO */}
            {totalPaginas > 1 && (
              <div style={styles.paginacao}>
                <button
                  onClick={() => setPaginaAtual(1)}
                  disabled={paginaAtual === 1}
                  style={
                    paginaAtual === 1
                      ? styles.paginaBotaoDesabilitado
                      : styles.paginaBotao
                  }
                >
                  &laquo;
                </button>

                <button
                  onClick={() => setPaginaAtual(paginaAtual - 1)}
                  disabled={paginaAtual === 1}
                  style={
                    paginaAtual === 1
                      ? styles.paginaBotaoDesabilitado
                      : styles.paginaBotao
                  }
                >
                  &lt;
                </button>

                <span style={styles.paginaInfo}>
                  Página {paginaAtual} de {totalPaginas}
                </span>

                <button
                  onClick={() => setPaginaAtual(paginaAtual + 1)}
                  disabled={paginaAtual === totalPaginas}
                  style={
                    paginaAtual === totalPaginas
                      ? styles.paginaBotaoDesabilitado
                      : styles.paginaBotao
                  }
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ⭐⭐ FIM DO BLOCO ENVOLVIDO ⭐⭐ */}
    </div>
  );
};
// Estilos atualizados
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
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contratosCount: {
    fontSize: "1rem",
    color: "#666",
    fontWeight: "normal",
    backgroundColor: "#f0f0f0",
    padding: "0.25rem 0.75rem",
    borderRadius: "15px",
  },
  actionsContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
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

  // Novos estilos para contratos compactos
  compactContractsList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1rem",
  },
  compactContractCard: {
    border: "1px solid #eee",
    borderRadius: "8px",
    padding: "1rem",
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease",
  },
  compactContractInfo: {
    flex: 1,
  },
  compactContractHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  compactContractName: {
    fontSize: "1.1rem",
    fontWeight: "500",
    margin: 0,
    color: "#5d4037",
  },
  compactContractTotal: {
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#b6a06a",
  },
  compactContractDetails: {
    fontSize: "0.9rem",
  },
  compactContractDetail: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.25rem",
  },
  detailLabel: {
    color: "#666",
    marginRight: "0.5rem",
  },
  compactContractActions: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    marginLeft: "1rem",
  },
  compactActionButton: {
    backgroundColor: "transparent",
    border: "1px solid #ddd",
    borderRadius: "4px",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "1rem",
    padding: 0,
    transition: "all 0.2s ease",
  },

  // Estilos para filtros e paginação
  filtrosContainer: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
    backgroundColor: "#f9f9f9",
    padding: "1rem",
    borderRadius: "8px",
  },
  filtroItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  filtroSelect: {
    padding: "0.5rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "0.9rem",
  },
  pesquisaContainer: {
    flex: 1,
  },
  pesquisaInput: {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "0.9rem",
  },
  paginacao: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.5rem",
    marginTop: "2rem",
  },
  paginaBotao: {
    padding: "0.5rem 0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "#fff",
    cursor: "pointer",
  },
  paginaBotaoDesabilitado: {
    padding: "0.5rem 0.75rem",
    border: "1px solid #eee",
    borderRadius: "4px",
    backgroundColor: "#f9f9f9",
    color: "#ccc",
    cursor: "not-allowed",
  },
  paginaInfo: {
    padding: "0 1rem",
  },

  // Estilos para mensagens e erros
  erro: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1.5rem",
    position: "relative",
  },
  closeErrorButton: {
    position: "absolute",
    top: "0.5rem",
    right: "0.5rem",
    background: "none",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
    color: "#c62828",
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
    color: "#666",
  },

  // Estilos restantes do componente original
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
  // Adicione estes estilos no final do objeto styles, antes do };
  toggleButton: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "1rem 2rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1.1rem",
    marginLeft: "1rem",
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },

  badge: {
    backgroundColor: "#dc3545",
    color: "white",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    fontSize: "0.8rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: "-5px",
    right: "-5px",
  },

  contractsSection: {
    marginTop: "2rem",
    animation: "fadeIn 0.3s ease-in",
  },
};

export default GerenciadorContratos;
