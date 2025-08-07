import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const FAQ = () => {
  // Estado para controlar qual categoria está ativa
  const [activeCategory, setActiveCategory] = useState("geral");

  // Estado para controlar quais perguntas estão abertas
  const [openQuestions, setOpenQuestions] = useState({});

  // Categorias de perguntas
  const categories = [
    { id: "geral", label: "Geral" },
    { id: "noivas", label: "Noivas" },
    { id: "noivos", label: "Noivos" },
    { id: "pagamento", label: "Pagamento" },
    { id: "agendamento", label: "Agendamento" },
  ];

  // Perguntas frequentes organizadas por categoria
  const faqItems = {
    geral: [
      {
        pergunta: "Qual a diferença entre aluguel e compra de trajes?",
        resposta:
          "O aluguel é uma opção econômica para quem deseja usar um traje de alta qualidade por um preço mais acessível. Inclui ajustes básicos e limpeza após o uso. Já a compra é ideal para quem deseja um traje totalmente personalizado ou pretende utilizá-lo em outras ocasiões. Ambas as opções incluem nosso atendimento exclusivo e consultoria de estilo.",
      },
      {
        pergunta: "Vocês atendem em outras cidades?",
        resposta:
          "Nosso ateliê está localizado em Contagem/MG, mas atendemos clientes de todo o Brasil. Para clientes de outras cidades, oferecemos consultoria online inicial e organizamos as provas presenciais de forma otimizada. Em casos especiais, nossa equipe pode se deslocar até você, mediante consulta de disponibilidade e custos adicionais.",
      },
      {
        pergunta: "Quanto tempo de antecedência devo procurar o ateliê?",
        resposta:
          "Recomendamos iniciar a busca pelo vestido de noiva com 8 a 12 meses de antecedência, e para ternos e vestidos de festa, 3 a 6 meses antes do evento. Para peças sob medida, o prazo ideal é de 6 a 10 meses. No entanto, também temos opções para casamentos com prazos mais curtos - entre em contato para verificarmos as possibilidades.",
      },
      {
        pergunta: "Posso levar acompanhantes nas provas?",
        resposta:
          "Sim! Entendemos que este é um momento especial que você pode querer compartilhar. Recomendamos trazer até 3 acompanhantes para manter o foco e tornar a experiência mais produtiva. Para grupos maiores, pedimos que nos avise com antecedência para que possamos preparar adequadamente o espaço.",
      },
    ],
    noivas: [
      {
        pergunta: "Como escolher o vestido ideal para meu tipo de corpo?",
        resposta:
          "Cada silhueta tem modelos que a valorizam naturalmente. Durante sua consulta, nossa equipe especializada analisará seu tipo de corpo e estilo pessoal para recomendar os modelos mais adequados. Trabalhamos com uma ampla variedade de estilos - desde o clássico linha A, que favorece a maioria dos corpos, até modelos sereia, princesa, império e muitos outros, garantindo que você encontre o vestido perfeito.",
      },
      {
        pergunta: "Vocês fazem vestidos sob medida do zero?",
        resposta:
          "Sim! Oferecemos serviço completo de criação de vestidos sob medida, desde o desenvolvimento do croqui até a confecção final. O processo inclui consultoria de estilo, escolha de tecidos e rendas, desenvolvimento do design exclusivo e múltiplas provas para ajustes. Este serviço permite criar uma peça única que reflete perfeitamente sua personalidade e sonhos.",
      },
      {
        pergunta: "Quanto custa em média um vestido de noiva?",
        resposta:
          "O investimento em um vestido de noiva varia conforme o modelo, tecidos, complexidade dos bordados e se é aluguel ou compra. Nossos vestidos para aluguel começam em R$ 3.500, enquanto os vestidos para venda começam em R$ 5.000. Vestidos sob medida com design exclusivo têm valores a partir de R$ 7.000. Durante sua consulta, apresentaremos opções dentro do orçamento que você determinar.",
      },
      {
        pergunta: "Posso fazer alterações no vestido escolhido?",
        resposta:
          "Sim, oferecemos serviços de personalização para vestidos prontos. Dependendo do modelo, podemos adicionar ou remover mangas, modificar decotes, acrescentar bordados ou aplicações, e realizar outros ajustes para tornar o vestido mais adequado ao seu estilo. Para vestidos de aluguel, algumas alterações podem ser limitadas, mas nossa equipe sempre buscará alternativas para atender seus desejos.",
      },
      {
        pergunta: "O que devo levar para a primeira prova?",
        resposta:
          "Para a primeira prova, recomendamos trazer a lingerie que pretende usar no dia (especialmente se for um corselet ou modelador), sapatos com altura similar aos que usará na cerimônia, e acessórios que já tenha escolhido, como véu ou joias específicas. Isso nos ajudará a visualizar o look completo e fazer recomendações mais precisas.",
      },
    ],
    noivos: [
      {
        pergunta: "Quais estilos de ternos vocês oferecem?",
        resposta:
          "Nosso acervo inclui uma ampla variedade de estilos, desde ternos clássicos slim e tradicionais até smokings, fraque, morning coat e opções mais contemporâneas. Trabalhamos com marcas renomadas e também oferecemos confecção sob medida. Temos opções em diversas cores, tecidos e acabamentos para complementar qualquer estilo de casamento.",
      },
      {
        pergunta: "Como escolher a cor ideal do terno para meu casamento?",
        resposta:
          "A escolha da cor depende do horário, local e estilo do casamento. Para cerimônias diurnas ao ar livre, tons de azul, cinza claro ou bege são excelentes opções. Para eventos noturnos ou mais formais, o preto, azul marinho e cinza escuro são mais adequados. Durante sua consulta, analisaremos o estilo do evento, a paleta de cores do casamento e suas preferências pessoais para recomendar a melhor opção.",
      },
      {
        pergunta: "Vocês oferecem acessórios para complementar o traje?",
        resposta:
          "Sim, oferecemos uma seleção completa de acessórios, incluindo gravatas, gravatas borboleta, lenços de bolso, abotoaduras, coletes, suspensórios e sapatos. Nossos consultores ajudarão a criar um look harmonioso e elegante, garantindo que todos os elementos complementem perfeitamente seu traje principal.",
      },
      {
        pergunta: "Quanto tempo antes devo escolher meu terno?",
        resposta:
          "Recomendamos iniciar a busca pelo traje ideal com 3 a 6 meses de antecedência. Para ternos sob medida, o prazo ideal é de 4 a 6 meses antes do evento. Este tempo permite realizar todas as provas necessárias e garantir que os ajustes sejam feitos com perfeição. Para casamentos com prazo mais curto, temos opções prontas que podem ser ajustadas em menos tempo.",
      },
    ],
    pagamento: [
      {
        pergunta: "Quais formas de pagamento são aceitas?",
        resposta:
          "Aceitamos diversas formas de pagamento para sua conveniência: dinheiro, PIX, transferência bancária, cartões de débito e crédito das principais bandeiras (Visa, Mastercard, American Express, Elo). Para compras ou aluguéis de maior valor, oferecemos parcelamento em até 10x sem juros nos cartões de crédito.",
      },
      {
        pergunta: "Como funciona o pagamento para aluguel de trajes?",
        resposta:
          "Para reservar seu traje, solicitamos um sinal de 30% do valor total no momento da escolha. O restante pode ser pago em até 30 dias antes do evento. Também é necessário um depósito caução, que será integralmente devolvido após a devolução do traje em perfeitas condições. Oferecemos opções de parcelamento para sua conveniência.",
      },
      {
        pergunta: "Qual a política de cancelamento?",
        resposta:
          "Em caso de cancelamento com mais de 90 dias de antecedência da data do evento, devolvemos 70% do valor pago. Para cancelamentos entre 90 e 60 dias, a devolução é de 50%. Com menos de 60 dias de antecedência, infelizmente não é possível realizar reembolso, mas o valor pode ser convertido em crédito para outros serviços do ateliê, válido por 12 meses.",
      },
      {
        pergunta: "Vocês oferecem descontos para pacotes completos?",
        resposta:
          "Sim! Temos pacotes especiais para noivos e noivas que incluem o traje principal e acessórios com condições diferenciadas. Também oferecemos descontos para grupos, como padrinhos e madrinhas. Durante sua consulta, apresentaremos as opções disponíveis que melhor atendem às suas necessidades e orçamento.",
      },
    ],
    agendamento: [
      {
        pergunta: "Como agendar uma visita ao ateliê?",
        resposta:
          "Você pode agendar sua visita através do nosso WhatsApp (31) 99453-0011, por telefone, e-mail ou preenchendo o formulário em nosso site. Recomendamos o agendamento prévio para garantirmos um atendimento exclusivo e personalizado. Ao agendar, informe o tipo de evento e suas preferências iniciais para que possamos preparar uma seleção prévia de peças.",
      },
      {
        pergunta: "Qual o horário de funcionamento do ateliê?",
        resposta:
          "Nosso ateliê funciona de segunda a sexta-feira, das 10h às 19h, e aos sábados das 10h às 16h. Para sua comodidade, também oferecemos horários especiais mediante agendamento prévio. Aos domingos e feriados, atendemos apenas com agendamento antecipado e para casos especiais.",
      },
      {
        pergunta: "Quanto tempo dura uma consulta inicial?",
        resposta:
          "Nossa consulta inicial tem duração média de 1h30 a 2 horas. Este tempo permite conhecer suas preferências, apresentar nossas opções e realizar as primeiras provas. Para noivas, recomendamos reservar um pouco mais de tempo, cerca de 2 a 3 horas, especialmente se deseja experimentar vários modelos diferentes.",
      },
      {
        pergunta: "É necessário agendar para apenas conhecer o ateliê?",
        resposta:
          "Sim, trabalhamos exclusivamente com atendimento agendado, mesmo para visitas de reconhecimento. Isso nos permite oferecer a atenção personalizada que nossos clientes merecem. A visita inicial não gera nenhum compromisso de compra ou aluguel, e é uma ótima oportunidade para conhecer nosso acervo e serviços.",
      },
    ],
  };

  // Função para alternar a exibição da resposta
  const toggleQuestion = (questionId) => {
    setOpenQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // Função para mudar a categoria ativa
  const changeCategory = (categoryId) => {
    setActiveCategory(categoryId);
    setOpenQuestions({}); // Fecha todas as perguntas ao mudar de categoria
  };

  return (
    <section style={styles.faqContainer}>
      <div style={styles.faqContent}>
        {/* Cabeçalho da seção */}
        <div style={styles.faqHeader}>
          <h2 style={styles.faqTitle}>Perguntas Frequentes</h2>
          <div style={styles.faqDivider}></div>
          <p style={styles.faqSubtitle}>
            Encontre respostas para as dúvidas mais comuns sobre nossos serviços
            e processos
          </p>
        </div>

        {/* Navegação de categorias */}
        <div style={styles.categoryNav}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => changeCategory(category.id)}
              style={{
                ...styles.categoryButton,
                ...(activeCategory === category.id
                  ? styles.activeCategory
                  : {}),
              }}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Lista de perguntas e respostas */}
        <div style={styles.questionsList}>
          {faqItems[activeCategory].map((item, index) => {
            const questionId = `${activeCategory}-${index}`;
            const isOpen = openQuestions[questionId];

            return (
              <div key={questionId} style={styles.questionItem}>
                <button
                  onClick={() => toggleQuestion(questionId)}
                  style={styles.questionButton}
                  aria-expanded={isOpen}
                >
                  <span style={styles.questionText}>{item.pergunta}</span>
                  <span style={styles.questionIcon}>
                    {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </button>

                <div
                  style={{
                    ...styles.answerContainer,
                    maxHeight: isOpen ? "500px" : "0",
                    padding: isOpen ? "1rem 1.5rem 1.5rem" : "0 1.5rem",
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <p style={styles.answerText}>{item.resposta}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Seção de contato adicional */}
        <div style={styles.additionalHelp}>
          <h3 style={styles.additionalHelpTitle}>
            Não encontrou o que procurava?
          </h3>
          <p style={styles.additionalHelpText}>
            Entre em contato conosco diretamente e teremos prazer em esclarecer
            todas as suas dúvidas.
          </p>
          <div style={styles.contactButtons}>
            <a
              href="https://wa.me/5531994530011?text=Olá,%20tenho%20uma%20dúvida%20sobre%20o%20Ateliê%20Erica%20Damas"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.whatsappButton}
            >
              Falar pelo WhatsApp
            </a>
            <a
              href="mailto:contato@ericadamas.com.br"
              style={styles.emailButton}
            >
              Enviar E-mail
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

// Estilos do componente
const styles = {
  faqContainer: {
    padding: "5rem 2rem",
    backgroundColor: "#f9f7f4",
    fontFamily: '"Cormorant Garamond", serif',
  },
  faqContent: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  faqHeader: {
    textAlign: "center",
    marginBottom: "3rem",
  },
  faqTitle: {
    fontSize: "2.5rem",
    fontWeight: "300",
    color: "#5d4037",
    letterSpacing: "2px",
    marginBottom: "1rem",
    textTransform: "uppercase",
  },
  faqDivider: {
    width: "80px",
    height: "2px",
    backgroundColor: "#b6a06a",
    margin: "0 auto 1.5rem",
  },
  faqSubtitle: {
    fontSize: "1.1rem",
    color: "#666",
    maxWidth: "700px",
    margin: "0 auto",
    lineHeight: "1.6",
  },
  categoryNav: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "3rem",
  },
  categoryButton: {
    background: "transparent",
    border: "1px solid #b6a06a",
    color: "#5d4037",
    padding: "0.6rem 1.2rem",
    fontSize: "1rem",
    fontFamily: '"Cormorant Garamond", serif',
    borderRadius: "30px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: "500",
    letterSpacing: "0.5px",
  },
  activeCategory: {
    backgroundColor: "#b6a06a",
    color: "#fff",
    fontWeight: "600",
  },
  questionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginBottom: "4rem",
  },
  questionItem: {
    borderBottom: "1px solid #e8e1d5",
    backgroundColor: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
  },
  questionButton: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    textAlign: "left",
    padding: "1.2rem 1.5rem",
    backgroundColor: "#fff",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  questionText: {
    fontSize: "1.1rem",
    fontWeight: "500",
    color: "#5d4037",
    fontFamily: '"Cormorant Garamond", serif',
    flex: "1",
  },
  questionIcon: {
    color: "#b6a06a",
    fontSize: "0.9rem",
    transition: "transform 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
  },
  answerContainer: {
    overflow: "hidden",
    transition: "all 0.3s ease",
  },
  answerText: {
    fontSize: "1rem",
    lineHeight: "1.7",
    color: "#666",
    margin: 0,
  },
  additionalHelp: {
    textAlign: "center",
    padding: "2rem",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
    marginTop: "2rem",
  },
  additionalHelpTitle: {
    fontSize: "1.5rem",
    color: "#5d4037",
    marginBottom: "1rem",
    fontWeight: "500",
  },
  additionalHelpText: {
    fontSize: "1.1rem",
    color: "#666",
    marginBottom: "1.5rem",
    lineHeight: "1.6",
  },
  contactButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  whatsappButton: {
    backgroundColor: "#25D366",
    color: "#fff",
    padding: "0.8rem 1.5rem",
    borderRadius: "4px",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    display: "inline-block",
  },
  emailButton: {
    backgroundColor: "#b6a06a",
    color: "#fff",
    padding: "0.8rem 1.5rem",
    borderRadius: "4px",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    display: "inline-block",
  },
};

export default FAQ;
