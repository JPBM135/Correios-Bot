import type { ArgumentsOf } from '@yuudachi/framework/types';
import type { ChatInputCommandInteraction } from 'discord.js';
import { Emojis } from '../constants.js';
import { fetchCorreios } from '../correios/fetch.js';
import type { RegisterCommand } from '../interactions/create.js';
import { createCode } from '../postgres/create.js';
import { getCode, getUser } from '../postgres/get.js';
import { isCodeDelivered } from '../utils/isDelivered.js';
import { validateCorreiosCode } from '../utils/validadeCode.js';

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

	if (!validateCorreiosCode(codigo)) {
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

	if (correios.statusCode === 404 || !correios.eventos?.length) {
		return interaction.editReply(`${Emojis.error} | Código não encontrado, tente novamente mais tarde.`);
	}

	if (!correios.success) {
		return interaction.editReply(
			`${Emojis.error} | Houve um erro ao buscar o código: \`${correios.statusCode}\` - \`Desconhecido\``,
		);
	}

	const isEnded = isCodeDelivered(correios);

	const created = await createCode(codigo, interaction.user.id, interaction.channelId, name, restricted, isEnded);

	return interaction.editReply({
		embeds: [
			{
				description: [
					`${Emojis.success} | Código cadastrado com sucesso.`,
					`${Emojis.curvaReta} Código: \`${created.code}\``,
					`${Emojis.curvaReta} Nome: \`${created.name ?? 'Nenhum'}\``,
					`${Emojis.curvaReta} Restrito: \`${created.restricted ? 'Sim' : 'Não'}\``,
					`${Emojis.curvaReta} Canal vinculado: \`${created.channel_id ? `<#${created.channel_id}>` : 'Nenhum'}\``,
					`${Emojis.curva} Entregue: \`${isEnded ? 'Sim' : 'Não'}\``,
				].join('\n'),
			},
		],
	});
}
