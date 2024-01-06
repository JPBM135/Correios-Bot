import {
	ButtonInteraction,
	ComponentType,
	type APIMessageActionRowComponent,
	type Message,
	type APIActionRowComponent,
} from 'discord.js';
import { EventEmitter } from 'node:events';
import { generatePaginationComponents } from './generateComponents.js';
import { logger } from '@yuudachi/framework';

export enum PaginationCustomId {
	First = 'FIRST',
	Previous = 'PREVIOUS',
	Change = 'CHANGE',
	Next = 'NEXT',
	Last = 'LAST',
}

export class PaginationWrapper extends EventEmitter {
	public interactionMessage: Message;
	public ownerId: string;
	public meta: {
		count: number;
		perPage: number;
	};
	public page: number;

	public static DefaultPaginationComponents(pages: number) {
		return generatePaginationComponents(1, pages);
	}

	constructor(
		interactionMessage: Message,
		ownerId: string,
		{
			count,
			perPage,
			startPage,
		}: {
			count: number;
			perPage: number;
			startPage?: number;
		},
	) {
		super();

		this.interactionMessage = interactionMessage;
		this.ownerId = ownerId;
		this.meta = {
			count,
			perPage,
		};

		this.page = startPage ?? 1;

		this.createListener();
	}

	public async createListener() {
		const filter = (i: ButtonInteraction) => i.user.id === this.ownerId;
		const collector = this.interactionMessage.createMessageComponentCollector<ComponentType.Button>({
			filter,
			time: 60000,
			componentType: ComponentType.Button,
		});

		collector.on('collect', (i) => {
			const customId = i.customId.split('::')[1]! as PaginationCustomId;
			switch (customId) {
				case PaginationCustomId.First:
					this.page = 1;
					break;
				case PaginationCustomId.Previous:
					this.page--;
					break;
				case PaginationCustomId.Next:
					this.page++;
					break;
				case PaginationCustomId.Last:
					this.page = Math.ceil(this.meta.count / this.meta.perPage);
					break;
				default:
					logger.info({
						msg: 'PaginationWrapper:collect:default',
						ownerId: this.ownerId,
						page: this.page,
						customId,
					});
					return;
			}

			logger.debug({
				msg: 'PaginationWrapper:collect',
				ownerId: this.ownerId,
				page: this.page,
				customId,
			});

			const result = this.emit('Change', {
				interaction: i,
				page: this.page,
				components: generatePaginationComponents(this.page, Math.ceil(this.meta.count / this.meta.perPage)),
			});

			logger.debug({
				msg: 'PaginationWrapper:emit',
				ownerId: this.ownerId,
				page: this.page,
				customId,
				result,
			});
		});
	}

	public override on<K = keyof typeof PaginationCustomId>(
		s: K,
		listener: (v: {
			interaction: ButtonInteraction;
			page: number;
			components: APIActionRowComponent<APIMessageActionRowComponent>[];
		}) => void,
	) {
		return super.on(s as string, listener);
	}

	public override emit<K = keyof typeof PaginationCustomId>(
		s: K,
		v: {
			interaction: ButtonInteraction;
			page: number;
			components: APIActionRowComponent<APIMessageActionRowComponent>[];
		},
	) {
		return super.emit(s as string, v);
	}
}
