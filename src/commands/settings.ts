import { logger } from '@yuudachi/framework';
import type { ArgumentsOf } from '@yuudachi/framework/types';
import type { ChatInputCommandInteraction } from 'discord.js';
import { Emojis } from '../constants.js';
import type { SettingsCommand } from '../interactions/settings.js';
import { getUser } from '../postgres/get.js';
import { updateUser } from '../postgres/update.js';

export async function handleSettings(
	interaction: ChatInputCommandInteraction,
	args: ArgumentsOf<typeof SettingsCommand>,
) {
	await interaction.deferReply({ ephemeral: true });

	const userConfig = await getUser(interaction.user.id);

	switch (Object.keys(args)[0]) {
		case 'permitir_dm':
			await updateUser(interaction.user.id, {
				allow_dm: !userConfig.allow_dm,
			});

			return interaction.editReply({
				content: `${Emojis.success} | Mensagens diretas ${userConfig.allow_dm ? 'des' : ''}ativadas.`,
			});
		case 'sempre_restrito':
			await updateUser(interaction.user.id, {
				always_restrict: !userConfig.always_restrict,
			});

			return interaction.editReply({
				content: `${Emojis.success} | Modo restrito ${userConfig.always_restrict ? 'des' : ''}ativado.`,
			});
		default:
			logger.warn('Invalid subcommand');
			return undefined;
	}
}
