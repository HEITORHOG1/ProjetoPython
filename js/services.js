/**
 * Serviços para comunicação com a API
 * Nome do arquivo: js/services.js
 */
class ApiService {
    constructor() {
        this.apiKey = CONFIG.PIAPI_KEY;
        this.proxyUrl = CONFIG.PROXY_URL;
    }

    /**
     * Realiza uma chamada para a API de chat (LLM)
     * @param {Array} messages - Array de mensagens para o chat
     * @param {String} model - Modelo a ser utilizado
     * @returns {Promise} - Retorna uma promessa com a resposta da API
     */
    async chatCompletion(messages, model = CONFIG.AI_MODELS.CHAT) {
        try {
            console.log('Enviando requisição para o proxy:', { 
                model, 
                messagesCount: messages.length,
                proxyUrl: this.proxyUrl 
            });
            
            // Verificar se o servidor está acessível primeiro
            try {
                const testResponse = await fetch(`${this.proxyUrl}/test`, { 
                    method: 'GET',
                    cache: 'no-cache', // Importante para evitar cache
                });
                
                if (!testResponse.ok) {
                    throw new Error(`Servidor não está respondendo: ${testResponse.status}`);
                }
                
                console.log('Servidor está online, prosseguindo com a requisição');
            } catch (proxyError) {
                console.error('Erro ao verificar o servidor:', proxyError);
                throw new Error(`Não foi possível conectar ao servidor (${this.proxyUrl}). Verifique se o servidor está rodando.`);
            }
            
            // Agora fazendo a requisição principal
            const response = await fetch(`${this.proxyUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    apiKey: this.apiKey,
                    model: model,
                    messages: messages,
                }),
                cache: 'no-cache', // Importante para evitar cache
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Resposta de erro da API:', errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(`Erro na API: ${errorData.error || response.statusText}`);
                } catch (e) {
                    // Se não conseguir fazer parsing do JSON
                    throw new Error(`Erro na API (${response.status}): ${errorText || response.statusText}`);
                }
            }

            return await response.json();
        } catch (error) {
            console.error('Erro detalhado ao comunicar com a API de chat:', error);
            throw error;
        }
    }

    /**
     * Gera imagens baseadas em um prompt
     * @param {String} prompt - Prompt para geração da imagem
     * @param {String} model - Modelo a ser utilizado
     * @returns {Promise} - Retorna uma promessa com a resposta da API
     */
    async generateImage(prompt, model = CONFIG.AI_MODELS.IMAGE) {
        try {
            // Verificar a conexão com o servidor primeiro
            try {
                const testResponse = await fetch(`${this.proxyUrl}/test`, {
                    cache: 'no-cache',
                });
                
                if (!testResponse.ok) {
                    throw new Error(`Servidor não está respondendo: ${testResponse.status}`);
                }
            } catch (proxyError) {
                console.error('Erro ao verificar o servidor:', proxyError);
                throw new Error(`Não foi possível conectar ao servidor. Verifique se o servidor está rodando.`);
            }

            const response = await fetch(`${this.proxyUrl}/flux`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    apiKey: this.apiKey,
                    model: model,
                    taskType: 'txt2img',
                    input: {
                        prompt: prompt,
                        width: 1024,
                        height: 1024,
                    },
                }),
                cache: 'no-cache',
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Resposta de erro da API de imagem:', errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(`Erro na API: ${errorData.error || response.statusText}`);
                } catch (e) {
                    // Se não conseguir fazer parsing do JSON
                    throw new Error(`Erro na API (${response.status}): ${errorText || response.statusText}`);
                }
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao gerar imagem:', error);
            throw error;
        }
    }

    /**
     * Verifica o status de uma tarefa de geração de imagem
     * @param {String} taskId - ID da tarefa
     * @returns {Promise} - Retorna uma promessa com a resposta da API
     */
    async checkImageTaskStatus(taskId) {
        try {
            // Verificar a conexão com o servidor primeiro
            try {
                const testResponse = await fetch(`${this.proxyUrl}/test`, {
                    cache: 'no-cache',
                });
                
                if (!testResponse.ok) {
                    throw new Error(`Servidor não está respondendo: ${testResponse.status}`);
                }
            } catch (proxyError) {
                console.error('Erro ao verificar o servidor:', proxyError);
                throw new Error(`Não foi possível conectar ao servidor. Verifique se o servidor está rodando.`);
            }

            const response = await fetch(`${this.proxyUrl}/task/${taskId}?apiKey=${this.apiKey}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-cache',
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Resposta de erro da API (status da tarefa):', errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(`Erro na API: ${errorData.error || response.statusText}`);
                } catch (e) {
                    // Se não conseguir fazer parsing do JSON
                    throw new Error(`Erro na API (${response.status}): ${errorText || response.statusText}`);
                }
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao verificar status da tarefa:', error);
            throw error;
        }
    }
}

