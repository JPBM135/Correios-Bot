import { container, kSQL, logger } from '@yuudachi/framework';
import { Client } from 'discord.js';
import type { Sql } from 'postgres';
import { DELIVERED_STATUS } from '../constants.js';
import { getUser, type RawCorreiosCode } from '../postgres/get.js';
import { updateCode } from '../postgres/update.js';
import type { RastreioCorreios } from './fetch.js';
import { fetchCorreios } from './fetch.js';
import { awaitOneSecond } from '../utils/awaitOneSecond.js';
import { generateCorreiosMessage } from '../utils/formatCorreios/generateMessage.js';

export async function checkJob() {
	const sql = container.resolve<Sql<any>>(kSQL);
	const client = container.resolve<Client<true>>(Client);

	const openCodes = await sql<[RawCorreiosCode]>`
		select * from correios_codes
		where ended = false
	`;

	logger.info(`Checking ${openCodes.length} codes`);

	for (const code of openCodes) {
		try {
			const data = (await fetchCorreios(code.code)) as RastreioCorreios<true>;
			const rateLimitTimer = awaitOneSecond();

			if (!data?.success) {
				logger.error({
					msg: 'Error while fetching code',
					code: code.code,
					statusCode: data.statusCode,
				});

				continue;
			}

			const someEnded = data.eventos?.some((evento) => evento.status === DELIVERED_STATUS);

			if (someEnded && (!data || data.eventos?.length === code.events_size)) {
				logger.info(`Code ${code.code} was delivered, ending`);
				await updateCode(code.code, { ended: true });

				continue;
			}

			if ((Number(data.eventos?.length) ?? 0) <= code.events_size) {
				logger.info(`Code ${code.code} has not changed since last time!`)
				continue
			}

			logger.info({
				msg: 'Updating code',
				code: code.code,
				events_size: data.eventos?.length ?? 0,
			});

			const owner = await client.users.fetch(code.owner_id);

			if (!owner) {
				continue;
			}

			const ownerConfig = await getUser(code.owner_id);

			const embeds = generateCorreiosMessage(data, true);

			if (ownerConfig.allow_dm) await owner.send({ embeds }).catch(() => null);

			if (code.channel_id && !code.restricted) {
				const channel = await client.channels.fetch(code.channel_id);

				if (channel?.isTextBased()) {
					await channel.send({ embeds }).catch(() => null);
				}
			}

			console.log(data, code)

			await updateCode(code.code, {
				events_size: data.eventos?.length ?? code.events_size ?? 0,
				ended: someEnded ?? code.ended,
			});

			await rateLimitTimer();
		} catch (error) {
			logger.error(error);
		}
	}
}
