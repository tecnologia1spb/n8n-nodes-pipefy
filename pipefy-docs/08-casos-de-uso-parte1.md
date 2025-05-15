# Casos de Uso da API do Pipefy - Parte 1

Este documento apresenta exemplos práticos de como utilizar a API GraphQL do Pipefy para implementar funcionalidades comuns. Cada caso de uso inclui exemplos de código completos.

## Gerenciamento de Cartões

### Criar um Cartão com Campos Obrigatórios

Um dos casos de uso mais comuns é criar cartões em um pipe, garantindo que todos os campos obrigatórios estejam preenchidos.

#### 1. Identificar campos obrigatórios do pipe

Primeiro, é necessário identificar quais campos são obrigatórios no pipe:

```graphql
query {
  pipe(id: "301397126") {
    start_form_fields {
      id
      label
      type
      required
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

#### 2. Criar o cartão com campos obrigatórios

```graphql
mutation {
  createCard(input: {
    pipe_id: "301397126",
    title: "Novo pedido de cliente",
    fields_attributes: [
      { field_id: "cliente", field_value: "Empresa ABC" },
      { field_id: "valor", field_value: "1500.00" },
      { field_id: "data_pedido", field_value: "2023-05-15" }
    ]
  }) {
    card {
      id
      title
      url
    }
  }
}
```

#### Exemplo em JavaScript

```javascript
const axios = require('axios');

async function createCardWithRequiredFields(token, pipeId, title, fieldsData) {
  try {
    // 1. Obter campos obrigatórios
    const fieldsResponse = await axios({
      url: 'https://api.pipefy.com/graphql',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: {
        query: `
          query GetRequiredFields($pipeId: ID!) {
            pipe(id: $pipeId) {
              start_form_fields {
                id
                label
                required
              }
            }
          }
        `,
        variables: {
          pipeId
        }
      }
    });
    
    const requiredFields = fieldsResponse.data.data.pipe.start_form_fields
      .filter(field => field.required)
      .map(field => field.id);
    
    // 2. Verificar se todos os campos obrigatórios estão presentes
    const providedFieldIds = fieldsData.map(field => field.field_id);
    const missingRequiredFields = requiredFields.filter(
      id => !providedFieldIds.includes(id)
    );
    
    if (missingRequiredFields.length > 0) {
      throw new Error(`Campos obrigatórios faltando: ${missingRequiredFields.join(', ')}`);
    }
    
    // 3. Criar o cartão
    const createResponse = await axios({
      url: 'https://api.pipefy.com/graphql',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: {
        query: `
          mutation CreateCard($pipeId: ID!, $title: String!, $fieldsAttributes: [FieldValueInput!]) {
            createCard(input: {
              pipe_id: $pipeId,
              title: $title,
              fields_attributes: $fieldsAttributes
            }) {
              card {
                id
                title
                url
              }
            }
          }
        `,
        variables: {
          pipeId,
          title,
          fieldsAttributes: fieldsData
        }
      }
    });
    
    return createResponse.data.data.createCard.card;
  } catch (error) {
    console.error('Erro ao criar cartão:', error.response?.data || error.message);
    throw error;
  }
}

// Exemplo de uso
const token = 'seu_token_aqui';
const pipeId = '301397126';
const title = 'Novo pedido de cliente';
const fieldsData = [
  { field_id: "cliente", field_value: "Empresa ABC" },
  { field_id: "valor", field_value: "1500.00" },
  { field_id: "data_pedido", field_value: "2023-05-15" }
];

createCardWithRequiredFields(token, pipeId, title, fieldsData)
  .then(card => {
    console.log('Cartão criado com sucesso:', card);
  })
  .catch(error => {
    console.error('Falha ao criar cartão:', error);
  });
```

### Mover um Cartão para Outra Fase

Mover cartões entre fases é uma operação comum em fluxos de trabalho automatizados.

#### Consulta GraphQL

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

#### Exemplo em JavaScript

```javascript
const axios = require('axios');

