import React from "react";
import { Helmet } from "react-helmet";

const Depoimentos = () => {
  const depoimentos = [
    {
      id: 1,
      nome: "Jennifer",
      conteudo: `Posso dizer com toda convicção que o Ateliê Erica Damas, com toda a sensibilidade para selecionar cada peça de sua coleção e os detalhes que fazem a diferença, é a melhor escolha que uma noiva pode ter. 

    Cada vestido é cuidado de maneira impecável, guardado e exposto com total capricho. Quando encontrei meu vestido ideal, a emoção foi tão grande que as lágrimas vieram espontaneamente, junto com a certeza: "SIM, ESSE É MEU VESTIDO DOS SONHOS".
    
    Com toda elegância, encanto, graciosidade e profissionalismo que possui, o ateliê pelo qual me apaixonei e indico de olhos fechados é o Erica Damas!`,
      data: "Janeiro 2023",
    },
    {
      id: 2,
      nome: "Camila",
      conteudo: `Minha experiência no Ateliê Erica Damas superou todas as expectativas. A equipe tem um olhar único para entender o que cada noiva busca, transformando o momento da escolha em algo mágico.
    
    O cuidado com cada detalhe, desde o atendimento até a qualidade dos materiais, mostra o amor pelo que fazem. Quando me vi no espelho com meu vestido escolhido, soube que havia encontrado não apenas um traje, mas uma peça que contaria minha história.`,
      data: "Março 2023",
    },
    {
      id: 3,
      nome: "Letícia",
      conteudo: `Recomendo o Ateliê Erica Damas não apenas pela beleza incomparável dos vestidos, mas pela experiência completa que oferecem. Fui recebida com carinho e profissionalismo, e cada sugestão da equipe foi perfeita para meu estilo.
    
    O processo de escolha foi tão especial que me fez sentir única em cada etapa. A qualidade dos tecidos e o acabamento impecável fazem toda diferença no grande dia. É mais que um ateliê, é um lugar onde sonhos de noiva se tornam realidade!`,
      data: "Maio 2023",
    },
    {
      id: 4,
      nome: "Isabella",
      conteudo: `O Ateliê Erica Damas transformou completamente minha visão sobre vestidos de noiva. Desde o primeiro momento, fui tratada com uma atenção especial que me fez sentir única e compreendida.
    
    A variedade de modelos e a qualidade dos tecidos são impressionantes, mas o que realmente me conquistou foi a capacidade da equipe de traduzir em um vestido tudo o que eu imaginava para meu grande dia. O resultado foi além do que eu poderia sonhar - um vestido que parecia ter sido feito só para mim (e de fato foi!). 
    
    Gratidão eterna por tornar esse momento tão perfeito!`,
      data: "Julho 2023",
    },
  ];

  return (
    <section style={styles.depoimentosContainer}>
      <Helmet>
        <title>Erica Damas - Depoimentos de Noivas</title>
        <meta
          name="description"
          content="Depoimentos emocionantes de noivas que viveram a experiência Erica Damas"
        />
      </Helmet>

      <div style={styles.tituloContainer}>
        <h1 style={styles.titulo}>DEPOIMENTOS</h1>
        <div style={styles.divisor}></div>
      </div>

      <div style={styles.depoimentosGrid}>
        {depoimentos.map((depoimento) => (
          <div key={depoimento.id} style={styles.depoimentoCard}>
            <div style={styles.quoteIcon}>"</div>
            <p style={styles.depoimentoTexto}>{depoimento.conteudo}</p>
            <div style={styles.assinatura}>
              <div style={styles.nome}>{depoimento.nome}</div>
              <div style={styles.data}>{depoimento.data}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const styles = {
  depoimentosContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "4rem 2rem",
    fontFamily: '"Cormorant Garamond", serif',
  },
  tituloContainer: {
    textAlign: "center",
    marginBottom: "3rem",
  },
  titulo: {
    fontSize: "2.5rem",
    fontWeight: "300",
    letterSpacing: "3px",
    color: "#5d4037",
    marginBottom: "1rem",
    textTransform: "uppercase",
  },
  divisor: {
    width: "80px",
    height: "2px",
    backgroundColor: "#b6a06a",
    margin: "0 auto",
  },
  depoimentosGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1.5rem",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  depoimentoCard: {
    backgroundColor: "#fafafa",
    padding: "1.8rem",
    borderRadius: "3px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    position: "relative",
    borderLeft: "2px solid #b6a06a",
    transition: "transform 0.3s ease",
  },
  quoteIcon: {
    position: "absolute",
    top: "15px",
    left: "15px",
    fontSize: "3rem",
    color: "#b6a06a",
    opacity: "0.15",
    lineHeight: "1",
  },
  depoimentoTexto: {
    fontSize: "1rem",
    lineHeight: "1.7",
    color: "#666",
    marginBottom: "1.2rem",
    fontStyle: "italic",
    position: "relative",
  },
  assinatura: {
    borderTop: "1px solid #eee",
    paddingTop: "0.8rem",
    textAlign: "right",
  },
  nome: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#5d4037",
    letterSpacing: "0.5px",
  },
  data: {
    fontSize: "0.85rem",
    color: "#999",
    fontStyle: "italic",
  },
  "@media (max-width: 768px)": {
    depoimentosGrid: {
      gridTemplateColumns: "1fr",
    },
  },
};

export default Depoimentos;
