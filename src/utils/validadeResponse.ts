import type { Dispatcher } from 'undici';

export function validateResponse(res: Dispatcher.ResponseData, throwOnFail = false): boolean {
	if (res.statusCode >= 200 && res.statusCode <= 299) return true;
	if (throwOnFail) throw new Error(`Invalid response code: ${res.statusCode}`);
	return false;
}
