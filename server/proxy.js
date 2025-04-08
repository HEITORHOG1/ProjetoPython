/**
 * Servidor proxy para evitar problemas de CORS
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

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));

// Adicionando middleware para verificar se a requisição está chegando
app.use((req, res, next) => {
    console.log(`Requisição recebida: ${req.method} ${req.path}`);
    next();
});

// Endpoint para chamadas à API de chat
app.post('/chat', async (req, res) => {
    try {
        const { apiKey, model, messages } = req.body;
        
        console.log('Corpo da requisição:', req.body);
        
        if (!apiKey) {
            return res.status(400).json({ error: 'API Key não fornecida' });
        }
        
        console.log('Enviando requisição para API de chat:', { model, messagesCount: messages?.length });
        
        const response = await axios.post('https://api.piapi.ai/v1/chat/completions', {
            model: model,
            messages: messages
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });
        
        console.log('Resposta recebida da API de chat:', response.status);
        res.json(response.data);
    } catch (error) {
        console.error('Erro na chamada à API de chat:', 
            error.response?.status, 
            error.response?.data || error.message
        );
        res.status(500).json({
            error: error.response?.data?.error || 'Erro ao comunicar com a API',
            message: error.message,
            details: error.response?.data
        });
    }
});

// Endpoint para chamadas à API Flux (geração de imagens)
app.post('/flux', async (req, res) => {
    try {
        const { apiKey, model, taskType, input } = req.body;
        
        if (!apiKey) {
            return res.status(400).json({ error: 'API Key não fornecida' });
        }
        
        const response = await axios.post('https://api.piapi.ai/api/v1/task', {
            model: model,
            task_type: taskType,
            input: input
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('Erro na chamada à API Flux:', error.response?.data || error.message);
        res.status(500).json({
            error: error.response?.data?.error || 'Erro ao comunicar com a API',
            message: error.message
        });
    }
});

// Endpoint para verificar status de tarefas
app.get('/task/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const apiKey = req.query.apiKey;
        
        if (!apiKey) {
            return res.status(400).json({ error: 'API Key não fornecida' });
        }
        
        const response = await axios.get(`https://api.piapi.ai/api/v1/task/${taskId}`, {
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('Erro ao verificar status da tarefa:', error.response?.data || error.message);
        res.status(500).json({
            error: error.response?.data?.error || 'Erro ao comunicar com a API',
            message: error.message
        });
    }
});

// Endpoint simples para testar se o servidor está rodando
app.get('/test', (req, res) => {
    res.json({ message: 'Servidor proxy está funcionando!' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor proxy rodando na porta ${PORT}`);
    console.log(`Acesse http://localhost:${PORT}/test para verificar se está funcionando`);
}); 