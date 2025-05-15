# Importadores do Pipefy

## Visão Geral dos Importadores

Os importadores do Pipefy permitem transferir dados em massa para a plataforma, facilitando a migração de sistemas existentes ou a atualização em lote de informações. Com os importadores, você pode:

1. **Criar cartões em massa**: Adicionar vários cartões de uma só vez em um pipe
2. **Preencher campos automaticamente**: Importar dados para campos específicos
3. **Criar registros de tabela**: Importar dados para tabelas do banco de dados
4. **Atualizar cartões existentes**: Modificar cartões em lote 

## Tipos de Importação

O Pipefy suporta dois tipos principais de importação:

1. **Importação para Pipes**: Adiciona ou atualiza cartões em um pipe
2. **Importação para Tabelas**: Adiciona ou atualiza registros em uma tabela

## Métodos de Importação

### Importação via Interface do Usuário

Embora o foco desta documentação seja na API, vale mencionar que o Pipefy oferece uma interface gráfica para importação que:

- Suporta arquivos CSV e Excel
- Permite mapeamento visual de campos
- Fornece feedback sobre o progresso da importação
- Gera relatórios de erros

### Importação via API

A importação via API é mais flexível e pode ser automatizada, sendo ideal para:

- Sincronização regular com sistemas externos
- Integração com ferramentas personalizadas
- Importação programática de dados

## Estrutura da API de Importação

A API de Importação do Pipefy usa o GraphQL e consiste em:

1. **Mutations para iniciar importações**: `importCards` e `importTableRecords`
2. **Queries para monitorar o progresso**: `importations`
3. **Objetos para representar dados**: `CardImportation` e `TableRecordImportation`

## Importando Cartões para um Pipe

O processo de importação de cartões tem três etapas principais:

1. **Preparação dos dados**: Estruturar os dados no formato correto
2. **Iniciar a importação**: Enviar os dados usando a mutation `importCards`
3. **Monitorar o progresso**: Acompanhar o status da importação

### Formato dos Dados para Importação de Cartões

Os dados para importação devem ser estruturados como uma lista de objetos, onde cada objeto representa um cartão:

```javascript
const cardsData = [
  {
    title: "Título do Cartão 1",
    due_date: "2023-12-31",
    fields: [
      { field_id: "nome", field_value: "João Silva" },
      { field_id: "email", field_value: "joao@exemplo.com" }
    ]
  },
  {
    title: "Título do Cartão 2",
    due_date: "2024-01-15",
    fields: [
      { field_id: "nome", field_value: "Maria Oliveira" },
      { field_id: "email", field_value: "maria@exemplo.com" }
    ]
  }
]
```

### Iniciando a Importação de Cartões

Para iniciar uma importação de cartões, use a mutation `importCards`:

```graphql
mutation {
  importCards(input: {
    pipe_id: "12345",
    data: "[{\"title\":\"Título do Cartão 1\",\"due_date\":\"2023-12-31\",\"fields\":[{\"field_id\":\"nome\",\"field_value\":\"João Silva\"},{\"field_id\":\"email\",\"field_value\":\"joao@exemplo.com\"}]},{\"title\":\"Título do Cartão 2\",\"due_date\":\"2024-01-15\",\"fields\":[{\"field_id\":\"nome\",\"field_value\":\"Maria Oliveira\"},{\"field_id\":\"email\",\"field_value\":\"maria@exemplo.com\"}]}]"
  }) {
    importation {
      id
      status
      errors_count
      success_count
      progress
    }
  }
}
```

**Nota importante**: O parâmetro `data` deve ser uma string JSON válida representando um array de objetos.

### Exemplo em cURL

```bash
curl -X POST https://api.pipefy.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "query": "mutation($pipeId: ID!, $data: String!) { importCards(input: { pipe_id: $pipeId, data: $data }) { importation { id status errors_count success_count progress } } }",
    "variables": {
      "pipeId": "12345",
      "data": "[{\"title\":\"Título do Cartão 1\",\"due_date\":\"2023-12-31\",\"fields\":[{\"field_id\":\"nome\",\"field_value\":\"João Silva\"},{\"field_id\":\"email\",\"field_value\":\"joao@exemplo.com\"}]},{\"title\":\"Título do Cartão 2\",\"due_date\":\"2024-01-15\",\"fields\":[{\"field_id\":\"nome\",\"field_value\":\"Maria Oliveira\"},{\"field_id\":\"email\",\"field_value\":\"maria@exemplo.com\"}]}]"
    }
  }'
```

### Exemplo em JavaScript

