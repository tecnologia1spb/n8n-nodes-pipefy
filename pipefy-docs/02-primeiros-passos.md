# Primeiros Passos com a API do Pipefy

## Autenticação

Para usar a API GraphQL do Pipefy, você precisa se autenticar usando um token de acesso. Existem duas maneiras principais de obter tokens de autenticação:

1. **Token de Acesso Pessoal (PAT)**: Token permanente vinculado à sua conta
2. **OAuth 2.0**: Para aplicativos integrados que acessam contas de outros usuários

### Token de Acesso Pessoal

Os tokens de acesso pessoal são a maneira mais simples de autenticar-se com a API do Pipefy.

#### Como obter um Token de Acesso Pessoal:

1. Faça login na sua conta do Pipefy em [app.pipefy.com](https://app.pipefy.com)
2. Clique no seu avatar no canto superior direito
3. Selecione "Perfil"
4. No menu lateral, clique em "Tokens de API"
5. Clique em "Gerar novo token"
6. Dê um nome descritivo ao seu token
7. Clique em "Gerar token"
8. Copie o token gerado (você não poderá vê-lo novamente)

**Importante**: Trate seus tokens como senhas. Nunca compartilhe-os publicamente ou inclua-os diretamente no código-fonte versionado.

#### Usar o Token de Acesso Pessoal:

Adicione o token ao cabeçalho da requisição HTTP:

```
Authorization: Bearer seu_token_aqui
```

### Contas de Serviço

As Contas de Serviço são úteis para integrações automatizadas e aplicações que precisam acessar o Pipefy sem estar vinculadas a um usuário específico.

#### Vantagens das Contas de Serviço:

- Não estão vinculadas a um usuário individual
- Podem ter permissões específicas
- Ideal para automações e integrações
- Manutenção simplificada (não é afetada quando funcionários saem da empresa)

#### Como criar uma Conta de Serviço:

1. Acesse as configurações da sua organização no Pipefy
2. Vá para "Contas de serviço"
3. Clique em "Criar conta de serviço"
4. Defina um nome e permissões específicas
5. Obtenha o token de acesso da conta de serviço

## Estrutura das Chamadas GraphQL

As chamadas à API GraphQL do Pipefy seguem uma estrutura específica que consiste em queries (consultas) e mutations (mutações).

### Anatomia de uma Query

As queries são usadas para recuperar dados do Pipefy. Aqui está um exemplo básico:

```graphql
query {
  me {
    id
    name
    email
  }
}
```

Esta query retorna o ID, nome e email do usuário autenticado.

### Anatomia de uma Mutation

As mutations são usadas para criar, atualizar ou excluir dados no Pipefy. Exemplo:

```graphql
mutation {
  createCard(input: {
    pipe_id: "12345"
    title: "Novo card"
    fields_attributes: [
      {field_id: "nome", field_value: "João Silva"}
    ]
  }) {
    card {
      id
      title
    }
  }
}
```

Esta mutation cria um novo cartão em um pipe e retorna seu ID e título.

## Fazendo sua primeira chamada à API

Vamos criar uma chamada simples usando cURL para demonstrar como funciona a autenticação e a estrutura da requisição:

```bash
curl -X POST https://api.pipefy.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{"query": "query { me { id name email } }"}'
```

Resposta esperada:

```json
{
  "data": {
    "me": {
      "id": "12345",
      "name": "Seu Nome",
      "email": "seu.email@exemplo.com"
    }
  }
}
```

## Tratamento de Requisições da API

A API do Pipefy utiliza uma abordagem específica para o tratamento de requisições. Aqui estão algumas informações importantes:

### Limites de Taxa (Rate Limits)

A API do Pipefy impõe limites de taxa para garantir a estabilidade e desempenho da plataforma:

- **Limite padrão**: 100 requisições por minuto por token
- **Consultas complexas**: Podem contar como múltiplas requisições
- **Status 429**: Retornado quando o limite é excedido

#### Estratégias para lidar com limites de taxa:

1. **Exponential Backoff**: Aumente o tempo entre tentativas após falhas
2. **Batch Operations**: Combine múltiplas operações em uma única chamada
3. **Caching**: Armazene temporariamente resultados frequentemente consultados

### Melhores Práticas

Para otimizar suas chamadas à API do Pipefy:

1. **Solicite apenas os campos necessários**: Reduza a quantidade de dados transferidos
2. **Use aliases para consultas múltiplas**: Renomeie resultados para maior clareza
3. **Implemente paginação**: Para grandes conjuntos de dados
4. **Use variáveis para consultas dinâmicas**: Facilita a reutilização e manutenção do código
5. **Implemente tratamento de erros robusto**: Capte e lide adequadamente com erros

## Explorando o Playground GraphQL

O Pipefy oferece um Playground GraphQL interativo onde você pode explorar a API, construir consultas e ver a documentação completa.

### Como acessar o Playground:

1. Acesse [https://app.pipefy.com/graphiql](https://app.pipefy.com/graphiql)
2. Faça login com sua conta do Pipefy
3. Explore o painel de documentação no lado direito
4. Experimente consultas em tempo real
5. Veja resultados instantâneos

### Recursos do Playground:

- **Autocompletar**: Sugestões de campos e parâmetros
- **Documentação integrada**: Descrições de tipos e campos
- **Validação em tempo real**: Alertas sobre erros de sintaxe
- **Histórico de consultas**: Acesso a consultas anteriores
- **Variáveis e cabeçalhos**: Suporte a parâmetros dinâmicos

## Dominando a Documentação

Para tirar o máximo proveito da API do Pipefy, é importante saber como navegar e entender a documentação completa.

### Tipos de Documentação Disponíveis:

1. **Documentação do Schema**: Descrição detalhada de todos os tipos e campos
2. **Guias de Caso de Uso**: Exemplos práticos para cenários comuns
3. **Referência de Erros**: Informações sobre códigos de erro e soluções

### Como Utilizar a Documentação:

1. **Começar com exemplos**: Utilize os exemplos fornecidos como ponto de partida
2. **Explorar o schema**: Entenda a estrutura de dados subjacente
3. **Analisar casos de uso**: Veja como implementar funcionalidades específicas
4. **Verificar limites e restrições**: Conheça os limites da API

Com essas informações, você está pronto para começar a utilizar a API GraphQL do Pipefy de forma eficiente. Nas próximas seções, exploraremos conceitos mais avançados e exemplos específicos para diversos casos de uso.
