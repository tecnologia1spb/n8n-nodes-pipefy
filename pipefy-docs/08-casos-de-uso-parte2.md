# Casos de Uso da API do Pipefy - Parte 2

Continuação dos exemplos práticos de como utilizar a API GraphQL do Pipefy para implementar funcionalidades comuns.

## Gerenciamento de Conexões

### Conexões entre Cartões

As conexões entre cartões permitem estabelecer relacionamentos entre diferentes registros, criando uma estrutura de dados conectada.

#### Consulta GraphQL para Criar Conexão

```graphql
mutation {
  createCardRelation(input: {
    parent_card_id: "12345",
    child_card_id: "67890",
    name: "Item do pedido"
  }) {
    card_relation {
      id
      name
      parent {
        id
        title
      }
      child {
        id
        title
      }
    }
  }
}
```

#### Consulta GraphQL para Listar Conexões

```graphql
query {
  card(id: "12345") {
    parent_relations {
      name
      parent {
        id
        title
      }
    }
    child_relations {
      name
      child {
        id
        title
      }
    }
  }
}
```

#### Exemplo em JavaScript

```javascript
const axios = require('axios');

async function connectCards(token, parentCardId, childCardId, connectionName) {
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
          mutation ConnectCards($parentId: ID!, $childId: ID!, $name: String!) {
            createCardRelation(input: {
              parent_card_id: $parentId,
              child_card_id: $childId,
              name: $name
            }) {
              card_relation {
                id
                name
                parent {
                  id
                  title
                }
                child {
                  id
                  title
                }
              }
            }
          }
        `,
        variables: {
          parentId: parentCardId,
          childId: childCardId,
          name: connectionName
        }
      }
    });
    
    return response.data.data.createCardRelation.card_relation;
  } catch (error) {
    console.error('Erro ao conectar cartões:', error.response?.data || error.message);
    throw error;
  }
}

async function getCardConnections(token, cardId) {
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
          query CardConnections($cardId: ID!) {
            card(id: $cardId) {
              parent_relations {
                name
                parent {
                  id
                  title
                }
              }
              child_relations {
                name
                child {
                  id
                  title
                }
              }
            }
          }
        `,
        variables: {
          cardId
        }
      }
    });
    
    return response.data.data.card;
  } catch (error) {
    console.error('Erro ao obter conexões:', error.response?.data || error.message);
    throw error;
  }
}

// Exemplo de uso
connectCards('seu_token_aqui', '12345', '67890', 'Item do pedido')
  .then(relation => {
    console.log('Conexão criada:');
    console.log(`- Pai: ${relation.parent.title} (${relation.parent.id})`);
    console.log(`- Filho: ${relation.child.title} (${relation.child.id})`);
    console.log(`- Tipo: ${relation.name}`);
  })
  .catch(error => {
    console.error('Falha ao conectar cartões:', error);
  });

getCardConnections('seu_token_aqui', '12345')
  .then(connections => {
    console.log('Cartões pais:');
    connections.parent_relations.forEach(rel => {
      console.log(`- ${rel.parent.title} (${rel.name})`);
    });
    
    console.log('\nCartões filhos:');
    connections.child_relations.forEach(rel => {
      console.log(`- ${rel.child.title} (${rel.name})`);
    });
  })
  .catch(error => {
    console.error('Falha ao obter conexões:', error);
  });
```

## Gerenciamento de Organização

### Recuperar Configurações da Organização

Obter as configurações de uma organização permite adaptar sua integração às regras específicas definidas no Pipefy.

#### Consulta GraphQL

```graphql
query {
  organization(id: "12345") {
    id
    name
    settings {
      calendar_initial_hour
      calendar_final_hour
      time_zone
      week_starts_at
      allow_create_pipe
      allow_create_table
      dashboard_filter_visibility
      notification_email_from
      white_label_url
    }
  }
}
```

#### Exemplo em JavaScript

```javascript
const axios = require('axios');

async function getOrganizationSettings(token, orgId) {
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
          query OrgSettings($orgId: ID!) {
            organization(id: $orgId) {
              id
              name
              settings {
                calendar_initial_hour
                calendar_final_hour
                time_zone
                week_starts_at
                allow_create_pipe
                allow_create_table
                dashboard_filter_visibility
                notification_email_from
                white_label_url
              }
            }
          }
        `,
        variables: {
          orgId
        }
      }
    });
    
    return response.data.data.organization;
  } catch (error) {
    console.error('Erro ao obter configurações:', error.response?.data || error.message);
    throw error;
  }
}

