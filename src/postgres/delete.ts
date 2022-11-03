import { logger, container, kSQL } from '@yuudachi/framework';
import type { Sql } from 'postgres';

export async function deleteCode(code: string): Promise<boolean> {
	const sql = container.resolve<Sql>(kSQL);

	const results = await sql<[{ code: string }]>`
		delete from correios_codes
		where code = ${code}
		returning code
	`;

	return results.length > 0;
}

export async function deleteUser(id: string): Promise<number> {
	const sql = container.resolve<Sql>(kSQL);

	const results = await sql<[{ id: string }]>`
		delete from user_config
		where user_id = ${id}
		returning id
	`;

	if (!results.length) {
		return 0;
	}

	const codes = await sql<[{ code: string }]>`
		delete from correios_codes
		where owner_id = ${id}
		returning code
	`;

	logger.warn({
		msg: 'Data delete',
		user: id,
		codes: codes.map((code) => code.code),
	});

	return codes.length;
}
