import { container, kSQL, logger } from '@yuudachi/framework';
import type { Sql } from 'postgres';
import type { RawCorreiosCode, RawUser } from './get.js';

export async function createUser(id: string): Promise<RawUser> {
	const sql = container.resolve<Sql>(kSQL);

	logger.info(`Creating user ${id}`);

	const [user] = await sql<[RawUser]>`
		insert into user_config (user_id) values (${id})
		returning *
	`;

	return user;
}

export async function createCode(
	code: string,
	owner_id: string,
	channel_id: string,
	name: string | null = null,
	restricted = false,
	ended = false,
): Promise<RawCorreiosCode> {
	const sql = container.resolve<Sql>(kSQL);

	logger.info({
		msg: 'Creating code',
		code,
		owner_id,
		name,
		restricted,
		ended,
	});

	const [result] = await sql<[RawCorreiosCode]>`
		insert into correios_codes (code, owner_id, channel_id, name, restricted, ended) values (${code}, ${owner_id}, ${channel_id}, ${name}, ${restricted}, ${ended})
		returning *
	`;

	return result;
}
