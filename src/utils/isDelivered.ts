import { DELIVERED_STATUS } from '../constants.js';
import type { RastreioCorreios } from '../correios/fetch.js';

export function isCodeDelivered(code: RastreioCorreios<true>): boolean {
	return code.eventos?.some((evento) => evento.status === DELIVERED_STATUS) ?? false;
}
