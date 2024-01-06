import 'reflect-metadata';
import process from 'node:process';
import { setInterval } from 'node:timers';
import { container, createPostgres, logger } from '@yuudachi/framework';
import { Client, GatewayIntentBits } from 'discord.js';
import { checkInterval, kCheckInterval } from './constants.js';
import { checkJob } from './correios/job.js';
import { handleInteractionButton, handleInteractionCommand } from './handler.js';

if (!process.env.DISCORD_TOKEN || !process.env.LINETRACK_USER || !process.env.LINETRACK_TOKEN) {
	throw new Error('Missing environment variables');
}

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
