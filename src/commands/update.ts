import { removeUndefinedKeys } from '@yuudachi/framework';
import type { ArgumentsOf } from '@yuudachi/framework/types';
import type { ChatInputCommandInteraction } from 'discord.js';
import { Emojis } from '../constants.js';
import type { EditCommand } from '../interactions/edit.js';
import { getCode, type RawCorreiosCode } from '../postgres/get.js';
import { updateCode } from '../postgres/update.js';
import { validateCorreiosCode } from '../utils/validadeCode.js';

export async function handleUpdate(interaction: ChatInputCommandInteraction, args: ArgumentsOf<typeof EditCommand>) {
	await interaction.deferReply({ ephemeral: true });

	const { codigo } = args;

	if (!validateCorreiosCode(codigo)) {
		return interaction.editReply({
			content: [
				`${Emojis.warning} | **Código inválido.**`,
				'',
				`> Os codigos de rastreio seguem o padrão: \`LL000000000LL\` onde \`L\` é uma letra e \`0\` é um número.`,
			].join('\n'),
		});
	}

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

	const patches: Partial<RawCorreiosCode> = {
		channel_id: args.canal_de_notificacao?.id ?? undefined,
		name: args.novo_nome ?? undefined,
		restricted: args.restringir ?? undefined,
	};

	const updateSize = Object.keys(removeUndefinedKeys(patches)).length;

	if (!updateSize) {
		return interaction.editReply({
			content: `${Emojis.error} | Você não passou nenhum valor para atualizar.`,
		});
	}

	const code = await updateCode(codigo, patches);

	return interaction.editReply({
		content: [
			`${Emojis.success} | Código atualizado com sucesso.`,
			patches.channel_id
				? `${updateSize > 1 ? Emojis.curvaReta : Emojis.curva} | Canal de notificação: <#${code.channel_id}>`
				: null,
			patches.name ? `${updateSize > 2 ? Emojis.curvaReta : Emojis.curva} | Nome: ${code.name}` : null,
			patches.restricted ? `${Emojis.curva} | Restringido: ${code.restricted ? 'Sim' : 'Não'}` : null,
		]
			.filter(Boolean)
			.join('\n'),
	});
}
