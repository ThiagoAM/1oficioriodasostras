export default function AboutSection() {
  return (
    <section className="max-lg:py-16 py-24 bg-white" id="about">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-lg:flex max-lg:justify-center relative">
            <div className="max-lg:hidden absolute inset-0 bg-brand-blue transform -translate-x-4 translate-y-4"></div>
            <div className="max-lg:bg-white max-lg:p-2 max-lg:border-2 max-lg:border-brand-blue relative z-10 p-4 bg-white">
              <img
                src="/uploads/robson.jpg"
                alt="Robson Martins, um homem sorridente de terno azul e gravata, segurando um livro de capa marrom."
                className="w-full h-auto"
                data-testid="img-about-lawyer"
              />
            </div>
          </div>

          <div className="text-gray-600">
            <p className="max-lg:text-sm max-lg:text-gray-500 max-lg:mb-2 text-brand-blue font-semibold" data-testid="text-about-subtitle">Sobre</p>
            <h2 className="max-lg:block max-lg:font-serif max-lg:text-3xl max-lg:font-bold max-lg:text-brand-blue max-lg:mb-6 hidden">Robson Martins</h2>
            <div className="max-lg:hidden w-16 h-0.5 bg-brand-blue my-4"></div>
            <p className="mb-8 max-lg:text-base text-lg leading-relaxed max-lg:text-justify" data-testid="text-about-paragraph-1">
              Robson Martins é o Titular do Cartório do 1. Ofício de Rio das Ostras, após aprovação em rigoroso concurso público de provas e títulos iniciado em 2016 e elaborado pelo Tribunal de Justiça do Rio de Janeiro. É Pós-Doutorando em Direito (UENPL), Doutor em Direito da Cidade (UERJ) e em Direito Constitucional (CEUB-ITE). Mestre em Sociedade, Direitos Humanos e Arte (PND-UFRJ) e em Direito Processual e Cidadania (UNIPAR). Especialista em Direito Notarial e Registral, Negócios Imobiliários e Direito Civil pela Universidade Anhanguera e Faculdade Damásio. Professor da pós graduação em direito da UNINTER, Tabelião de Notas e Protesto e Oficial de Registro Civil no RJ. Foi Procurador da República, Promotor de Justiça e Técnico da Justiça Federal por mais de 30 anos. Pesquisador em direito da cidade, direito urbanístico e políticas públicas (UERJ e UENP). Foi aprovado em inúmeros concursos para Cartórios em vários Estados do país e também para a Advocacia Geral da União, Justiça Federal, Ministério Público Estadual e Federal. Autor de 3 Livros sobre REURB, idosos e superendividamento e Ministério Público de Garantias.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
