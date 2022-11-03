import { ApplicationCommandOptionType } from 'discord.js';

export const LookupCommand = {
	name: 'rastrear',
	description: 'Rastreia um código de rastreio.',
	options: [
		{
			name: 'codigo',
			description: 'O código de rastreio.',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: 'esconder',
			description: 'Esconde a mensagem de rastreio. (Padrão: falso)',
			type: ApplicationCommandOptionType.Boolean,
		},
	],
} as const;
