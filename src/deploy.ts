import process from 'node:process';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { RegisterCommand, EditCommand, LookupCommand, SettingsCommand, DeleteCommand } from './interactions/index.js';
import { ListCommand } from './interactions/list.js';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

const commands = [RegisterCommand, EditCommand, LookupCommand, SettingsCommand, DeleteCommand, ListCommand];

try {
	console.log('Start refreshing interaction (/) commands.');

	if (process.argv.includes('--global')) {
		await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!), {
			body: commands,
		});
		console.log('Successfully reloaded interaction (/) commands globally.');
	} else {
		await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID!), {
			body: commands,
		});
		console.log('Successfully reloaded interaction (/) commands.');
	}
} catch (error) {
	console.error(error);
}
