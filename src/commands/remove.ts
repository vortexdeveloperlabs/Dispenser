import { Bot, Interaction } from "npm:@discordeno/bot";
import {
	ApplicationCommandTypes,
	CreateSlashApplicationCommand,
} from "npm:@discordeno/types";

import { CommandConfig } from "../types/commands.d.ts";

import { linksDb } from "$db";

import Responder from "../util/responder.ts";

import { getUserLocale } from "../util/getIfExists.ts";
import { accessConfig } from "../util/AccessConfig.ts";

const data: CreateSlashApplicationCommand = {
	name: "remove",
	description: "Removes a link",
	type: ApplicationCommandTypes.ChatInput,
	options: [
		{
			type: ApplicationCommandOptionTypes.String,
			name: "category",
			description: "The proxy site to categorize the link",
			required: true,
		},
		{
			type: ApplicationCommandOptionTypes.String,
			name: "link",
			description: "The link to remove",
		},
	],
	managementOnly: true,
};

const commandConfig: CommandConfig = {
	managementOnly: true,
};

async function handle(bot: Bot, interaction: Interaction): Promise<void> {
	const responder = new Responder(bot, interaction.id, interaction.token);

	const guildId = String(interaction.guildId);

	const cat = interaction.data?.options?.[0]?.value;
	const link = interaction.data?.options?.[1]?.value;

	const userLocale = getUserLocale(interaction.user);

	if (!link) {
		await linksDb.deleteMany({
			guildId: guildId,
			cat: cat,
		});

		return await responder.respond(`${await accessConfig.getTranslation({
			type: "in_command",
			searchString: "Removed the category",
			commandTarget: "remove",
			isEmbed: false,
		}, userLocale)} ${cat}`);
	} else {
		await linksDb.deleteMany({
			guildId: guildId,
			link: link,
			cat: cat,
		});

		return await responder.respond(`${await accessConfig.getTranslation({
			type: "in_command",
			searchString: "Removed",
			commandTarget: "remove",
			isEmbed: false,
		}, userLocale)} ${link} ${await accessConfig.getTranslation({
			type: "in_command",
			searchString: "from",
			commandTarget: "remove",
			isEmbed: false,
		}, userLocale)} ${cat}`);
	}
}

export { commandConfig, data, handle };
