import { container, kSQL } from '@yuudachi/framework';
import type { Sql } from 'postgres';
import { createUser } from './create.js';

export interface RawUser {
	allow_dm: boolean;
	always_restrict: boolean;
	user_id: string;
}

export interface RawCorreiosCode {
	channel_id: string;
	code: string;
	ended: boolean;
	events_size: number;
	last_update: Date;
	name: string | null;
	owner_id: string;
	restricted: boolean;
}

export async function getUser(id: string) {
	const sql = container.resolve<Sql>(kSQL);

	const [user] = await sql<[RawUser]>`
		select * from user_config
		where user_id = ${id}
	`;

	if (!user) {
		return createUser(id);
	}

	return user;
}

export async function getCode(code: string): Promise<RawCorreiosCode | null> {
	const sql = container.resolve<Sql>(kSQL);

	const [result] = await sql<[RawCorreiosCode]>`
		select * from correios_codes
		where code = ${code}
	`;

	if (!result) {
		return null;
	}

	return result;
}

export async function getCodesByUser(
	id: string,
	{
		ended = false,
		limit = 10,
		offset = 0,
	}: {
		ended: boolean | null;
		limit?: number;
		offset?: number;
	},
) {
	const sql = container.resolve<Sql>(kSQL);

	const results = await sql.unsafe<[RawCorreiosCode]>(
		/* sql */ `
		select * from correios_codes
			where owner_id = $1
			${ended === null ? '' : 'and ended = $4'}
			order by last_update desc
			limit $2
			offset $3
	`,
		ended === null ? [id, limit, offset] : [id, limit, offset, ended],
	);

	const [count] = await sql.unsafe<[{ count: number }]>(
		`
		select count(*) from correios_codes
			where owner_id = $1
			${ended === null ? '' : 'and ended = $2'}
	`,
		ended === null ? [id] : [id, ended],
	);

	return {
		count: Number(count.count),
		results,
	};
}
