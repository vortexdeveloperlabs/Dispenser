import { Bot, Interaction } from "npm:@discordeno/bot";
import {
	ApplicationCommandOptionTypes,
	ApplicationCommandTypes,
	CreateSlashApplicationCommand,
} from "npm:@discordeno/types";

import { usersDb } from "$db";

import Responder from "../util/responder.ts";

import { CommandConfig } from "../types/commands.d.ts";

import autocompleteHandleCategoryOnly from "../util/autocompleteHandleCategoryOnly.ts";

const data: CreateSlashApplicationCommand = {
	name: "reset",
	description: "Resets a user's proxy limit",
	type: ApplicationCommandTypes.ChatInput,
	options: [
		{
			type: ApplicationCommandOptionTypes.User,
			name: "user",
			description: "The user to query",
			required: true,
		},
		{
			type: ApplicationCommandOptionTypes.String,
			name: "category",
			description: "The category to get the links from",
			autocomplete: true,
		},
	],
	dmPermission: false,
};

const commandConfig: CommandConfig = {
	managementOnly: true,
};

const autocompleteHandle = autocompleteHandleCategoryOnly;

async function handle(bot: Bot, interaction: Interaction): Promise<void> {
	const responder = new Responder(bot, interaction.id, interaction.token);

	const user = interaction.data?.options?.[0]?.value;
	const cat: string | undefined = String(
		interaction.data?.options?.[1]?.value,
	);

	const filter: {
		guildId: string;
		userId: string;
		cat?: string;
	} = {
		guildId: String(interaction.guildId),
		userId: String(user),
	};

	if (cat) filter.cat = cat;

	await usersDb.updateMany(
		filter,
		{
			$set: {
				links: [],
				times: 0,
			},
		},
		{
			upsert: true,
		},
	);

	return await responder.respond(`Reset ${user}'s proxy limit!`);
}

export { autocompleteHandle, commandConfig, data, handle };
