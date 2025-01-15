import { Bot, Interaction } from "npm:@discordeno/bot";
import {
	ApplicationCommandOptionTypes,
	ApplicationCommandTypes,
	CreateSlashApplicationCommand,
} from "npm:@discordeno/types";

import { catsDb, linksDb } from "$db";

import Responder from "../util/responder.ts";
import createErrorEmbed from "../util/createErrorEmbed.ts";

import { CommandConfig } from "../types/commands.d.ts";

import { getUserLocale } from "../util/getIfExists.ts";
import { accessConfig } from "../util/AccessConfig.ts";

// TODO: Support rename links and make this a subcommand with /`rename <link/category> [newname]`. The reason why links need renaming now is because the data about them is much more rich than just the raw link as it was before.
const data: CreateSlashApplicationCommand = {
	name: "rename",
	description: "Renames a category",
	type: ApplicationCommandTypes.ChatInput,
	options: [
		{
			type: ApplicationCommandOptionTypes.User,
			name: "category1",
			description: "The category to replace",
			required: true,
		},
		{
			type: ApplicationCommandOptionTypes.String,
			name: "category2",
			description: "The category to replace with",
			required: true,
		},
	],
	dmPermission: false,
};

const commandConfig: CommandConfig = {
	managementOnly: true,
};

async function handle(bot: Bot, interaction: Interaction): Promise<void> {
	const responder = new Responder(bot, interaction.id, interaction.token);

	const cat1 = interaction.data?.options?.[0]?.value;
	const cat2 = interaction.data?.options?.[1]?.value;

	const guildId = String(interaction.guildId);

	const userLocale = getUserLocale(interaction.user);

	if (typeof cat1 !== "string" || typeof cat2 !== "string") {
		responder.respondEmbed(
			createErrorEmbed(
				"The interaction data for the categories was not of the expected type string",
				"bot_error",
				userLocale,
			),
		);
		return;
	}

	await catsDb.updateMany(
		{
			guildId: guildId,
			cat: cat1,
		},
		{
			$set: {
				cat: cat2,
			},
		},
		{
			upsert: true,
		},
	);

	await linksDb.updateMany(
		{
			guildId: guildId,
			cat: cat1,
		},
		{
			$set: {
				cat: cat2,
			},
		},
		{
			upsert: true,
		},
	);

	responder.respond(`${await accessConfig.getTranslation({
		type: "in_command",
		searchString: "Renamed",
		commandTarget: "rename",
		isEmbed: false,
	}, userLocale)} ${cat1} ${await accessConfig.getTranslation({
		type: "in_command",
		searchString: "to",
		commandTarget: "rename",
		isEmbed: false,
	}, userLocale)} ${cat2}`);
}

export { commandConfig, data, handle };