// Exemplo de uso
getOrganizationSettings('seu_token_aqui', '12345')
  .then(org => {
    console.log(`Configurações da organização ${org.name}:`);
    console.log(JSON.stringify(org.settings, null, 2));
  })
  .catch(error => {
    console.error('Falha ao obter configurações:', error);
  });
```

### Estatísticas de Uso da Organização

Obter estatísticas de uso da organização ajuda a monitorar a utilização da plataforma.

#### Consulta GraphQL

```graphql
query {
  organization(id: "12345") {
    usage_stats {
      pipes_count
      cards_created_last_30d
      cards_created_all_time
      cards_in_progress_count
      cards_done_count
      late_cards_count
      active_users_last_30d
      organization_members_count
    }
  }
}
```

#### Exemplo em JavaScript

```javascript
const axios = require('axios');

async function getOrganizationUsageStats(token, orgId) {
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
          query OrgUsageStats($orgId: ID!) {
            organization(id: $orgId) {
              name
              usage_stats {
                pipes_count
                cards_created_last_30d
                cards_created_all_time
                cards_in_progress_count
                cards_done_count
                late_cards_count
                active_users_last_30d
                organization_members_count
              }
            }
          }
        `,
        variables: {
          orgId
        }
      }
    });
    
    return {
      name: response.data.data.organization.name,
      stats: response.data.data.organization.usage_stats
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error.response?.data || error.message);
    throw error;
  }
}

// Exemplo de uso
getOrganizationUsageStats('seu_token_aqui', '12345')
  .then(result => {
    console.log(`Estatísticas de uso da organização ${result.name}:`);
    const stats = result.stats;
    console.log(`- Total de pipes: ${stats.pipes_count}`);
    console.log(`- Cartões criados nos últimos 30 dias: ${stats.cards_created_last_30d}`);
    console.log(`- Cartões criados desde o início: ${stats.cards_created_all_time}`);
    console.log(`- Cartões em andamento: ${stats.cards_in_progress_count}`);
    console.log(`- Cartões concluídos: ${stats.cards_done_count}`);
    console.log(`- Cartões atrasados: ${stats.late_cards_count}`);
    console.log(`- Usuários ativos nos últimos 30 dias: ${stats.active_users_last_30d}`);
    console.log(`- Total de membros: ${stats.organization_members_count}`);
  })
  .catch(error => {
    console.error('Falha ao obter estatísticas:', error);
  });
```

## Gerenciamento de Usuários

### Definir Funções de Usuários

Atribuir funções específicas a usuários permite gerenciar permissões de acesso.

#### Consulta GraphQL

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
        email
      }
      role
    }
  }
}
```

#### Exemplo em JavaScript

```javascript
const axios = require('axios');

async function setUserRole(token, orgId, userId, role) {
  // Valida o papel
  if (!['admin', 'member', 'guest'].includes(role)) {
    throw new Error('Papel inválido. Use "admin", "member" ou "guest".');
  }
  
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
          mutation SetRole($orgId: ID!, $userId: ID!, $role: String!) {
            setRole(input: {
              organization_id: $orgId,
              user_id: $userId,
              role: $role
            }) {
              organization_user {
                user {
                  id
                  name
                  email
                }
                role
              }
            }
          }
        `,
        variables: {
          orgId,
          userId,
          role
        }
      }
    });
    
    return response.data.data.setRole.organization_user;
  } catch (error) {
    console.error('Erro ao definir função do usuário:', error.response?.data || error.message);
    throw error;
  }
}

// Exemplo de uso
setUserRole('seu_token_aqui', '12345', '67890', 'admin')
  .then(result => {
    console.log(`Função atualizada para ${result.user.name} (${result.user.email}):`);
    console.log(`- Nova função: ${result.role}`);
  })
  .catch(error => {
    console.error('Falha ao definir função do usuário:', error);
  });
```

### Configurar Pipes Favoritos do Usuário

Definir pipes favoritos para um usuário melhora a experiência ao facilitar o acesso a processos frequentemente usados.

#### Consulta GraphQL

```graphql
mutation {
  setUserFavoritePipes(input: {
    pipe_ids: ["12345", "67890"]
  }) {
    clientMutationId
  }
}
```

#### Exemplo em JavaScript

```javascript
const axios = require('axios');

async function setUserFavoritePipes(token, pipeIds) {
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
          mutation SetFavorites($pipeIds: [ID!]!) {
            setUserFavoritePipes(input: {
              pipe_ids: $pipeIds
            }) {
              clientMutationId
            }
          }
        `,
        variables: {
          pipeIds: Array.isArray(pipeIds) ? pipeIds : [pipeIds]
        }
      }
    });
    
    return response.data.data.setUserFavoritePipes;
  } catch (error) {
    console.error('Erro ao definir pipes favoritos:', error.response?.data || error.message);
    throw error;
  }
}