```javascript
const axios = require('axios');

async function importCards(token, pipeId, cardsData) {
  try {
    const response = await axios({
      url: 'https://api.pipefy.com/graphql',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: {
        query: `
          mutation($pipeId: ID!, $data: String!) {
            importCards(input: {
              pipe_id: $pipeId,
              data: $data
            }) {
              importation {
                id
                status
                errors_count
                success_count
                progress
              }
            }
          }
        `,
        variables: {
          pipeId: pipeId,
          data: JSON.stringify(cardsData)
        }
      }
    });

    return response.data.data.importCards.importation;
  } catch (error) {
    console.error('Erro ao importar cartões:', error.response?.data || error.message);
    throw error;
  }
}

// Exemplo de uso
const token = 'seu_token_aqui';
const pipeId = '12345';
const cardsData = [
  {
    title: "Título do Cartão 1",
    due_date: "2023-12-31",
    fields: [
      { field_id: "nome", field_value: "João Silva" },
      { field_id: "email", field_value: "joao@exemplo.com" }
    ]
  },
  {
    title: "Título do Cartão 2",
    due_date: "2024-01-15",
    fields: [
      { field_id: "nome", field_value: "Maria Oliveira" },
      { field_id: "email", field_value: "maria@exemplo.com" }
    ]
  }
];

importCards(token, pipeId, cardsData)
  .then(importation => {
    console.log('Importação iniciada:', importation);
  })
  .catch(error => {
    console.error('Falha na importação:', error);
  });
```

## Monitorando o Progresso da Importação

Após iniciar uma importação, você pode monitorar seu progresso usando a query `importation`:

```graphql
query {
  importation(id: "12345") {
    id
    status
    progress
    success_count
    errors_count
    created_at
    updated_at
    errors {
      row
      message
    }
  }
}
```

### Estados Possíveis da Importação

A importação pode ter os seguintes status:

- **waiting**: Aguardando processamento
- **processing**: Em processamento
- **done**: Concluída com sucesso
- **error**: Concluída com erros
- **canceled**: Cancelada

### Exemplo de Monitoramento em JavaScript

```javascript
async function checkImportationStatus(token, importationId) {
  try {
    const response = await axios({
      url: 'https://api.pipefy.com/graphql',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: {
        query: `
          query($importationId: ID!) {
            importation(id: $importationId) {
              id
              status
              progress
              success_count
              errors_count
              created_at
              updated_at
              errors {
                row
                message
              }
            }
          }
        `,
        variables: {
          importationId: importationId
        }
      }
    });

    return response.data.data.importation;
  } catch (error) {
    console.error('Erro ao verificar status da importação:', error.response?.data || error.message);
    throw error;
  }
}

// Função para polling do status da importação
async function pollImportationStatus(token, importationId, interval = 5000) {
  let completed = false;
  
  while (!completed) {
    const status = await checkImportationStatus(token, importationId);
    console.log(`Status: ${status.status}, Progresso: ${status.progress}%, Sucesso: ${status.success_count}, Erros: ${status.errors_count}`);
    
    if (['done', 'error', 'canceled'].includes(status.status)) {
      completed = true;
      return status;
    }
    
    // Aguardar o intervalo antes da próxima verificação
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}
```

## Importando Registros para uma Tabela

O processo de importação para tabelas é similar ao de cartões:

### Formato dos Dados para Importação de Registros de Tabela

```javascript
const tableRecordsData = [
  {
    title: "Registro 1",
    fields: [
      { field_id: "nome", field_value: "João Silva" },
      { field_id: "departamento", field_value: "TI" }
    ]
  },
  {
    title: "Registro 2",
    fields: [
      { field_id: "nome", field_value: "Maria Oliveira" },
      { field_id: "departamento", field_value: "RH" }
    ]
  }
]
```

### Iniciando a Importação de Registros de Tabela

```graphql
mutation {
  importTableRecords(input: {
    table_id: "12345",
    data: "[{\"title\":\"Registro 1\",\"fields\":[{\"field_id\":\"nome\",\"field_value\":\"João Silva\"},{\"field_id\":\"departamento\",\"field_value\":\"TI\"}]},{\"title\":\"Registro 2\",\"fields\":[{\"field_id\":\"nome\",\"field_value\":\"Maria Oliveira\"},{\"field_id\":\"departamento\",\"field_value\":\"RH\"}]}]"
  }) {
    importation {
      id
      status
      errors_count
      success_count
      progress
    }
  }
}
```

## Atualizando Cartões ou Registros Existentes

Para atualizar cartões ou registros existentes, inclua um identificador único:

### Atualização de Cartões

```javascript
const updateCardsData = [
  {
    id: "12345", // ID do cartão existente
    title: "Título Atualizado",
    fields: [
      { field_id: "status", field_value: "Concluído" }
    ]
  }
]
```

### Atualização de Registros de Tabela

```javascript
const updateTableRecordsData = [
  {
    id: "12345", // ID do registro existente
    title: "Título Atualizado",
    fields: [
      { field_id: "departamento", field_value: "Marketing" }
    ]
  }
]
```

