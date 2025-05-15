# Automações e Webhooks no Pipefy

## API de Automações

As automações no Pipefy permitem configurar ações que são executadas automaticamente quando determinados eventos ocorrem, criando fluxos de trabalho eficientes.

### Visão Geral das Automações

A API de Automações do Pipefy permite:

1. **Criar automações programaticamente**: Configure automações sem usar a interface gráfica
2. **Gerenciar automações existentes**: Ative, desative ou modifique automações
3. **Monitorar execuções de automações**: Acompanhe se as automações estão funcionando corretamente
4. **Implementar lógicas complexas**: Crie automações com condições avançadas

### Estrutura de uma Automação

Uma automação no Pipefy consiste em três componentes principais:

1. **Gatilho (Trigger)**: O evento que inicia a automação
2. **Condições (Conditions)**: Critérios opcionais que determinam se a ação será executada
3. **Ações (Actions)**: O que acontece quando o gatilho é acionado e as condições são atendidas

```graphql
type Automation {
  id: ID!
  name: String!
  description: String
  active: Boolean!
  pipe: Pipe!
  trigger: Trigger!
  actions: [Action!]!
  created_at: DateTime!
  updated_at: DateTime!
}
```

### Eventos de Automação (Triggers)

Os gatilhos determinam quando uma automação será executada:

#### Gatilhos Baseados em Cartões

- **card_created**: Quando um cartão é criado
- **card_moved**: Quando um cartão é movido para outra fase
- **card_expired**: Quando um cartão expira (atinge sua data de expiração)
- **card_due_date**: Quando um cartão atinge sua data de vencimento
- **card_field_updated**: Quando um campo específico é atualizado
- **card_overdue**: Quando um cartão se torna atrasado
- **card_comment_created**: Quando um comentário é adicionado a um cartão

#### Gatilhos Baseados em Tempo

- **on_date**: Em uma data específica
- **recurrent**: Em intervalos recorrentes (diário, semanal, mensal)
- **scheduled**: Em um horário específico

#### Gatilhos Baseados em Outros Eventos

- **database_record_created**: Quando um registro é criado em uma tabela
- **database_record_updated**: Quando um registro é atualizado em uma tabela
- **email_received**: Quando um email é recebido em um cartão

### Ações de Automação

As ações definem o que acontece quando uma automação é acionada:

#### Ações de Cartão

- **move_card**: Move um cartão para outra fase
- **create_card**: Cria um novo cartão
- **create_card_comment**: Adiciona um comentário a um cartão
- **update_card_field**: Atualiza um campo em um cartão
- **send_email**: Envia um email
- **create_card_relation**: Cria uma relação entre cartões
- **delete_card**: Exclui um cartão
- **update_card_due_date**: Atualiza a data de vencimento
- **update_card_expiration_date**: Atualiza a data de expiração

#### Ações de Integração

- **trigger_webhook**: Aciona um webhook
- **http_request**: Faz uma requisição HTTP para um endpoint externo

#### Ações de Usuário

- **assign_card**: Atribui um cartão a um usuário
- **subscribe_user**: Inscreve um usuário em um cartão

### Criando uma Automação

```graphql
mutation {
  createAutomation(input: {
    pipe_id: "12345",
    name: "Mover cartão após aprovação",
    description: "Move o cartão para a fase de pagamento quando aprovado",
    active: true,
    trigger: {
      type: "card_field_updated",
      field_conditions: [
        {
          field_id: "status_aprovacao",
          condition_expression: "equal_to",
          value: "Aprovado"
        }
      ]
    },
    actions: [
      {
        type: "move_card",
        options: {
          destination_phase_id: "67890"
        }
      },
      {
        type: "send_email",
        options: {
          to: "financeiro@exemplo.com",
          subject: "Novo item aprovado para pagamento",
          template: "Notificação de pagamento"
        }
      }
    ]
  }) {
    automation {
      id
      name
      active
    }
  }
}
```

### Recuperando Automações

```graphql
query {
  pipe(id: "12345") {
    automations {
      id
      name
      description
      active
      trigger {
        type
      }
      actions {
        type
      }
      created_at
      updated_at
    }
  }
}
```

