import { logger, transformInteraction } from '@yuudachi/framework';
import type { Interaction } from 'discord.js';
import { codeBlock } from 'discord.js';
import { handleRefresh } from './buttons/refresh.js';
import { handleCreate } from './commands/create.js';
import { handleDelete } from './commands/delete.js';
import { handleLookup } from './commands/lookup.js';
import { handleSettings } from './commands/settings.js';
import { handleUpdate } from './commands/update.js';
import { Emojis } from './constants.js';
import { handleList } from './commands/list.js';

type CommandNames = 'configurar' | 'delete' | 'editar' | 'rastrear' | 'registrar' | 'listar';

export async function handleInteractionCommand(interaction: Interaction) {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.commandName as CommandNames;
	const args = transformInteraction(interaction.options.data);

	logger.info({
		msg: 'Received interaction (ChatInput)',
		command,
		args,
	});

	try {
		switch (command) {
			case 'registrar':
				await handleCreate(interaction, args);
				break;
			case 'rastrear':
				await handleLookup(interaction, args);
				break;
			case 'delete':
				await handleDelete(interaction, args);
				break;
			case 'configurar':
				await handleSettings(interaction, args);
				break;
			case 'editar':
				await handleUpdate(interaction, args);
				break;
			case 'listar':
				await handleList(interaction, args);
				break;
			default:
				await interaction.reply({ content: `${Emojis.error} | Comando não implementado.`, ephemeral: true });
				break;
		}
	} catch (error) {
		const err = error as Error;
		logger.error(err);

		const data = {
			content: [`${Emojis.error} | Ocorreu um erro ao processar o comando:`, codeBlock('js', err.message)].join('\n'),
			ephemeral: true,
		};

		if (!interaction.deferred && !interaction.replied) {
			await interaction.reply(data).catch(logger.error);
		}

		await interaction.editReply(data).catch(logger.error);
	}
}

export async function handleInteractionButton(interaction: Interaction) {
	if (!interaction.isButton()) return;

	const [command] = interaction.customId.split('::');

	if (command === 'CUSTOM') {
		return;
	}

	logger.info({
		msg: 'Received interaction (Button)',
		customId: interaction.customId,
		command,
	});

	try {
		switch (command) {
			case 'REFRESH':
				await handleRefresh(interaction);
				break;
			case 'PAGINATION':
				if (new Date().getTime() - interaction.message.createdTimestamp > 60000) {
					await interaction.update({ components: [] });
				}
				break;
			default:
				await interaction.reply({ content: 'Botão não implementado.', ephemeral: true });
				break;
		}
	} catch (error) {
		const err = error as Error;
		logger.error(err);

		const data = {
			content: [`${Emojis.error} | Ocorreu um erro ao processar o comando:`, codeBlock('js', err.message)].join('\n'),
			ephemeral: true,
		};

		if (!interaction.deferred && !interaction.replied) {
			await interaction.reply(data).catch(logger.error);
		}

		await interaction.editReply(data).catch(logger.error);
	}
}