## Tratamento de Erros na Importação

Ao importar grandes volumes de dados, é comum que ocorram erros. A API do Pipefy fornece informações detalhadas sobre esses erros para facilitar a correção:

### Verificando Erros de Importação

```graphql
query {
  importation(id: "12345") {
    errors {
      row
      message
    }
  }
}
```

### Tipos Comuns de Erros

1. **Campos Obrigatórios**: Falta de valores em campos obrigatórios
2. **Formato de Dados**: Valores com formato inválido (ex: data inválida)
3. **Validações de Campo**: Violação de regras de validação definidas no pipe
4. **Limitações da API**: Excesso de requisições ou volume de dados

### Estratégias para Lidar com Erros

1. **Pre-validação**: Validar os dados antes de enviar para importação
2. **Importações em lote**: Dividir grandes volumes em lotes menores
3. **Retry em caso de falha**: Implementar mecanismo de retry com backoff exponencial
4. **Logging detalhado**: Registrar erros para análise posterior

## Melhores Práticas para Importação

1. **Mapeie campos corretamente**: Certifique-se de usar os IDs corretos dos campos
2. **Validação prévia**: Valide os dados antes de enviá-los para importação
3. **Lotes menores**: Para grandes volumes, divida a importação em lotes menores
4. **Monitoramento ativo**: Acompanhe o progresso em tempo real
5. **Tratamento de erros**: Implemente estratégias para lidar com falhas
6. **Timestamps**: Inclua timestamps nos registros para rastreabilidade
7. **Backup de dados**: Mantenha um backup dos dados originais

## Limites e Considerações

A API de importação do Pipefy tem alguns limites e considerações importantes:

1. **Tamanho máximo de payload**: 5MB por requisição
2. **Taxa de requisições**: Respeite os limites de rate limiting
3. **Tempo de processamento**: Importações grandes podem levar tempo
4. **Campos complexos**: Alguns tipos de campos têm formato específico
5. **Upsert seletivo**: A atualização de registros existentes requer um identificador único

## Exemplos de Casos de Uso

### Sincronização Diária de um Sistema CRM

```javascript
// Exemplo simplificado de sincronização CRM
async function syncCrmDataToPipefy() {
  // 1. Buscar dados do CRM
  const crmData = await fetchCrmData();
  
  // 2. Transformar dados para o formato do Pipefy
  const pipeCards = crmData.map(customer => ({
    title: `${customer.firstName} ${customer.lastName}`,
    fields: [
      { field_id: "email", field_value: customer.email },
      { field_id: "phone", field_value: customer.phoneNumber },
      { field_id: "company", field_value: customer.companyName },
      { field_id: "last_contact", field_value: customer.lastContactDate }
    ]
  }));
  
  // 3. Importar dados para o pipe
  const importation = await importCards(TOKEN, PIPE_ID, pipeCards);
  
  // 4. Monitorar progresso
  await pollImportationStatus(TOKEN, importation.id);
  
  // 5. Registrar resultados
  console.log(`Sincronização concluída: ${new Date()}`);
}

// Agendar sincronização diária
setInterval(syncCrmDataToPipefy, 24 * 60 * 60 * 1000);
```

### Migração de Dados de um Sistema Legado

```javascript
async function migrateFromLegacySystem() {
  // 1. Extrair todos os dados do sistema legado
  const legacyData = await extractAllLegacyData();
  
  // 2. Dividir em lotes
  const batches = chunkArray(legacyData, 100);
  
  console.log(`Migrando ${legacyData.length} registros em ${batches.length} lotes`);
  
  // 3. Processar cada lote
  for (let i = 0; i < batches.length; i++) {
    console.log(`Processando lote ${i+1}/${batches.length}`);
    
    // Transformar dados para o formato do Pipefy
    const pipeCards = transformLegacyDataToPipefy(batches[i]);
    
    try {
      // Importar lote
      const importation = await importCards(TOKEN, PIPE_ID, pipeCards);
      
      // Aguardar conclusão antes de prosseguir
      const result = await pollImportationStatus(TOKEN, importation.id);
      
      // Registrar resultados
      console.log(`Lote ${i+1}: ${result.success_count} sucesso, ${result.errors_count} erros`);
      
      // Se houver erros, salvar para análise
      if (result.errors_count > 0) {
        await saveErrorsForReview(result.errors, batches[i]);
      }
      
      // Aguardar um pouco entre lotes para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`Erro no lote ${i+1}:`, error);
      // Salvar lote com erro para retry posterior
      await saveBatchForRetry(batches[i]);
    }
  }
  
  console.log("Migração concluída!");
}
```

Com estes conhecimentos e exemplos, você está preparado para utilizar os importadores do Pipefy de forma eficiente, seja para migração única de dados ou integrações contínuas com outros sistemas.
