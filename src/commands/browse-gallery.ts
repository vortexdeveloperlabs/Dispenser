import { Bot, Interaction } from "npm:@discordeno/bot";
import {
	ApplicationCommandOptionTypes,
	ApplicationCommandTypes,
	ButtonStyles,
	InteractionResponseTypes,
	MessageComponentTypes,
} from "npm:@discordeno/types";
import { Embed, Guild } from "npm:@discordeno/bot";

import { CommandConfig } from "../types/commands.d.ts";

import Responder from "../util/responder.ts";

import { accessConfig } from "../util/AccessConfig.ts";

import { linksDb } from "$db";

// TODO: Make a global config that allows the server managers to block certain servers. If they are blocked, the servers won't be shown in the gallery and users won't be able to get links from that server, and that server won't be shown in the autocomplete. If the user still tries to get the links from that server, the bot will advise to be used in a user-installable scenario or in a server where interactions to that server are allowed.
const data = {
	name: "gallery",
	description:
		"Browse the servers that use this bot so you may join them or subscribe to get their links",
	type: ApplicationCommandTypes.ChatInput,
	options: [
		{
			type: ApplicationCommandOptionTypes.String,
			name: "sortBy",
			description:
				"Sort how the servers are listed: by memberCount (number of members), by linkCount (number of links), by freshestLinks (which one has had the most links added recently), by name (a-z)",
		},
		{
			type: ApplicationCommandOptionTypes.String,
			name: "showThis",
			ServerDescription: "Show the current server first",
		},
		{
			type: ApplicationCommandOptionTypes.String,
			name: "hideInaccessibleServers",
			description: "Don't list servers that you are blocked in",
			/* False by default */
		},
		{
			type: ApplicationCommandOptionTypes.String,
			name: "empheral",
			/* True by default, but if false, the bot will dm you instead */
		},
	],
	dmPermission: false,
};

const commandConfig: CommandConfig = {
	managementOnly: true,
};

// TODO: Create a config: isUserAllowedToUseNonEmpherals

async function handle(bot: Bot, interaction: Interaction): Promise<void> {
	const responder = new Responder(bot, interaction.id, interaction.token);

	const guilds: Guild[] = [];
	for (const guildId of bot.activeGuildIds) {
		guilds.push(await bot.helpers.getGuild(guildId));
	}

	// TODO: Sort the guilds by the sortBy option

	// TODO: More translations
	const embed: Embed = {
		type: InteractionResponseTypes.ChannelMessageWithSource,
		data: {
			embeds: {
				type: "rich",
				title: await accessConfig.getTranslation({
					type: "in_command",
					searchString: "Gallery",
					commandTarget: "browse-gallery",
					isEmbed: true,
				}),
				footer: {
					text: guilds[0].name,
				},
			},
			components: [
				{
					/* There is no back because it starts at the first index */
					type: MessageComponentTypes.ActionRow,
					components: {
						type: MessageComponentTypes,
						label: await accessConfig.getTranslation({
							type: "in_command",
							searchString: "Next",
							commandTarget: "browse-gallery",
							isEmbed: true,
						}),
						customId: "nextBtn",
						style: ButtonStyles.Primary,
						disabled: false,
					},
				},
			],
		},
	};

	await responder.respondEmbed(embed);
}

export { commandConfig, data, handle };
