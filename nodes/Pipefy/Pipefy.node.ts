import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	INodeProperties,
	INodePropertyOptions,
} from 'n8n-workflow';

import { OptionsWithUri } from 'request-promise-native';

export class Pipefy implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pipefy',
		name: 'pipefy',
		icon: 'file:pipefy.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume Pipefy API',
		defaults: {
			name: 'Pipefy',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'pipefyApi',
				required: true,
			},
		],
		properties: [
			// Resources
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Organization',
						value: 'organization',
					},
					{
						name: 'User',
						value: 'user',
					},
					{
						name: 'Pipe',
						value: 'pipe',
					},
					{
						name: 'Phase',
						value: 'phase',
					},
					{
						name: 'Field',
						value: 'field',
					},
					{
						name: 'Card',
						value: 'card',
					},
				],
				default: 'organization',
			},

			// Operations for Organization resource
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'organization',
						],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get an organization',
					},
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get many organizations',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create an organization',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an organization',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an organization',
					},
				],
				default: 'get',
			},

			// Operations for User resource
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'user',
						],
					},
				},
				options: [
					{
						name: 'Get Me',
						value: 'getMe',
						description: 'Get current user information',
					},
					{
						name: 'Invite Member',
						value: 'inviteMember',
						description: 'Invite a member to an organization',
					},
					{
						name: 'Remove User',
						value: 'removeUser',
						description: 'Remove a user from an organization',
					},
					{
						name: 'Set Role',
						value: 'setRole',
						description: 'Change user permissions',
					},
				],
				default: 'getMe',
			},

			// Operations for Pipe resource
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'pipe',
						],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a pipe',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a pipe',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a pipe',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a pipe',
					},
				],
				default: 'get',
			},

			// Operations for Phase resource
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'phase',
						],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a phase',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a phase',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a phase',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a phase',
					},
				],
				default: 'get',
			},

			// Operations for Card resource
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'card',
						],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a card',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a card',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a card',
					},
					{
						name: 'Update Field',
						value: 'updateField',
						description: 'Update a field in a card',
					},
					{
						name: 'Move to Phase',
						value: 'moveToPhase',
						description: 'Move a card to another phase',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a card',
					},
				],
				default: 'get',
			},

			// Fields for Organization:Get operation
			{
				displayName: 'Organization ID',
				name: 'organizationId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'organization',
						],
						operation: [
							'get',
						],
					},
				},
				description: 'ID of the organization to get',
			},

			// Fields for Organization:Create operation
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'organization',
						],
						operation: [
							'create',
						],
					},
				},
				description: 'Name of the organization to create',
			},
			{
				displayName: 'Industry',
				name: 'industry',
				type: 'options',
				options: [
					{
						name: 'Financial Services',
						value: 'financial_services',
					},
					{
						name: 'Technology',
						value: 'technology',
					},
					{
						name: 'Manufacturing',
						value: 'manufacturing',
					},
					{
						name: 'Healthcare',
						value: 'healthcare',
					},
					{
						name: 'Education',
						value: 'education',
					},
					{
						name: 'Other',
						value: 'other',
					},
				],
				default: 'other',
				displayOptions: {
					show: {
						resource: [
							'organization',
						],
						operation: [
							'create',
						],
					},
				},
				description: 'Industry of the organization',
			},

			// Fields for Organization:Update operation
			{
				displayName: 'Organization ID',
				name: 'organizationId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'organization',
						],
						operation: [
							'update',
						],
					},
				},
				description: 'ID of the organization to update',
			},
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: [
							'organization',
						],
						operation: [
							'update',
						],
					},
				},
				options: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'New name of the organization',
					},
				],
			},

			// Fields for Organization:Delete operation
			{
				displayName: 'Organization ID',
				name: 'organizationId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'organization',
						],
						operation: [
							'delete',
						],
					},
				},
				description: 'ID of the organization to delete',
			},

			// Fields for User:Invite Member operation
			{
				displayName: 'Organization ID',
				name: 'organizationId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'user',
						],
						operation: [
							'inviteMember',
						],
					},
				},
				description: 'ID of the organization to invite member to',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'user',
						],
						operation: [
							'inviteMember',
						],
					},
				},
				description: 'Email of the user to invite',
			},
			{
				displayName: 'Role',
				name: 'roleName',
				type: 'options',
				options: [
					{
						name: 'Admin',
						value: 'admin',
					},
					{
						name: 'Member',
						value: 'member',
					},
					{
						name: 'Guest',
						value: 'guest',
					},
				],
				default: 'member',
				displayOptions: {
					show: {
						resource: [
							'user',
						],
						operation: [
							'inviteMember',
						],
					},
				},
				description: 'Role of the user in the organization',
			},

			// Fields for Pipe:Get operation
			{
				displayName: 'Pipe ID',
				name: 'pipeId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'pipe',
						],
						operation: [
							'get',
						],
					},
				},
				description: 'ID of the pipe to get',
			},

			// Fields for Pipe:Create operation
			{
				displayName: 'Organization ID',
				name: 'organizationId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'pipe',
						],
						operation: [
							'create',
						],
					},
				},
				description: 'ID of the organization to create pipe in',
			},

			// Fields for Phase:Get operation
			{
				displayName: 'Phase ID',
				name: 'phaseId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'phase',
						],
						operation: [
							'get',
						],
					},
				},
				description: 'ID of the phase to get',
			},

			// Fields for Phase:Create operation
			{
				displayName: 'Pipe ID',
				name: 'pipeId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'phase',
						],
						operation: [
							'create',
						],
					},
				},
				description: 'ID of the pipe to create phase in',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'phase',
						],
						operation: [
							'create',
						],
					},
				},
				description: 'Name of the phase to create',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: [
							'phase',
						],
						operation: [
							'create',
						],
					},
				},
				description: 'Description of the phase',
			},

			// Fields for Phase:Update operation
			{
				displayName: 'Phase ID',
				name: 'phaseId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'phase',
						],
						operation: [
							'update',
						],
					},
				},
				description: 'ID of the phase to update',
			},
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: [
							'phase',
						],
						operation: [
							'update',
						],
					},
				},
				options: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'New name of the phase',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'New description of the phase',
					},
				],
			},

			// Fields for Phase:Delete operation
			{
				displayName: 'Phase ID',
				name: 'phaseId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'phase',
						],
						operation: [
							'delete',
						],
					},
				},
				description: 'ID of the phase to delete',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'pipe',
						],
						operation: [
							'create',
						],
					},
				},
				description: 'Name of the pipe to create',
			},

			// Fields for Card:Get operation
			{
				displayName: 'Card ID',
				name: 'cardId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'card',
						],
						operation: [
							'get',
						],
					},
				},
				description: 'ID of the card to get',
			},

			// Fields for Card:Move to Phase operation
			{
				displayName: 'Card ID',
				name: 'cardId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'card',
						],
						operation: [
							'moveToPhase',
						],
					},
				},
				description: 'ID of the card to move',
			},
			{
				displayName: 'Destination Phase ID',
				name: 'destinationPhaseId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'card',
						],
						operation: [
							'moveToPhase',
						],
					},
				},
				description: 'ID of the phase to move the card to',
			},

			// Fields for Card:Create operation
			{
				displayName: 'Pipe ID',
				name: 'pipeId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'card',
						],
						operation: [
							'create',
						],
					},
				},
				description: 'Enter the ID of the Pipe where the card will be created.',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'card',
						],
						operation: [
							'create',
						],
					},
				},
				description: 'Title of the card to create',
			},
			{
				displayName: 'Fields',
				name: 'fieldsUi',
				placeholder: 'Add Field',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: [
							'card',
						],
						operation: [
							'create',
						],
					},
				},
				default: {},
				options: [
					{
						name: 'fieldValues',
						displayName: 'Field',
						values: [
							{
								displayName: 'Pipe Field',
								name: 'fieldId',
								type: 'options',
								default: '',
								required: true,
								description: 'Select the Pipefy field to set. Required fields are marked with *.',
								typeOptions: {
									loadOptionsMethod: 'getPipeFieldOptionsForSelect',
								},
							},
							{
								displayName: 'Field Value',
								name: 'fieldValue',
								type: 'string',
								default: '',
								description: 'Value to set for the field',
							},
						],
					},
				],
			},
			// Novo campo para exibir os campos do Pipe dinamicamente
			{
				displayName: 'Pipe Fields',
				name: 'pipeFields',
				type: 'collection',
				placeholder: 'Load Pipe Fields',
				default: {},
				displayOptions: {
					show: {
						resource: ['card'],
						operation: ['create'],
					},
				},
				typeOptions: {
					multipleValues: false, // Cada campo do pipe é uma entrada separada na UI
					loadOptionsMethod: 'getPipeFields',
					loadOptionsDependsOn: ['pipeId'],
				},
				// As 'options' aqui serão populadas dinamicamente por getPipeFields
				// Esta definição estática é apenas um placeholder ou pode ser omitida
				// se loadOptionsMethod sempre fornecer a estrutura completa.
				options: [
					{
						displayName: 'Field Name (Dynamically Loaded)',
						name: 'fieldName',
						type: 'string',
						default: '',
						description: 'This will be replaced by actual pipe fields.',
					},
				],
			},
		],
	};

	//###########################################################################
	//
	//      METHODS FOR LOADING OPTIONS START HERE
	//
	//###########################################################################

	async getPipes(this: IExecuteFunctions): Promise<INodePropertyOptions[]> {
		const returnData: INodePropertyOptions[] = [];
		const query = `
			query {
				me {
					organizations {
						edges {
							node {
								id
								name
								pipes {
									id
									name
								}
							}
						}
					}
				}
			}
		`;

		const options: OptionsWithUri = {
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
			body: {
				query,
			},
			uri: 'https://api.pipefy.com/graphql', // Assumindo endpoint GraphQL padrão
			json: true,
		};

		const credentials = await this.getCredentials('pipefyApi');
		// @ts-ignore
		const responseData = await this.helpers.requestPromise(options, {credentials}); // Passando credenciais se necessário

		if (responseData && responseData.data && responseData.data.me && responseData.data.me.organizations && responseData.data.me.organizations.edges) {
			responseData.data.me.organizations.edges.forEach((orgEdge: any) => {
				if (orgEdge.node && orgEdge.node.pipes) {
					orgEdge.node.pipes.forEach((pipe: { id: string; name: string }) => {
						returnData.push({
							name: `${pipe.name} (Org: ${orgEdge.node.name})`,
							value: pipe.id,
						});
					});
				}
			});
		}

		// Ordenar para melhor UX
		returnData.sort((a, b) => {
			if (a.name < b.name) {
				return -1;
			}
			if (a.name > b.name) {
				return 1;
			}
			return 0;
		});

		return returnData;
	}

	async getPipeFields(this: IExecuteFunctions): Promise<INodeProperties[]> {
		const pipeId = this.getNodeParameter('pipeId', 0, '') as string;
		if (!pipeId) {
			// Não há pipeId selecionado, retorna um campo placeholder ou vazio
			return [
				{
					displayName: 'Select a Pipe first to see its fields',
					name: 'placeholderInfo',
					type: 'notice',
					default: '',
				},
			];
		}

		const returnProperties: INodeProperties[] = [];
		const query = `
			query {
				pipe(id: "${pipeId}") {
					fields {
						id
						label
						type
						required
						description
						options // Para campos como select, radio, checkbox
						help
					}
				}
			}
		`;

		const requestOptions: OptionsWithUri = {
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
			body: {
				query,
			},
			uri: 'https://api.pipefy.com/graphql',
			json: true,
		};

		const credentials = await this.getCredentials('pipefyApi');
		// @ts-ignore (helpers pode não ter tipagem completa para requestPromise com options extras)
		const responseData = await this.helpers.requestPromise(requestOptions, { credentials });

		if (responseData && responseData.data && responseData.data.pipe && responseData.data.pipe.fields) {
			const fields = responseData.data.pipe.fields;

			for (const field of fields) {
				const fieldProperty: INodeProperties = {
					displayName: field.required ? `${field.label} *` : field.label,
					name: field.id, // Usar o ID do campo como 'name' para fácil mapeamento
					default: '',
					description: field.description || field.help || '',
					required: field.required,
					type: 'string', // Tipo padrão, será ajustado abaixo
				};

				// Mapear tipos de campo do Pipefy para tipos de campo do n8n
				// Esta é uma lista de exemplo, pode precisar de mais tipos
				switch (field.type) {
					case 'short_text':
					case 'long_text':
					case 'email':
					case 'phone':
					case 'url':
						fieldProperty.type = 'string';
						break;
					case 'number':
					case 'currency':
						fieldProperty.type = 'number';
						break;
					case 'select':
					case 'radio_vertical':
					case 'radio_horizontal':
						fieldProperty.type = 'options';
						fieldProperty.options = field.options ? field.options.map((opt: string) => ({ name: opt, value: opt })) : [];
						break;
					case 'checkbox_vertical':
					case 'checkbox_horizontal':
						// Para múltiplos checkboxes, n8n pode usar uma coleção ou múltiplas booleans.
						// Por simplicidade, vamos tratar como uma string de valores separados por vírgula ou boolean se for único.
						// Uma melhoria seria criar múltiplos campos booleanos ou uma multi-select list.
						if (field.options && field.options.length > 1) {
							fieldProperty.type = 'string';
							fieldProperty.description = `${fieldProperty.description} (Provide comma-separated values from: ${field.options.join(', ')})`;
						} else if (field.options && field.options.length === 1) {
							fieldProperty.type = 'boolean';
							fieldProperty.displayName = field.required ? `${field.options[0]} *` : field.options[0]; // Usa a opção como nome
							fieldProperty.default = false;
						} else {
							fieldProperty.type = 'boolean'; // Checkbox único sem opções especificadas? Default para boolean.
							fieldProperty.default = false;
						}
						break;
					case 'date':
					case 'datetime':
						fieldProperty.type = 'dateTime';
						break;
					case 'time':
						fieldProperty.type = 'string'; // n8n não tem um tipo 'time' específico, usar string com placeholder
						fieldProperty.placeholder = 'HH:MM:SS';
						break;
					case 'assignee_select':
					case 'member_select': // Pode precisar carregar usuários/membros como opções
						fieldProperty.type = 'string'; // Placeholder, idealmente seria um options carregado dinamicamente
						fieldProperty.description = `${fieldProperty.description} (Enter User/Assignee ID(s))`;
						break;
					// Adicionar mais mapeamentos conforme necessário (attachment, etc.)
					default:
						fieldProperty.type = 'string';
				}
				returnProperties.push(fieldProperty);
			}
		} else {
			// Erro ao buscar campos ou nenhum campo encontrado
			returnProperties.push({
				displayName: 'Error or No Fields Found',
				name: 'errorInfo',
					type: 'notice',
					default: 'Could not load fields for the selected pipe. Check pipeId or API response.',
			});
		}

		return returnProperties;
	}

	async getPipeFieldOptionsForSelect(this: IExecuteFunctions): Promise<INodePropertyOptions[]> {
		const pipeId = this.getNodeParameter('pipeId', 0, '') as string;
		const options: INodePropertyOptions[] = [];

		if (!pipeId) {
			// Retorna uma opção placeholder se nenhum pipeId estiver selecionado
			// Isso pode não ser ideal aqui, pois o campo só aparecerá se um pipeId estiver selecionado
			// mas é uma salvaguarda.
			options.push({ name: 'Select a Pipe ID first', value: '' });
			return options;
		}

		const query = `
			query {
				pipe(id: "${pipeId}") {
					fields {
						id
						label
						required
					}
				}
			}
		`;

		const requestOptions: OptionsWithUri = {
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
			body: {
				query,
			},
			uri: 'https://api.pipefy.com/graphql',
			json: true,
		};

		const credentials = await this.getCredentials('pipefyApi');
		// @ts-ignore
		const responseData = await this.helpers.requestPromise(requestOptions, { credentials });

		if (responseData && responseData.data && responseData.data.pipe && responseData.data.pipe.fields) {
			const fields = responseData.data.pipe.fields;
			for (const field of fields) {
				options.push({
					name: field.required ? `${field.label} *` : field.label,
					value: field.id,
				});
			}
		} else {
			options.push({ name: 'Could not load fields or no fields found', value: '_error' });
		}

		// Ordenar para melhor UX
		options.sort((a, b) => {
			if (a.name < b.name) return -1;
			if (a.name > b.name) return 1;
			return 0;
		});

		return options;
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		let responseData;

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Get credentials for the API
		const credentials = await this.getCredentials('pipefyApi') as IDataObject;

		// Loop through all input items and process them
		for (let i = 0; i < length; i++) {
			try {
				let query = '';

				// Logic for different resources and operations
				if (resource === 'organization') {
					// Organization operations
					if (operation === 'get') {
						const organizationId = this.getNodeParameter('organizationId', i) as string;
						
						query = `
							query {
								organization(id: ${organizationId}) {
									id
									name
									pipes {
										id
										name
									}
									tables {
										edges {
											node {
												id
												name
											}
										}
									}
									members {
										role_name
										user {
											id
											name
											email
										}
									}
								}
							}
						`;
					} else if (operation === 'getMany') {
						query = `
							query {
								organizations {
									id
									name
								}
							}
						`;
					} else if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const industry = this.getNodeParameter('industry', i) as string;
						
						query = `
							mutation {
								createOrganization(input: {
									name: "${name}",
									industry: "${industry}"
								})
							}
						`;
					} else if (operation === 'update') {
						const organizationId = this.getNodeParameter('organizationId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
						
						query = `
							mutation {
								updateOrganization(input: {
									id: ${organizationId},
									name: "${updateFields.name || ''}"
								})
							}
						`;
					} else if (operation === 'delete') {
						const organizationId = this.getNodeParameter('organizationId', i) as string;
						
						query = `
							mutation {
								deleteOrganization(input: {
									id: ${organizationId}
								})
							}
						`;
					}
				} else if (resource === 'user') {
					// User operations
					if (operation === 'getMe') {
						query = `
							query {
								me {
									id
									name
									email
									username
								}
							}
						`;
					} else if (operation === 'inviteMember') {
						const organizationId = this.getNodeParameter('organizationId', i) as string;
						const email = this.getNodeParameter('email', i) as string;
						const roleName = this.getNodeParameter('roleName', i) as string;
						
						query = `
							mutation {
								inviteMembers(input: {
									organization_id: ${organizationId},
									emails: [{email: "${email}", role_name: "${roleName}"}]
								}) {
									clientMutationId
								}
							}
						`;
					}
				} else if (resource === 'pipe') {
					// Pipe operations
					if (operation === 'get') {
						const pipeId = this.getNodeParameter('pipeId', i) as string;
						
						query = `
							query {
								pipe(id: ${pipeId}) {
									id
									name
									color
									users_count
									cards_count
									organization {
										id
										name
									}
									phases {
										id
										name
									}
									start_form_fields {
										id
										label
									}
								}
							}
						`;
					} else if (operation === 'create') {
						const organizationId = this.getNodeParameter('organizationId', i) as string;
						const name = this.getNodeParameter('name', i) as string;
						
						query = `
							mutation {
								createPipe(input: {
									name: "${name}",
									organization_id: ${organizationId}
								}) {
									clientMutationId
								}
							}
						`;
					}
				} else if (resource === 'phase') {
					// Phase operations
					if (operation === 'get') {
						const phaseId = this.getNodeParameter('phaseId', i) as string;
						
						query = `
							query {
								phase(id: ${phaseId}) {
									id
									name
									description
									fields {
										id
										label
										type
									}
									phase_field_conditions {
										id
										field {
											id
											label
										}
									}
									cards_count
								}
							}
						`;
					} else if (operation === 'create') {
						const pipeId = this.getNodeParameter('pipeId', i) as string;
						const name = this.getNodeParameter('name', i) as string;
						const description = this.getNodeParameter('description', i) as string;
						
						query = `
							mutation {
								createPhase(input: {
									pipe_id: ${pipeId},
									name: "${name}",
									description: "${description}"
								}) {
									phase {
										id
										name
									}
								}
							}
						`;
					} else if (operation === 'update') {
						const phaseId = this.getNodeParameter('phaseId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
						
						query = `
							mutation {
								updatePhase(input: {
									id: ${phaseId},
									${updateFields.name ? `name: "${updateFields.name}"` : ''}
									${updateFields.description ? `description: "${updateFields.description}"` : ''}
								}) {
									phase {
										id
										name
										description
									}
								}
							}
						`;
					} else if (operation === 'delete') {
						const phaseId = this.getNodeParameter('phaseId', i) as string;
						
						query = `
							mutation {
								deletePhase(input: {
									id: ${phaseId}
								}) {
									success
								}
							}
						`;
					}
				} else if (resource === 'card') {
					// Card operations
					if (operation === 'get') {
						const cardId = this.getNodeParameter('cardId', i) as string;
						
						query = `
							query {
								card(id: ${cardId}) {
									id
									title
									url
									createdAt
									due_date
									current_phase {
										id
										name
									}
									assignees {
										id
										username
									}
									labels {
										id
										name
									}
								}
							}
						`;
					} else if (operation === 'create') {
						const pipeId = this.getNodeParameter('pipeId', i) as string;
						const title = this.getNodeParameter('title', i) as string;
						const dynamicPipeFields = this.getNodeParameter('pipeFields', i, {}) as IDataObject; // Obter os campos dinâmicos

						let fieldsAttributesArray: string[] = [];

						// Processar os campos dinâmicos de pipeFields
						if (dynamicPipeFields && Object.keys(dynamicPipeFields).length > 0) {
							for (const fieldId in dynamicPipeFields) {
								if (Object.prototype.hasOwnProperty.call(dynamicPipeFields, fieldId)) {
									const fieldValue = dynamicPipeFields[fieldId];
									// Certifique-se de que o valor é uma string e escapa aspas duplas se necessário para GraphQL
									const formattedValue = typeof fieldValue === 'string' ? fieldValue.replace(/"/g, '\\"') : fieldValue;
									// Lógica para formatar diferentes tipos de valor (ex: array para checklist)
									// Por agora, vamos assumir que são strings ou números que podem ser colocados diretamente
									if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') { // Apenas incluir campos com valor
										// Se o valor for um array (ex: para campos de múltipla escolha ou checklist do Pipefy),
										// formate-o como um array de strings JSON.
										if (Array.isArray(fieldValue)) {
											const arrayValues = fieldValue.map(val => `"${String(val).replace(/"/g, '\\"' )}"`).join(', ');
											fieldsAttributesArray.push(`{field_id: "${fieldId}", value: [${arrayValues}]}`);
										} else {
											fieldsAttributesArray.push(`{field_id: "${fieldId}", value: "${formattedValue}"}`);
										}
									}
								}
							}
						} else {
							// Fallback para fieldsUi se pipeFields estiver vazio (manter lógica original como exemplo)
							const fieldsUi = this.getNodeParameter('fieldsUi', i, {}) as IDataObject;
							if (fieldsUi && fieldsUi.fieldValues && (fieldsUi.fieldValues as IDataObject[]).length > 0) {
								fieldsAttributesArray = (fieldsUi.fieldValues as IDataObject[]).map(fv => {
									const formattedValue = typeof fv.fieldValue === 'string' ? fv.fieldValue.replace(/"/g, '\\"') : fv.fieldValue;
									// Adicionar checagem para valor não ser vazio/nulo/undefined
									if (fv.fieldValue !== null && fv.fieldValue !== undefined && fv.fieldValue !== '') {
										return `{field_id: "${fv.fieldId}", value: "${formattedValue}"}`;
									}
									return null; // Ignorar campos sem valor
								}).filter(fv => fv !== null) as string[];
							}
						}

						const fieldsAttributesString = fieldsAttributesArray.length > 0 ? `fields_attributes: [${fieldsAttributesArray.join(', ')}]` : '';

						query = `
							mutation {
								createCard(input: {
									pipe_id: "${pipeId}",
									title: "${title}",
									${fieldsAttributesString}
								}) {
									card {
										id
										title
										url
									}
								}
							}
						`;
					} else if (operation === 'update') {
						const cardId = this.getNodeParameter('cardId', i) as string;
						const fieldsToUpdate = this.getNodeParameter('updateFields', i, {}) as IDataObject;

						let inputArguments = `id: "${cardId}"`;

						// Iterar sobre os campos fornecidos em updateFields e adicioná-los à query
						// Exemplo: title, dueDate. Adicionar outros conforme definido nas propriedades do nó.
						if (fieldsToUpdate.title !== undefined) {
							inputArguments += `, title: "${String(fieldsToUpdate.title).replace(/"/g, '\\"' )}"`;
						}
						if (fieldsToUpdate.dueDate !== undefined) {
							inputArguments += `, due_date: "${String(fieldsToUpdate.dueDate).replace(/"/g, '\\"' )}"`;
						}
						// Adicione aqui outros campos que a operação 'updateCard' suporta,
						// conforme as 'options' da propriedade 'updateFields' para esta operação.
						// Por exemplo, se houver um campo 'description' em 'updateFields':
						// if (fieldsToUpdate.description !== undefined) {
						// 	inputArguments += `, description: "${String(fieldsToUpdate.description).replace(/"/g, '\\"' )}"`;
						// }

						query = `
							mutation {
								updateCard(input: {${inputArguments}}) {
									card {
										id
										title
										url
										// Adicionar outros campos do card que você quer retornar
									}
								}
							}
						`;
					} else if (operation === 'updateField') {
						const cardId = this.getNodeParameter('cardId', i) as string;
						const fieldId = this.getNodeParameter('fieldId', i) as string;
						const fieldValue = this.getNodeParameter('fieldValue', i) as string;
						
						query = `
							mutation {
								updateCard(input: {
									id: ${cardId},
									${fieldId ? `fields_attributes: [{field_id: "${fieldId}", value: "${fieldValue}"}]` : ''}
								}) {
									card {
										id
										title
										url
									}
								}
							}
						`;
					} else if (operation === 'moveToPhase') {
						const cardId = this.getNodeParameter('cardId', i) as string;
						const destinationPhaseId = this.getNodeParameter('destinationPhaseId', i) as string;
						
						query = `
							mutation {
								moveCardToPhase(input: {
									card_id: ${cardId},
									destination_phase_id: ${destinationPhaseId}
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
						`;
					}
				}

				// Prepare request options
				const requestOptions: OptionsWithUri = {
					method: 'POST',
					uri: 'https://api.pipefy.com/graphql',
					headers: {
						'Authorization': `Bearer ${credentials.accessToken}`,
						'Content-Type': 'application/json',
					},
					body: {
						query,
					},
					json: true,
				};

				responseData = await this.helpers.request(requestOptions);

				// If the result has errors return them
				if (responseData.errors) {
					throw new NodeOperationError(this.getNode(), responseData.errors[0].message, {
						itemIndex: i,
					});
				}

				// Return data
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData.data),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: error.message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw error;
			}
		}

		return this.prepareOutputData(returnData);
	}
}

interface IDataObject {
	[key: string]: any;
}

