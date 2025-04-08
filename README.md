# Gerador de Histórias com IA

Uma aplicação web para gerar histórias em partes, prompts de imagem, imagens e narração usando APIs de IA (PIAPI).

## Funcionalidades

- Geração de 15 títulos baseados em prompts específicos
- Geração de histórias divididas em 4 partes (cada uma com mínimo de 5.000 palavras)
- Geração de prompts para imagens baseados na história
- Geração de imagens baseadas nos prompts
- Interface responsiva com Bootstrap

## Configuração e Execução

### Pré-requisitos
- Node.js instalado (para o servidor proxy)
- NPM ou Yarn para instalar as dependências
- Navegador moderno
- Conexão com a internet
- Chave de API da PIAPI (incluída no código para demonstração)

### Passos para Execução

1. **Instale as dependências do servidor proxy**:
   ```bash
   npm install
   ```

2. **Inicie o servidor proxy** (necessário para evitar problemas de CORS):
   ```bash
   npm start
   ```
   Mantenha este terminal aberto durante o uso da aplicação.

3. **Abra o arquivo `index.html`** em seu navegador:
   - Abra diretamente clicando no arquivo, ou
   - Use um servidor web local (recomendado):
     ```bash
     # Se você tiver Python instalado:
     python -m http.server 5000
     ```
     E então acesse http://localhost:5000 em seu navegador.

4. **Use a aplicação seguindo os passos na interface**:
   - Gere títulos
   - Selecione um título
   - Gere cada parte da história em sequência (1 a 4)
   - Gere prompts para imagens
   - Gere imagens baseadas nos prompts

## Arquitetura do Projeto

O projeto segue uma arquitetura em camadas:

```
├── index.html           # Interface do usuário
├── css/                 # Estilos
│   └── style.css        # Estilos personalizados
├── js/                  # Lógica do cliente
│   ├── config.js        # Configurações e prompts
│   ├── services.js      # Serviços de comunicação com APIs
│   └── main.js          # Lógica principal e manipulação do DOM
├── server/              # Backend
│   └── proxy.js         # Servidor proxy para evitar CORS
└── package.json         # Dependências do projeto
```

## Resolução de Problemas

### Erros de CORS
Se você ver erros relacionados a CORS no console:
1. Verifique se o servidor proxy está em execução
2. Certifique-se de que está usando as URLs corretas no arquivo `js/config.js`:
   ```javascript
   const PROXY_URL = 'http://localhost:3000';
   ```

### Falhas na Geração de História
1. Verifique se a chave da API PIAPI é válida
2. Observe mensagens de erro no console do navegador (F12)
3. Verifique se o modelo especificado está disponível

### Falhas na Geração de Imagens
1. Verifique a chave de API
2. Certifique-se de que o serviço de imagens está disponível

## Notas de Segurança

⚠️ **ATENÇÃO**: Em um ambiente de produção:
- NÃO armazene chaves de API no código frontend
- Implemente autenticação adequada
- Use HTTPS para todas as comunicações
- Considere um backend dedicado para lidar com as chamadas de API

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes. 