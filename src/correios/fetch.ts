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

export interface RastreioCorreios {
	data: Data;
	success: boolean;
}

export async function fetchCorreios(code: string): Promise<RastreioCorreios> {
	const response = await request(`${BaseUrl}/${code}`);

	if (!validateResponse(response)) {
		throw new Error(`Error while fetching ${code}: ${response.statusCode}`);
	}

	return (await response.body.json()) as RastreioCorreios;
}
