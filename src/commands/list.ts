import type { ArgumentsOf } from '@yuudachi/framework/types';
import { time, type ChatInputCommandInteraction, TimestampStyles, type MessageEditOptions } from 'discord.js';
import type { ListCommand } from '../interactions/list.js';
import { getCodesByUser } from '../postgres/get.js';
import { Emojis } from '../constants.js';
import { PaginationWrapper } from '../utils/pagination/wrapper.js';

const statusMap = {
	delivered: true,
	transit: false,
	all: null,
};

const PAGE_SIZE = 5;

async function generateListMessage(
	userId: string,
	args: ArgumentsOf<typeof ListCommand>,
	limit = PAGE_SIZE,
	offset = 0,
): Promise<MessageEditOptions> {
	const { count, results: codesByUser } = await getCodesByUser(userId, {
		ended: statusMap[args.status ?? 'transit'],
		limit,
		offset,
	});

	const codes = codesByUser.map((code) => {
		const data = [`${code.ended ? Emojis.success : Emojis.refresh} | \`${code.code}\` - ${code.name ?? 'Sem nome'}`];

		if (code.restricted) {
			data.push(`${Emojis.curvaReta} Acesso restrito`);
		}

		if (code.channel_id) {
			data.push(`${Emojis.curvaReta} Canal: <#${code.channel_id}>`);
		}

		const formattedDate = new Date(code.last_update);
		data.push(
			`${Emojis.curva} ${time(formattedDate, TimestampStyles.ShortDateTime)} (${time(
				formattedDate,
				TimestampStyles.RelativeTime,
			)})`,
		);

		return data.join('\n');
	});

	return {
		embeds: [
			{
				title: `${Emojis.fallback} | Códigos cadastrados (${codes.length + offset}/${count})`,
				description: codes.join('\n\n'),
			},
		],
	};
}

export async function handleList(interaction: ChatInputCommandInteraction, args: ArgumentsOf<typeof ListCommand>) {
	await interaction.deferReply({ ephemeral: true });

	const { count } = await getCodesByUser(interaction.user.id, {
		ended: statusMap[args.status ?? 'transit'],
	});

	if (!count) {
		const modifiers = {
			delivered: ' entregue',
			transit: ' em trânsito',
			all: '',
		};

		return interaction.editReply({
			embeds: [
				{
					description: `${Emojis.warning} | Você não possui nenhum código cadastrado${
						modifiers[args.status ?? 'transit']
					}.`,
				},
			],
		});
	}

	const message = await interaction.editReply({
		...(await generateListMessage(interaction.user.id, args)),
		components: count > PAGE_SIZE ? PaginationWrapper.DefaultPaginationComponents(Math.ceil(count / PAGE_SIZE)) : [],
	});

	const paginationHandler = new PaginationWrapper(message, interaction.user.id, {
		count,
		perPage: PAGE_SIZE,
	});

	paginationHandler.on('Change', async ({ interaction: buttonInteraction, page, components }) => {
		await buttonInteraction.update({
			...(await generateListMessage(interaction.user.id, args, PAGE_SIZE, (page - 1) * PAGE_SIZE)),
			components,
		});
	});

	return paginationHandler;
}
