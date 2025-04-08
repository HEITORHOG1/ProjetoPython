/**
 * Servidor proxy simplificado para evitar problemas de CORS
 * Nome do arquivo: server/simple-proxy.js
 */
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração CORS mais permissiva
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Middleware para lidar com preflight OPTIONS
app.options('*', cors());

// Middleware para parsing de corpo JSON
app.use(bodyParser.json({ limit: '50mb' }));

// Logging de todas as requisições
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Endpoint de teste para verificar se o servidor está funcionando
app.get('/test', (req, res) => {
    console.log('Requisição de teste recebida!');
    res.json({ 
        status: 'success', 
        message: 'Servidor proxy está funcionando!',
        time: new Date().toISOString()
    });
});

// Endpoint para chamadas à API de chat (endpoint principal)
app.post('/chat', async (req, res) => {
    try {
        const { apiKey, model, messages } = req.body;
        
        console.log('Recebida requisição para API de chat:');
        console.log('- Modelo:', model);
        console.log('- Quantidade de mensagens:', messages?.length);
        
        if (!apiKey) {
            console.error('Erro: API Key não fornecida');
            return res.status(400).json({ error: 'API Key não fornecida' });
        }
        
        console.log('Enviando requisição para API PIAPI...');
        
        try {
            const response = await axios.post('https://api.piapi.ai/v1/chat/completions', {
                model: model,
                messages: messages
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                timeout: 30000 // 30 segundos de timeout
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
app.post('/flux', async (req, res) => {
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
                timeout: 30000 // 30 segundos de timeout
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
app.get('/task/:taskId', async (req, res) => {
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
                timeout: 10000 // 10 segundos de timeout
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

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor proxy simplificado rodando na porta ${PORT}`);
    console.log(`Acesse http://localhost:${PORT}/test para verificar se está funcionando`);
    console.log('Use Ctrl+C para encerrar');
});

// Lidar com erros não tratados
process.on('uncaughtException', (error) => {
    console.error('Erro não tratado:', error);
});

// Adicionar handler para SIGINT (Ctrl+C)
process.on('SIGINT', () => {
    console.log('Servidor proxy encerrando...');
    process.exit(0);
});