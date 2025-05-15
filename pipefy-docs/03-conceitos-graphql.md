# Conceitos do GraphQL no Pipefy

## Estrutura do GraphQL

O GraphQL é uma linguagem de consulta que permite aos clientes definir exatamente quais dados desejam receber. Ao contrário das APIs REST tradicionais, onde cada endpoint retorna um conjunto fixo de dados, o GraphQL fornece um único endpoint que responde a consultas específicas.

### Componentes Principais

#### 1. Schema

O schema define os tipos de dados disponíveis e as operações que podem ser realizadas. É como um contrato entre o servidor e cliente, descrevendo o que pode ser solicitado e como.

```graphql
type Card {
  id: ID!
  title: String!
  createdAt: DateTime!
  createdBy: User
  currentPhase: Phase
  fields: [Field]
}
```

#### 2. Queries

Queries são usadas para buscar dados e são semelhantes a operações GET em REST.

```graphql
query {
  card(id: "12345") {
    id
    title
    createdAt
    currentPhase {
      name
    }
  }
}
```

#### 3. Mutations

Mutations são usadas para criar, atualizar ou excluir dados, semelhantes às operações POST, PUT e DELETE em REST.

```graphql
mutation {
  updateCard(input: {
    id: "12345",
    title: "Título atualizado"
  }) {
    card {
      id
      title
    }
  }
}
```

#### 4. Subscriptions

Subscriptions permitem um fluxo de dados em tempo real, embora atualmente não sejam suportadas na API do Pipefy.

## Tipos de Dados no GraphQL do Pipefy

A API do Pipefy inclui vários tipos de dados fundamentais:

### Tipos Escalares

- **ID**: Identificador único, geralmente uma string.
- **String**: Uma sequência de caracteres UTF-8.
- **Int**: Um número inteiro de 32 bits.
- **Float**: Um número de ponto flutuante de dupla precisão.
- **Boolean**: Valores `true` ou `false`.
- **DateTime**: Representação ISO-8601 de data e hora.

### Tipos Compostos

- **Objeto**: Representa uma entidade com campos que podem ser selecionados.
- **Enum**: Um conjunto limitado de valores possíveis.
- **Interface**: Um conjunto de campos que um objeto deve incluir.
- **Union**: Um tipo que pode ser um de vários objetos.
- **InputObject**: Objetos usados como parâmetros em mutations.

## Melhores Práticas do GraphQL

Para utilizar efetivamente a API GraphQL do Pipefy, considere estas práticas recomendadas:

### 1. Solicitação Seletiva de Campos

Solicite apenas os campos que você realmente precisa, reduzindo o tamanho da resposta e melhorando o desempenho.

```graphql
# Ruim - solicita muitos campos desnecessários
{
  cards(pipe_id: "12345") {
    edges {
      node {
        id
        title
        due_date
        expiration_date
        createdAt
        createdBy {
          id
          name
          email
          username
          avatarUrl
        }
        # ... muitos outros campos
      }
    }
  }
}

# Bom - solicita apenas o necessário
{
  cards(pipe_id: "12345") {
    edges {
      node {
        id
        title
        createdBy {
          name
        }
      }
    }
  }
}
```

### 2. Uso de Fragmentos para Reutilização

Os fragmentos permitem reutilizar seleções de campos em várias consultas ou mutations:

```graphql
fragment CardDetails on Card {
  id
  title
  current_phase {
    name
  }
  assignees {
    name
    email
  }
}

query {
  card1: card(id: "12345") {
    ...CardDetails
  }
  card2: card(id: "67890") {
    ...CardDetails
  }
}
```

### 3. Consultas com Nome e Variáveis

Use consultas nomeadas e variáveis para criar operações parametrizadas e reutilizáveis:

```graphql
query GetCardById($cardId: ID!) {
  card(id: $cardId) {
    id
    title
    current_phase {
      name
    }
  }
}
```

Variáveis JSON:
```json
{
  "cardId": "12345"
}
```

### 4. Uso de Aliases

Aliases permitem renomear campos na resposta, útil ao solicitar o mesmo campo com diferentes argumentos:

```graphql
query {
  openCards: cards(pipe_id: "12345", status: "open") {
    totalCount
  }
  doneCards: cards(pipe_id: "12345", status: "done") {
    totalCount
  }
}
```

### 5. Tratamento de Erros

Projete suas consultas para lidar com o fato de que o GraphQL pode retornar dados parciais com erros:

```javascript
function processResponse(response) {
  // Verifica se há erros na resposta
  if (response.errors) {
    console.error("Erros GraphQL:", response.errors);
    // Trata erros específicos
    for (let error of response.errors) {
      if (error.extensions && error.extensions.code === "RATE_LIMITED") {
        // Implementa lógica de retry
      }
    }
  }
  
  // Processa dados mesmo se parciais
  if (response.data) {
    // Trabalha com os dados disponíveis
  }
}
```

## Paginação no GraphQL do Pipefy

A API do Pipefy usa o padrão de paginação "Connections" do Relay:

```graphql
{
  cards(pipe_id: "12345", first: 10, after: "cursor_aqui") {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      cursor
      node {
        id
        title
      }
    }
  }
}
```

### Implementação da Paginação

```javascript
async function fetchAllCards(pipeId) {
  let hasNextPage = true;
  let afterCursor = null;
  let allCards = [];
  
  while (hasNextPage) {
    const query = `
      query ($pipeId: ID!, $cursor: String) {
        cards(pipe_id: $pipeId, first: 50, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
            }
          }
        }
      }
    `;
    
    const variables = {
      pipeId: pipeId,
      cursor: afterCursor
    };
    
    const response = await fetchGraphQL(query, variables);
    
    const cards = response.data.cards;
    allCards = allCards.concat(cards.edges.map(edge => edge.node));
    
    hasNextPage = cards.pageInfo.hasNextPage;
    afterCursor = cards.pageInfo.endCursor;
  }
  
  return allCards;
}
```

## Referência do Schema

A API GraphQL do Pipefy tem um schema extenso com muitos tipos e operações. Aqui estão os tipos principais:

### Tipos de Objeto Principais

- **Organization**: Contêiner de mais alto nível para pipes, tabelas e usuários
- **Pipe**: Representa um processo ou fluxo de trabalho
- **Phase**: Etapa dentro de um pipe
- **Card**: Item que flui através das fases de um pipe
- **Field**: Campo para armazenar dados em um card
- **Table**: Banco de dados relacionais
- **TableRecord**: Registro em uma tabela
- **User**: Usuário da plataforma Pipefy

### Principais Queries

- **me**: Informações sobre o usuário autenticado
- **organization**: Busca uma organização por ID
- **pipe**: Busca um pipe por ID
- **card**: Busca um card por ID
- **table**: Busca uma tabela por ID
- **tableRecord**: Busca um registro de tabela por ID

### Principais Mutations

- **createCard**: Cria um novo card em um pipe
- **updateCard**: Atualiza um card existente
- **moveCardToPhase**: Move um card para outra fase
- **deleteCard**: Exclui um card
- **createTableRecord**: Cria um novo registro em uma tabela
- **updateTableRecord**: Atualiza um registro de tabela

Este overview do GraphQL fornece o conhecimento necessário para trabalhar efetivamente com a API do Pipefy. As próximas seções abordarão objetos específicos e casos de uso comuns.