// Exemplo de uso
setUserFavoritePipes('seu_token_aqui', ['12345', '67890'])
  .then(() => {
    console.log('Pipes favoritos atualizados com sucesso!');
  })
  .catch(error => {
    console.error('Falha ao definir pipes favoritos:', error);
  });
```

### Rastrear Usuários Ativos

Monitorar os usuários ativos na plataforma é útil para análise de engajamento.

#### Consulta GraphQL

```graphql
query {
  organization(id: "12345") {
    users(active_last_30_days: true, first: 10) {
      edges {
        node {
          user {
            id
            name
            email
          }
          last_activity_at
        }
      }
    }
  }
}
```

#### Exemplo em JavaScript

```javascript
const axios = require('axios');

async function trackActiveUsers(token, orgId, daysActive = 30, limit = 100) {
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
          query ActiveUsers($orgId: ID!, $active: Boolean!, $first: Int!) {
            organization(id: $orgId) {
              users(active_last_30_days: $active, first: $first) {
                edges {
                  node {
                    user {
                      id
                      name
                      email
                    }
                    last_activity_at
                  }
                }
              }
            }
          }
        `,
        variables: {
          orgId,
          active: true,
          first: limit
        }
      }
    });
    
    return response.data.data.organization.users.edges.map(edge => ({
      id: edge.node.user.id,
      name: edge.node.user.name,
      email: edge.node.user.email,
      lastActivity: edge.node.last_activity_at
    }));
  } catch (error) {
    console.error('Erro ao rastrear usuários ativos:', error.response?.data || error.message);
    throw error;
  }
}

// Exemplo de uso
trackActiveUsers('seu_token_aqui', '12345')
  .then(users => {
    console.log(`${users.length} usuários ativos nos últimos 30 dias:`);
    users.forEach(user => {
      const lastActivity = new Date(user.lastActivity).toLocaleString();
      console.log(`- ${user.name} (${user.email}): última atividade em ${lastActivity}`);
    });
  })
  .catch(error => {
    console.error('Falha ao rastrear usuários ativos:', error);
  });
```

## Gerenciamento de Tags

### Adicionar Tags a Recursos

Tags ajudam a organizar e classificar recursos no Pipefy.

#### Consulta GraphQL

```graphql
mutation {
  addTagsToResource(input: {
    resource_type: "card",
    resource_id: "12345",
    tag_category_id: "67890",
    tag_ids: ["tag1", "tag2"]
  }) {
    success
  }
}
```

#### Exemplo em JavaScript

```javascript
const axios = require('axios');

async function addTagsToResource(token, resourceType, resourceId, categoryId, tagIds) {
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
          mutation AddTags($input: AddTagsToResourceInput!) {
            addTagsToResource(input: $input) {
              success
            }
          }
        `,
        variables: {
          input: {
            resource_type: resourceType,
            resource_id: resourceId,
            tag_category_id: categoryId,
            tag_ids: Array.isArray(tagIds) ? tagIds : [tagIds]
          }
        }
      }
    });
    
    return response.data.data.addTagsToResource;
  } catch (error) {
    console.error('Erro ao adicionar tags:', error.response?.data || error.message);
    throw error;
  }
}

// Exemplo de uso
addTagsToResource(
  'seu_token_aqui',
  'card',
  '12345',
  '67890',
  ['tag1', 'tag2']
)
  .then(result => {
    if (result.success) {
      console.log('Tags adicionadas com sucesso!');
    } else {
      console.log('Falha ao adicionar tags.');
    }
  })
  .catch(error => {
    console.error('Erro ao adicionar tags:', error);
  });
