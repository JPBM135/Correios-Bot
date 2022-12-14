import process from 'node:process';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { RegisterCommand, EditCommand, LookupCommand, SettingsCommand, DeleteCommand } from './interactions/index.js';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

try {
	console.log('Start refreshing interaction (/) commands.');

	await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID!), {
		body: [RegisterCommand, EditCommand, LookupCommand, SettingsCommand, DeleteCommand],
	});
	console.log('Successfully reloaded interaction (/) commands.');
} catch (error) {
	console.error(error);
}
