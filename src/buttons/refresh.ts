import type { ButtonInteraction } from 'discord.js';
import { Emojis } from '../constants.js';
import { fetchCorreios } from '../correios/fetch.js';
import { getCode } from '../postgres/get.js';
import { formatCorreios } from '../utils/correioFormat.js';

export async function handleRefresh(interaction: ButtonInteraction) {
	const code = interaction.customId.split('::')[1]!;

	await interaction.deferUpdate();

	const data = await fetchCorreios(code);

	if (!data) {
		await interaction.followUp({
			content: `${Emojis.error} | Código não encontrado, tente novamente mais tarde.`,
			ephemeral: true,
		});

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

		await interaction.editReply({
			embeds: interaction.message.embeds,
		});
		return;
	}

	await interaction.editReply({ embeds: [formatCorreios({ ...data, name: codeData?.name })] });
}
