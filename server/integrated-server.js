/**
 * Servidor integrado que serve a aplicação web e funciona como proxy da API
 * Nome do arquivo: server/integrated-server.js
 */
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuração CORS
app.use(cors());

// Middleware para lidar com preflight OPTIONS
app.options('*', cors());

// Middleware para parsing de corpo JSON
app.use(bodyParser.json({ limit: '50mb' }));

// Servir arquivos estáticos da aplicação
app.use(express.static(path.join(__dirname, '..'))); // Pasta raiz do projeto

// Logging de todas as requisições
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Endpoint de teste para verificar se o servidor está funcionando
app.get('/api/test', (req, res) => {
    console.log('Requisição de teste recebida!');
    res.json({ 
        status: 'success', 
        message: 'Servidor integrado está funcionando!',
        time: new Date().toISOString()
    });
});

// ----------------------------------------
// API Proxy Endpoints
// ----------------------------------------

// Endpoint para chamadas à API de chat (endpoint principal)
app.post('/api/chat', async (req, res) => {
    try {
        const { apiKey, model, messages } = req.body;
        
        console.log('Recebida requisição para API de chat:');
        console.log('- Modelo:', model);
        console.log('- Quantidade de mensagens:', messages?.length);
        
        if (!apiKey) {
            console.error('Erro: API Key não fornecida');
            return res.status(400).json({ error: 'API Key não fornecida' });
        }
        
        // Determinar o timeout com base no tamanho do conteúdo
        // Histórias e descrições de imagens precisam de mais tempo
        let timeout = 60000; // 60 segundos padrão
        
        // Verificar se é uma requisição para geração de história ou descrições
        if (messages && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.content && 
                (lastMessage.content.includes("PART") || 
                 lastMessage.content.includes("descrições") || 
                 lastMessage.content.includes("imagens"))) {
                timeout = 180000; // 3 minutos para conteúdos grandes
                console.log('Timeout estendido detectado (3 minutos) para conteúdo longo');
            }
        }
        
        console.log(`Enviando requisição para API PIAPI com timeout de ${timeout/1000} segundos...`);
        
        try {
            const response = await axios.post('https://api.piapi.ai/v1/chat/completions', {
                model: model,
                messages: messages
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                timeout: timeout // Timeout personalizado
            });
            
            console.log('Resposta recebida da API de chat:', response.status);
            res.json(response.data);
        } catch (apiError) {
            console.error('Erro na chamada à API de chat:', 
                apiError.response?.status, 
                apiError.response?.data || apiError.message
            );
            
            // Enviar erros detalhados para facilitar o debugging
            res.status(apiError.response?.status || 500).json({
                error: apiError.response?.data?.error || 'Erro ao comunicar com a API',
                message: apiError.message,
                details: apiError.response?.data || {},
                code: apiError.code || 'UNKNOWN_ERROR'
            });
        }
    } catch (error) {
        console.error('Erro no servidor proxy:', error);
        res.status(500).json({
            error: 'Erro interno no servidor proxy',
            message: error.message
        });
    }
});

// Endpoint para chamadas à API Flux (geração de imagens)
app.post('/api/flux', async (req, res) => {
    try {
        const { apiKey, model, taskType, input } = req.body;
        
        console.log('Recebida requisição para API Flux:');
        console.log('- Modelo:', model);
        console.log('- Tipo de tarefa:', taskType);
        
        if (!apiKey) {
            console.error('Erro: API Key não fornecida');
            return res.status(400).json({ error: 'API Key não fornecida' });
        }
        
        console.log('Enviando requisição para API PIAPI (Flux)...');
        
        try {
            const response = await axios.post('https://api.piapi.ai/api/v1/task', {
                model: model,
                task_type: taskType,
                input: input
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': apiKey
                },
                timeout: 60000 // 60 segundos para geração de imagens
            });
            
            console.log('Resposta recebida da API Flux:', response.status);
            res.json(response.data);
        } catch (apiError) {
            console.error('Erro na chamada à API Flux:', 
                apiError.response?.status, 
                apiError.response?.data || apiError.message
            );
            
            res.status(apiError.response?.status || 500).json({
                error: apiError.response?.data?.error || 'Erro ao comunicar com a API',
                message: apiError.message,
                details: apiError.response?.data || {}
            });
        }
    } catch (error) {
        console.error('Erro no servidor proxy (Flux):', error);
        res.status(500).json({
            error: 'Erro interno no servidor proxy',
            message: error.message
        });
    }
});

// Endpoint para verificar status de tarefas
app.get('/api/task/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const apiKey = req.query.apiKey;
        
        console.log(`Verificando status da tarefa: ${taskId}`);
        
        if (!apiKey) {
            console.error('Erro: API Key não fornecida');
            return res.status(400).json({ error: 'API Key não fornecida' });
        }
        
        try {
            const response = await axios.get(`https://api.piapi.ai/api/v1/task/${taskId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': apiKey
                },
                timeout: 30000 // 30 segundos para verificação de status
            });
            
            console.log(`Status da tarefa ${taskId}:`, response.data?.data?.status || 'desconhecido');
            res.json(response.data);
        } catch (apiError) {
            console.error('Erro ao verificar status da tarefa:', 
                apiError.response?.status, 
                apiError.response?.data || apiError.message
            );
            
            res.status(apiError.response?.status || 500).json({
                error: apiError.response?.data?.error || 'Erro ao comunicar com a API',
                message: apiError.message,
                details: apiError.response?.data || {}
            });
        }
    } catch (error) {
        console.error('Erro no servidor proxy (verificação de tarefa):', error);
        res.status(500).json({
            error: 'Erro interno no servidor proxy',
            message: error.message
        });
    }
});

// Servir o favicon.ico
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No content response para favicon
});

// Rota para a página principal - garante que todas as rotas não-API servem o index.html
app.get('*', (req, res) => {
    // Ignorar rotas que começam com /api
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '..', 'index.html'));
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
============================================================
  Servidor integrado rodando em http://localhost:${PORT}
============================================================
✅ Interface web: http://localhost:${PORT}
✅ API proxy endpoints:
   - /api/test  - Teste de conexão
   - /api/chat  - Geração de texto (timeout aumentado: 3 min)
   - /api/flux  - Geração de imagens (timeout: 60s)
   - /api/task/:taskId - Verificação de status

Pressione Ctrl+C para encerrar o servidor.
============================================================
`);
});

// Lidar com erros não tratados
process.on('uncaughtException', (error) => {
    console.error('Erro não tratado:', error);
});

// Adicionar handler para SIGINT (Ctrl+C)
process.on('SIGINT', () => {
    console.log('Servidor integrado encerrando...');
    process.exit(0);
});