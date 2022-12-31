import { container, kSQL, logger } from '@yuudachi/framework';
import { Client } from 'discord.js';
import type { Sql } from 'postgres';
import { getUser, type RawCorreiosCode } from '../postgres/get.js';
import { updateCode } from '../postgres/update.js';
import { formatCorreios } from '../utils/correioFormat.js';
import type { RastreioCorreios } from './fetch.js';
import { fetchCorreios } from './fetch.js';

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

			if (!data.success) {
				logger.error({
					msg: 'Error while fetching code',
					code: code.code,
					statusCode: data.statusCode,
					message: data.message,
				});

				continue;
			}

			if (!data || data.data.events.length === code.events_size) {
				if (data.data.status === 'delivered') {
					logger.info(`Code ${code.code} was delivered, ending`);
					await updateCode(code.code, { ended: true });
				}

				continue;
			}

			logger.info({
				msg: 'Updating code',
				code: code.code,
				events_size: data.data.events.length,
			});

			const owner = await client.users.fetch(code.owner_id);

			if (!owner) {
				continue;
			}

			const ownerConfig = await getUser(code.owner_id);

			const embeds = formatCorreios(data, true);

			if (ownerConfig.allow_dm) await owner.send({ embeds }).catch(() => null);

			if (code.channel_id && !code.restricted) {
				const channel = await client.channels.fetch(code.channel_id);

				if (channel?.isTextBased()) {
					await channel.send({ embeds }).catch(() => null);
				}
			}

			await updateCode(code.code, {
				events_size: data.data.events.length,
				ended: data.data.status === 'delivered',
			});
		} catch (error) {
			logger.error(error);
		}
	}
}
