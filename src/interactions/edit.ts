import { ApplicationCommandOptionType, ChannelType } from 'discord.js';

export const EditCommand = {
	name: 'editar',
	description: 'Edita um código de rastreio.',
	options: [
		{
			name: 'codigo',
			description: 'O código de rastreio.',
			type: ApplicationCommandOptionType.String,
			required: true,
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
		{
			name: 'canal_de_notificacao',
			description: 'O canal de notificação do código de rastreio.',
			type: ApplicationCommandOptionType.Channel,
			channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread],
		},
	],
} as const;
