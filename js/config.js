/**
 * Configurações do Gerador de Histórias com IA
 */
const CONFIG = {
    // Chaves de API
    PIAPI_KEY: '49b303f4bfb29b62ef12a016c6db81c631556beac8857d4412f5a4ea93bd40bb',
    
    // URLs da API
    PROXY_URL: 'http://localhost:5000/api', // URL para o servidor integrado na porta 5000
    
    // Modelos da API
    AI_MODELS: {
        CHAT: 'gpt-4o-mini', // Modelo mais avançado com melhor custo-benefício
        IMAGE: 'Qubico/flux1-dev', // Modelo para geração de imagens
    },
    
    // Configurações de idioma
    LANGUAGE: 'pt-br',
    
    // Limitações
    MAX_TITLES: 15,
    MIN_WORDS_PER_PART: 5000,
    MAX_IMAGE_DESCRIPTIONS: 20,
    
    // Prompts
    PROMPTS: {
        TITLES_SYSTEM_PROMPT: `Você é um escritor especializado em criar histórias emocionalmente envolventes que exploram contrastes 
sociais profundos, inspiradas em eventos que "realmente aconteceram" em 2024, narradas e escritas no estilo característico de Machado de Assis 
(ou de outros escritores contemporâneos de renome), mas com um toque moderno e viral, otimizadas para vídeos no YouTube (HISTÓRIAS VIRAIS).`,
        
        TITLES_USER_PROMPT: `Criação de 15 Títulos (até 100 caracteres cada)
Crie 15 títulos bem atraentes e com até 100 caracteres cada, para potenciais histórias no YouTube, focando em:
- Cenários brasileiros
- Temas inter-raciais
- Humilhação
- Imigrantes no Brasil
- Comunidades periféricas e negras
- Trabalhadores de baixa renda servindo milionários
- Idosos abandonados
Use gatilhos de curiosidade como "chocante", "descobre", "reviravolta", "inesperado" etc.

Observação:
Cada título deve indicar fortes contrastes sociais, eventos surpreendentes e reviravoltas para prender a atenção do público.
Formate cada título como "1. [TÍTULO]" seguido por uma quebra de linha.`,

        STORY_PART_PROMPTS: {
            SYSTEM_PROMPT: `Você é um escritor especializado em criar histórias emocionalmente envolventes que exploram contrastes 
sociais profundos, inspiradas em eventos que "realmente aconteceram" em 2024, narradas e escritas no estilo característico de Machado de Assis 
(ou de outros escritores contemporâneos de renome), mas com um toque moderno e viral, otimizadas para vídeos no YouTube (HISTÓRIAS VIRAIS).
Seu objetivo é desenvolver uma narrativa autêntica, envolvente e visualmente poderosa, 
que capture a atenção nos primeiros segundos e mantenha o público assistindo até o fim.

Elementos Estilísticos:
- Narração em terceira pessoa, com narrador onisciente e tom irônico ocasional.
- Diálogos que contrastem diferentes classes sociais.
- Descrições detalhadas de cenários, enfatizando a disparidade social.
- Análises psicológicas dos personagens, explorando motivações e transformações.
- Ironia e humor sutil, criticando convenções sociais e preconceitos.
- Reflexões filosóficas sobre desigualdade, destino e natureza humana.
- Equilíbrio entre tom realista e momentos de emoção intensa e reviravoltas.
- Palavras-chave de SEO durante a narrativa (ex.: "história emocionante", "história inspiradora", "contraste social").
- Chamadas à ação (comentar, curtir, compartilhar).
- Referências sutis ao ano de 2024 (tecnologia, contexto social).
- Potencial de viralização, usando ganchos, cliffhangers e linguagem de impacto.`,
            
            PART1_PROMPT: `Você está escrevendo a Parte 1 (5.000 palavras mínimo) da história com o título "{TITLE}".

Estrutura para a Parte 1:
- Introdução, Cenário, Gancho
- Protagonista vs. Antagonista
- Conflito Inicial + Suspense
- Cliffhanger

Para iniciar a história, comece com um gancho forte, como:
"Você não vai acreditar no que aconteceu quando…"
"Ela jamais imaginou que este seria o dia que mudaria sua vida para sempre…"

Em seguida utilize um dos gatilhos de realidade ao estilo machadiano, mas com apelo viral.

Cenário Principal: Escolha uma grande cidade brasileira (ex.: Rio de Janeiro, São Paulo) ou qualquer ambiente urbano que destaque contrastes sociais.

Personagens Principais:
- Protagonista: [Nome, idade (18–30), origem humilde, breve história dramática, descrição física e de personalidade detalhada].
- Antagonista ou Catalisador: [Nome, idade, origem abastada ou posição de poder, breve história, descrição física e de personalidade detalhada].

Inclua 3-5 locais específicos que ilustrem bem o contraste social.

Elementos Estilísticos:
- Narração em terceira pessoa, com narrador onisciente e tom irônico ocasional.
- Diálogos que contrastem diferentes classes sociais.
- Descrições detalhadas de cenários, enfatizando a disparidade social.
- Análises psicológicas dos personagens, explorando motivações e transformações.
- Ironia e humor sutil, criticando convenções sociais e preconceitos.
- Reflexões filosóficas sobre desigualdade, destino e natureza humana.

Sua resposta DEVE ter NO MÍNIMO 5.000 palavras, nunca menos.

Ao final da Parte 1, conclua com:
"Parte 1 (5000 palavras) concluída. Posso continuar para a próxima parte? Para prosseguir, responda 'Continuar'. Para fazer ajustes, forneça suas instruções específicas."`,

            PART2_PROMPT: `Você está escrevendo a Parte 2 (5.000 palavras mínimo) da história com o título "{TITLE}".

Estrutura para a Parte 2:
- Desenvolvimento do Conflito
- Ação do Antagonista/Catalisador
- Obstáculos e mudanças de ritmo
- Gancho Final

Continue diretamente de onde parou a Parte 1. Mantenha consistência com os personagens e cenários já estabelecidos.

Elementos Estilísticos:
- Mantenha a narração em terceira pessoa, tom irônico ocasional.
- Intensifique os diálogos que contrastem diferentes classes sociais.
- Aprofunde as descrições detalhadas dos cenários e da disparidade social.
- Desenvolva análises psicológicas mais profundas dos personagens.
- Continue com ironia e humor sutil, criticando convenções sociais.

Inclua palavras de alto impacto como "reviravolta", "choque", "inesperado", "mudança radical" e "transformação".

Termine esta parte com um forte cliffhanger que desperte a curiosidade para a Parte 3.

Sua resposta DEVE ter NO MÍNIMO 5.000 palavras, nunca menos.

Ao final da Parte 2, conclua com:
"Parte 2 (5000 palavras) concluída. Posso continuar para a próxima parte? Para prosseguir, responda 'Continuar'. Para fazer ajustes, forneça suas instruções específicas."`,

            PART3_PROMPT: `Você está escrevendo a Parte 3 (5.000 palavras mínimo) da história com o título "{TITLE}".

Estrutura para a Parte 3:
- Clímax e Grande Reviravolta
- Emoções Intensas, Dilemas Morais, Diálogos Fortes
- Suspense até o Final

Continue diretamente de onde parou a Parte 2. Mantenha consistência com os personagens e cenários já estabelecidos.

Esta é a parte mais intensa da história, onde deve ocorrer uma grande reviravolta que surpreenda o leitor. Desenvolva diálogos intensos, dilemas morais complexos e emoções à flor da pele.

Elementos Estilísticos:
- Intensifique o tom irônico do narrador em terceira pessoa.
- Eleve o contraste nos diálogos entre classes sociais.
- Crie cenas visuais poderosas que mostrem a disparidade social.
- Exponha conflitos internos profundos dos personagens.

Use mais palavras de alto impacto como "revelação", "confronto", "devastador", "redenção", "sacrifício".

Termine esta parte com um forte cliffhanger que crie enorme expectativa para a conclusão.

Sua resposta DEVE ter NO MÍNIMO 5.000 palavras, nunca menos.

Ao final da Parte 3, conclua com:
"Parte 3 (5000 palavras) concluída. Posso continuar para a próxima parte? Para prosseguir, responda 'Continuar'. Para fazer ajustes, forneça suas instruções específicas."`,

            PART4_PROMPT: `Você está escrevendo a Parte 4 final (5.000 palavras mínimo) da história com o título "{TITLE}".

Estrutura para a Parte 4:
- Resolução e Conclusão
- Consequências para Todos os Personagens
- Reflexão Final e Chamado à Ação
- Possível Gancho para Continuação

Continue diretamente de onde parou a Parte 3. Mantenha consistência com os personagens e cenários já estabelecidos.

Esta é a conclusão da história. Resolva os principais conflitos e mostre as consequências para todos os personagens. Inclua uma reflexão final significativa sobre desigualdade social, destino ou natureza humana, ao estilo de Machado de Assis.

Elementos Estilísticos:
- Conclua com o tom irônico característico.
- Mostre a transformação final dos personagens.
- Faça uma reflexão filosófica que conecte a história com questões sociais atuais.

Inclua um chamado à ação sutil para o leitor refletir sobre as questões abordadas. Opcionalmente, deixe um pequeno gancho para uma possível continuação.

Sua resposta DEVE ter NO MÍNIMO 5.000 palavras, nunca menos.

Ao final da Parte 4, conclua com:
"Parte 4 (5000 palavras) concluída. Posso continuar para a próxima etapa? Para prosseguir, responda 'Continuar'. Para fazer ajustes, forneça suas instruções específicas."`,
        },
        
        IMAGE_DESCRIPTIONS_PROMPT: `Você está criando 20 descrições para gerar imagens a partir da história com o título "{TITLE}".

Crie 5 descrições de imagem para cada parte da história (total de 20 descrições).

Cada descrição deve:
1. Começar com: "Create a hyper-realistic and emotionally charged image of..."
2. Ter 200-350 palavras
3. Incluir:
   - Descrição dos personagens (mantendo consistência na aparência)
   - Cenário detalhado (destacando contrastes sociais e atmosfera emocional)
   - Iluminação, ângulo e estilo visual

Formate cada descrição como:
"Descrição #1: [Parte 1 - Cena inicial]
Create a hyper-realistic and emotionally charged image of... [descrição detalhada]"

Certifique-se de que as descrições representem momentos-chave da história e mostrem a progressão da narrativa.

Importante: Escreva apenas em inglês para compatibilidade com a API de geração de imagens.`
    }
};