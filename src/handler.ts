import { logger, transformInteraction } from '@yuudachi/framework';
import type { Interaction } from 'discord.js';
import { codeBlock } from 'discord.js';
import { handleRefresh } from './buttons/refresh.js';
import { handleCreate } from './commands/create.js';
import { handleLookup } from './commands/lookup.js';
import { Emojis } from './constants.js';

type CommandNames = 'configurar' | 'criar' | 'editar' | 'rastrear';

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
			case 'criar':
				await handleCreate(interaction, args);
				break;
			case 'rastrear':
				await handleLookup(interaction, args);
				break;
			default:
				await interaction.reply({ content: 'Comando não implementado.', ephemeral: true });
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
