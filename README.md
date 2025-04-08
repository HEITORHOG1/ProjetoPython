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




tutorial
LLM API | Basic Completions
POST
https://api.piapi.ai/v1/chat/completions
LLM
INFO

Discount
PiAPI also provides different LLM API at cost effective pricing, sometimes at 25%~75% of their official pricing.

Availability
Given the steep discount, we sometimes face availability issues thus we always recommend developers to always have another back up API source ready - take advantage of our low pricing when you can, and when availability becomes a problem switch to a higher cost solution to maintain overall system up-time.

Using "System"
1.
o1-preview & o1-mini & o3-mini does not support "system" role as part of the function call.

model name	pricing	Notes
gpt-4o-mini	input 1M tokens = $0.1125
output 1M tokens = $0.45	75% of OpenAI's official pricing
gpt-4o	input 1M tokens = $1.875
output 1M tokens = $7.5
Only for Creator Plan or Above	75% of OpenAI's official pricing, as the original OpenAI's API model gpt-4o.
o1-mini	input 1M tokens = $2.25
output 1M tokens = $9
Only for Creator Plan or Above	75% of OpenAI's official pricing
o3-mini	input 1M tokens = $0.825
output 1M tokens = $3.3
Only for Creator Plan or Above	75% of OpenAI's official pricing
o1-preview	input 1M tokens = $11.25
output 1M tokens = $45
Only for Creator Plan or Above	75% of OpenAI's official pricing
claude-3-5-sonnet-20240620 or claude-3-5-sonnet-20241022 or claude-3-7-sonnet-20250219	input 1M tokens = $2.25
output 1M tokens = $11.25
Only for Creator Plan or Above	75% of Anthropic's official pricing
gpt-4-gizmo-*(gpts)	input 1M tokens = $2.5
output 1M tokens = $10
each completion call of this model has a $0.005 minimum charge*
Only for Creator Plan or Above	equal to OpenAI gpt-4o price
deepseek-reasoner	input 1M tokens = $0.55
output 1M tokens = $2.2	see deepseek models
gpt-4o-image-preview	$0.1 per request	see 4o image generation api
Note:
1.
OpenAI's input and output tokens, where 1k token roughly equals to 750 words. Thus 1 token roughly equates to 0.75 word.
2.
The definition of minimum charge: if the actual token (input+output) usage for that particular completion is less than that value, we will round it that value.
Request
Header Params
Authorization
string 
required
Your API KEY for authorization
Body Params
application/json
model
string 
required
The name of the model to be used

How to get Gizmo model name: Go to ChatGPT official website, explore the GPTs and enter chat with the GPT of your choice, you will see webpage address like https://chatgpt.com/g/g-gFt1ghYJl-logo-creator. Then the model name you should use is gpt-4-gizmo-g-gFt1ghYJl.
messages
array[string]
required
A list of messages comprising the conversation so far
functions
array[string]
optional
A list of functions the model may generate JSON inputs for.
function_call
string 
optional
Controls how the model calls functions.

"none" means the model will not call a function and instead generates a message.

"auto" means the model can pick between generating a message or calling a function.

Specifying a particular function via {name:my_function} forces the model to call that function.

"none" is the default when no functions are present.

"auto" is the default if functions are present.
temperature
number 
optional
Defaults to 1. What sampling temperature to use, between 0 and 2.

Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
top_p
number 
optional
Defaults to 1.

An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass.

So 0.1 means only the tokens comprising the top 10% probability mass are considered.
n
integer 
optional
Defaults to 1.

How many chat completion choices to generate for each input message.
stream
boolean 
optional
Defaults to false.

If set, partial message deltas will be sent, like in ChatGPT.

Tokens will be sent as data-only server-sent events as they become available, with the stream terminated by a data:[none] message
stop
string  | 
array
optional
Defaults to null.

Up to 4 sequences where the API will stop generating further tokens.
max_tokens
number 
optional
Defaults to the maximum number of tokens to generate in the chat completion.
presence_penalty
number 
optional
Defaults to 0.

Number between -2.0 and 2.0.

Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
frequency_penalty
number 
optional
Defaults to 0.

Number between -2.0 and 2.0.

Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
logit_bias
string 
optional
Defaults to null. Modify the likelihood of specified tokens appearing in the completion.
Example
//Request Example - No Streaming

curl https://api.piapi.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
     {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Hello!"
      }
    ]
  }'


  //Request Example - Streaming
  curl https://api.piapi.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Hello!"
      }
   ],
    "stream": true
  }'
Request samples
Fetch
Axios
jQuery
XHR
Native
Request
Unirest
var myHeaders = new Headers();
myHeaders.append("Authorization", "");
myHeaders.append("Content-Type", "application/json");

var raw = "//Request Example - No Streaming\r\n\r\ncurl https://api.piapi.ai/v1/chat/completions \\\r\n  -H \"Content-Type: application/json\" \\\r\n  -H \"Authorization: Bearer API_KEY\" \\\r\n  -d '{\r\n    \"model\": \"gpt-3.5-turbo\",\r\n    \"messages\": [\r\n     {\r\n        \"role\": \"system\",\r\n        \"content\": \"You are a helpful assistant.\"\r\n      },\r\n      {\r\n        \"role\": \"user\",\r\n        \"content\": \"Hello!\"\r\n      }\r\n    ]\r\n  }'\r\n\r\n\r\n  //Request Example - Streaming\r\n  curl https://api.piapi.ai/v1/chat/completions \\\r\n  -H \"Content-Type: application/json\" \\\r\n  -H \"Authorization: Bearer API_KEY\" \\\r\n  -d '{\r\n    \"model\": \"gpt-3.5-turbo\",\r\n    \"messages\": [\r\n      {\r\n        \"role\": \"system\",\r\n        \"content\": \"You are a helpful assistant.\"\r\n      },\r\n      {\r\n        \"role\": \"user\",\r\n        \"content\": \"Hello!\"\r\n      }\r\n   ],\r\n    \"stream\": true\r\n  }'";

var requestOptions = {
   method: 'POST',
   headers: myHeaders,
   body: raw,
   redirect: 'follow'
};

fetch("https://api.piapi.ai/v1/chat/completions", requestOptions)
   .then(response => response.text())
   .then(result => console.log(result))
   .catch(error => console.log('error', error));
Responses
🟢200
OK
application/json
id
string 
required
object
string 
required
created
integer 
required
model
string 
required
choices
array [object {3}] 
required
index
integer 
optional
message
object 
optional
finish_reason
string 
optional
usage
object 
required
prompt_tokens
integer 
required
completion_tokens
integer 
required
total_tokens
integer 
required
Examples
Success- No Streaming
Success-Steaming
{
  "id": "chatcmpl-83jZ61GDHtdlsFUzXDbpGeoU193Mj",
  "object": "chat.completion",
  "created": 1695900828,
  "model": "gpt-3.5-turbo",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I assist you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 19,
    "completion_tokens": 9,
    "total_tokens": 28
  }
}
🟠400
Bad Request
🟠401
Unauthorized
🔴500
Server Error
Modified at 5 days ago
Previous
GPT-4o Image Generation API
Next
Get Task
