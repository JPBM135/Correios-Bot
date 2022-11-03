import { ApplicationCommandOptionType } from 'discord.js';

export const SettingsCommand = {
	name: 'configurar',
	description: 'Configura o bot.',
	options: [
		{
			name: 'permitir_dm',
			description: 'Permite que o bot envie mensagens diretamente para você. (Padrão: true)',
			type: ApplicationCommandOptionType.Subcommand,
		},
		{
			name: 'sempre_restrito',
			description: 'Se o bot sempre deve criar códigos de rastreio restritos. (Padrão: falso)',
			type: ApplicationCommandOptionType.Subcommand,
		},
	],
} as const;