/**
 * Serviço para geração de títulos
 */
class TitleGeneratorService {
    constructor() {
        this.apiService = new ApiService();
    }

    /**
     * Gera títulos para histórias
     * @param {String} additionalPrompt - Prompt adicional para geração de títulos
     * @returns {Promise<Array>} - Array de títulos gerados
     */
    async generateTitles(additionalPrompt = '') {
        try {
            // Log detalhado antes de iniciar
            console.log('Iniciando geração de títulos...');
            console.log('Modelo a ser usado:', CONFIG.AI_MODELS.CHAT);
            console.log('URL do proxy:', this.apiService.proxyUrl);
            
            const messages = [
                {
                    role: 'system',
                    content: CONFIG.PROMPTS.TITLES_SYSTEM_PROMPT
                },
                {
                    role: 'user',
                    content: CONFIG.PROMPTS.TITLES_USER_PROMPT + (additionalPrompt ? `\n\nConsiderações adicionais: ${additionalPrompt}` : '')
                }
            ];

            console.log('Enviando mensagens para gerar títulos, total:', messages.length);
            
            // Tentar apenas uma requisição simples primeiro para testar a conexão
            try {
                console.log('Testando conexão com o servidor...');
                const testResponse = await fetch(`${this.apiService.proxyUrl}/test`);
                const testResult = await testResponse.text();
                console.log('Resposta do teste de conexão:', testResult);
            } catch (testError) {
                console.error('Falha no teste de conexão:', testError);
                throw new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando.');
            }
            
            // Prosseguir com a requisição principal
            const response = await this.apiService.chatCompletion(messages);
            console.log('Resposta recebida, processando conteúdo...');
            
            if (response && response.choices && response.choices[0] && response.choices[0].message) {
                const content = response.choices[0].message.content;
                console.log('Conteúdo da resposta recebido, tamanho:', content.length);
                
                // Extrai os títulos do conteúdo
                const titles = this._extractTitles(content);
                console.log('Títulos extraídos:', titles.length);
                
                return titles.slice(0, CONFIG.MAX_TITLES);
            }
            
            throw new Error('Resposta da API inválida');
        } catch (error) {
            console.error('Erro ao gerar títulos:', error);
            throw error;
        }
    }

    /**
     * Extrai os títulos da resposta da API
     * @param {String} content - Conteúdo retornado pela API
     * @returns {Array} - Array de títulos extraídos
     * @private
     */
    _extractTitles(content) {
        const lines = content.split('\n');
        const titlePattern = /^\d+\.\s+(.+)$/;
        
        const titles = [];
        for (const line of lines) {
            const match = line.match(titlePattern);
            if (match && match[1]) {
                titles.push(match[1]);
            }
        }
        
        console.log('Linhas processadas:', lines.length);
        console.log('Títulos encontrados:', titles.length);
        
        return titles;
    }
}

/**
 * Serviço para geração de histórias
 */
class StoryGeneratorService {
    constructor() {
        this.apiService = new ApiService();
    }

