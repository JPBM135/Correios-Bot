import type { APIEmbed } from 'discord.js';
import type { RastreioCorreios } from '../../correios/fetch.js';
import { isCodeDelivered } from '../isDelivered.js';
import { formatCorreiosEvent } from './formatEvent.js';
import { organizeEmbeds } from './organizeEmbeds.js';
import { Emojis } from '../../constants.js';
import { logger } from '@yuudachi/framework';

type FormatInput = RastreioCorreios<true> & { name?: string | null };

export function generateCorreiosMessage(data: FormatInput, update = false): APIEmbed[] {
	const name = data.name ?? null;
	const { codigo: code, eventos } = data;
	const title = `📦 | Rastreio de \`${code}\`${name ? `- ${name}` : ''}`;

	const isDelivered = isCodeDelivered(data);
	const orderedEvents = eventos?.reverse() ?? [];
	const formattedEvents = orderedEvents.map<string>((event, index) => {
		try {
			return formatCorreiosEvent(event, index, update && index === orderedEvents.length - 1);
		} catch (error) {
			logger.error({
				msg: 'Error while formatting event',
				code,
				event,
				error,
			});

			return [
				`\`${index + 1}\` - ${Emojis.error} | **${event.status}** ${update ? Emojis.new : ''}`,
				`${Emojis.curva} Houve um erro ao obter os dados deste evento.`,
			].join('\n');
		}
	});

	return organizeEmbeds(title, formattedEvents, orderedEvents.at(-1), isDelivered);
}
