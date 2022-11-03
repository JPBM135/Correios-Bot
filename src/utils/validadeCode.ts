const regex = /^[A-Z]{2}\d{9}[A-Z]{2}$/;

export function validateCode(code: string): boolean {
	return regex.test(code);
}
