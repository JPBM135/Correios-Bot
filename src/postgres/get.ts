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
