import type { ArgumentsOf } from '@yuudachi/framework/types';
import type { ChatInputCommandInteraction } from 'discord.js';
import { Emojis } from '../constants.js';
import type { RastreioCorreios } from '../correios/fetch.js';
import { fetchCorreios } from '../correios/fetch.js';
import type { RegisterCommand } from '../interactions/create.js';
import { createCode } from '../postgres/create.js';
import { getCode, getUser } from '../postgres/get.js';
import { formatCorreios } from '../utils/correioFormat.js';
import { validateCode } from '../utils/validadeCode.js';

export async function handleCreate(
	interaction: ChatInputCommandInteraction,
	args: ArgumentsOf<typeof RegisterCommand>,
) {
	await interaction.deferReply({
		ephemeral: true,
	});

	const userConfig = await getUser(interaction.user.id);

	const { codigo } = args;
	const name = args.nome ?? null;
	const restricted = args.restrito ?? userConfig.always_restrict ?? false;

	if (!validateCode(codigo)) {
		return interaction.editReply({
			content: [
				`${Emojis.warning} | **Código inválido.**`,
				'',
				`> Os codigos de rastreio seguem o padrão: \`LL000000000LL\` onde \`L\` é uma letra e \`0\` é um número.`,
			].join('\n'),
		});
	}

	const code = await getCode(codigo);
	if (code) {
		return interaction.editReply(`${Emojis.error} | Código já cadastrado.`);
	}

	if (!userConfig.allow_dm && restricted) {
		return interaction.editReply(`${Emojis.error} | Você não pode cadastrar um código restrito se não permitir DMs.`);
	}

	const correios = await fetchCorreios(codigo);

	if (correios.statusCode === 404) {
		return interaction.editReply(`${Emojis.error} | Código não encontrado, tente novamente mais tarde.`);
	}

	if (!correios.success) {
		return interaction.editReply(
			`${Emojis.error} | Houve um erro ao buscar o código: \`${correios.statusCode}\` - \`${correios.message}\``,
		);
	}

	if ((correios as RastreioCorreios<true>).data.status === 'delivered') {
		return interaction.editReply({
			content: `${Emojis.success} | O código já foi entregue.`,
			embeds: formatCorreios(correios as RastreioCorreios<true>),
		});
	}

	const created = await createCode(codigo, interaction.user.id, interaction.channelId, name, restricted);

	return interaction.editReply({
		content: [
			`${Emojis.success} | Código cadastrado com sucesso.`,
			'',
			`> **Código:** \`${created.code}\``,
			`> **Nome:** \`${created.name ?? 'Nenhum'}\``,
			`> **Restrito:** \`${created.restricted ? 'Sim' : 'Não'}\``,
		].join('\n'),
	});
}
