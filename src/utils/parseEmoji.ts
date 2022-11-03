import { type APIMessageComponentEmoji, parseEmoji } from 'discord.js';

export function typeSafeParseEmoji(emojiString: string): APIMessageComponentEmoji | undefined {
	const emoji = parseEmoji(emojiString);

	if (!emoji) {
		return undefined;
	}

	return { ...emoji, id: emoji.id ?? undefined };
}
