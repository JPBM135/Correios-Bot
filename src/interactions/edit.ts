import { ApplicationCommandOptionType } from 'discord.js';

export const EditCommand = {
	name: 'editar',
	description: 'Edita um código de rastreio.',
	options: [
		{
			name: 'codigo',
			description: 'O código de rastreio.',
			type: ApplicationCommandOptionType.String,
			required: true,
			autocomplete: true,
		},
		{
			name: 'novo_nome',
			description: 'O novo nome do código de rastreio.',
			type: ApplicationCommandOptionType.String,
		},
		{
			name: 'restringir',
			description: 'Se o código de rastreio é restrito para apenas você. (Padrão: falso)',
			type: ApplicationCommandOptionType.Boolean,
		},
	],
};
