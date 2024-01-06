import { time, TimestampStyles } from 'discord.js';
import { Emojis } from '../../constants.js';
import type { Evento } from '../../correios/fetch.js';
import { resolveEmoji } from './resolveEmoji.js';

export function formatCorreiosEvent(event: Evento, index: number, update = false): string {
	const { local, data: rawDate, hora: rawTime, status } = event;
	const [day, month, year] = rawDate?.split('/') ?? [];
	const [hour, minute] = rawTime?.split(':') ?? [];

	const formattedDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));

	const data = [`\`${index + 1}\` - ${resolveEmoji(event)} | **${status}** ${update ? Emojis.new : ''}`];

	if (local) {
		data.push(`${Emojis.curvaReta} Origem: *${local}*`);
	}

	const rawDestination = event.subStatus?.find((sub) => sub.startsWith('Destino:'));

	if (rawDestination) {
		const [, destination] = rawDestination.split(': ') as [string, string];

		data.push(`${Emojis.curvaReta} Destino: *${destination}*`);
	}

	data.push(
		`${Emojis.curva} ${time(formattedDate, TimestampStyles.ShortDateTime)} (${time(
			formattedDate,
			TimestampStyles.RelativeTime,
		)})`,
	);

	return data.join('\n');
}