    /**
     * Gera uma parte da história
     * @param {String} title - Título da história
     * @param {Number} partNumber - Número da parte (1-4)
     * @param {String} previousParts - Texto das partes anteriores (para contexto)
     * @returns {Promise<String>} - Texto da parte gerada
     */
    async generateStoryPart(title, partNumber, previousParts = '') {
        try {
            if (partNumber < 1 || partNumber > 4) {
                throw new Error('Número de parte inválido. Deve ser entre 1 e 4.');
            }

            console.log(`Iniciando geração da parte ${partNumber} da história...`);
            console.log('Título:', title);
            console.log('Tamanho do contexto anterior:', previousParts.length);

            let promptKey;
            switch (partNumber) {
                case 1: promptKey = 'PART1_PROMPT'; break;
                case 2: promptKey = 'PART2_PROMPT'; break;
                case 3: promptKey = 'PART3_PROMPT'; break;
                case 4: promptKey = 'PART4_PROMPT'; break;
            }

            const prompt = CONFIG.PROMPTS.STORY_PART_PROMPTS[promptKey].replace('{TITLE}', title);
            
            const messages = [
                {
                    role: 'system',
                    content: CONFIG.PROMPTS.STORY_PART_PROMPTS.SYSTEM_PROMPT
                }
            ];
            
            // Adiciona partes anteriores como contexto, se houver
            if (previousParts && partNumber > 1) {
                console.log(`Adicionando contexto das partes anteriores (${previousParts.length} caracteres)`);
                messages.push({
                    role: 'user',
                    content: 'Esta é a história que você está escrevendo até agora. Use para manter consistência:\n\n' + previousParts
                });
                
                messages.push({
                    role: 'assistant',
                    content: 'Entendido. Vou continuar a história mantendo consistência com o que já foi escrito.'
                });
            }
            
            messages.push({
                role: 'user',
                content: prompt
            });

            console.log(`Enviando requisição para gerar parte ${partNumber}, total de mensagens:`, messages.length);
            
            // Tentar uma requisição de teste primeiro
            try {
                console.log('Testando conexão com o servidor...');
                const testResponse = await fetch(`${this.apiService.proxyUrl}/test`);
                const testResult = await testResponse.text();
                console.log('Resposta do teste de conexão:', testResult);
            } catch (testError) {
                console.error('Falha no teste de conexão:', testError);
                throw new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando.');
            }
            
            const response = await this.apiService.chatCompletion(messages);
            console.log(`Resposta recebida para parte ${partNumber}, processando...`);
            
            if (response && response.choices && response.choices[0] && response.choices[0].message) {
                const content = response.choices[0].message.content;
                console.log(`Conteúdo da parte ${partNumber} recebido, tamanho:`, content.length);
                return content;
            }
            
            throw new Error('Resposta da API inválida');
        } catch (error) {
            console.error(`Erro ao gerar parte ${partNumber} da história:`, error);
            throw error;
        }
    }
}

/**
 * Serviço para geração de descrições de imagens
 */
class ImageDescriptionGeneratorService {
    constructor() {
        this.apiService = new ApiService();
    }

    /**
     * Gera descrições para imagens baseadas na história
     * @param {String} title - Título da história
     * @param {String} storyText - Texto completo da história
     * @returns {Promise<Array>} - Array de descrições para imagens
     */
    async generateImageDescriptions(title, storyText) {
        try {
            console.log('Iniciando geração de descrições de imagens...');
            console.log('Título:', title);
            console.log('Tamanho do texto da história:', storyText.length);
            
            // Limitar o tamanho do texto para evitar problemas com a API
            const maxStoryLength = 3000; // 3000 caracteres é suficiente para contexto
            const truncatedStory = storyText.length > maxStoryLength 
                ? storyText.substring(0, maxStoryLength) + "... [História truncada]" 
                : storyText;
            
            // Criar um prompt mais simples para facilitar a geração
            const simplifiedPrompt = `
Crie ${CONFIG.MAX_IMAGE_DESCRIPTIONS} descrições curtas para gerar imagens baseadas na história com o título "${title}".

Cada descrição deve:
1. Começar com: "Create a hyper-realistic and emotionally charged image of..."
2. Ter 100-150 palavras (não mais que isso)
3. Incluir descrição dos personagens e cenário detalhado

Formate cada descrição como:
"Descrição #1: [Parte 1 - Cena inicial]
Create a hyper-realistic and emotionally charged image of... [descrição]"

Escreva apenas em inglês para compatibilidade com a API de geração de imagens.`;

            // Simplificar as mensagens para reduzir o tamanho total
            const messages = [
                {
                    role: 'system',
                    content: 'Você é um especialista em criar descrições para geração de imagens realistas.'
                },
                {
                    role: 'user',
                    content: `História: ${truncatedStory}\n\n${simplifiedPrompt}`
                }
            ];

            console.log('Enviando requisição para gerar descrições de imagens, total de mensagens:', messages.length);
            
            // Tentar uma requisição de teste primeiro
            try {
                console.log('Testando conexão com o servidor...');
                const testResponse = await fetch(`${this.apiService.proxyUrl}/test`);
                const testResult = await testResponse.text();
                console.log('Resposta do teste de conexão:', testResult);
            } catch (testError) {
                console.error('Falha no teste de conexão:', testError);
                throw new Error('Não foi possível conectar ao servidor. Verifique se o servidor está rodando.');
            }

            const response = await this.apiService.chatCompletion(messages);
            console.log('Resposta recebida, processando descrições de imagens...');
            
            if (response && response.choices && response.choices[0] && response.choices[0].message) {
                const content = response.choices[0].message.content;
                console.log('Conteúdo recebido, tamanho:', content.length);
                
                // Extrai as descrições de imagens do conteúdo
                const descriptions = this._extractImageDescriptions(content);
                console.log('Descrições de imagens extraídas:', descriptions.length);
                
                // Se não encontrou nenhuma descrição, tenta extrair de forma alternativa
                if (descriptions.length === 0) {
                    console.log('Tentando extrair descrições de forma alternativa...');
                    const alternativeDescriptions = this._extractAlternativeDescriptions(content);
                    if (alternativeDescriptions.length > 0) {
                        return alternativeDescriptions;
                    }
                    throw new Error('Não foi possível extrair descrições de imagens da resposta da API.');
                }
                
                return descriptions;
            }
            
            throw new Error('Resposta da API inválida');
        } catch (error) {
            console.error('Erro ao gerar descrições de imagens:', error);
            throw error;
        }
    }