```

### Consultar Tags por Categoria

Recuperar tags organizadas por categoria ajuda a compreender a taxonomia definida na organização.

#### Consulta GraphQL

```graphql
query {
  organization(id: "12345") {
    tag_categories {
      id
      name
      tags {
        id
        name
        color
      }
    }
  }
}
```

#### Exemplo em JavaScript

```javascript
const axios = require('axios');

async function getTagsByCategory(token, orgId) {
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
          query TagsByCategory($orgId: ID!) {
            organization(id: $orgId) {
              tag_categories {
                id
                name
                tags {
                  id
                  name
                  color
                }
              }
            }
          }
        `,
        variables: {
          orgId
        }
      }
    });
    
    return response.data.data.organization.tag_categories;
  } catch (error) {
    console.error('Erro ao consultar tags:', error.response?.data || error.message);
    throw error;
  }
}

// Exemplo de uso
getTagsByCategory('seu_token_aqui', '12345')
  .then(categories => {
    console.log(`${categories.length} categorias de tags encontradas:`);
    categories.forEach(category => {
      console.log(`\nCategoria: ${category.name} (${category.id})`);
      console.log(`Tags (${category.tags.length}):`);
      category.tags.forEach(tag => {
        console.log(`- ${tag.name} (${tag.color}): ${tag.id}`);
      });
    });
  })
  .catch(error => {
    console.error('Falha ao consultar tags:', error);
  });
```

### Consultar Tags em um Recurso Específico

Verificar quais tags estão aplicadas a um recurso específico.

#### Consulta GraphQL

```graphql
query {
  card(id: "12345") {
    tag_resources {
      tag {
        id
        name
        color
      }
      tag_category {
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

async function getResourceTags(token, resourceType, resourceId) {
  // Valida o tipo de recurso
  if (!['card', 'pipe', 'table'].includes(resourceType)) {
    throw new Error('Tipo de recurso inválido. Use "card", "pipe" ou "table".');
  }
  
  // Constrói a consulta com base no tipo de recurso
  const queryMap = {
    card: `
      query CardTags($id: ID!) {
        card(id: $id) {
          tag_resources {
            tag {
              id
              name
              color
            }
            tag_category {
              id
              name
            }
          }
        }
      }
    `,
    pipe: `
      query PipeTags($id: ID!) {
        pipe(id: $id) {
          tag_resources {
            tag {
              id
              name
              color
            }
            tag_category {
              id
              name
            }
          }
        }
      }
    `,
    table: `
      query TableTags($id: ID!) {
        table(id: $id) {
          tag_resources {
            tag {
              id
              name
              color
            }
            tag_category {
              id
              name
            }
          }
        }
      }
    `
  };
  
  try {
    const response = await axios({
      url: 'https://api.pipefy.com/graphql',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: {
        query: queryMap[resourceType],
        variables: {
          id: resourceId
        }
      }
    });
    
    // Extrair as tags do tipo de recurso correto
    const resourceData = response.data.data[resourceType];
    return resourceData.tag_resources;
  } catch (error) {
    console.error('Erro ao consultar tags do recurso:', error.response?.data || error.message);
    throw error;
  }
}

// Exemplo de uso
getResourceTags('seu_token_aqui', 'card', '12345')
  .then(tagResources => {
    console.log(`${tagResources.length} tags encontradas neste recurso:`);
    
    // Agrupar tags por categoria
    const tagsByCategory = {};
    tagResources.forEach(tr => {
      const categoryName = tr.tag_category.name;
      if (!tagsByCategory[categoryName]) {
        tagsByCategory[categoryName] = [];
      }
      tagsByCategory[categoryName].push(tr.tag);
    });
    
    // Exibir tags agrupadas por categoria
    Object.entries(tagsByCategory).forEach(([category, tags]) => {
      console.log(`\nCategoria: ${category}`);
      tags.forEach(tag => {
        console.log(`- ${tag.name} (${tag.color})`);
      });
    });
  })
  .catch(error => {
    console.error('Falha ao consultar tags do recurso:', error);
  });
```

## Gerenciamento de Relatórios

### Obter Relatórios de um Pipe

Os relatórios do Pipefy fornecem insights importantes sobre o desempenho dos processos.

#### Consulta GraphQL

```graphql
query {
  pipe(id: "12345") {
    reports {
      id
      name
      description
      type
      report_group {
        name
      }
    }
  }
}
```

#### Exemplo em JavaScript

```javascript
const axios = require('axios');

async function getPipeReports(token, pipeId) {
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
          query PipeReports($pipeId: ID!) {
            pipe(id: $pipeId) {
              name
              reports {
                id
                name
                description
                type
                report_group {
                  name
                }
              }
            }
          }
        `,
        variables: {
          pipeId
        }
      }
    });
    
    return {
      pipeName: response.data.data.pipe.name,
      reports: response.data.data.pipe.reports
    };
  } catch (error) {
    console.error('Erro ao obter relatórios:', error.response?.data || error.message);
    throw error;
  }
}

