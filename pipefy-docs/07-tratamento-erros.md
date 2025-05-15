# Tratamento de Erros na API do Pipefy

## Visão Geral do Tratamento de Erros

O tratamento adequado de erros é essencial para criar integrações robustas com a API do Pipefy. Diferente das APIs REST tradicionais, o GraphQL tem uma abordagem específica para lidar com erros.

### Particularidades do GraphQL

No GraphQL, as respostas geralmente têm status HTTP 200, mesmo quando ocorrem erros. Os erros são retornados no corpo da resposta, junto com quaisquer dados que foram solicitados com sucesso. Isso significa que:

1. **Respostas parciais**: É possível receber parte dos dados solicitados, mesmo se ocorrerem erros
2. **Múltiplos erros**: Uma única requisição pode retornar múltiplos erros
3. **Metadados de erro**: Cada erro pode incluir informações detalhadas sobre o problema

## Estrutura de Erros no GraphQL

Uma resposta com erro na API GraphQL do Pipefy segue esta estrutura:

```json
{
  "data": {
    "query_field": null
  },
  "errors": [
    {
      "message": "Mensagem de erro legível por humanos",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": [
        "query_field"
      ],
      "extensions": {
        "code": "CÓDIGO_DE_ERRO",
        "details": {
          "informações": "adicionais sobre o erro"
        }
      }
    }
  ]
}
```

### Componentes principais:

- **message**: Descrição legível do erro
- **locations**: Posição no documento GraphQL onde o erro ocorreu
- **path**: Caminho no campo solicitado que gerou o erro
- **extensions**: Informações adicionais específicas do Pipefy, incluindo:
  - **code**: Código de erro padronizado
  - **details**: Detalhes específicos do erro

## Códigos de Status HTTP

Embora a maioria das respostas GraphQL retornem status HTTP 200, alguns erros resultam em códigos de status HTTP diferentes:

| Código | Descrição | Situações Comuns |
|--------|-----------|------------------|
| 200 | OK | Resposta normal, mesmo com erros no corpo da resposta |
| 400 | Bad Request | Sintaxe de query GraphQL inválida |
| 401 | Unauthorized | Token de autenticação ausente ou inválido |
| 403 | Forbidden | Permissões insuficientes para a operação |
| 413 | Payload Too Large | Tamanho da requisição excede o limite |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Erro interno no servidor Pipefy |
| 502 | Bad Gateway | Problemas temporários na infraestrutura |
| 503 | Service Unavailable | Servidor temporariamente indisponível |
| 504 | Gateway Timeout | Tempo limite excedido na operação |

## Códigos de Erro GraphQL

A API do Pipefy utiliza códigos de erro padronizados no campo `extensions.code` para identificar o tipo de erro:

### Erros de Autenticação e Autorização

| Código | Descrição | Solução |
|--------|-----------|---------|
| UNAUTHENTICATED | Token ausente ou inválido | Verificar se o token está presente e válido |
| FORBIDDEN | Permissões insuficientes | Verificar se o usuário tem as permissões necessárias |
| TOKEN_EXPIRED | Token expirado | Renovar o token |
| INVALID_CREDENTIALS | Credenciais inválidas | Verificar as credenciais utilizadas |

### Erros de Validação e Entrada

| Código | Descrição | Solução |
|--------|-----------|---------|
| BAD_USER_INPUT | Parâmetros inválidos | Verificar os parâmetros enviados |
| VALIDATION_ERROR | Violação de regras de validação | Corrigir os dados conforme as regras |
| REQUIRED_FIELD | Campo obrigatório não fornecido | Adicionar o campo obrigatório |
| INVALID_FORMAT | Formato de dados inválido | Corrigir o formato segundo a especificação |
| ALREADY_EXISTS | Recurso já existe | Verificar se o recurso já existe |
| NOT_FOUND | Recurso não encontrado | Verificar se o ID está correto |

### Erros de Limitação

| Código | Descrição | Solução |
|--------|-----------|---------|
| RATE_LIMITED | Taxa de requisições excedida | Reduzir frequência de requisições, implementar backoff |
| QUERY_COMPLEXITY_TOO_HIGH | Consulta muito complexa | Simplificar a consulta |
| MAX_FILE_SIZE_EXCEEDED | Tamanho de arquivo excede limite | Reduzir tamanho do arquivo |
| MAX_ITEMS_EXCEEDED | Número de itens excede limite | Reduzir quantidade de itens |

### Erros Internos

| Código | Descrição | Solução |
|--------|-----------|---------|
| INTERNAL_SERVER_ERROR | Erro interno no servidor | Contatar suporte se persistir |
| TIMEOUT | Tempo limite excedido | Tentar novamente mais tarde |
| SERVICE_UNAVAILABLE | Serviço temporariamente indisponível | Tentar novamente mais tarde |
| DATABASE_ERROR | Erro no banco de dados | Contatar suporte se persistir |

