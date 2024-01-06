import { performance } from 'perf_hooks';

export function awaitOneSecond() {
	const startTime = performance.now();
	return async () =>
		new Promise((resolve) => {
			setTimeout(
				() => {
					resolve(performance.now() - startTime);
				},
				performance.now() - startTime > 1000 ? 0 : 1000 - (performance.now() - startTime),
			);
		});
}
