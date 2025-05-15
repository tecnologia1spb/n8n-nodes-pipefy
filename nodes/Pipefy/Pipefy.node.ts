import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
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
						name: 'Card',
						value: 'card',
					},
				],
				default: 'card',
				description: 'Resource do Pipefy para acessar',
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
						name: 'Create',
						value: 'create',
						description: 'Criar um novo card',
					},
				],
				default: 'create',
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
				description: 'ID do Pipe onde o cartão será criado. Entre com o ID numérico do pipe (ex: 301397126)',
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
				description: 'Título do cartão a ser criado',
			},
			{
				displayName: 'Card Fields',
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
								displayName: 'Field ID',
								name: 'fieldId',
								type: 'string',
								default: '',
								required: true,
								description: 'ID do campo no Pipefy (ex: email, phone, nome)',
							},
							{
								displayName: 'Field Value',
								name: 'fieldValue',
								type: 'string',
								default: '',
								description: 'Valor para o campo',
							},
						],
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		let responseData;

		// Get credentials for the API
		const credentials = await this.getCredentials('pipefyApi') as IDataObject;

		// Loop through all input items and process them
		for (let i = 0; i < length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				
				// Process only card creation in this simplified version
				if (resource === 'card' && operation === 'create') {
					const pipeId = this.getNodeParameter('pipeId', i) as string;
					const title = this.getNodeParameter('title', i) as string;
					const fieldsUi = this.getNodeParameter('fieldsUi', i, {}) as IDataObject;
					
					// Prepare fields_attributes array
					const fieldsAttributesArray: string[] = [];
					
					if (fieldsUi && fieldsUi.fieldValues && (fieldsUi.fieldValues as IDataObject[]).length > 0) {
						fieldsAttributesArray.push(...(fieldsUi.fieldValues as IDataObject[])
							.filter(field => field.fieldId && field.fieldValue)
							.map(field => {
								const fieldId = field.fieldId as string;
								const fieldValue = field.fieldValue as string;
								return `{field_id: "${fieldId}", field_value: "${fieldValue.replace(/"/g, '\\"')}"}`;
							}));
					}
					
					// Build the mutation with only essential fields
					const fieldsAttributesInput = fieldsAttributesArray.length > 0 
						? `fields_attributes: [${fieldsAttributesArray.join(', ')}]` 
						: '';
					
					const query = `
						mutation {
							createCard(input: {
								pipe_id: "${pipeId}",
								title: "${title.replace(/"/g, '\\"')}"
								${fieldsAttributesInput ? `, ${fieldsAttributesInput}` : ''}
							}) {
								card {
									id
									title
									url
								}
							}
						}
					`;
					
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
				} else {
					throw new NodeOperationError(this.getNode(), `A operação ${operation} não está implementada nesta versão simplificada do nó.`);
				}
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