## Exemplos de Erros Comuns

### Erro de Autenticação

```json
{
  "data": null,
  "errors": [
    {
      "message": "You need to sign in or sign up before continuing.",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": [
        "me"
      ],
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

### Erro de Permissão

```json
{
  "data": {
    "updateCard": null
  },
  "errors": [
    {
      "message": "You don't have permission to perform this action",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": [
        "updateCard"
      ],
      "extensions": {
        "code": "FORBIDDEN"
      }
    }
  ]
}
```

### Erro de Validação

```json
{
  "data": {
    "createCard": null
  },
  "errors": [
    {
      "message": "Title can't be blank",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": [
        "createCard"
      ],
      "extensions": {
        "code": "VALIDATION_ERROR",
        "details": {
          "field": "title"
        }
      }
    }
  ]
}
```

### Erro de Rate Limit

```json
{
  "data": null,
  "errors": [
    {
      "message": "You have exceeded the rate limit. Please try again later.",
      "extensions": {
        "code": "RATE_LIMITED",
        "details": {
          "retry_after": 60
        }
      }
    }
  ]
}
```

## Estratégias para Tratamento de Erros

Uma abordagem robusta para lidar com erros na API do Pipefy inclui:

### 1. Verificação Sistemática de Erros

Sempre verifique o campo `errors` na resposta, mesmo quando o status HTTP é 200:

```javascript
function checkForErrors(response) {
  if (response.errors) {
    // Processar erros
    return true;
  }
  return false;
}
```

### 2. Implementação de Retries com Backoff Exponencial

Para erros temporários (rate limits, timeouts), implemente retries com backoff exponencial:

```javascript
async function executeWithRetry(operation, maxRetries = 3, initialDelay = 1000) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      const isRetryable = checkIfErrorIsRetryable(error);
      
      if (!isRetryable || retries === maxRetries - 1) {
        throw error;
      }
      
      const delay = initialDelay * Math.pow(2, retries);
      console.log(`Retry ${retries + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
    }
  }
}

function checkIfErrorIsRetryable(error) {
  // Verifica se é um erro que pode ser tentado novamente
  if (error?.response?.errors) {
    const codes = error.response.errors.map(e => e.extensions?.code);
    return codes.some(code => ['RATE_LIMITED', 'TIMEOUT', 'SERVICE_UNAVAILABLE'].includes(code));
  }
  return false;
}
```

### 3. Tratamento de Erros Específicos

Implemente handlers específicos para diferentes tipos de erros:

```javascript
function handlePipefyError(error) {
  if (!error.response?.errors) {
    console.error('Erro desconhecido:', error);
    return;
  }
  
  for (const err of error.response.errors) {
    const code = err.extensions?.code;
    
    switch (code) {
      case 'UNAUTHENTICATED':
      case 'TOKEN_EXPIRED':
        // Lidar com problemas de autenticação
        refreshToken();
        break;
        
      case 'FORBIDDEN':
        // Lidar com problemas de permissão
        console.error('Permissão insuficiente:', err.message);
        break;
        
      case 'RATE_LIMITED':
        // Lidar com rate limiting
        const retryAfter = err.extensions?.details?.retry_after || 60;
        console.log(`Rate limit excedido. Tentando novamente em ${retryAfter}s`);
        break;
        
      case 'VALIDATION_ERROR':
        // Lidar com erros de validação
        console.error('Erro de validação:', err.message, err.extensions?.details);
        break;
        
      default:
        // Outros erros
        console.error(`Erro (${code}):`, err.message);
    }
  }
}
```

### 4. Registro de Erros para Depuração

Mantenha registros detalhados de erros para facilitar a depuração:

```javascript
function logError(operation, error) {
  const timestamp = new Date().toISOString();
  const errorDetails = {
    timestamp,
    operation,
    errors: error.response?.errors || error.message,
    request: error.request?.data,
    stack: error.stack
  };
  
  console.error('Erro na API do Pipefy:', JSON.stringify(errorDetails, null, 2));
  
  // Opcionalmente, envie para um serviço de monitoramento de erros
  // sendToErrorMonitoring(errorDetails);
}
```

### 5. Validação Prévia

Valide os dados antes de enviá-los para a API para evitar erros previsíveis:

```javascript
function validateCardInput(cardData) {
  const errors = [];
  
  if (!cardData.title) {
    errors.push('O título é obrigatório');
  }
  
  if (cardData.due_date && !isValidDate(cardData.due_date)) {
    errors.push('A data de vencimento tem formato inválido');
  }
  
  // Validações adicionais...
  
  return errors;
}

function isValidDate(dateString) {
  // Implementação de validação de data
  return !isNaN(new Date(dateString).getTime());
}
```

### 6. Tratamento de Respostas Parciais

Lide graciosamente com respostas parciais, onde parte dos dados foi retornada mesmo com erros:

```javascript
function processResponse(response) {
  // Registrar erros, mas continuar processando dados disponíveis
  if (response.errors) {
    console.warn('A resposta contém erros:', response.errors);
  }
  
  // Processar dados mesmo que parciais
  if (response.data) {
    return processData(response.data);
  }
  
  // Se não houver dados, então considere isso um erro crítico
  if (response.errors) {
    throw new Error('Falha na requisição: ' + JSON.stringify(response.errors));
  }
}
```

## Erros Específicos de Recursos

Alguns recursos da API têm erros específicos que você pode encontrar:

### Erros de Cartões

- **CARD_NOT_FOUND**: O cartão especificado não existe
- **CARD_ARCHIVED**: Tentativa de modificar um cartão arquivado
- **INVALID_CARD_PHASE**: A fase especificada não pertence ao pipe do cartão
- **MISSING_REQUIRED_FIELDS**: Campos obrigatórios não foram preenchidos

### Erros de Pipes

- **PIPE_NOT_FOUND**: O pipe especificado não existe
- **MAX_PHASES_EXCEEDED**: Tentativa de criar mais fases do que o permitido
- **MAX_FIELDS_EXCEEDED**: Tentativa de criar mais campos do que o permitido

### Erros de Tabelas

- **TABLE_NOT_FOUND**: A tabela especificada não existe
- **TABLE_RECORD_NOT_FOUND**: O registro especificado não existe
- **INVALID_RECORD_FIELD**: Campo inválido para o registro

### Erros de Automações

- **AUTOMATION_NOT_FOUND**: A automação especificada não existe
- **INVALID_TRIGGER**: O tipo de gatilho especificado é inválido
- **INVALID_ACTION**: O tipo de ação especificado é inválido

## Boas Práticas para Minimizar Erros

1. **Consulte a documentação**: Entenda os parâmetros e tipos esperados para cada operação
2. **Use variáveis GraphQL**: Evite erros de sintaxe em consultas dinâmicas
3. **Implemente testes**: Crie testes automatizados para verificar suas integrações
4. **Monitoramento proativo**: Acompanhe taxas de erro para identificar problemas
5. **Valide entrada de usuários**: Nunca passe diretamente entrada de usuários à API
6. **Comece pequeno**: Teste com consultas simples antes de passar para operações complexas
7. **Use paginação**: Para conjuntos grandes de dados, evitando timeout
8. **Entenda os limites**: Conheça os limites da API para evitar erros de limitação

## Exemplo Completo de Tratamento de Erros

Aqui está um exemplo abrangente usando JavaScript:

```javascript
const axios = require('axios');

class PipefyClient {
  constructor(token) {
    this.token = token;
    this.baseURL = 'https://api.pipefy.com/graphql';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      }
    });
  }
  
  async execute(query, variables, operationName) {
    try {
      const result = await this.executeWithRetry(() => {
        return this.client.post('', {
          query,
          variables,
          operationName
        });
      });
      
      return this.processResponse(result.data);
    } catch (error) {
      this.handleError(operationName, error);
      throw error;
    }
  }
  
  async executeWithRetry(operation, maxRetries = 3, initialDelay = 1000) {
    let retries = 0;
    let lastError;
    
    while (retries < maxRetries) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Verifica se é um erro que pode ser tentado novamente
        const isRetryable = this.isRetryableError(error);
        
        if (!isRetryable || retries === maxRetries - 1) {
          break;
        }
        
        // Cálculo do tempo de espera com backoff exponencial
        const delay = initialDelay * Math.pow(2, retries);
        console.log(`Tentativa ${retries + 1}/${maxRetries} falhou. Tentando novamente em ${delay}ms`);
        
        // Aguarda antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, delay));
        
        retries++;
      }
    }
    
    throw lastError;
  }
  
  isRetryableError(error) {
    // Erros de rede
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return true;
    }
    
    // Status HTTP específicos
    if (error.response?.status === 429 || error.response?.status >= 500) {
      return true;
    }
    
    // Códigos de erro GraphQL
    if (error.response?.data?.errors) {
      const codes = error.response.data.errors.map(e => e.extensions?.code);
      return codes.some(code => 
        ['RATE_LIMITED', 'TIMEOUT', 'SERVICE_UNAVAILABLE'].includes(code)
      );
    }
    
    return false;
  }
  
  processResponse(response) {
    // Verificar erros na resposta GraphQL
    if (response.errors) {
      const criticalErrors = response.errors.filter(e => 
        !['RATE_LIMITED', 'TIMEOUT', 'SERVICE_UNAVAILABLE'].includes(e.extensions?.code)
      );
      
      // Se todos os erros forem temporários e já tratados pelo mecanismo de retry,
      // e temos dados, apenas registramos e continuamos
      if (criticalErrors.length === 0 && response.data) {
        console.warn('Resposta contém erros não críticos:', response.errors);
        return response.data;
      }
      
      // Se houver erros críticos, lançamos exceção
      const error = new Error('Erro na API GraphQL do Pipefy');
      error.response = response;
      throw error;
    }
    
    return response.data;
  }
  
  handleError(operation, error) {
    const timestamp = new Date().toISOString();
    let errorData = {
      timestamp,
      operation,
      message: error.message
    };
    
    // Extrair detalhes específicos do GraphQL se disponíveis
    if (error.response?.data?.errors) {
      errorData.graphqlErrors = error.response.data.errors.map(e => ({
        message: e.message,
        code: e.extensions?.code,
        details: e.extensions?.details,
        path: e.path
      }));
      
      // Tratar tipos específicos de erro
      for (const err of error.response.data.errors) {
        const code = err.extensions?.code;
        
        switch (code) {
          case 'UNAUTHENTICATED':
          case 'TOKEN_EXPIRED':
            console.error('Erro de autenticação. Token inválido ou expirado.');
            // Aqui você poderia implementar renovação automática de token
            break;
            
          case 'FORBIDDEN':
            console.error('Permissão insuficiente para esta operação.');
            break;
            
          case 'VALIDATION_ERROR':
            console.error('Erro de validação:', err.message);
            console.error('Detalhes:', err.extensions?.details);
            break;
            
          case 'NOT_FOUND':
            console.error('Recurso não encontrado:', err.path?.join('.'));
            break;
            
          default:
            console.error(`Erro (${code || 'desconhecido'}):`, err.message);
        }
      }
    } else if (error.response) {
      // Erros HTTP não-GraphQL
      errorData.httpStatus = error.response.status;
      errorData.statusText = error.response.statusText;
      errorData.responseData = error.response.data;
    } else {
      // Erros de rede ou outros
      errorData.stack = error.stack;
    }
    
    console.error('Erro detalhado:', JSON.stringify(errorData, null, 2));
    
    // Aqui você poderia enviar para um serviço de monitoramento
    // ou registrar em um sistema de logs
  }
}

// Exemplo de uso
const client = new PipefyClient('seu_token_aqui');

async function createCard(pipeId, cardData) {
  // Validar dados antes de enviar
  const validationErrors = validateCardData(cardData);
  if (validationErrors.length > 0) {
    throw new Error(`Dados inválidos: ${validationErrors.join(', ')}`);
  }
  
  const query = `
    mutation CreateCard($pipeId: ID!, $title: String!, $fieldsAttributes: [FieldValueInput!]) {
      createCard(input: {
        pipe_id: $pipeId,
        title: $title,
        fields_attributes: $fieldsAttributes
      }) {
        card {
          id
          title
        }
      }
    }
  `;
  
  const variables = {
    pipeId,
    title: cardData.title,
    fieldsAttributes: cardData.fields.map(f => ({
      field_id: f.field_id,
      field_value: f.field_value
    }))
  };
  
  try {
    const result = await client.execute(query, variables, 'CreateCard');
    return result.createCard.card;
  } catch (error) {
    console.error('Falha ao criar cartão:', error.message);
    throw error;
  }
}

function validateCardData(cardData) {
  const errors = [];
  
  if (!cardData.title) {
    errors.push('Título é obrigatório');
  }
  
  if (!Array.isArray(cardData.fields)) {
    errors.push('O campos devem ser um array');
  } else {
    for (const field of cardData.fields) {
      if (!field.field_id) {
        errors.push('Cada campo deve ter um field_id');
      }
    }
  }
  
  return errors;
}

// Uso do cliente
createCard('12345', {
  title: 'Novo cartão',
  fields: [
    { field_id: 'nome', field_value: 'João Silva' },
    { field_id: 'email', field_value: 'joao@exemplo.com' }
  ]
})
  .then(card => {
    console.log('Cartão criado com sucesso:', card);
  })
  .catch(error => {
    console.error('Operação falhou:', error.message);
  });
```

Este guia de tratamento de erros fornece as ferramentas necessárias para criar integrações robustas e resilientes com a API GraphQL do Pipefy, garantindo que suas aplicações possam lidar adequadamente com as diversas situações de erro que podem ocorrer.
