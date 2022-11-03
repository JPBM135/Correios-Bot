import { container, kSQL, removeUndefinedKeys } from '@yuudachi/framework';
import type { Sql } from 'postgres';
import type { RawCorreiosCode, RawUser } from './get.js';

type PatchUser = Partial<Pick<RawUser, 'allow_dm' | 'always_restrict'>>;

export async function updateUser(id: string, patch: PatchUser) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const updates: Partial<Record<keyof RawUser, unknown>> = {
		allow_dm: patch.allow_dm,
		always_restrict: patch.always_restrict,
	};

	const queries = removeUndefinedKeys(updates);

	const [result] = await sql<[RawUser]>`
		update users set ${sql(queries as Record<string, unknown>, ...Object.keys(queries))}
		where id = ${id}
		returning *
	`;

	return result;
}

type PatchCode = Partial<Pick<RawCorreiosCode, 'ended' | 'events_size' | 'restricted'>>;

export async function updateCode(code: string, patch: PatchCode) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const updates: Partial<Record<keyof RawCorreiosCode, unknown>> = {
		events_size: patch.events_size,
		restricted: patch.restricted,
		ended: patch.ended,
	};

	const queries = removeUndefinedKeys(updates);

	const [result] = await sql<[RawCorreiosCode]>`
		update correios_codes set ${sql(queries as Record<string, unknown>, ...Object.keys(queries))}
		where code = ${code}
		returning *
	`;

	return result;
}
