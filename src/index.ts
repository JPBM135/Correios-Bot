import 'reflect-metadata';
import { setInterval } from 'node:timers';
import { container, createPostgres, logger } from '@yuudachi/framework';
import { Client, GatewayIntentBits } from 'discord.js';
import { checkInterval, kCheckInterval } from './constants.js';
import { checkJob } from './correios/job.js';
import { handleInteractionButton, handleInteractionCommand } from './handler.js';

const client = new Client({
	intents: [GatewayIntentBits.Guilds],
});

container.register(Client, { useValue: client });

await createPostgres();

client.on('ready', () => {
	logger.info('Ready!');

	void checkJob();

	const interval = setInterval(() => {
		logger.info('Running job');
		void checkJob();
	}, checkInterval);

	logger.info(`Check interval set to ${checkInterval}ms`);

	container.register(kCheckInterval, { useValue: interval });
});

client.on('interactionCreate', handleInteractionCommand);
client.on('interactionCreate', handleInteractionButton);

await client.login();
