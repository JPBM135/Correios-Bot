import { createButton, createMessageActionRow } from '@yuudachi/framework';
import { ButtonStyle, type APIActionRowComponent, type APIMessageActionRowComponent } from 'discord.js';

export function generatePaginationComponents(
	page: number,
	totalPages: number,
): APIActionRowComponent<APIMessageActionRowComponent>[] {
	return [
		createMessageActionRow([
			createButton({
				customId: 'PAGINATION::FIRST',
				label: 'Primeira',
				style: ButtonStyle.Secondary,
				disabled: page === 1,
			}),
			createButton({
				customId: 'PAGINATION::PREVIOUS',
				label: 'Anterior',
				style: ButtonStyle.Secondary,
				disabled: page === 1,
			}),
			createButton({
				customId: 'PAGINATION::CURRENT',
				label: `${page}/${totalPages}`,
				style: ButtonStyle.Primary,
				disabled: true,
			}),
			createButton({
				customId: 'PAGINATION::NEXT',
				label: 'Próxima',
				style: ButtonStyle.Secondary,
				disabled: page === totalPages,
			}),
			createButton({
				customId: 'PAGINATION::LAST',
				label: 'Última',
				style: ButtonStyle.Secondary,
				disabled: page === totalPages,
			}),
		]),
	];
}
