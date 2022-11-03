import { randomBytes } from 'node:crypto';

export function generateCustomId() {
	return 'CUSTOM::' + randomBytes(16).toString('hex');
}
