import { request } from 'undici';
import { BaseUrl } from '../constants.js';
import { validateResponse } from '../utils/validadeResponse.js';

export interface Company {
	created_at: Date;
	id: number;
	is_active: number;
	jobs_frequency: string;
	name: string;
	sk_company: string;
	updated_at?: string;
}

export interface Event {
	city: string;
	comment?: string;
	date: string;
	destination_city: string;
	destination_local: string;
	destination_uf: string;
	events: string;
	local: string;
	tag: string;
	uf: string;
}

export interface Data {
	company: Company;
	events: Event[];
	status: string;
	tracking_code: string;
}

export interface RastreioCorreios<T extends boolean> {
	data: T extends true ? Data : undefined;
	message: T extends false ? string : undefined;
	statusCode: number;
	success: T;
}

export async function fetchCorreios(code: string): Promise<RastreioCorreios<boolean>> {
	const response = await request(`${BaseUrl}/${code}`);

	const body = await response.body.json();

	if (!validateResponse(response) || !body.success) {
		return {
			...body,
			statusCode: body.message.includes('não encontrado') ? 404 : response.statusCode,
		} as RastreioCorreios<false>;
	}

	return {
		...body,
		statusCode: response.statusCode,
	} as RastreioCorreios<true>;
}
