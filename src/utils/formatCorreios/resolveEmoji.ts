import { Emojis } from '../../constants.js';
import type { Evento } from '../../correios/fetch.js';

export function resolveEmoji(event: Evento): string {
	let { status } = event;

	status ??= '';

	status = status.toLowerCase();

	if (status.includes('entregue')) {
		return Emojis.success;
	}

	if (status.includes('correios do brasil')) {
		return ':flag_br:';
	}

	if (status.includes('saiu para entrega')) {
		return ':incoming_envelope:';
	}

	if (status.includes('em trânsito') || status.includes('encaminhado')) {
		return ':articulated_lorry:';
	}

	if (status.includes('fiscalização aduaneira')) {
		return ':coin:';
	}

	if (status.includes('pagamento confirmado')) {
		return ':dollar:';
	}

	if (status.includes('saída do centro internacional')) {
		return ':airplane_departure:';
	}

	if (status.includes('aguardando retirada')) {
		return ':post_office:';
	}

	if (status.includes('eletrônicas enviadas para análise')) {
		return ':mag:';
	}

	if (status.includes('entrega não pode ser efetuada')) {
		return Emojis.warning;
	}

	if (status.includes('postado')) {
		return `:envelope_with_arrow:${status.includes('horário limite') ? ' :hourglass_flowing_sand:' : ''}`;
	}

	return Emojis.fallback;
}
