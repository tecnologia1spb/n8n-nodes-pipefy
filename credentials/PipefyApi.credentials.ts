import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PipefyApi implements ICredentialType {
	name = 'pipefyApi';
	displayName = 'Pipefy API';
	documentationUrl = 'https://developers.pipefy.com/reference/authentication';
	properties: INodeProperties[] = [
		{
			displayName: 'Personal Access Token',
			name: 'accessToken',
			type: 'string',
			default: '',
			required: true,
			typeOptions: {
				password: true,
			},
		},
	];
}