### Atualizando uma Automação

```graphql
mutation {
  updateAutomation(input: {
    id: "12345",
    name: "Nome atualizado",
    description: "Nova descrição",
    active: false
  }) {
    automation {
      id
      name
      description
      active
    }
  }
}
```

### Excluindo uma Automação

```graphql
mutation {
  deleteAutomation(input: {
    id: "12345"
  }) {
    success
  }
}
```

### Exemplo de Automação Condicional

```graphql
mutation {
  createAutomation(input: {
    pipe_id: "12345",
    name: "Notificar sobre valor alto",
    description: "Notifica o gerente quando o valor for maior que 10.000",
    active: true,
    trigger: {
      type: "card_field_updated",
      field_conditions: [
        {
          field_id: "valor",
          condition_expression: "greater_than",
          value: "10000"
        }
      ]
    },
    actions: [
      {
        type: "send_email",
        options: {
          to: "gerente@exemplo.com",
          subject: "Solicitação de valor alto",
          template: "Aprovação especial"
        }
      },
      {
        type: "create_card_comment",
        options: {
          text: "Este cartão requer aprovação especial devido ao valor elevado."
        }
      }
    ]
  }) {
    automation {
      id
      name
    }
  }
}
```

## Webhooks

Os webhooks permitem que o Pipefy notifique sistemas externos quando eventos específicos ocorrem na plataforma.

### Introdução aos Webhooks

Um webhook é um callback HTTP que é acionado quando um evento específico ocorre. No Pipefy, webhooks permitem que você:

1. **Receba notificações em tempo real**: Seja notificado imediatamente quando algo acontece no Pipefy
2. **Integre com sistemas externos**: Conecte o Pipefy a outros sistemas sem consultas constantes
3. **Automatize processos**: Acione ações em sistemas externos com base em eventos do Pipefy
4. **Mantenha dados sincronizados**: Mantenha sistemas externos atualizados com dados do Pipefy

### Tipos de Webhooks

O Pipefy suporta dois tipos principais de webhooks:

1. **Webhooks de Organização**: Recebem eventos de toda a organização
2. **Webhooks de Pipe**: Recebem eventos específicos de um pipe

### Eventos Suportados

Os webhooks podem ser configurados para os seguintes eventos:

#### Eventos de Cartão

- **card.create**: Quando um cartão é criado
- **card.move**: Quando um cartão é movido para outra fase
- **card.field_update**: Quando um campo de cartão é atualizado
- **card.expired**: Quando um cartão expira
- **card.overdue**: Quando um cartão se torna atrasado
- **card.delete**: Quando um cartão é excluído
- **card.comment.create**: Quando um comentário é adicionado a um cartão

#### Eventos de Pipe

- **pipe.create**: Quando um pipe é criado
- **pipe.update**: Quando um pipe é atualizado

#### Eventos de Tabela

- **table_record.create**: Quando um registro de tabela é criado
- **table_record.update**: Quando um registro de tabela é atualizado
- **table_record.delete**: Quando um registro de tabela é excluído

### Criando um Webhook

```graphql
mutation {
  createWebhook(input: {
    pipe_id: "12345", # para webhook de pipe
    # ou organization_id: "67890" para webhook de organização
    name: "Notificação de movimentação",
    url: "https://meu-sistema.com/webhook",
    headers: [
      { key: "Authorization", value: "Bearer meu-token" },
      { key: "X-Custom-Header", value: "valor-personalizado" }
    ],
    actions: ["card.move", "card.create"],
    active: true,
    email_notifications: true
  }) {
    webhook {
      id
      name
      url
      active
    }
  }
}
```

### Consultando Webhooks

```graphql
# Para webhooks de pipe
query {
  pipe(id: "12345") {
    webhooks {
      id
      name
      url
      actions
      active
    }
  }
}

# Para webhooks de organização
query {
  organization(id: "67890") {
    webhooks {
      id
      name
      url
      actions
      active
    }
  }
}
```

### Atualizando um Webhook

