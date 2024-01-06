import { Colors, type APIEmbed } from 'discord.js';
import type { Evento } from '../../correios/fetch.js';
import { truncateEmbed } from '@yuudachi/framework';

export function organizeEmbeds(
	title: string,
	formattedEvents: string[],
	lastEvent: Evento | undefined,
	isDelivered: boolean,
): APIEmbed[] {
	const eventEmbeds: APIEmbed[] = [];
	const tempContent = [];
	const color = isDelivered ? Colors.Green : undefined;

	const firstEmbed: APIEmbed = {
		title: title,
	};

	for (const event of formattedEvents ?? []) {
		if (tempContent.join('\n\n').length + event.length > 4_096) {
			eventEmbeds.push({ color, description: tempContent.join('\n\n') });
			tempContent.length = 0;
		}

		tempContent.push(event);
	}

	if (tempContent.length >= 1) {
		eventEmbeds.push({ color, description: tempContent.join('\n\n') });
	}

	if (!eventEmbeds.length) {
		eventEmbeds.push({ color, description: 'Nenhum evento encontrado.' });
	}

	eventEmbeds[0]!.title = firstEmbed.title;
	eventEmbeds[eventEmbeds.length - 1] = {
		...eventEmbeds.at(-1),
		footer: {
			text: `Status: ${lastEvent?.status ?? 'Desconhecido'} | Atualizado em:`,
		},
		timestamp: new Date().toISOString(),
	};

	return eventEmbeds.map((evt) => truncateEmbed(evt));
}
