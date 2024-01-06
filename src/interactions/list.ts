import { ApplicationCommandOptionType } from 'discord.js';

export const ListCommand = {
	name: 'listar',
	description: 'Lista seus códigos',
	options: [
		{
			name: 'status',
			description: 'Filtra por status do código',
			type: ApplicationCommandOptionType.String,
			choices: [
				{
					name: 'Entregue',
					value: 'delivered',
				},
				{
					name: 'Em trânsito (Padrão)',
					value: 'transit',
				},
				{
					name: 'Todos',
					value: 'all',
				},
			],
		},
	],
} as const;