```graphql
mutation {
  updateWebhook(input: {
    id: "12345",
    name: "Novo nome",
    url: "https://nova-url.com/webhook",
    active: false
  }) {
    webhook {
      id
      name
      url
      active
    }
  }
}
```

### Excluindo um Webhook

```graphql
mutation {
  deleteWebhook(input: {
    id: "12345"
  }) {
    success
  }
}
```

### Formato do Payload do Webhook

Quando um evento ocorre, o Pipefy envia uma requisição POST para a URL configurada com um payload JSON. Aqui está um exemplo de payload para o evento `card.move`:

```json
{
  "event": "card.move",
  "action": {
    "id": "9876543",
    "data": {
      "from": {
        "id": "12345",
        "name": "Em Análise"
      },
      "to": {
        "id": "67890",
        "name": "Aprovado"
      }
    }
  },
  "card": {
    "id": "123456",
    "title": "Solicitação de Compra #123",
    "url": "https://app.pipefy.com/pipes/12345/cards/123456",
    "current_phase": {
      "id": "67890",
      "name": "Aprovado"
    },
    "fields": [
      {
        "name": "Solicitante",
        "value": "João Silva"
      },
      {
        "name": "Valor",
        "value": "5000"
      }
    ]
  },
  "pipe": {
    "id": "12345",
    "name": "Processo de Compras"
  },
  "organization": {
    "id": "67890",
    "name": "Minha Empresa"
  },
  "performed_by": {
    "id": "11223344",
    "name": "Maria Oliveira",
    "email": "maria@exemplo.com"
  },
  "created_at": "2023-05-15T14:30:45Z"
}
```

### Segurança de Webhooks

Para garantir que as requisições de webhook sejam legítimas, recomenda-se:

1. **Usar HTTPS**: Sempre configure URLs de webhook com HTTPS
2. **Validar a origem**: Implemente validação de origem no seu endpoint
3. **Usar tokens de autenticação**: Adicione cabeçalhos de autenticação
4. **Implementar retry**: Trate falhas temporárias com mecanismo de retry

### Exemplo de Implementação de Endpoint de Webhook

Aqui está um exemplo simples de como implementar um endpoint para receber webhooks do Pipefy usando Node.js e Express:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

// Segredo compartilhado para validação
const WEBHOOK_SECRET = 'seu-segredo-aqui';

app.post('/webhooks/pipefy', (req, res) => {
  // Validar a autenticação (exemplo simples)
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
    return res.status(401).send('Não autorizado');
  }
  
  // Processar o evento
  const event = req.body.event;
  const cardData = req.body.card;
  
  console.log(`Recebido evento: ${event}`);
  console.log(`Cartão: ${cardData.title} (ID: ${cardData.id})`);
  
  // Lógica específica baseada no tipo de evento
  switch (event) {
    case 'card.create':
      console.log('Novo cartão criado!');
      // Implementar lógica para cartão criado
      break;
    case 'card.move':
      const fromPhase = req.body.action.data.from.name;
      const toPhase = req.body.action.data.to.name;
      console.log(`Cartão movido de "${fromPhase}" para "${toPhase}"`);
      // Implementar lógica para cartão movido
      break;
    case 'card.field_update':
      const fieldName = req.body.action.data.field.name;
      const newValue = req.body.action.data.new_value;
      console.log(`Campo "${fieldName}" atualizado para "${newValue}"`);
      // Implementar lógica para campo atualizado
      break;
    default:
      console.log(`Evento não tratado: ${event}`);
  }
  
  // Sempre responda com 200 para confirmar recebimento
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
```

### Melhores Práticas para Webhooks

1. **Responda rapidamente**: Retorne status 200 assim que possível
2. **Processe de forma assíncrona**: Para operações demoradas, use uma fila
3. **Implemente retry**: Lide com falhas temporárias com backoff exponencial
4. **Filtre eventos**: Inscreva-se apenas nos eventos necessários
5. **Monitore falhas**: Implemente logging e alertas para falhas de webhook
6. **Valide payloads**: Sempre verifique se o payload é válido antes de processá-lo

Essa documentação oferece um guia completo para trabalhar com automações e webhooks no Pipefy, permitindo criar fluxos de trabalho automatizados e integrações com sistemas externos.
