# n8n-nodes-pipefy

Este pacote contém um nó para usar a API do Pipefy em n8n.

[n8n](https://n8n.io/) é uma plataforma de automação de fluxo de trabalho sem código que pode ser usada para conectar diferentes serviços e aplicativos.

## Instalação

### Instalação em sua instalação n8n

1. Vá para o diretório de instalação do n8n e instale o pacote:
```bash
npm install n8n-nodes-pipefy
```

2. Reinicie o n8n

### Instalação para desenvolvimento

1. Clone o repositório
```bash
git clone https://github.com/yourusername/n8n-nodes-pipefy.git
```

2. Instale as dependências
```bash
cd n8n-nodes-pipefy
npm install
```

3. Build o código
```bash
npm run build
```

4. Link o pacote com o n8n
```bash
npm link
cd ~/.n8n
npm link n8n-nodes-pipefy
```

## Uso

Após a instalação, o nó do Pipefy estará disponível em n8n. Você pode usá-lo como qualquer outro nó para interagir com a API do Pipefy.

### Autenticação

Para usar este nó, você precisará de um Personal Access Token do Pipefy:

1. Faça login na sua conta do Pipefy
2. Vá para as configurações da sua conta
3. Navegue até a seção "API" ou "Personal Access Tokens"
4. Gere um novo token
5. Use este token nas credenciais do nó Pipefy no n8n

### Recursos disponíveis

Os seguintes recursos estão disponíveis no nó do Pipefy:

#### Organizações
- **Obter**: Recuperar informações de uma organização específica
- **Obter Vários**: Recuperar informações de várias organizações
- **Criar**: Criar uma nova organização
- **Atualizar**: Atualizar uma organização existente
- **Excluir**: Excluir uma organização

#### Usuários
- **Obter Me**: Recuperar informações do usuário atual
- **Convidar Membro**: Convidar um membro para uma organização
- **Remover Usuário**: Remover um usuário de uma organização
- **Definir Função**: Alterar as permissões de um usuário

#### Pipes
- **Obter**: Recuperar informações de um pipe específico
- **Criar**: Criar um novo pipe
- **Atualizar**: Atualizar um pipe existente
- **Excluir**: Excluir um pipe

#### Cards
- **Obter**: Recuperar informações de um card específico
- **Criar**: Criar um novo card
- **Atualizar**: Atualizar um card existente
- **Atualizar Campo**: Atualizar um campo específico em um card
- **Excluir**: Excluir um card

## Referência da API

Este nó é baseado na [API GraphQL do Pipefy](https://developers.pipefy.com/reference). Para obter mais informações sobre os endpoints e parâmetros disponíveis, consulte a documentação oficial.

## Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).