    /**
     * Método alternativo para extrair descrições de imagens quando o padrão principal falha
     * @param {String} content - Conteúdo retornado pela API
     * @returns {Array} - Array de descrições de imagens
     * @private
     */
    _extractAlternativeDescriptions(content) {
        // Tentar dividir por "Descrição #" primeiro
        const sections = content.split(/Descrição #\d+:/);
        
        // Se encontrou pelo menos 2 seções (a primeira é vazia antes da primeira "Descrição")
        if (sections.length > 1) {
            // Ignorar a primeira seção que é o texto antes da primeira "Descrição #"
            const descriptions = sections.slice(1).map((section, index) => {
                // Limpar o texto e adicionar o prefixo novamente
                const cleanSection = section.trim();
                return `Descrição #${index + 1}: [Parte ${Math.floor(index/5) + 1} - Cena]\nCreate a hyper-realistic and emotionally charged image of ${cleanSection}`;
            });
            
            console.log('Extração alternativa 1 encontrou:', descriptions.length, 'descrições');
            return descriptions;
        }
        
        // Segunda tentativa: Procurar por "Create a hyper-realistic"
        const createPattern = /Create a hyper-realistic.*?(?=Create a hyper-realistic|$)/gs;
        const createMatches = content.match(createPattern);
        
        if (createMatches && createMatches.length > 0) {
            const descriptions = createMatches.map((match, index) => {
                return `Descrição #${index + 1}: [Parte ${Math.floor(index/5) + 1} - Cena]\n${match.trim()}`;
            });
            
            console.log('Extração alternativa 2 encontrou:', descriptions.length, 'descrições');
            return descriptions;
        }
        
        // Terceira tentativa: Dividir por números
        const numberPattern = /\d+\.\s+(.*?)(?=\d+\.\s+|$)/gs;
        const numberMatches = content.match(numberPattern);
        
        if (numberMatches && numberMatches.length > 0) {
            const descriptions = numberMatches.map((match, index) => {
                // Se já contém "Create a hyper-realistic", use como está
                if (match.includes("Create a hyper-realistic")) {
                    return `Descrição #${index + 1}: [Parte ${Math.floor(index/5) + 1} - Cena]\n${match.trim()}`;
                }
                // Caso contrário, adicione o prefixo
                return `Descrição #${index + 1}: [Parte ${Math.floor(index/5) + 1} - Cena]\nCreate a hyper-realistic and emotionally charged image of ${match.trim()}`;
            });
            
            console.log('Extração alternativa 3 encontrou:', descriptions.length, 'descrições');
            return descriptions;
        }
        
        // Se tudo falhar, criar descrições básicas baseadas no título
        const title = "Scene from the story";
        const basicDescriptions = [];
        
        for (let i = 1; i <= 20; i++) {
            const part = Math.ceil(i / 5);
            const description = `Descrição #${i}: [Parte ${part} - Cena ${i % 5 || 5}]\nCreate a hyper-realistic and emotionally charged image of a scene from the story, showing characters in an emotional moment with dramatic lighting.`;
            basicDescriptions.push(description);
        }
        
        console.log('Criando descrições básicas:', basicDescriptions.length);
        return basicDescriptions.slice(0, CONFIG.MAX_IMAGE_DESCRIPTIONS);
    }

    /**
     * Extrai as descrições de imagens do conteúdo retornado pela API
     * @param {String} content - Conteúdo retornado pela API
     * @returns {Array} - Array de descrições de imagens
     * @private
     */
    _extractImageDescriptions(content) {
        const descriptionPattern = /Descrição #\d+[\s\S]*?Create a hyper-realistic[\s\S]*?(?=Descrição #\d+|$)/g;
        const matches = content.match(descriptionPattern) || [];
        
        console.log('Padrão de extração aplicado, descrições encontradas:', matches.length);
        return matches.map(desc => desc.trim());
    }

    /**
     * Gera uma imagem a partir de uma descrição
     * @param {String} description - Descrição da imagem
     * @returns {Promise<String>} - URL da imagem gerada
     */
    async generateImage(description) {
        try {
            console.log('Iniciando geração de imagem...');
            console.log('Tamanho da descrição:', description.length);
            
            // Extrai apenas o texto após "Create a hyper-realistic"
            const promptPattern = /Create a hyper-realistic[\s\S]*/;
            const match = description.match(promptPattern);
            
            if (!match) {
                console.error('Formato de descrição inválido:', description.substring(0, 100) + '...');
                throw new Error('Formato de descrição inválido. Não contém "Create a hyper-realistic"');
            }
            
            const prompt = match[0];
            console.log('Prompt extraído para geração de imagem:', prompt.substring(0, 100) + '...');
            
            const taskResponse = await this.apiService.generateImage(prompt);
            console.log('Resposta da API de geração de imagem recebida:', taskResponse);
            
            if (taskResponse && taskResponse.data && taskResponse.data.task_id) {
                const taskId = taskResponse.data.task_id;
                console.log('ID da tarefa de geração de imagem:', taskId);
                return await this._waitForImageCompletion(taskId);
            }
            
            throw new Error('Resposta da API de geração de imagem inválida');
        } catch (error) {
            console.error('Erro ao gerar imagem:', error);
            throw error;
        }
    }

    /**
     * Aguarda a conclusão de uma tarefa de geração de imagem
     * @param {String} taskId - ID da tarefa
     * @returns {Promise<String>} - URL da imagem gerada
     * @private
     */
    async _waitForImageCompletion(taskId) {
        let attempts = 0;
        const maxAttempts = 30; // 30 tentativas com 2 segundos de espera = máximo de 1 minuto
        
        console.log(`Iniciando verificação de status da tarefa ${taskId}...`);
        
        while (attempts < maxAttempts) {
            try {
                console.log(`Verificando status (tentativa ${attempts + 1}/${maxAttempts})...`);
                const response = await this.apiService.checkImageTaskStatus(taskId);
                
                if (response && response.data) {
                    const status = response.data.status;
                    console.log(`Status atual da tarefa ${taskId}: ${status}`);
                    
                    if (status === 'completed' || status === 'success') {
                        console.log('Tarefa concluída com sucesso!');
                        console.log('URL da imagem:', response.data.output.image_url);
                        return response.data.output.image_url;
                    } else if (status === 'failed') {
                        console.error('Falha na geração da imagem:', response.data);
                        throw new Error('Falha na geração da imagem');
                    } else {
                        console.log(`Tarefa ainda em processamento (status: ${status}), aguardando...`);
                    }
                }
                
                // Aguarda 2 segundos antes de tentar novamente
                console.log('Aguardando 2 segundos para próxima verificação...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                attempts++;
            } catch (error) {
                console.error('Erro ao verificar status da tarefa:', error);
                throw error;
            }
        }
        
        console.error(`Tempo esgotado aguardando a tarefa ${taskId}`);
        throw new Error('Tempo esgotado aguardando a geração da imagem');
    }
}