// Exemplo de uso
getPipeReports('seu_token_aqui', '12345')
  .then(result => {
    console.log(`Relatórios para o pipe "${result.pipeName}":`);
    
    // Agrupar relatórios por grupo
    const reportsByGroup = {};
    result.reports.forEach(report => {
      const groupName = report.report_group ? report.report_group.name : 'Sem grupo';
      if (!reportsByGroup[groupName]) {
        reportsByGroup[groupName] = [];
      }
      reportsByGroup[groupName].push(report);
    });
    
    // Exibir relatórios agrupados
    Object.entries(reportsByGroup).forEach(([group, reports]) => {
      console.log(`\nGrupo: ${group}`);
      reports.forEach(report => {
        console.log(`- ${report.name} (${report.type}): ${report.id}`);
        if (report.description) {
          console.log(`  Descrição: ${report.description}`);
        }
      });
    });
  })
  .catch(error => {
    console.error('Falha ao obter relatórios:', error);
  });
```

### Acessar Dados de um Relatório Específico

Recuperar os dados de um relatório para análise ou exibição em sistemas externos.

#### Consulta GraphQL

```graphql
query {
  pipeReport(id: "12345") {
    name
    type
    chart_data {
      name
      data
    }
    table_data {
      headers
      rows
    }
  }
}
```

#### Exemplo em JavaScript

```javascript
const axios = require('axios');

async function getReportData(token, reportId) {
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
          query ReportData($reportId: ID!) {
            pipeReport(id: $reportId) {
              id
              name
              type
              chart_data {
                name
                data
              }
              table_data {
                headers
                rows
              }
            }
          }
        `,
        variables: {
          reportId
        }
      }
    });
    
    return response.data.data.pipeReport;
  } catch (error) {
    console.error('Erro ao obter dados do relatório:', error.response?.data || error.message);
    throw error;
  }
}

// Função para exportar dados de tabela para CSV
function exportTableToCSV(report) {
  if (!report.table_data) {
    throw new Error('Este relatório não possui dados de tabela.');
  }
  
  const { headers, rows } = report.table_data;
  const csvRows = [];
  
  // Adicionar cabeçalhos
  csvRows.push(headers.join(','));
  
  // Adicionar linhas
  rows.forEach(row => {
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
}

// Exemplo de uso
getReportData('seu_token_aqui', '12345')
  .then(report => {
    console.log(`Relatório: ${report.name} (${report.type})`);
    
    if (report.chart_data && report.chart_data.length > 0) {
      console.log('\nDados do gráfico:');
      report.chart_data.forEach(series => {
        console.log(`- Série: ${series.name}`);
        console.log(`  Dados: ${JSON.stringify(series.data)}`);
      });
    }
    
    if (report.table_data) {
      console.log('\nDados da tabela:');
      console.log(`- Colunas: ${report.table_data.headers.join(', ')}`);
      console.log(`- Linhas: ${report.table_data.rows.length}`);
      
      // Exportar para CSV se necessário
      const csv = exportTableToCSV(report);
      console.log('\nDados CSV:');
      console.log(csv);
      
      // Aqui você poderia salvar o CSV em um arquivo
      // fs.writeFileSync(`relatório_${report.id}.csv`, csv);
    }
  })
  .catch(error => {
    console.error('Falha ao obter dados do relatório:', error);
  });
```

Este documento apresenta vários casos de uso para a API do Pipefy, demonstrando como interagir com recursos relacionados a conexões, organização, usuários, tags e relatórios. Os exemplos incluem consultas GraphQL e implementações em JavaScript para facilitar a integração.
