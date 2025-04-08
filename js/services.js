/**
 * Serviços para comunicação com a API
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
            console.log('Enviando requisição para o proxy:', { model, messagesCount: messages.length });
            
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
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Resposta de erro da API:', errorData);
                throw new Error(`Erro na API: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao comunicar com a API de chat:', error);
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
            });

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.statusText}`);
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
            const response = await fetch(`${this.proxyUrl}/task/${taskId}?apiKey=${this.apiKey}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.statusText}`);
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

            console.log('Enviando mensagens para gerar títulos:', messages);
            const response = await this.apiService.chatCompletion(messages);
            console.log('Resposta recebida:', response);
            
            if (response && response.choices && response.choices[0] && response.choices[0].message) {
                const content = response.choices[0].message.content;
                console.log('Conteúdo da resposta:', content);
                
                // Extrai os títulos do conteúdo
                const titles = this._extractTitles(content);
                
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

            const response = await this.apiService.chatCompletion(messages);
            
            if (response && response.choices && response.choices[0] && response.choices[0].message) {
                return response.choices[0].message.content;
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
            const messages = [
                {
                    role: 'system',
                    content: 'Você é um especialista em criar descrições detalhadas para imagens.'
                },
                {
                    role: 'user',
                    content: `Aqui está uma história completa: ${storyText.substring(0, 2000)}... [História truncada devido ao tamanho]`
                },
                {
                    role: 'assistant',
                    content: 'Entendido. Li o resumo da história e compreendi o contexto, personagens e ambientação.'
                },
                {
                    role: 'user',
                    content: CONFIG.PROMPTS.IMAGE_DESCRIPTIONS_PROMPT.replace('{TITLE}', title)
                }
            ];

            const response = await this.apiService.chatCompletion(messages);
            
            if (response && response.choices && response.choices[0] && response.choices[0].message) {
                const content = response.choices[0].message.content;
                
                // Extrai as descrições de imagens do conteúdo
                return this._extractImageDescriptions(content);
            }
            
            throw new Error('Resposta da API inválida');
        } catch (error) {
            console.error('Erro ao gerar descrições de imagens:', error);
            throw error;
        }
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
        
        return matches.map(desc => desc.trim());
    }

    /**
     * Gera uma imagem a partir de uma descrição
     * @param {String} description - Descrição da imagem
     * @returns {Promise<String>} - URL da imagem gerada
     */
    async generateImage(description) {
        try {
            // Extrai apenas o texto após "Create a hyper-realistic"
            const promptPattern = /Create a hyper-realistic[\s\S]*/;
            const match = description.match(promptPattern);
            
            if (!match) {
                throw new Error('Formato de descrição inválido');
            }
            
            const prompt = match[0];
            const taskResponse = await this.apiService.generateImage(prompt);
            
            if (taskResponse && taskResponse.data && taskResponse.data.task_id) {
                return await this._waitForImageCompletion(taskResponse.data.task_id);
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
        
        while (attempts < maxAttempts) {
            try {
                const response = await this.apiService.checkImageTaskStatus(taskId);
                
                if (response && response.data) {
                    const status = response.data.status;
                    
                    if (status === 'completed' || status === 'success') {
                        return response.data.output.image_url;
                    } else if (status === 'failed') {
                        throw new Error('Falha na geração da imagem');
                    }
                }
                
                // Aguarda 2 segundos antes de tentar novamente
                await new Promise(resolve => setTimeout(resolve, 2000));
                attempts++;
            } catch (error) {
                console.error('Erro ao verificar status da tarefa:', error);
                throw error;
            }
        }
        
        throw new Error('Tempo esgotado aguardando a geração da imagem');
    }
} 