async function moveCardToPhase(token, cardId, phaseId) {
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
          mutation MoveCard($cardId: ID!, $phaseId: ID!) {
            moveCardToPhase(input: {
              card_id: $cardId,
              destination_phase_id: $phaseId
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
        `,
        variables: {
          cardId,
          phaseId
        }
      }
    });
    
    return response.data.data.moveCardToPhase.card;
  } catch (error) {
    console.error('Erro ao mover cartão:', error.response?.data || error.message);
    throw error;
  }
}

// Exemplo de uso
moveCardToPhase('seu_token_aqui', '12345', '67890')
  .then(card => {
    console.log(`Cartão "${card.title}" movido para a fase "${card.current_phase.name}"`);
  })
  .catch(error => {
    console.error('Falha ao mover cartão:', error);
  });
```

### Adicionar Anexos a um Cartão

Adicionar arquivos como anexos a cartões é útil para documentação e referência.

#### Processo de Upload de Anexos

O processo de upload de anexos no Pipefy envolve duas etapas:

1. Obter uma URL para upload (mutation `generateUploadUrl`)
2. Fazer upload do arquivo para essa URL e depois associá-lo ao cartão

#### Consulta GraphQL

```graphql
# Passo 1: Gerar URL de upload
mutation {
  generateUploadUrl(input: {
    organizationId: "12345"
  }) {
    uploadUrl
    attachmentId
  }
}

# Passo 2: Anexar o arquivo ao cartão
mutation {
  createCardAttachment(input: {
    card_id: "67890",
    attachment_ids: ["attachment_id_da_etapa_1"]
  }) {
    card {
      attachments {
        id
        filename
        url
      }
    }
  }
}
```

#### Exemplo Completo em JavaScript

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function uploadAttachmentToCard(token, orgId, cardId, filePath) {
  try {
    // 1. Obter URL para upload
    const generateUrlResponse = await axios({
      url: 'https://api.pipefy.com/graphql',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: {
        query: `
          mutation GenerateUrl($orgId: ID!) {
            generateUploadUrl(input: {
              organizationId: $orgId
            }) {
              uploadUrl
              attachmentId
            }
          }
        `,
        variables: {
          orgId
        }
      }
    });
    
    const { uploadUrl, attachmentId } = generateUrlResponse.data.data.generateUploadUrl;
    
    // 2. Upload do arquivo para a URL gerada
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    
    const formData = new FormData();
    formData.append('file', fileContent, fileName);
    
    await axios.post(uploadUrl, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    // 3. Associar o arquivo ao cartão
    const attachResponse = await axios({
      url: 'https://api.pipefy.com/graphql',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: {
        query: `
          mutation AttachFile($cardId: ID!, $attachmentId: ID!) {
            createCardAttachment(input: {
              card_id: $cardId,
              attachment_ids: [$attachmentId]
            }) {
              card {
                attachments {
                  id
                  filename
                  url
                }
              }
            }
          }
        `,
        variables: {
          cardId,
          attachmentId
        }
      }
    });
    
    return attachResponse.data.data.createCardAttachment.card.attachments;
  } catch (error) {
    console.error('Erro ao anexar arquivo:', error.response?.data || error.message);
    throw error;
  }
}

// Exemplo de uso
uploadAttachmentToCard(
  'seu_token_aqui',
  '12345',
  '67890',
  '/caminho/para/documento.pdf'
)
  .then(attachments => {
    console.log('Anexo adicionado com sucesso:', attachments);
  })
  .catch(error => {
    console.error('Falha ao anexar arquivo:', error);
  });
```

### Criar e Enviar Email a partir de um Cartão

O Pipefy permite enviar emails diretamente a partir de cartões, útil para notificações e comunicações automatizadas.

#### Consulta GraphQL

```graphql
mutation {
  createAndSendEmail(input: {
    card_id: "12345",
    to: ["destinatario@exemplo.com"],
    cc: ["copia@exemplo.com"],
    subject: "Atualização do seu pedido",
    body: "<p>Olá,</p><p>Seu pedido foi aprovado e está em processamento.</p><p>Atenciosamente,<br>Equipe de Atendimento</p>"
  }) {
    clientMutationId
  }
}
```

#### Exemplo em JavaScript

```javascript
const axios = require('axios');

async function sendEmailFromCard(token, cardId, to, subject, body, cc = []) {
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
          mutation SendEmail($cardId: ID!, $to: [String!]!, $cc: [String!], $subject: String!, $body: String!) {
            createAndSendEmail(input: {
              card_id: $cardId,
              to: $to,
              cc: $cc,
              subject: $subject,
              body: $body
            }) {
              clientMutationId
            }
          }
        `,
        variables: {
          cardId,
          to: Array.isArray(to) ? to : [to],
          cc: Array.isArray(cc) ? cc : [cc],
          subject,
          body
        }
      }
    });
    
    return response.data.data.createAndSendEmail;
  } catch (error) {
    console.error('Erro ao enviar email:', error.response?.data || error.message);
    throw error;
  }
}

// Exemplo de uso
sendEmailFromCard(
  'seu_token_aqui',
  '12345',
  ['cliente@exemplo.com'],
  'Atualização do seu pedido',
  '<p>Olá,</p><p>Seu pedido foi aprovado e está em processamento.</p><p>Atenciosamente,<br>Equipe de Atendimento</p>',
  ['copia@exemplo.com']
)
  .then(result => {
    console.log('Email enviado com sucesso!');
  })
  .catch(error => {
    console.error('Falha ao enviar email:', error);
  });
```

### Listar Emails de um Cartão

Você pode recuperar o histórico de emails associados a um cartão.

#### Consulta GraphQL

```graphql
query {
  card(id: "12345") {
    emails {
      sender {
        name
        email
      }
      to
      cc
      subject
      body
      createdAt
    }
  }
}
```

#### Exemplo em JavaScript

```javascript
const axios = require('axios');

async function listCardEmails(token, cardId) {
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
          query CardEmails($cardId: ID!) {
            card(id: $cardId) {
              emails {
                sender {
                  name
                  email
                }
                to
                cc
                subject
                body
                createdAt
              }
            }
          }
        `,
        variables: {
          cardId
        }
      }
    });
    
    return response.data.data.card.emails;
  } catch (error) {
    console.error('Erro ao listar emails:', error.response?.data || error.message);
    throw error;
  }
}

// Exemplo de uso
listCardEmails('seu_token_aqui', '12345')
  .then(emails => {
    console.log(`${emails.length} emails encontrados:`);
    emails.forEach((email, index) => {
      console.log(`\nEmail #${index + 1}:`);
      console.log(`De: ${email.sender.name} <${email.sender.email}>`);
      console.log(`Para: ${email.to.join(', ')}`);
      console.log(`Assunto: ${email.subject}`);
      console.log(`Data: ${new Date(email.createdAt).toLocaleString()}`);
    });
  })
  .catch(error => {
    console.error('Falha ao listar emails:', error);
  });
```

## Configuração de Pipes e Formulários

### Criar um Pipe com Formulário Inicial

A criação de pipes com formulários personalizados permite configurar novos processos programaticamente.

#### Abordagem em Etapas

1. Criar o pipe básico
2. Criar campos no formulário inicial
3. Configurar fases do pipe
4. Adicionar campos às fases

#### Consulta GraphQL

```graphql
# Passo 1: Criar o pipe
mutation {
  createPipe(input: {
    organization_id: "12345",
    name: "Processo de Aprovação de Despesas",
    icon: "money"
  }) {
    pipe {
      id
      name
    }
  }
}

# Passo 2: Criar campos no formulário inicial
mutation {
  createField(input: {
    pipe_id: "pipe_id_do_passo_1",
    label: "Valor da Despesa",
    type: "currency",
    required: true,
    description: "Informe o valor total da despesa"
  }) {
    field {
      id
      label
    }
  }
}

# Passo 3: Criar fases
mutation {
  createPhase(input: {
    pipe_id: "pipe_id_do_passo_1",
    name: "Em Análise",
    done: false
  }) {
    phase {
      id
      name
    }
  }
}
```

#### Exemplo Completo em JavaScript

```javascript
const axios = require('axios');

class PipeBuilder {
  constructor(token, organizationId) {
    this.token = token;
    this.organizationId = organizationId;
    this.client = axios.create({
      baseURL: 'https://api.pipefy.com/graphql',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  }
  
  async execute(query, variables) {
    try {
      const response = await this.client.post('', {
        query,
        variables
      });
      
      if (response.data.errors) {
        throw new Error(JSON.stringify(response.data.errors));
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro na operação GraphQL:', error.response?.data || error.message);
      throw error;
    }
  }
  
  async createPipe(name, icon = "clipboard") {
    const result = await this.execute(`
      mutation CreatePipe($orgId: ID!, $name: String!, $icon: String!) {
        createPipe(input: {
          organization_id: $orgId,
          name: $name,
          icon: $icon
        }) {
          pipe {
            id
            name
          }
        }
      }
    `, {
      orgId: this.organizationId,
      name,
      icon
    });
    
    return result.createPipe.pipe;
  }
  
  async createStartFormField(pipeId, fieldData) {
    const result = await this.execute(`
      mutation CreateField($pipeId: ID!, $label: String!, $type: String!, $required: Boolean!, $description: String, $options: [String!]) {
        createField(input: {
          pipe_id: $pipeId,
          label: $label,
          type: $type,
          required: $required,
          description: $description,
          options: $options
        }) {
          field {
            id
            label
            type
          }
        }
      }
    `, {
      pipeId,
      ...fieldData
    });
    
    return result.createField.field;
  }
  
  async createPhase(pipeId, name, done = false) {
    const result = await this.execute(`
      mutation CreatePhase($pipeId: ID!, $name: String!, $done: Boolean!) {
        createPhase(input: {
          pipe_id: $pipeId,
          name: $name,
          done: $done
        }) {
          phase {
            id
            name
          }
        }
      }
    `, {
      pipeId,
      name,
      done
    });
    
    return result.createPhase.phase;
  }
  
  async createPhaseField(phaseId, fieldData) {
    const result = await this.execute(`
      mutation CreateField($phaseId: ID!, $label: String!, $type: String!, $required: Boolean!, $description: String, $options: [String!]) {
        createField(input: {
          phase_id: $phaseId,
          label: $label,
          type: $type,
          required: $required,
          description: $description,
          options: $options
        }) {
          field {
            id
            label
            type
          }
        }
      }
    `, {
      phaseId,
      ...fieldData
    });
    
    return result.createField.field;
  }
  
  async createCompletePipe(pipeConfig) {
    try {
      // 1. Criar o pipe
      console.log(`Criando pipe "${pipeConfig.name}"...`);
      const pipe = await this.createPipe(pipeConfig.name, pipeConfig.icon);
      console.log(`Pipe criado com ID: ${pipe.id}`);
      
      // 2. Criar campos do formulário inicial
      console.log("Criando campos do formulário inicial...");
      for (const fieldData of pipeConfig.startFormFields) {
        const field = await this.createStartFormField(pipe.id, fieldData);
        console.log(`Campo "${field.label}" criado com ID: ${field.id}`);
      }
      
      // 3. Criar fases
      console.log("Criando fases do pipe...");
      for (const phaseConfig of pipeConfig.phases) {
        const phase = await this.createPhase(
          pipe.id, 
          phaseConfig.name, 
          phaseConfig.done || false
        );
        console.log(`Fase "${phase.name}" criada com ID: ${phase.id}`);
        
        // 4. Criar campos para cada fase
        if (phaseConfig.fields && phaseConfig.fields.length > 0) {
          console.log(`Criando campos para a fase "${phase.name}"...`);
          for (const fieldData of phaseConfig.fields) {
            const field = await this.createPhaseField(phase.id, fieldData);
            console.log(`Campo "${field.label}" criado com ID: ${field.id}`);
          }
        }
      }
      
      return pipe;
    } catch (error) {
      console.error("Erro ao criar pipe completo:", error);
      throw error;
    }
  }
}

// Exemplo de uso
async function createExpenseApprovalProcess() {
  const builder = new PipeBuilder('seu_token_aqui', 'id_da_organizacao');
  
  const pipeConfig = {
    name: "Processo de Aprovação de Despesas",
    icon: "money",
    startFormFields: [
      {
        label: "Solicitante",
        type: "short_text",
        required: true,
        description: "Nome do funcionário que está solicitando"
      },
      {
        label: "Valor da Despesa",
        type: "currency",
        required: true,
        description: "Valor total da despesa"
      },
      {
        label: "Categoria",
        type: "select",
        required: true,
        options: ["Viagem", "Material de Escritório", "Software", "Hardware", "Outros"]
      },
      {
        label: "Descrição",
        type: "long_text",
        required: true,
        description: "Detalhe a finalidade da despesa"
      }
    ],
    phases: [
      {
        name: "Solicitação Enviada",
        fields: []
      },
      {
        name: "Em Análise pelo Gestor",
        fields: [
          {
            label: "Parecer do Gestor",
            type: "long_text",
            required: true
          },
          {
            label: "Status de Aprovação",
            type: "select",
            required: true,
            options: ["Aprovado", "Reprovado", "Necessita Ajustes"]
          }
        ]
      },
      {
        name: "Aprovado",
        fields: [
          {
            label: "Código de Aprovação",
            type: "short_text",
            required: true
          }
        ]
      },
      {
        name: "Pagamento Processado",
        done: true,
        fields: [
          {
            label: "Data do Pagamento",
            type: "date",
            required: true
          },
          {
            label: "Comprovante",
            type: "attachment",
            required: true
          }
        ]
      },
      {
        name: "Rejeitado",
        done: true,
        fields: [
          {
            label: "Motivo da Rejeição",
            type: "long_text",
            required: true
          }
        ]
      }
    ]
  };
  
  try {
    const pipe = await builder.createCompletePipe(pipeConfig);
    console.log("Processo de Aprovação de Despesas criado com sucesso!");
    return pipe;
  } catch (error) {
    console.error("Falha ao criar processo:", error);
  }
}

createExpenseApprovalProcess();
```

### Configurar Formulário Inicial em um Pipe Existente

Você pode adicionar ou modificar campos no formulário inicial de um pipe já existente.

#### Consulta GraphQL

```graphql
mutation {
  createField(input: {
    pipe_id: "12345",
    label: "Prioridade",
    type: "select",
    required: true,
    options: ["Baixa", "Média", "Alta", "Urgente"]
  }) {
    field {
      id
      label
      type
    }
  }
}
```

#### Exemplo em JavaScript

```javascript
const axios = require('axios');

async function configureStartForm(token, pipeId, fields) {
  try {
    const results = [];
    
    for (const field of fields) {
      const response = await axios({
        url: 'https://api.pipefy.com/graphql',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: {
          query: `
            mutation CreateField($pipeId: ID!, $field: InputField!) {
              createField(input: {
                pipe_id: $pipeId,
                label: $field.label,
                type: $field.type,
                required: $field.required,
                description: $field.description,
                options: $field.options
              }) {
                field {
                  id
                  label
                  type
                }
              }
            }
          `,
          variables: {
            pipeId,
            field
          }
        }
      });
      
      results.push(response.data.data.createField.field);
    }
    
    return results;
  } catch (error) {
    console.error('Erro ao configurar formulário:', error.response?.data || error.message);
    throw error;
  }
}

// Exemplo de uso
const fieldsToAdd = [
  {
    label: "Prioridade",
    type: "select",
    required: true,
    options: ["Baixa", "Média", "Alta", "Urgente"],
    description: "Selecione a prioridade da solicitação"
  },
  {
    label: "Data Limite",
    type: "date",
    required: false,
    description: "Data limite para conclusão (opcional)"
  }
];

configureStartForm('seu_token_aqui', '12345', fieldsToAdd)
  .then(fields => {
    console.log('Campos adicionados com sucesso:');
    fields.forEach(field => {
      console.log(`- ${field.label} (${field.type}): ${field.id}`);
    });
  })
  .catch(error => {
    console.error('Falha ao configurar formulário:', error);
  });
```

### Criar Campos em uma Fase

Adicionar campos a uma fase específica permite coletar informações em diferentes estágios do processo.

#### Consulta GraphQL

```graphql
mutation {
  createField(input: {
    phase_id: "12345",
    label: "Feedback",
    type: "long_text",
    required: true,
    description: "Avaliação da entrega pelo cliente"
  }) {
    field {
      id
      label
      type
    }
  }
}
```
