import type { ButtonInteraction } from 'discord.js';
import { Emojis } from '../constants.js';
import type { RastreioCorreios } from '../correios/fetch.js';
import { fetchCorreios } from '../correios/fetch.js';
import { getCode } from '../postgres/get.js';
import { formatCorreios } from '../utils/correioFormat.js';

export async function handleRefresh(interaction: ButtonInteraction) {
	const code = interaction.customId.split('::')[1]!;

	await interaction.deferUpdate();

	const correios = await fetchCorreios(code);

	if (!correios.success) {
		if (correios.statusCode === 404) {
			return interaction.followUp({
				content: `${Emojis.error} | Código não encontrado, tente novamente mais tarde.`,
				ephemeral: true,
			});
		} else if (correios.statusCode !== 200) {
			return interaction.followUp({
				content: `${Emojis.error} | Houve um erro ao buscar o código: \`${correios.statusCode}\` - \`${correios.message}\``,
				ephemeral: true,
			});
		}

		await interaction.editReply({
			components: [],
			embeds: interaction.message.embeds,
		});
		return;
	}

	const codeData = await getCode(code);

	if (codeData?.restricted && interaction.user.id !== codeData.owner_id) {
		await interaction.followUp({
			content: `${Emojis.error} | Você não tem permissão para ver este código.`,
			ephemeral: true,
		});

		return interaction.editReply({
			embeds: interaction.message.embeds,
		});
	}

	return interaction.editReply({
		embeds: formatCorreios({ ...(correios as RastreioCorreios<true>), name: codeData?.name }),
	});
}
