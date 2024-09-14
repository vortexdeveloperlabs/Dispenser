import { Bot, Interaction } from "npm:@discordeno/bot";
import {
	ApplicationCommandOptionTypes,
	ApplicationCommandTypes,
	CreateSlashApplicationCommand,
} from "npm:@discordeno/types";

import { CommandConfig } from "../types/commands.d.ts";

import { limitsDb } from "$db";

import Responder from "../util/responder.ts";

import autocompleteHandleCategoryOnly from "../util/autocompleteHandleCategoryOnly.ts";

const data: CreateSlashApplicationCommand = {
	name: "limit",
	description: "Sets the monthly limit for a category",
	type: ApplicationCommandTypes.ChatInput,
	options: [
		{
			type: ApplicationCommandOptionTypes.Number,
			name: "limit",
			description: "The limit",
			required: true,
		},
		{
			type: ApplicationCommandOptionTypes.Number,
			name: "premiumlimit",
			description: "The limit for premium users",
		},
		{
			type: ApplicationCommandOptionTypes.String,
			name: "category",
			description:
				"The category. The autocomplete will suggest already created categories; however, you may put a new one to create a new one.",
			autocomplete: true,
			required: true,
		},
	],
	dmPermission: false,
};

const commandConfig: CommandConfig = {
	managementOnly: true,
};

const autocompleteHandle = (interaction: Interaction) =>
	autocompleteHandleCategoryOnly(interaction, data);

async function handle(bot: Bot, interaction: Interaction): Promise<void> {
	const responder = new Responder(bot, interaction.id, interaction.token);

	const limit = interaction.data?.options?.[0]?.value;
	const cat = interaction.data?.options?.[2]?.value;
	const premiumLimit = interaction.data?.options?.[3]?.value;

	await limitsDb.updateMany(
		{
			guildId: String(interaction.guildId),
			cat: cat,
		},
		{
			$set: {
				limit,
				premiumLimit,
			},
		},
		{
			upsert: true,
		},
	);

	await responder.respond(
		`Set the limit to ${limit}` +
			(premiumLimit ? `and the premium limit to ${premiumLimit}!` : "!"),
	);
}

export { autocompleteHandle, commandConfig, data, handle };
