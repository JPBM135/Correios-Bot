import { ApplicationCommandOptionType } from 'discord.js';

export const DeleteCommand = {
	name: 'delete',
	description: 'Delete coisas',
	options: [
		{
			name: 'usuario-e-dados',
			description: 'Deleta um usuário e TODOS seus dados relacionados',
			type: ApplicationCommandOptionType.Subcommand,
		},
		{
			name: 'codigo',
			description: 'Deleta um código',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'codigo',
					description: 'O código a ser deletado',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
		},
	],
} as const;
