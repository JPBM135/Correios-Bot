import { createMessageActionRow, logger } from '@yuudachi/framework';
import type { ArgumentsOf } from '@yuudachi/framework/types';
import type { APIButtonComponentWithCustomId, APIEmbed, ChatInputCommandInteraction } from 'discord.js';
import { ButtonStyle, ComponentType } from 'discord.js';
import { Emojis } from '../constants.js';
import type { DeleteCommand } from '../interactions/delete.js';
import { deleteCode, deleteUser } from '../postgres/delete.js';
import { getCode } from '../postgres/get.js';
import { generateCustomId } from '../utils/genCustomId.js';
import { typeSafeParseEmoji } from '../utils/parseEmoji.js';
import { validateCode } from '../utils/validadeCode.js';

export async function handleDelete(interaction: ChatInputCommandInteraction, args: ArgumentsOf<typeof DeleteCommand>) {
	switch (Object.keys(args)[0]) {
		case 'usuario-e-dados':
			await handleUser(interaction);
			break;
		case 'codigo':
			await handleCode(interaction, args.codigo);
			break;
		default:
			logger.warn('Invalid subcommand');
			break;
	}
}

async function handleUser(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: true });

	const embed: APIEmbed = {
		description: [
			`${Emojis.warning} | Você tem certeza que deseja deletar seu usuário e todos os dados relacionados?`,
			`${Emojis.curvaReta} Isso vai deletar todos os codigos que você tem cadastrados.`,
			`${Emojis.curva} **Esta ação não pode ser desfeita!**`,
		].join('\n'),
	};
	const [confirm, cancel] = [generateCustomId(), generateCustomId()];

	const confirmButton: APIButtonComponentWithCustomId = {
		type: ComponentType.Button,
		label: 'Apagar',
		style: ButtonStyle.Danger,
		custom_id: confirm,
		emoji: typeSafeParseEmoji(Emojis.error),
	};

	const cancelButton: APIButtonComponentWithCustomId = {
		type: ComponentType.Button,
		label: 'Cancelar',
		style: ButtonStyle.Secondary,
		custom_id: cancel,
		emoji: typeSafeParseEmoji(Emojis.success),
	};

	const response = await interaction.editReply({
		embeds: [embed],
		components: [createMessageActionRow([confirmButton, cancelButton])],
	});

	const collector = response.createMessageComponentCollector({
		componentType: ComponentType.Button,
		max: 1,
		filter: (int) => int.user.id === interaction.user.id,
		time: 1_000 * 15,
	});

	collector.on('collect', async (collectedInteraction) => {
		if (collectedInteraction.customId === cancel) {
			await collectedInteraction.update({
				embeds: [
					{
						description: `${Emojis.success} | Ação cancelada com sucesso.`,
					},
				],
				components: [],
			});
		} else if (collectedInteraction.customId === confirm) {
			await collectedInteraction.deferUpdate();

			const codes = await deleteUser(interaction.user.id);

			await collectedInteraction.editReply({
				embeds: [
					{
						description: `${Emojis.success} | Usuário deletado com sucesso, deletei ${codes} códigos associados a sua conta.`,
					},
				],
				components: [],
			});
		}
	});

	collector.on('end', async (collectedInteractions) => {
		if (collectedInteractions.size) return;

		await interaction.editReply({
			content: `${Emojis.error} | Você não respondeu a tempo.`,
			embeds: [],
			components: [],
		});
	});
}

async function handleCode(interaction: ChatInputCommandInteraction, args: ArgumentsOf<typeof DeleteCommand>['codigo']) {
	const { codigo } = args;

	if (!validateCode(codigo)) {
		return interaction.editReply({
			content: [
				`${Emojis.warning} | **Código inválido.**`,
				'',
				`> Os codigos de rastreio seguem o padrão: \`LL000000000LL\` onde \`L\` é uma letra e \`0\` é um número.`,
			].join('\n'),
		});
	}

	await interaction.deferReply({ ephemeral: true });

	const codeConfig = await getCode(codigo);

	if (!codeConfig) {
		return interaction.editReply({
			content: `${Emojis.error} | Não encontrei nenhum código.`,
		});
	}

	if (codeConfig.owner_id !== interaction.user.id) {
		return interaction.editReply({
			content: `${Emojis.error} | Você não é dono desse código.`,
		});
	}

	const code = await deleteCode(codigo);

	if (!code) {
		return interaction.editReply({
			content: `${Emojis.error} | Houve um erro ao deletar essa código.`,
		});
	}

	return interaction.editReply({
		content: `${Emojis.success} | Código deletado com sucesso.`,
	});
}
