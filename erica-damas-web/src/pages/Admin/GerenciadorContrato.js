import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/AuthService";

const GerenciadorContratos = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [contratos, setContratos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  // Estados para paginação e filtros
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [filtroData, setFiltroData] = useState("semana");
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
    numeroContrato: "",
    dataVenda: "",
    dataAjuste: "",
    dataRetirada: "",
    dataEntrega: "",
    pecaEncomenda: "nao",
    planoLivreTroca: "nao",
    formaPagamento: "",
    formaPagamentoOutro: "",
    itens: [{ codigo: "", especificacao: "", valor: "" }],
    parcelas: [],
    observacoesPagamento: "",
    observacoesGerais: "",
    avalistas: [
      { cpfCnpj: "", endereco: "" },
      { cpfCnpj: "", endereco: "" },
    ],
    promissoria: {
      vencimento: "",
      valor: "",
      ao: "",
      pagar: "",
      cpfCnpj: "",
      endereco: "",
      emitente: "",
      dataEmissao: "",
      emitenteCpfCnpj: "",
      emitenteEndereco: "",
    },
  });

  // Estados para cláusulas editáveis
  const [clausulas, setClausulas] = useState({
    clausula1: {
      titulo: "CLÁUSULA 1 – OBJETO",
      conteudo:
        "1.1 O presente contrato tem por objeto a locação de trajes e acessórios, conforme especificações acordadas entre as partes no ato da contratação.",
    },
    clausula2: {
      titulo: "CLÁUSULA 2 – OBRIGAÇÕES DO LOCATÁRIO",
      itens: [
        {
          subtitulo: "2.1 Informações e Ajustes:",
          texto:
            "O LOCATÁRIO deverá fornecer todas as informações necessárias para a locação e comparecer na data agendada para prova e ajuste das peças, utilizando os sapatos que usará no evento. A ausência ou descumprimento dessas obrigações isenta a LOCADORA de possíveis falhas ao realizar os ajustes, ou até mesmo de realizar os ajustes.",
        },
        {
          subtitulo: "2.2 Limitações dos Ajustes:",
          texto:
            "Os ajustes realizados são simples, manuais e sem corte de tecido, consistindo apenas em dobras costuradas à mão. Tais ajustes podem apresentar marcas aparentes, folgas ou papos, sendo considerados provisórios. Costuras manuais não têm a mesma resistência das feitas à máquina e podem se soltar durante o uso.",
        },
        {
          subtitulo: "2.3 Estado das Peças:",
          texto:
            "As peças locadas são adaptadas ao cliente para uso único, sem garantia de ajuste perfeito. Não são realizados rebordados ou alterações estruturais, apenas ajustes simples.",
        },
        {
          subtitulo: "2.4 Primeiro Aluguel:",
          texto:
            "A LOCADORA não realiza nem garante primeiro aluguel em peças prontas para locação.",
        },
        {
          subtitulo: "2.5 Responsabilidade por Acessórios:",
          texto:
            "Os acessórios entregues (bolsas, sapatos, cintos, cabides, capas etc.) serão fornecidos em perfeitas condições. O LOCATÁRIO responderá pelo valor de reposição em caso de danos ou extravio.",
        },
        {
          subtitulo: "2.6 Proibição de Alterações na(s) peça(s) ou nos ajustes realizados:",
          texto:
            "É vedado ao LOCATÁRIO realizar qualquer alteração na(s) peça(s) e nos ajustes feitos pela LOCADORA sem autorização expressa e por escrito. O descumprimento implicará multa de 5 (cinco) vezes o valor da locação.",
        },
        {
          subtitulo: "2.7 Conferência e Aceite das Peças:",
          texto:
            "Todas as peças devem ser conferidas ao todo, higienização das peças, fechos, zíper, ajustes efetuados, barras, costuras no geral e outros mais, e apenas após provadas, efetuar a assinatura do termo de retirada,(assinatura do cliente recebedor). O LOCATÁRIO assume integral responsabilidade pela guarda, conservação e devolução das peças, não sendo aceitas reclamações posteriores.",
        },
        {
          subtitulo: "2.8 Pagamento:",
          texto:
            "A liberação dos itens locados está condicionada à quitação total do valor contratual até a data da retirada. São aceitas as seguintes formas de pagamento: Pix, dinheiro e cartão de crédito (bandeiras Visa e Mastercard). Na falta da quitação total da retirada, valores pagos anteriores serão retidos a título de reserva e não serão devolvidos.",
        },
      ],
    },
    clausula3: {
      titulo: "CLÁUSULA 3 – OBRIGAÇÕES DA LOCADORA",
      itens: [
        {
          subtitulo: "3.1 Disponibilidade:",
          texto:
            "A LOCADORA disponibilizará a loja para ajuste, retirada e devolução de peça de segunda a sexta-feira, das 9:00h às 17:00hs, e aos sábados das 9:00hs às 11:00hs, exceto feriados.",
        },
        {
          subtitulo: "3.2 Retirada de Itens:",
          texto:
            "O LOCATÁRIO compromete-se a retirar os itens na data estipulada. A LOCADORA não se responsabiliza por peças não retiradas, sendo devido o valor integral da locação, ainda que a peça não tenha sido utilizada.",
        },
        {
          subtitulo: "3.3 Substituição de Peças:",
          texto:
            "A LOCADORA poderá substituir peças por similares, de acordo com a disponibilidade ou necessidade estética, sem necessidade de autorização prévia.",
        },
      ],
    },
    clausula4: {
      titulo: "CLÁUSULA 4 – INADIPLÊNCIA, CANCELAMENTO, MULTAS, TROCAS E CRÉDITO",
      itens: [
        {
          subtitulo: "4.1 Inadimplência:",
          texto:
            "Fica definido entre as partes a rescisão do contrato se ocorrer a falta do pagamento das parcelas com atraso superior a 10 dias, sendo utilizada as regras da rescisão a penalizar o locatário.",
        },
        {
          subtitulo: "4.2 Rescisão:",
          texto:
            "O contrato poderá ser rescindido por qualquer das partes mediante aviso prévio por escrito ou inadimplência por parte do locatário. Aplicam-se as seguintes penalidades:20% (vinte por cento) do valor total do contrato, no caso de peças sem ajustes;100% (cem por cento) do valor total, no caso de peças ajustadas ou não retiradas na data combinada.",
        },
        {
          subtitulo: "4.3 Sinal (Arras):",
          texto:
            "Após o pagamento do sinal, não haverá devolução do valor em caso de cancelamento por parte do LOCATÁRIO. O valor poderá ser convertido em crédito, válido por 365 dias, descontadas eventuais penalidades. Após esse prazo, o crédito perderá a validade.",
        },
        {
          subtitulo: "4.4 Cancelamento pela LOCADORA:",
          texto:
            "No caso de cancelamento por parte da LOCADORA, serão devolvidos ao LOCATÁRIO os valores referentes aos serviços não prestados.",
        },
        {
          subtitulo: "4.5 Troca de Reserva:",
          texto:
            "A troca de reserva estará sujeita a cobrança de taxa correspondente a 10% (dez por cento) do valor da peça retirada do contrato.",
        },
      ],
    },
    clausula5: {
      titulo: "CLÁUSULA 5 – CONDIÇÕES GERAIS, CUIDADOS E MULTAS",
      itens: [
        {
          subtitulo: "5.1 Sujeira e Manchas:",
          texto:
            "Será aplicada multa de R$ 50,00 (cinquenta reais) por peça devolvida com sujeira excessiva, manchas ou arrasto de barra.",
        },
        {
          subtitulo: "5.2 Danos e Extravio:",
          texto:
            "Em caso de danos irreparáveis ou extravio, o LOCATÁRIO pagará indenização correspondente a 5 (cinco) vezes o valor da locação do item.",
        },
        {
          subtitulo: "5.3 Atraso na Devolução:",
          texto:
            "A devolução fora do prazo gerará multa diária de 10% (dez por cento) sobre o valor da locação.",
        },
        {
          subtitulo: "5.4 Extravio:",
          texto:
            "A não devolução após 10 (dez) dias será considerada extravio, sujeitando o LOCATÁRIO à indenização de 5 (cinco) vezes o valor da peça, com prazo de pagamento de até 30 dias.",
        },
        {
          subtitulo: "5.5 Avaliação das Peças:",
          texto:
            "A LOCADORA terá o prazo de até 10 (dez) dias úteis, a contar da data da devolução, para realizar a avaliação das peças. Em caso de constatação de danos, o LOCATÁRIO será notificado.",
        },
        {
          subtitulo: "5.6 Alterações Proibidas:",
          texto:
            "É terminantemente proibida qualquer modificação física nas peças locadas, tais como corte, bainha, costura ou outras intervenções.",
        },
        {
          subtitulo: "5.7 Sublocação ou emprestar peças locadas:",
          texto:
            "É proibido sublocar ou emprestar ou transferir o uso da(s) peça(s) locada(s) neste contrato, multa de 100% da locação.",
        },
      ],
    },
    clausula6: {
      titulo: "CLÁUSULA 6 – USO DE IMAGEM",
      conteudo:
        "6.1 O LOCATÁRIO autoriza, de forma gratuita e irrevogável, o uso de sua imagem, decorrente do uso das peças locadas, para fins de divulgação da LOCADORA, em quaisquer meios de comunicação, físicos ou digitais.",
    },
    clausula7: {
      titulo: "CLÁUSULA 7 – TÍTULO EXECUTIVO",
      conteudo:
        "7.1 Este contrato constitui título executivo extrajudicial, nos termos do artigo 784, inciso III, do Código de Processo Civil, para fins de cobrança de valores não pagos, bem como de indenizações por danos ou extravios dos itens locados.",
    },
    clausula8: {
      titulo: "CLÁUSULA 8 – FORO",
      conteudo:
        "8.1 Para dirimir quaisquer controvérsias oriundas deste contrato, as partes elegem o foro da Comarca de Pará de Minas/MG, renunciando a qualquer outro, por mais privilegiado que seja. E, por estarem justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor, juntamente com as testemunhas abaixo.",
    },
  });

  const FORMAS_PAGAMENTO = [
    { value: "avista", label: "À vista" },
    { value: "cartao_credito", label: "Cartão de crédito" },
    { value: "cheque_pre", label: "Cheque Pré" },
    { value: "outros", label: "Outros - especificar" },
  ];

  // Carregar contratos do banco de dados
  const carregarContratos = async () => {
    try {
      setCarregando(true);
      setErro("");

      const response = await api.get("/contratos");

      if (response.data.success) {
        setContratos(response.data.contratos);
        console.log(
          `✅ ${response.data.contratos.length} contratos carregados`
        );
      } else {
        throw new Error(response.data.message || "Erro ao carregar contratos");
      }
    } catch (error) {
      console.error("Erro ao carregar contratos:", error);
      setErro("Falha ao carregar contratos. " + (error.message || ""));

      const contratosSalvos = localStorage.getItem("contratos");
      if (contratosSalvos) {
        setContratos(JSON.parse(contratosSalvos));
        console.log("⚠️ Usando contratos do localStorage como fallback");
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

  const handleEnterToNextField = (event) => {
    if (event.key !== "Enter") return;
    if (!formRef.current) return;

    const target = event.target;
    if (target.tagName === "TEXTAREA") return;

    event.preventDefault();

    const fields = Array.from(
      formRef.current.querySelectorAll("input, select, textarea")
    ).filter((el) => !el.disabled && !el.readOnly && el.type !== "hidden");

    const index = fields.indexOf(target);
    if (index >= 0 && index < fields.length - 1) {
      fields[index + 1].focus();
    }
  };

  // Salvar contratos no banco de dados e localStorage
  const salvarContratos = async (novoContrato, isUpdate = false) => {
    try {
      setSalvando(true);

      let response;

      if (isUpdate) {
        response = await api.put(`/contratos/${novoContrato._id}`, novoContrato);
      } else {
        response = await api.post("/contratos", novoContrato);
      }

      if (response.data.success) {
        await carregarContratos();
        console.log(
          `✅ Contrato ${isUpdate ? "atualizado" : "criado"} com sucesso`
        );
      } else {
        throw new Error(response.data.message || "Erro ao salvar contrato");
      }
    } catch (error) {
      console.error(
        `Erro ao ${isUpdate ? "atualizar" : "criar"} contrato:`,
        error
      );
      setErro(
        `Falha ao ${isUpdate ? "atualizar" : "criar"} contrato. ${
          error.message || ""
        }`
      );

      const contratosSalvos = localStorage.getItem("contratos")
        ? JSON.parse(localStorage.getItem("contratos"))
        : [];

      let novosContratos;

      if (isUpdate) {
        novosContratos = contratosSalvos.map((c) =>
          (c._id || c.id) === (novoContrato._id || novoContrato.id) ? novoContrato : c
        );
      } else {
        // Gera ID local apenas para fallback no localStorage
        novoContrato.id = Date.now().toString();
        novosContratos = [...contratosSalvos, novoContrato];
      }

      localStorage.setItem("contratos", JSON.stringify(novosContratos));
      setContratos(novosContratos);
      console.log("⚠️ Salvando no localStorage como fallback");
    } finally {
      setSalvando(false);
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
          console.log("✅ Contrato excluído com sucesso");
        } else {
          throw new Error(response.data.message || "Erro ao excluir contrato");
        }
      } catch (error) {
        console.error("Erro ao excluir contrato:", error);
        setErro("Falha ao excluir contrato. " + (error.message || ""));

        const contratosSalvos = localStorage.getItem("contratos")
          ? JSON.parse(localStorage.getItem("contratos"))
          : [];

        const novosContratos = contratosSalvos.filter((c) => (c._id || c.id) !== id);
        localStorage.setItem("contratos", JSON.stringify(novosContratos));
        setContratos(novosContratos);
        console.log("⚠️ Excluindo do localStorage como fallback");
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
        ...(dadosContrato.itens || []),
        { codigo: "", especificacao: "", valor: "" },
      ],
    });
  };

  // Remover item
  const removerItem = (index) => {
    const novosItens = (dadosContrato.itens || []).filter((_, i) => i !== index);
    setDadosContrato({ ...dadosContrato, itens: novosItens });
  };

  // Calcular total
  const calcularTotal = () => {
    return (dadosContrato.itens || []).reduce((total, item) => {
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
    return (dadosContrato.parcelas || []).reduce((total, parcela) => {
      return total + (parseFloat(parcela.valor) || 0);
    }, 0);
  };

  // Função para atualizar valor de uma parcela
  const atualizarValorParcela = (index, novoValor) => {
    const novasParcelas = [...(dadosContrato.parcelas || [])];
    novasParcelas[index].valor = novoValor;
    setDadosContrato({
      ...dadosContrato,
      parcelas: novasParcelas,
    });
  };

  // Função para distribuir valor igualmente entre as parcelas
  const distribuirValorIgualmente = () => {
    const totalItens = calcularTotal();
    const parcelasLength = (dadosContrato.parcelas || []).length;
    if (parcelasLength === 0) return;
    
    const valorPorParcela = (totalItens / parcelasLength).toFixed(2);

    const novasParcelas = (dadosContrato.parcelas || []).map((parcela) => ({
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
      parcelas: valor === "cartao_credito" ? (dadosContrato.parcelas || []) : [],
    });
  };

  // Salvar contrato
  const salvarContrato = () => {
    if (!dadosCliente.nome || !dadosCliente.cpf) {
      alert("Por favor, preencha pelo menos o nome e CPF do cliente");
      return;
    }

    if ((dadosContrato.itens || []).length === 0 || calcularTotal() <= 0) {
      alert("Adicione pelo menos um item com valor positivo");
      return;
    }

    if (
      dadosContrato.formaPagamento === "cartao_credito" &&
      ((dadosContrato.parcelas || []).length === 0 ||
        Math.abs(calcularTotal() - calcularTotalParcelas()) > 0.01)
    ) {
      alert("Configure corretamente as parcelas para cartão de crédito");
      return;
    }

    const novoContrato = {
      cliente: dadosCliente,
      contrato: dadosContrato,
      clausulas: clausulas,
      total: calcularTotal(),
      dataCriacao: new Date().toISOString(),
    };

    // Se está editando, adiciona o _id do MongoDB
    if (editandoId) {
      novoContrato._id = editandoId;
    }

    salvarContratos(novoContrato, !!editandoId);
    resetarFormulario();
  };

  // Editar contrato
  const editarContrato = (contrato) => {
    setDadosCliente(contrato.cliente);
    setDadosContrato(contrato.contrato);
    if (contrato.clausulas) {
      setClausulas(contrato.clausulas);
    }
    setEditandoId(contrato._id || contrato.id);
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
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());

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

    const contratosOrdenados = [...contratosFiltrados].sort(
      (a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao)
    );

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

  // Imprimir contrato
  const imprimirContrato = (contrato) => {
    const { cliente, contrato: dadosContrato, total } = contrato;
    const clausulasParaImprimir = contrato.clausulas || clausulas;

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
          margin: 0.8cm 1.2cm;
          size: A4;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          font-size: 12pt;
          line-height: 1.2;
          color: #000;
          background: white;
        }
        
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 4px;
          padding-bottom: 3px;
          border-bottom: 2px solid #000;
        }

        .header-left {
          flex: 1;
        }

        .logo {
          font-family: Arial, sans-serif;
          font-size: 22pt;
          font-weight: bold;
          font-style: italic;
          margin: 0;
          line-height: 1;
        }

        .logo-subtitle {
          font-family: Arial, sans-serif;
          font-size: 10pt;
          font-style: italic;
          margin: 0;
          color: #333;
        }

        .header-center {
          text-align: center;
          flex: 1;
          font-size: 9pt;
        }

        .header-right {
          text-align: right;
          flex: 1;
          font-size: 9pt;
        }

        .header-info {
          margin: 1px 0;
          line-height: 1.3;
        }
        
        .contract-title {
          font-size: 11pt;
          font-weight: bold;
          text-align: center;
          margin: 4px 0;
          text-transform: uppercase;
          padding: 4px;
          background-color: #f0f0f0;
          border: 1px solid #000;
        }

        .section-title {
          font-weight: bold;
          text-transform: uppercase;
          margin: 4px 0 2px 0;
          font-size: 11pt;
          background-color: #f5f5f5;
          padding: 2px 4px;
          border-left: 3px solid #000;
        }
        
        .section {
          margin-bottom: 4px;
        }
        
        .party {
          margin-bottom: 3px;
          text-align: justify;
          font-size: 11pt;
          line-height: 1.2;
        }
        
        .underline {
          border-bottom: 1.5px solid #000;
          display: inline-block;
          min-width: 150px;
          height: 18px;
          margin: 0 3px;
        }
        
        .underline-small {
          border-bottom: 1.5px solid #000;
          display: inline-block;
          min-width: 80px;
          height: 18px;
          margin: 0 3px;
        }
        
        .underline-medium {
          border-bottom: 1.5px solid #000;
          display: inline-block;
          min-width: 200px;
          height: 18px;
          margin: 0 3px;
        }
        
        .underline-large {
          border-bottom: 1.5px solid #000;
          display: inline-block;
          min-width: 300px;
          height: 18px;
          margin: 0 3px;
        }
        
        .underline-xlarge {
          border-bottom: 1.5px solid #000;
          display: inline-block;
          min-width: 500px;
          height: 18px;
          margin: 0 3px;
        }
        
        .info-line {
          margin: 4px 0;
          font-size: 10pt;
          line-height: 1.4;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 6px 0;
          font-size: 11pt;
        }
        
        .items-table th {
          padding: 5px;
          text-align: center;
          font-weight: bold;
          border: 1.5px solid #000;
          background-color: #e8e8e8;
          font-size: 11pt;
        }
        
        .items-table td {
          padding: 5px;
          text-align: left;
          vertical-align: top;
          border: 1px solid #000;
          min-height: 22px;
          font-size: 11pt;
        }
        
        .clause-title {
          font-weight: bold;
          margin: 4px 0 2px 0;
          text-decoration: underline;
          font-size: 11pt;
        }
        
        .clause-content {
          text-align: justify;
          margin-bottom: 3px;
          line-height: 1.2;
          font-size: 10pt;
        }
        
        .parcelas-grid {
          border: 1.5px solid #000;
          padding: 4px;
          margin: 4px 0;
          background-color: #fafafa;
        }

        .parcelas-row {
          display: flex;
          gap: 8px;
          margin-bottom: 3px;
        }
        
        .parcela-item {
          flex: 1;
          font-size: 10pt;
          line-height: 1.2;
        }
        
        .page-break {
          page-break-before: always;
        }
        
        .signature-area {
          margin-top: 8px;
          font-size: 11pt;
        }
        
        .signature-line {
          border-bottom: 1.5px solid #000;
          display: inline-block;
          min-width: 300px;
          height: 18px;
          margin: 0 10px;
        }

        .avalistas-container {
          display: flex;
          border: 1.5px solid #000;
          margin: 4px 0;
          min-height: 55px;
        }

        .avalistas-left {
          flex: 3;
          display: flex;
          flex-direction: column;
        }

        .avalista-box {
          flex: 1;
          border-right: 1px solid #000;
          padding: 4px;
          font-size: 10pt;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
        }

        .avalista-box:first-child {
          border-bottom: 1px solid #000;
        }

        .avalistas-label {
          flex: 1;
          border-right: 1px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 11pt;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
          background-color: #f0f0f0;
        }

        .promissoria-box {
          border: 1.5px solid #000;
          padding: 4px;
          margin: 4px 0;
          font-size: 10pt;
          background-color: #fafafa;
        }

        .promissoria-title {
          text-align: center;
          font-weight: bold;
          font-size: 12pt;
          margin-bottom: 8px;
        }

        .checkbox-line {
          margin: 6px 0;
          font-size: 11pt;
        }

        .data-box {
          border: 1px solid #000;
          padding: 6px;
          background-color: #fafafa;
          margin: 5px 0;
        }

        @media print {
          body { 
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .page-break {
            page-break-before: always;
          }
        }
      </style>
    </head>
    <body>
      <!-- CABEÇALHO -->
      <div class="header-container">
        <div class="header-left">
          <div class="logo">Érica Damas</div>
          <div class="logo-subtitle">NOIVAS</div>
        </div>
        <div class="header-center">
          <div class="header-info">Pará de Minas</div>
          <div class="header-info">(37) 3231-3738</div>
        </div>
        <div class="header-right">
          <div class="header-info">Emergência</div>
          <div class="header-info">(37) 99915-3738 / 99999-1089</div>
        </div>
        <div class="header-right" style="flex: 0.5; text-align: center;">
          <div class="header-info"><strong>Nº</strong></div>
          <div class="header-info">${dadosContrato.numeroContrato || "_______"}</div>
        </div>
      </div>

      <div class="contract-title">
        CONTRATO DE RESERVA E LOCAÇÃO DE VESTIDOS, TRAJES, ACESSÓRIOS E SERVIÇOS
      </div>

      <!-- IDENTIFICAÇÃO DAS PARTES -->
      <div class="section">
        <div class="section-title">IDENTIFICAÇÃO DAS PARTES</div>
        <div class="party">
          <strong>LOCADORA: ÉRICA DAMAS LINO EIRELI,</strong> Rua Goiás, 275 - São José - Pará de Minas - MG - CNPj: 11.791.386/0001-13.
        </div>
        <div class="party" style="margin-top: 8px;">
          <strong>LOCATÁRIO:</strong> <span class="underline-xlarge">${cliente.nome || ""}</span>
        </div>
        <div class="party" style="margin-top: 8px;">
          <strong>RG:</strong> <span class="underline-medium">${formatarRG(cliente.rg) || ""}</span>
          <strong>CPF:</strong> <span class="underline-medium">${formatarCPF(cliente.cpf) || ""}</span>
          <strong>DATA NASC.:</strong> <span class="underline">${formatarDataBrasileira(cliente.dataNascimento) || ""}</span>
        </div>
        <div class="party">
          <strong>Endereço:</strong> <span class="underline-xlarge">${cliente.endereco || ""}</span>
        </div>
        <div class="party">
          <strong>Número:</strong> <span class="underline-small">${cliente.numero || ""}</span>
          <strong>Bairro:</strong> <span class="underline-medium">${cliente.bairro || ""}</span>
          <strong>Cidade:</strong> <span class="underline-medium">${cliente.cidade || ""}</span>
        </div>
        <div class="party">
          <strong>Telefone:</strong> ${formatarTelefone(cliente.telefone) || ""}
          <strong>Celular:</strong> ${formatarTelefone(cliente.celular) || ""}
        </div>
        <div class="party" style="margin-top: 10px;">
          As partes identificadas acima têm, entre sí, justos e acertados o presente CONTRATO DE LOCAÇÃO DE ARTIGOS DE VESTUÁRIO, que se regerá pelas cláusulas seguintes e pelas condições de preço, forma e termo de pagamentos descritas no presente.
        </div>
      </div>

      <!-- DATAS -->
      <div class="section" style="margin-top: 4px;">
        <table style="width: 100%; border-collapse: collapse; border: 2px solid #000;">
          <tr>
            <td style="width: 18%; vertical-align: top; padding: 6px; border-right: 1.5px solid #000; background-color: #fafafa;">
              <div style="text-align: center;">
                <strong style="font-size: 10pt; color: #000; text-transform: uppercase; letter-spacing: 0.5px;">DATA VENDA</strong>
                <div style="margin-top: 6px; padding: 4px 0;">
                  <span class="underline" style="display: inline-block; min-width: 90%;">${formatarDataBrasileira(dadosContrato.dataVenda) || ""}</span>
                </div>
              </div>
            </td>
            <td style="width: 23%; vertical-align: top; padding: 6px; border-right: 1.5px solid #000;">
              <div style="text-align: center;">
                <strong style="font-size: 10pt; color: #000; text-transform: uppercase; letter-spacing: 0.5px;">DATA AJUSTE</strong>
                <div style="margin-top: 3px; font-size: 8.5pt; line-height: 1.3; color: #333;">
                  <span>Segunda a Quinta 9:00-17:00h</span><br/>
                  <span>Trazer o Sapato para ajuste</span>
                </div>
                <div style="margin-top: 4px; padding: 2px 0;">
                  <span class="underline" style="display: inline-block; min-width: 90%;">${formatarDataBrasileira(dadosContrato.dataAjuste) || ""}</span>
                </div>
              </div>
            </td>
            <td style="width: 23%; vertical-align: top; padding: 6px; border-right: 1.5px solid #000; background-color: #fafafa;">
              <div style="text-align: center;">
                <strong style="font-size: 10pt; color: #000; text-transform: uppercase; letter-spacing: 0.5px;">RETIRADA</strong>
                <div style="margin-top: 3px; font-size: 8.5pt; line-height: 1.3; color: #333;">
                  <span>Segunda a Sexta 9:00-17:00h</span><br/>
                  <span>Sábado 9:00-12:00h</span>
                </div>
                <div style="margin-top: 4px; padding: 2px 0;">
                  <span class="underline" style="display: inline-block; min-width: 90%;">${formatarDataBrasileira(dadosContrato.dataRetirada) || ""}</span>
                </div>
              </div>
            </td>
            <td style="width: 18%; vertical-align: top; padding: 6px; border-right: 1.5px solid #000;">
              <div style="text-align: center;">
                <strong style="font-size: 10pt; color: #000; text-transform: uppercase; letter-spacing: 0.5px;">DEVOLUÇÃO</strong>
                <div style="margin-top: 3px; font-size: 8.5pt; color: #333;">
                  <span>09:00 às 17:00h</span>
                </div>
                <div style="margin-top: 8px; padding: 2px 0;">
                  <span class="underline" style="display: inline-block; min-width: 90%;">${formatarDataBrasileira(dadosContrato.dataEntrega) || ""}</span>
                </div>
              </div>
            </td>
            <td style="width: 18%; vertical-align: top; padding: 6px; text-align: center; background-color: #f5f5f5;">
              <div style="margin-bottom: 6px;">
                <div style="font-size: 8.5pt; font-weight: bold; margin-bottom: 3px; color: #333;">Peça sob encomenda?</div>
                <div style="font-size: 10pt; letter-spacing: 1px;">
                  <span style="display: inline-block; width: 15px; height: 15px; border: 1.5px solid #000; vertical-align: middle; margin-right: 2px;">${dadosContrato.pecaEncomenda === "sim" ? "X" : ""}</span> Sim
                  <span style="display: inline-block; width: 15px; height: 15px; border: 1.5px solid #000; vertical-align: middle; margin: 0 2px 0 8px;">${dadosContrato.pecaEncomenda === "nao" ? "X" : ""}</span> Não
                </div>
              </div>
              <div style="margin: 8px 0;">
                <span class="underline-small" style="display: inline-block; min-width: 80%;"></span>
              </div>
              <div>
                <div style="font-size: 8.5pt; font-weight: bold; margin-bottom: 3px; color: #333;">Plano livre troca?</div>
                <div style="font-size: 10pt; letter-spacing: 1px;">
                  <span style="display: inline-block; width: 15px; height: 15px; border: 1.5px solid #000; vertical-align: middle; margin-right: 2px;">${dadosContrato.planoLivreTroca === "sim" ? "X" : ""}</span> Sim
                  <span style="display: inline-block; width: 15px; height: 15px; border: 1.5px solid #000; vertical-align: middle; margin: 0 2px 0 8px;">${dadosContrato.planoLivreTroca === "nao" ? "X" : ""}</span> Não
                </div>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- DO OBJETO DO CONTRATO -->
      <div class="section" style="margin-top: 4px;">
        <div class="section-title">DO OBJETO DO CONTRATO</div>
        <div class="party" style="margin-top: 2px;">
          É objeto do presente contrato a locação dos seguintes trajes e acessórios.
        </div>
      </div>

      <!-- TABELA DE ITENS -->
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 12%">CÓDIGO</th>
            <th style="width: 68%">ESPECIFICAÇÃO</th>
            <th style="width: 20%">VALOR</th>
          </tr>
        </thead>
        <tbody>
          ${(dadosContrato.itens || []).map((item) => `
            <tr>
              <td style="height: 20px; text-align: center;">${item.codigo || ""}</td>
              <td>${item.especificacao || ""}</td>
              <td style="text-align: center;">R$ ${formatarValor(item.valor)}</td>
            </tr>
          `).join("")}
          ${Array.from({ length: Math.max(0, 8 - (dadosContrato.itens || []).length) }).map(() => `
            <tr><td style="height: 20px;"></td><td></td><td></td></tr>
          `).join("")}
          <tr>
            <td colspan="2" style="text-align: right; font-weight: bold; padding-right: 15px; background-color: #e8e8e8;">TOTAL</td>
            <td style="text-align: center; font-weight: bold; background-color: #e8e8e8;">R$ ${formatarValor(total)}</td>
          </tr>
        </tbody>
      </table>

      <!-- FORMA DE PAGAMENTO -->
      <div class="section" style="margin-top: 4px;">
        <div class="section-title">FORMA DE PAGAMENTO CONTRATADA</div>
        <div class="checkbox-line" style="font-size: 10pt; margin-top: 3px;">
          ( ${dadosContrato.formaPagamento === "avista" ? "X" : " "} ) À vista &nbsp;&nbsp;&nbsp;&nbsp; 
          ( ${dadosContrato.formaPagamento === "cartao_credito" ? "X" : " "} ) Cartão de crédito &nbsp;&nbsp;&nbsp;&nbsp; 
          ( ${dadosContrato.formaPagamento === "cheque" ? "X" : " "} ) Cheque Pré &nbsp;&nbsp;&nbsp;&nbsp; 
          ( ${dadosContrato.formaPagamento === "outros" ? "X" : " "} ) Outros - especificar <span class="underline-large"></span>
        </div>
        <div style="margin-top: 4px; font-size: 10pt; font-weight: bold;">Se parcelado, forma de pagamento:</div>
        <div class="parcelas-grid">
          <div class="parcelas-row">
            <div class="parcela-item">${(dadosContrato.parcelas && dadosContrato.parcelas[0]) ? `1 - R$ ${formatarValor(dadosContrato.parcelas[0].valor)} Venc. ${formatarDataBrasileira(dadosContrato.parcelas[0].vencimento)}` : "1 - R$___________ Venc.___/___/___"}</div>
            <div class="parcela-item">${(dadosContrato.parcelas && dadosContrato.parcelas[4]) ? `5 - R$ ${formatarValor(dadosContrato.parcelas[4].valor)} Venc. ${formatarDataBrasileira(dadosContrato.parcelas[4].vencimento)}` : "5 - R$___________ Venc.___/___/___"}</div>
            <div class="parcela-item">${(dadosContrato.parcelas && dadosContrato.parcelas[8]) ? `9 - R$ ${formatarValor(dadosContrato.parcelas[8].valor)} Venc. ${formatarDataBrasileira(dadosContrato.parcelas[8].vencimento)}` : "9 - R$___________ Venc.___/___/___"}</div>
          </div>
          <div class="parcelas-row">
            <div class="parcela-item">${(dadosContrato.parcelas && dadosContrato.parcelas[1]) ? `2 - R$ ${formatarValor(dadosContrato.parcelas[1].valor)} Venc. ${formatarDataBrasileira(dadosContrato.parcelas[1].vencimento)}` : "2 - R$___________ Venc.___/___/___"}</div>
            <div class="parcela-item">${(dadosContrato.parcelas && dadosContrato.parcelas[5]) ? `6 - R$ ${formatarValor(dadosContrato.parcelas[5].valor)} Venc. ${formatarDataBrasileira(dadosContrato.parcelas[5].vencimento)}` : "6 - R$___________ Venc.___/___/___"}</div>
            <div class="parcela-item">${(dadosContrato.parcelas && dadosContrato.parcelas[9]) ? `10 - R$ ${formatarValor(dadosContrato.parcelas[9].valor)} Venc. ${formatarDataBrasileira(dadosContrato.parcelas[9].vencimento)}` : "10 - R$___________ Venc.___/___/___"}</div>
          </div>
          <div class="parcelas-row">
            <div class="parcela-item">${(dadosContrato.parcelas && dadosContrato.parcelas[2]) ? `3 - R$ ${formatarValor(dadosContrato.parcelas[2].valor)} Venc. ${formatarDataBrasileira(dadosContrato.parcelas[2].vencimento)}` : "3 - R$___________ Venc.___/___/___"}</div>
            <div class="parcela-item">${(dadosContrato.parcelas && dadosContrato.parcelas[6]) ? `7 - R$ ${formatarValor(dadosContrato.parcelas[6].valor)} Venc. ${formatarDataBrasileira(dadosContrato.parcelas[6].vencimento)}` : "7 - R$___________ Venc.___/___/___"}</div>
            <div class="parcela-item">${(dadosContrato.parcelas && dadosContrato.parcelas[10]) ? `11 - R$ ${formatarValor(dadosContrato.parcelas[10].valor)} Venc. ${formatarDataBrasileira(dadosContrato.parcelas[10].vencimento)}` : "11 - R$___________ Venc.___/___/___"}</div>
          </div>
          <div class="parcelas-row">
            <div class="parcela-item">${(dadosContrato.parcelas && dadosContrato.parcelas[3]) ? `4 - R$ ${formatarValor(dadosContrato.parcelas[3].valor)} Venc. ${formatarDataBrasileira(dadosContrato.parcelas[3].vencimento)}` : "4 - R$___________ Venc.___/___/___"}</div>
            <div class="parcela-item">${(dadosContrato.parcelas && dadosContrato.parcelas[7]) ? `8 - R$ ${formatarValor(dadosContrato.parcelas[7].valor)} Venc. ${formatarDataBrasileira(dadosContrato.parcelas[7].vencimento)}` : "8 - R$___________ Venc.___/___/___"}</div>
            <div class="parcela-item">${(dadosContrato.parcelas && dadosContrato.parcelas[11]) ? `12 - R$ ${formatarValor(dadosContrato.parcelas[11].valor)} Venc. ${formatarDataBrasileira(dadosContrato.parcelas[11].vencimento)}` : "12 - R$___________ Venc.___/___/___"}</div>
          </div>
        </div>
        <div class="party" style="margin-top: 6px; font-size: 10pt;">
          Fiz a prova final na retirada, Recebi a peça conforme combinado, com ajustes, limpa, sem danos e na data combinada.
        </div>
        <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11pt;">
          <div><span class="underline"></span><br/><span style="font-size: 10pt;">Data</span></div>
          <div style="text-align: center; flex: 1; margin-left: 30px;"><span class="underline-xlarge"></span><br/><span style="font-size: 10pt;">Assinatura do cliente recebedor</span></div>
        </div>
      </div>

      <!-- AVALISTAS -->
      <div class="avalistas-container">
        <div class="avalistas-left">
          <div class="avalista-box">
            <div style="font-size: 10pt; margin-bottom: 3px;">CPF/CNPJ <span class="underline-large">${dadosContrato.avalistas?.[0]?.cpfCnpj || ""}</span></div>
            <div style="font-size: 10pt;">ENDEREÇO <span class="underline-large">${dadosContrato.avalistas?.[0]?.endereco || ""}</span></div>
          </div>
          <div class="avalista-box">
            <div style="font-size: 10pt; margin-bottom: 3px;">CPF/CNPJ <span class="underline-large">${dadosContrato.avalistas?.[1]?.cpfCnpj || ""}</span></div>
            <div style="font-size: 10pt;">ENDEREÇO <span class="underline-large">${dadosContrato.avalistas?.[1]?.endereco || ""}</span></div>
          </div>
        </div>
        <div class="avalistas-label">AVALISTAS</div>
      </div>

      <!-- NOTA PROMISSÓRIA -->
      <div class="promissoria-box">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <div style="flex: 1; font-size: 11pt;">
            Vencimento <span class="underline-small">${dadosContrato.promissoria?.vencimentoDia || ""}</span> de <span class="underline-medium">${dadosContrato.promissoria?.vencimentoMes || ""}</span> de <span class="underline-small">${dadosContrato.promissoria?.vencimentoAno || ""}</span>
          </div>
          <div style="text-align: center; font-weight: bold; font-size: 12pt; margin-left: 15px;">
            R$ <span class="underline">${formatarValor(dadosContrato.promissoria?.valor || total)}</span>
          </div>
        </div>
        <div class="party" style="font-size: 11pt;">
          Ao (s) <span class="underline-medium">${dadosContrato.promissoria?.ao || ""}</span> pagar <span class="underline-medium">${dadosContrato.promissoria?.pagar || ""}</span> por esta única via de <strong>NOTA PROMISSÓRIA</strong>
        </div>
        <div class="party" style="font-size: 11pt;">
          a <span class="underline-large">ÉRICA DAMAS LINO EIRELI</span> CPF/CNPJ <span class="underline-large">11.791.386/0001-13</span>
        </div>
        <div class="party" style="font-size: 11pt;">
          ou à sua ordem, a quantia de <span class="underline-xlarge">${dadosContrato.promissoria?.quantiaExtenso || ""}</span>
        </div>
        <div class="party" style="font-size: 11pt;">
          em moeda corrente deste país, pagável em <span class="underline-xlarge">${dadosContrato.promissoria?.pagavelEm || ""}</span>
        </div>
        <div style="margin-top: 5px; display: flex; justify-content: space-between; font-size: 11pt;">
          <div>Emitente <span class="underline-medium">${cliente.nome || ""}</span> Data da Emissão <span class="underline">${formatarDataBrasileira(dadosContrato.dataVenda) || ""}</span></div>
        </div>
        <div style="font-size: 11pt; margin-top: 4px; display: flex; justify-content: space-between; align-items: center;">
          <div>CPF <span class="underline">${formatarCPF(cliente.cpf) || ""}</span> / <span class="underline"></span> CNPJ <span class="underline-large"></span></div>
          <div style="flex: 1; margin-left: 15px;">Endereço <span class="underline-xlarge" style="width: 280px;">${cliente.endereco || ""}, ${cliente.numero || ""} - ${cliente.bairro || ""} - ${cliente.cidade || ""}</span></div>
        </div>
        <div style="margin-top: 6px; font-size: 11pt;">
          <span class="underline-xlarge"></span> Ass. do emitente
        </div>
      </div>

      <!-- CLÁUSULAS - PÁGINA 2 -->
      <div class="page-break"></div>
      
      <div class="clause-title">CLÁUSULA 1 - OBJETO:</div>
      <div class="clause-content">${clausulasParaImprimir.clausula1.conteudo}</div>

      <div class="clause-title">CLÁUSULA 2 - OBRIGAÇÕES DO LOCATÁRIO:</div>
      ${clausulasParaImprimir.clausula2.itens.map((item) => `<div class="clause-content"><strong>${item.subtitulo}</strong> ${item.texto}</div>`).join("")}

      <div class="clause-title">CLÁUSULA 3 - OBRIGAÇÕES DA LOCADORA:</div>
      ${clausulasParaImprimir.clausula3.itens.map((item) => `<div class="clause-content"><strong>${item.subtitulo}</strong> ${item.texto}</div>`).join("")}

      <div class="clause-title">CLÁUSULA 4 - INADIPLÊNCIA, CANCELAMENTO, MULTAS, TROCAS E CRÉDITO:</div>
      ${clausulasParaImprimir.clausula4.itens.map((item) => `<div class="clause-content"><strong>${item.subtitulo}</strong> ${item.texto}</div>`).join("")}

      <div class="clause-title">CLÁUSULA 5 - CONDIÇÕES GERAIS:</div>
      ${clausulasParaImprimir.clausula5.itens.map((item) => `<div class="clause-content"><strong>${item.subtitulo}</strong> ${item.texto}</div>`).join("")}

      <div class="clause-title">CLÁUSULA 6 - USO DE IMAGEM:</div>
      <div class="clause-content">${clausulasParaImprimir.clausula6.conteudo}</div>

      <div class="clause-title">CLÁUSULA 7 - TÍTULO EXECUTIVO:</div>
      <div class="clause-content">${clausulasParaImprimir.clausula7.conteudo}</div>

      <div class="clause-title">CLÁUSULA 8 - FORO:</div>
      <div class="clause-content">${clausulasParaImprimir.clausula8.conteudo}</div>

      <!-- ASSINATURAS FINAIS -->
      <div class="signature-area">
        <div class="party" style="margin: 6px 0; font-size: 11pt;">
          <span class="underline-large"></span>, <span class="underline-small"></span> de <span class="underline-medium"></span> de 20<span class="underline-small"></span>.
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 10pt;">
          <div style="text-align: center;">
            <div class="underline-large"></div>
            <div style="margin-top: 2px;">1º Testemunha</div>
          </div>
          <div style="text-align: center;">
            <div class="underline-large"></div>
            <div style="margin-top: 2px;">2º Testemunha</div>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 10pt;">
          <div style="text-align: center;">
            <div class="underline-large"></div>
            <div style="margin-top: 2px;">ÉRICA DAMAS (Locadora)</div>
          </div>
          <div style="text-align: center;">
            <div class="underline-large"></div>
            <div style="margin-top: 2px;">ATENDENTE</div>
          </div>
          <div style="text-align: center;">
            <div class="underline-large"></div>
            <div style="margin-top: 2px;">CONTRATANTE (Locatário):</div>
          </div>
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
          disabled={salvando}
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
        >
          {mostrarContratos ? "Ocultar Contratos" : "Ver Contratos Feitos"}
        </button>
      </div>

      {mostrarFormulario && (
        <div
          style={styles.formContainer}
          ref={formRef}
          onKeyDown={handleEnterToNextField}
        >
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
              <input
                type="text"
                placeholder="Nº do contrato"
                value={dadosContrato.numeroContrato}
                onChange={(e) =>
                  setDadosContrato({
                    ...dadosContrato,
                    numeroContrato: e.target.value,
                  })
                }
                style={styles.input}
              />
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
            {(dadosContrato.itens || []).map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <input
                  type="text"
                  placeholder="Código"
                  value={item.codigo}
                  onChange={(e) => {
                    const novosItens = [...(dadosContrato.itens || [])];
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
                    const novosItens = [...(dadosContrato.itens || [])];
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
                    const novosItens = [...(dadosContrato.itens || [])];
                    novosItens[index].valor = e.target.value;
                    setDadosContrato({ ...dadosContrato, itens: novosItens });
                  }}
                  style={styles.inputSmall}
                  min="0"
                  step="0.01"
                />
                {(dadosContrato.itens || []).length > 1 && (
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

          <fieldset style={styles.fieldset}>
            <legend>Opções do Contrato</legend>
            <div style={styles.formGrid}>
              <div>
                <label>Peça sobre encomenda:</label>
                <select
                  value={dadosContrato.pecaEncomenda}
                  onChange={(e) =>
                    setDadosContrato({
                      ...dadosContrato,
                      pecaEncomenda: e.target.value,
                    })
                  }
                  style={styles.select}
                >
                  <option value="nao">Não</option>
                  <option value="sim">Sim</option>
                </select>
              </div>
              <div>
                <label>Plano livre troca:</label>
                <select
                  value={dadosContrato.planoLivreTroca}
                  onChange={(e) =>
                    setDadosContrato({
                      ...dadosContrato,
                      planoLivreTroca: e.target.value,
                    })
                  }
                  style={styles.select}
                >
                  <option value="nao">Não</option>
                  <option value="sim">Sim</option>
                </select>
              </div>
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

            {dadosContrato.formaPagamento === "outros" && (
              <div style={styles.formGrid}>
                <input
                  type="text"
                  placeholder="Especificar forma de pagamento"
                  value={dadosContrato.formaPagamentoOutro}
                  onChange={(e) =>
                    setDadosContrato({
                      ...dadosContrato,
                      formaPagamentoOutro: e.target.value,
                    })
                  }
                  style={styles.inputWide}
                />
              </div>
            )}

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

                {(dadosContrato.parcelas || []).length > 0 && (
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

                      {(dadosContrato.parcelas || []).map((parcela, index) => (
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
                              const novasParcelas = [...(dadosContrato.parcelas || [])];
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

          <fieldset style={styles.fieldset}>
            <legend>Avalistas</legend>
            <div style={styles.formGrid}>
              <input
                type="text"
                placeholder="CPF/CNPJ Avalista 1"
                value={dadosContrato.avalistas?.[0]?.cpfCnpj || ""}
                onChange={(e) => {
                  const avalistas = [...(dadosContrato.avalistas || [{ cpfCnpj: "", endereco: "" }, { cpfCnpj: "", endereco: "" }])];
                  avalistas[0].cpfCnpj = e.target.value;
                  setDadosContrato({ ...dadosContrato, avalistas });
                }}
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Endereço Avalista 1"
                value={dadosContrato.avalistas?.[0]?.endereco || ""}
                onChange={(e) => {
                  const avalistas = [...(dadosContrato.avalistas || [{ cpfCnpj: "", endereco: "" }, { cpfCnpj: "", endereco: "" }])];
                  avalistas[0].endereco = e.target.value;
                  setDadosContrato({ ...dadosContrato, avalistas });
                }}
                style={styles.inputWide}
              />
              <input
                type="text"
                placeholder="CPF/CNPJ Avalista 2"
                value={dadosContrato.avalistas?.[1]?.cpfCnpj || ""}
                onChange={(e) => {
                  const avalistas = [...(dadosContrato.avalistas || [{ cpfCnpj: "", endereco: "" }, { cpfCnpj: "", endereco: "" }])];
                  avalistas[1].cpfCnpj = e.target.value;
                  setDadosContrato({ ...dadosContrato, avalistas });
                }}
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Endereço Avalista 2"
                value={dadosContrato.avalistas?.[1]?.endereco || ""}
                onChange={(e) => {
                  const avalistas = [...(dadosContrato.avalistas || [{ cpfCnpj: "", endereco: "" }, { cpfCnpj: "", endereco: "" }])];
                  avalistas[1].endereco = e.target.value;
                  setDadosContrato({ ...dadosContrato, avalistas });
                }}
                style={styles.inputWide}
              />
            </div>
          </fieldset>

          <fieldset style={styles.fieldset}>
            <legend>Nota Promissória</legend>
            <div style={styles.formGrid}>
              <input
                type="text"
                placeholder="Vencimento"
                value={dadosContrato.promissoria?.vencimento || ""}
                onChange={(e) =>
                  setDadosContrato({
                    ...dadosContrato,
                    promissoria: {
                      ...(dadosContrato.promissoria || {}),
                      vencimento: e.target.value,
                    },
                  })
                }
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Valor (R$)"
                value={dadosContrato.promissoria?.valor || ""}
                onChange={(e) =>
                  setDadosContrato({
                    ...dadosContrato,
                    promissoria: {
                      ...(dadosContrato.promissoria || {}),
                      valor: e.target.value,
                    },
                  })
                }
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Ao(s)"
                value={dadosContrato.promissoria?.ao || ""}
                onChange={(e) =>
                  setDadosContrato({
                    ...dadosContrato,
                    promissoria: {
                      ...(dadosContrato.promissoria || {}),
                      ao: e.target.value,
                    },
                  })
                }
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Pagar"
                value={dadosContrato.promissoria?.pagar || ""}
                onChange={(e) =>
                  setDadosContrato({
                    ...dadosContrato,
                    promissoria: {
                      ...(dadosContrato.promissoria || {}),
                      pagar: e.target.value,
                    },
                  })
                }
                style={styles.input}
              />
              <input
                type="text"
                placeholder="CPF/CNPJ"
                value={dadosContrato.promissoria?.cpfCnpj || ""}
                onChange={(e) =>
                  setDadosContrato({
                    ...dadosContrato,
                    promissoria: {
                      ...(dadosContrato.promissoria || {}),
                      cpfCnpj: e.target.value,
                    },
                  })
                }
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Endereço"
                value={dadosContrato.promissoria?.endereco || ""}
                onChange={(e) =>
                  setDadosContrato({
                    ...dadosContrato,
                    promissoria: {
                      ...(dadosContrato.promissoria || {}),
                      endereco: e.target.value,
                    },
                  })
                }
                style={styles.inputWide}
              />
              <input
                type="text"
                placeholder="Emitente"
                value={dadosContrato.promissoria?.emitente || ""}
                onChange={(e) =>
                  setDadosContrato({
                    ...dadosContrato,
                    promissoria: {
                      ...(dadosContrato.promissoria || {}),
                      emitente: e.target.value,
                    },
                  })
                }
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Data da emissão"
                value={dadosContrato.promissoria?.dataEmissao || ""}
                onChange={(e) =>
                  setDadosContrato({
                    ...dadosContrato,
                    promissoria: {
                      ...(dadosContrato.promissoria || {}),
                      dataEmissao: e.target.value,
                    },
                  })
                }
                style={styles.input}
              />
              <input
                type="text"
                placeholder="CPF/CNPJ Emitente"
                value={dadosContrato.promissoria?.emitenteCpfCnpj || ""}
                onChange={(e) =>
                  setDadosContrato({
                    ...dadosContrato,
                    promissoria: {
                      ...(dadosContrato.promissoria || {}),
                      emitenteCpfCnpj: e.target.value,
                    },
                  })
                }
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Endereço Emitente"
                value={dadosContrato.promissoria?.emitenteEndereco || ""}
                onChange={(e) =>
                  setDadosContrato({
                    ...dadosContrato,
                    promissoria: {
                      ...(dadosContrato.promissoria || {}),
                      emitenteEndereco: e.target.value,
                    },
                  })
                }
                style={styles.inputWide}
              />
            </div>
          </fieldset>
          {/* CLÁUSULAS EDITÁVEIS */}
          <fieldset style={styles.fieldset}>
            <legend>📝 Cláusulas do Contrato (Editáveis)</legend>
            <p
              style={{
                color: "#666",
                fontSize: "0.9rem",
                marginBottom: "1rem",
              }}
            >
              Edite as cláusulas conforme necessário. As alterações serão
              aplicadas apenas a este contrato.
            </p>

            {Object.entries(clausulas).map(([key, clausula]) => (
              <div key={key} style={styles.clausulaEditavel}>
                <input
                  type="text"
                  value={clausula.titulo}
                  onChange={(e) =>
                    setClausulas({
                      ...clausulas,
                      [key]: { ...clausula, titulo: e.target.value },
                    })
                  }
                  style={styles.clausulaTitulo}
                />

                {clausula.conteudo ? (
                  <textarea
                    value={clausula.conteudo}
                    onChange={(e) =>
                      setClausulas({
                        ...clausulas,
                        [key]: { ...clausula, conteudo: e.target.value },
                      })
                    }
                    style={styles.clausulaTextarea}
                    rows={3}
                  />
                ) : (
                  clausula.itens &&
                  clausula.itens.map((item, idx) => (
                    <div key={idx} style={styles.clausulaItem}>
                      <input
                        type="text"
                        value={item.subtitulo}
                        onChange={(e) => {
                          const novosItens = [...clausula.itens];
                          novosItens[idx].subtitulo = e.target.value;
                          setClausulas({
                            ...clausulas,
                            [key]: { ...clausula, itens: novosItens },
                          });
                        }}
                        style={styles.clausulaSubtitulo}
                      />
                      <textarea
                        value={item.texto}
                        onChange={(e) => {
                          const novosItens = [...clausula.itens];
                          novosItens[idx].texto = e.target.value;
                          setClausulas({
                            ...clausulas,
                            [key]: { ...clausula, itens: novosItens },
                          });
                        }}
                        style={styles.clausulaTextarea}
                        rows={3}
                      />
                    </div>
                  ))
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                if (window.confirm("Deseja restaurar as cláusulas padrão?")) {
                  window.location.reload();
                }
              }}
              style={styles.restaurarButton}
            >
              🔄 Restaurar Cláusulas Padrão
            </button>
          </fieldset>
          <div style={styles.buttonGroup}>
            <button
              onClick={salvarContrato}
              style={styles.saveButton}
              disabled={salvando}
            >
              {salvando ? "Salvando..." : editandoId ? "Atualizar" : "Salvar"}{" "}
              Contrato
            </button>
            <button
              onClick={resetarFormulario}
              style={styles.cancelButton}
              disabled={salvando}
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
                  <div key={contrato._id || contrato.id} style={styles.compactContractCard}>
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
                        onClick={() => excluirContrato(contrato._id || contrato.id)}
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
  clausulaEditavel: {
    marginBottom: "1.5rem",
    padding: "1rem",
    backgroundColor: "#f9f9f9",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  clausulaTitulo: {
    width: "100%",
    padding: "0.5rem",
    fontSize: "1rem",
    fontWeight: "bold",
    border: "1px solid #ccc",
    borderRadius: "4px",
    marginBottom: "0.75rem",
    backgroundColor: "#fff",
  },
  clausulaSubtitulo: {
    width: "100%",
    padding: "0.5rem",
    fontSize: "0.95rem",
    fontWeight: "600",
    border: "1px solid #ddd",
    borderRadius: "4px",
    marginBottom: "0.5rem",
    backgroundColor: "#fff",
  },
  clausulaTextarea: {
    width: "100%",
    padding: "0.75rem",
    fontSize: "0.9rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    marginBottom: "0.75rem",
    backgroundColor: "#fff",
    fontFamily: "inherit",
    lineHeight: "1.5",
    resize: "vertical",
  },
  clausulaItem: {
    marginBottom: "1rem",
  },
  restaurarButton: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.95rem",
    marginTop: "1rem",
  },
  paymentInfo: {
    marginTop: "1rem",
  },
  resumoPagamento: {
    marginBottom: "1rem",
  },
  parcelasTable: {
    marginTop: "1rem",
  },
};

export default GerenciadorContratos;
