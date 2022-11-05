import { ApplicationCommandOptionType } from 'discord.js';

export const RegisterCommand = {
	name: 'registrar',
	description: 'Inicia o rastremento de um código dos correios.',
	options: [
		{
			name: 'codigo',
			description: 'O código de rastreio.',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: 'nome',
			description: 'O nome do código de rastreio.',
			type: ApplicationCommandOptionType.String,
			required: false,
			min_length: 3,
		},
		{
			name: 'restrito',
			description: 'Se o código de rastreio é restrito para apenas você. (Padrão: falso)',
			type: ApplicationCommandOptionType.Boolean,
		},
	],
} as const;
