import process from 'node:process';
import { URLSearchParams } from 'node:url';
import { request } from 'undici';
import { BaseUrl } from '../constants.js';
import { validateResponseStatusCode } from '../utils/validadeResponse.js';

export interface Evento {
	data?: string;
	hora?: string;
	local?: string;
	status?: string;
	subStatus?: string[];
}

export interface RastreioCorreios<T extends boolean> {
	codigo?: string;
	eventos?: T extends true ? Evento[] : [];
	host?: string;
	quantidade?: T extends true ? number : 0;
	servico?: string;
	statusCode: number;
	success: boolean;
}

export async function fetchCorreios(code: string): Promise<RastreioCorreios<boolean>> {
	const urlQuery = new URLSearchParams();
	urlQuery.append('codigo', code);
	urlQuery.append('user', process.env.LINETRACK_USER!);
	urlQuery.append('token', process.env.LINETRACK_TOKEN!);

	const response = await request(`${BaseUrl}?${urlQuery.toString()}`, {
		method: 'GET',
	});

	if (response.statusCode !== 200) {
		return {
			success: false,
			statusCode: response.statusCode,
		} as RastreioCorreios<false>;
	}

	const body = (await response.body.json()) as RastreioCorreios<boolean>;

	if (!validateResponseStatusCode(response)) {
		return {
			...body,
			success: response.statusCode > 499,
			statusCode: body.eventos?.length && body.host ? response.statusCode : 404,
		} as RastreioCorreios<false>;
	}

	return {
		...body,
		success: true,
		statusCode: response.statusCode,
	} as RastreioCorreios<true>;
}
