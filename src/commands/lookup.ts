import { createMessageActionRow } from '@yuudachi/framework';
import type { ArgumentsOf } from '@yuudachi/framework/types';
import type { APIButtonComponentWithCustomId, ChatInputCommandInteraction } from 'discord.js';
import { ComponentType, ButtonStyle } from 'discord.js';
import { Emojis } from '../constants.js';
import type { RastreioCorreios } from '../correios/fetch.js';
import { fetchCorreios } from '../correios/fetch.js';
import type { LookupCommand } from '../interactions/lookup.js';
import { getCode } from '../postgres/get.js';
import { typeSafeParseEmoji } from '../utils/parseEmoji.js';
import { validateCorreiosCode } from '../utils/validadeCode.js';
import { isCodeDelivered } from '../utils/isDelivered.js';
import { generateCorreiosMessage } from '../utils/formatCorreios/generateMessage.js';

export async function handleLookup(interaction: ChatInputCommandInteraction, args: ArgumentsOf<typeof LookupCommand>) {
	const [code, hide] = [args.codigo, args.esconder ?? false];

	await interaction.deferReply({
		ephemeral: hide,
	});

	if (!validateCorreiosCode(code)) {
		return interaction.editReply({
			content: [
				`${Emojis.warning} | **Código inválido.**`,
				'',
				`> Os codigos de rastreio seguem o padrão: \`LL000000000LL\` onde \`L\` é uma letra e \`0\` é um número.`,
			].join('\n'),
		});
	}

	const codeConfig = await getCode(code);

	if (code && codeConfig?.restricted && codeConfig.owner_id !== interaction.user.id) {
		return interaction.editReply(`${Emojis.error} | Esse código foi cadastrado como restrito.`);
	}

	const correios = await fetchCorreios(code);

	if (correios.statusCode === 404) {
		return interaction.editReply(`${Emojis.error} | Código não encontrado, tente novamente mais tarde.`);
	}

	if (!correios.success) {
		return interaction.editReply(
			`${Emojis.error} | Houve um erro ao buscar o código: \`${correios.statusCode}\` - \`Desconhecido\``,
		);
	}

	const isDelivered = isCodeDelivered(correios);

	const refreshButton: APIButtonComponentWithCustomId = {
		label: isCodeDelivered(correios) ? 'Entregue' : 'Atualizar',
		type: ComponentType.Button,
		custom_id: `REFRESH::${code}`,
		style: ButtonStyle.Secondary,
		disabled: isDelivered,
		emoji: typeSafeParseEmoji(isDelivered ? Emojis.success : Emojis.refresh),
	};

	return interaction.editReply({
		embeds: generateCorreiosMessage({ ...(correios as RastreioCorreios<true>), name: codeConfig?.name }),
		components: [createMessageActionRow([refreshButton])],
	});
}
