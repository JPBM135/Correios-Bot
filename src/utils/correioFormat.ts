import { truncateEmbed } from '@yuudachi/framework';
import type { APIEmbed } from 'discord.js';
import { time, TimestampStyles } from 'discord.js';
import { Emojis } from '../constants.js';
import type { RastreioCorreios, Event } from '../correios/fetch.js';

function findEmoji(event: Event): string {
	const { events } = event;

	if (events.includes('entregue')) {
		return Emojis.success;
	}

	if (events.includes('Correios do Brasil')) {
		return ':flag_br:';
	}

	if (events.includes('saiu para entrega')) {
		return ':incoming_envelope:';
	}

	if (events.includes('em trânsito')) {
		return ':articulated_lorry:';
	}

	if (events.includes('Fiscalização aduaneira')) {
		return ':coin:';
	}

	if (events.includes('postado')) {
		return `:envelope_with_arrow:${events.includes('tempo limite') ? ' :hourglass_flowing_sand:' : ''}`;
	}

	return Emojis.fallback;
}

function formatCity(city: string): string {
	if (!city || !city.length) {
		return '';
	}

	return city
		.split(' ')
		.map((word) => word[0]!.toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
}

function formatEvent(event: Event, index: number, update = false): string {
	const { events, local, city, date, uf, destination_city, destination_local, destination_uf } = event;

	const formatedDate = new Date(date);

	const data = [`\`${index + 1}\` - ${findEmoji(event)} | **${events}** ${update ? Emojis.new : ''}`];

	if (local) {
		data.push(
			`${Emojis.curvaReta} Origem: *${local}${city ? `, ${formatCity(city)}` : ''} ${uf ? `- \`${uf}\`` : ''}*`,
		);
	}

	if (destination_local) {
		data.push(
			`${Emojis.curvaReta} Destino: *${destination_local}${
				destination_city ? `, ${formatCity(destination_city)}` : ''
			} ${destination_uf ? `- \`${destination_uf}\`` : ''}*`,
		);
	}

	data.push(
		`${Emojis.curva} ${time(formatedDate, TimestampStyles.ShortDateTime)} (${time(
			formatedDate,
			TimestampStyles.RelativeTime,
		)})`,
	);

	return data.join('\n');
}

type FormatInput = RastreioCorreios & { name?: string | null };

export function formatCorreios(data: FormatInput, update = false): APIEmbed[] {
	const name = data.name ?? 'Sem nome';
	const { tracking_code, status, events } = data.data;

	const embed: APIEmbed = {
		title: `📦 | Rastreio de \`${tracking_code}\` - ${name}`,
	};

	if (status === 'delivered') {
		embed.color = 0x00ff00;
	} else {
		embed.color = 0x36393f;
	}

	const formattedEvents = events.map((evt, idx) => formatEvent(evt, idx, update && idx === events.length - 1));

	const eventEmbeds: APIEmbed[] = [];
	const tempContent = [];

	for (const event of formattedEvents) {
		if (tempContent.join('\n\n').length + event.length > 4_096) {
			eventEmbeds.push({ description: tempContent.join('\n\n') });
			tempContent.length = 0;
		}

		tempContent.push(event);
	}

	if (tempContent.length >= 1) {
		eventEmbeds.push({ description: tempContent.join('\n\n') });
	}

	eventEmbeds[0]!.title = embed.title;
	eventEmbeds[eventEmbeds.length - 1] = {
		...eventEmbeds.at(-1),
		footer: {
			text: `Status: ${status} | Atualizado em:`,
		},
		timestamp: new Date().toISOString(),
	};

	return eventEmbeds.map((evt) => truncateEmbed(evt));
}
