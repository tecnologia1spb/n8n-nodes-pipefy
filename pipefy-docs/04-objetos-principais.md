# Objetos Principais da API do Pipefy

## Organizações

As organizações são os contêineres de mais alto nível no Pipefy, agrupando pipes, tabelas, usuários e outros recursos.

### Estrutura da Organização

```graphql
type Organization {
  id: ID!
  name: String!
  users: [OrganizationUser!]!
  pipes: [Pipe!]!
  tables: [Table!]!
  # Outros campos
}
```

### Consultar Organizações

```graphql
query {
  me {
    organizations {
      id
      name
    }
  }
}
```

### Consultar uma Organização Específica

```graphql
query {
  organization(id: "12345") {
    id
    name
    users {
      user {
        id
        name
        email
      }
      role
    }
    pipes {
      id
      name
    }
    tables {
      id
      name
    }
  }
}
```

### Configurações da Organização

Você pode recuperar configurações específicas da organização:

```graphql
query {
  organization(id: "12345") {
    id
    name
    settings {
      allow_pipe_creation
      allow_table_creation
      timezone
    }
  }
}
```

## Usuários

Os usuários representam pessoas que têm acesso ao Pipefy, com diferentes níveis de permissões.

### Estrutura do Usuário

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  username: String!
  avatarUrl: String
  # Outros campos
}
```

### Consultar Usuário Atual

```graphql
query {
  me {
    id
    name
    email
    username
    avatarUrl
  }
}
```

### Consultar Usuários da Organização

```graphql
query {
  organization(id: "12345") {
    users {
      user {
        id
        name
        email
      }
      role
    }
  }
}
```

### Funções de Usuário

Os usuários podem ter diferentes funções em uma organização:

- **Admin**: Acesso total à organização
- **Member**: Acesso básico, com permissões configuráveis
- **Guest**: Acesso limitado a recursos específicos

```graphql
query {
  organization(id: "12345") {
    users {
      user {
        name
      }
      role
    }
  }
}
```

### Definir Funções de Usuário

```graphql
mutation {
  setRole(input: {
    organization_id: "12345",
    user_id: "67890",
    role: "admin"
  }) {
    organization_user {
      user {
        name
      }
      role
    }
  }
}
```

## Pipes

Os pipes representam processos ou fluxos de trabalho no Pipefy, contendo fases e cartões.

### Estrutura do Pipe

```graphql
type Pipe {
  id: ID!
  name: String!
  description: String
  phases: [Phase!]!
  cards: Connection!
  fields: [Field!]!
  members: [Member!]!
  # Outros campos
}
```

### Consultar Pipes

```graphql
query {
  organization(id: "12345") {
    pipes {
      id
      name
      cards_count
    }
  }
}
```

### Consultar um Pipe Específico

```graphql
query {
  pipe(id: "12345") {
    id
    name
    description
    phases {
      id
      name
      cards_count
    }
    start_form_fields {
      id
      label
      type
    }
  }
}
```

### Criar um Pipe

```graphql
mutation {
  createPipe(input: {
    organization_id: "12345",
    name: "Novo Processo",
    icon: "clipboard"
  }) {
    pipe {
      id
      name
    }
  }
}
```

### Atualizar um Pipe

```graphql
mutation {
  updatePipe(input: {
    id: "12345",
    name: "Processo Atualizado",
    description: "Nova descrição do processo"
  }) {
    pipe {
      id
      name
      description
    }
  }
}
```

### Excluir um Pipe

```graphql
mutation {
  deletePipe(input: {
    id: "12345"
  }) {
    success
  }
}
```

## Fases

As fases representam os estágios dentro de um pipe, por onde os cartões passam.

### Estrutura da Fase

```graphql
type Phase {
  id: ID!
  name: String!
  cards_count: Int!
  done: Boolean!
  description: String
  fields: [Field!]!
  # Outros campos
}
```

### Consultar Fases de um Pipe

```graphql
query {
  pipe(id: "12345") {
    phases {
      id
      name
      done
      cards_count
      description
    }
  }
}
```

### Criar uma Fase

```graphql
mutation {
  createPhase(input: {
    pipe_id: "12345",
    name: "Nova Fase",
    description: "Descrição da nova fase",
    done: false
  }) {
    phase {
      id
      name
      description
    }
  }
}
```

### Atualizar uma Fase

```graphql
mutation {
  updatePhase(input: {
    id: "12345",
    name: "Fase Atualizada",
    description: "Nova descrição"
  }) {
    phase {
      id
      name
      description
    }
  }
}
```

### Excluir uma Fase

```graphql
mutation {
  deletePhase(input: {
    id: "12345"
  }) {
    success
  }
}
```

## Campos

Os campos definem quais informações podem ser armazenadas em cartões e registros de tabelas.

### Tipos de Campos

O Pipefy suporta diversos tipos de campos:

- **Short Text**: Texto curto (até 255 caracteres)
- **Long Text**: Texto longo
- **Email**: Endereço de email
- **Number**: Número (inteiro ou decimal)
- **Statement**: Texto informativo (não editável)
- **Date**: Data
- **Time**: Hora
- **DateTime**: Data e hora
- **Radio Select**: Opção única (múltiplas opções)
- **Select**: Opção única com dropdown
- **Checkbox**: Múltiplas opções (checkbox)
- **Attachment**: Arquivos anexados
- **ConnectCards**: Conexão com outros cartões
- **ConnectTableRecords**: Conexão com registros de tabela
- **Label**: Etiqueta colorida

### Estrutura do Campo

```graphql
type Field {
  id: ID!
  label: String!
  type: String!
  description: String
  options: [String!]
  required: Boolean!
  # Campos específicos do tipo
}
```

### Consultar Campos de um Pipe

```graphql
query {
  pipe(id: "12345") {
    start_form_fields {
      id
      label
      type
      required
      description
    }
    phases {
      name
      fields {
        id
        label
        type
        required
      }
    }
  }
}
```

### Criar um Campo

```graphql
mutation {
  createField(input: {
    phase_id: "12345",
    label: "Novo Campo",
    type: "short_text",
    required: true,
    description: "Descrição do campo"
  }) {
    field {
      id
      label
      type
    }
  }
}
```

### Atualizar um Campo

```graphql
mutation {
  updateField(input: {
    id: "12345",
    label: "Campo Atualizado",
    description: "Nova descrição",
    required: false
  }) {
    field {
      id
      label
      description
      required
    }
  }
}
```

### Excluir um Campo

```graphql
mutation {
  deleteField(input: {
    id: "12345"
  }) {
    success
  }
}
```

## Cartões

Os cartões são os itens que fluem através das fases de um pipe, contendo dados nos campos definidos.

### Estrutura do Cartão

```graphql
type Card {
  id: ID!
  title: String!
  due_date: DateTime
  expiration_date: DateTime
  current_phase: Phase!
  fields: [CardField!]!
  createdAt: DateTime!
  createdBy: User
  assignees: [User!]!
  comments: [Comment!]!
  # Outros campos
}
```

### Consultar Cartões

```graphql
query {
  pipe(id: "12345") {
    cards(first: 10) {
      edges {
        node {
          id
          title
          current_phase {
            name
          }
          createdAt
          createdBy {
            name
          }
          assignees {
            name
          }
        }
      }
    }
  }
}
```

### Consultar um Cartão Específico

```graphql
query {
  card(id: "12345") {
    id
    title
    current_phase {
      name
    }
    fields {
      name
      value
    }
    comments {
      text
      createdBy {
        name
      }
      createdAt
    }
  }
}
```

### Criar um Cartão

```graphql
mutation {
  createCard(input: {
    pipe_id: "12345",
    title: "Novo Cartão",
    due_date: "2023-12-31",
    fields_attributes: [
      {field_id: "nome", field_value: "João Silva"},
      {field_id: "email", field_value: "joao@exemplo.com"}
    ]
  }) {
    card {
      id
      title
    }
  }
}
```

### Atualizar um Cartão

```graphql
mutation {
  updateCard(input: {
    id: "12345",
    title: "Cartão Atualizado",
    due_date: "2024-01-15",
    fields_attributes: [
      {field_id: "status", field_value: "Em andamento"}
    ]
  }) {
    card {
      id
      title
      fields {
        name
        value
      }
    }
  }
}
```

### Mover um Cartão para Outra Fase

```graphql
mutation {
  moveCardToPhase(input: {
    card_id: "12345",
    destination_phase_id: "67890"
  }) {
    card {
      id
      title
      current_phase {
        id
        name
      }
    }
  }
}
```

### Excluir um Cartão

```graphql
mutation {
  deleteCard(input: {
    id: "12345"
  }) {
    success
  }
}
```

## Tabelas

As tabelas são bancos de dados relacionais que podem ser conectados a pipes.

### Estrutura da Tabela

```graphql
type Table {
  id: ID!
  name: String!
  description: String
  records: Connection!
  table_fields: [TableField!]!
  # Outros campos
}
```

### Consultar Tabelas

```graphql
query {
  organization(id: "12345") {
    tables {
      id
      name
      records_count
    }
  }
}
```

### Consultar uma Tabela Específica

```graphql
query {
  table(id: "12345") {
    id
    name
    description
    table_fields {
      id
      label
      type
    }
    table_records(first: 10) {
      edges {
        node {
          id
          title
          record_fields {
            name
            value
          }
        }
      }
    }
  }
}
```

### Criar uma Tabela

```graphql
mutation {
  createTable(input: {
    organization_id: "12345",
    name: "Nova Tabela",
    description: "Descrição da nova tabela"
  }) {
    table {
      id
      name
    }
  }
}
```

### Criar um Registro de Tabela

```graphql
mutation {
  createTableRecord(input: {
    table_id: "12345",
    title: "Novo Registro",
    fields_attributes: [
      {field_id: "nome", field_value: "João Silva"},
      {field_id: "cargo", field_value: "Analista"}
    ]
  }) {
    table_record {
      id
      title
    }
  }
}
```

## Relatórios

Os relatórios fornecem métricas e visualizações de dados nos pipes.

### Consultar Relatórios de um Pipe

```graphql
query {
  pipe(id: "12345") {
    reports {
      id
      name
      type
    }
  }
}
```

### Consultar um Relatório Específico

```graphql
query {
  pipeReport(id: "12345") {
    id
    name
    chart_data {
      name
      data
    }
  }
}
```

Este documento cobre os principais objetos da API do Pipefy. Nas próximas seções, exploraremos funcionalidades mais avançadas e exemplos de casos de uso específicos.
