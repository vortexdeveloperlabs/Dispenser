import { Bot, Interaction } from "npm:@discordeno/bot";
import { ApplicationCommandTypes } from "npm:@discordeno/types";

import { LinkData, linksDb } from "$db";

import { getUserLocale } from "../util/getIfExists.ts";
import { accessConfig } from "../util/AccessConfig.ts";
import createErrorEmbed from "../util/createErrorEmbed.ts";

const data = {
	name: "add",
	description: "Adds a new link",
	type: ApplicationCommandTypes.ChatInput,
	options: [
		{
			type: ApplicationCommandOptionTypes.String,
			name: "link",
			description: "The link to add",
			required: true,
		},
		{
			type: ApplicationCommandOptionTypes.String,
			name: "category",
			description: "The proxy site to categorize the link",
			required: true,
		},
		{
			type: ApplicationCommandOptionTypes.String,
			name: "premiumLevels",
			description: "Comma sepaparated list of premium level IDs or role IDs"
		},
		{
			type: ApplicationCommandOptionTypes.String,
			name: "premiumLevelsByRoleTarget",
			description: "Finds premium levels that encompass the roles provided"
		}
	],
	dmPermission: false,
};

async function handle(bot: Bot, interaction: Interaction): Promise<void> {
	const responder = new Responder(bot, interaction.id, interaction.token);

	const link = interaction.data?.options?.[0]?.value;
	const cat = interaction.data?.options?.[1]?.value;
	//const isPremium = interaction.data?.options?.[2]?.value;

	if (!link) {
		await responder.respondEmbed(
			await createErrorEmbed()
		);
		return;
	}
	if (!cat) {

	}

	// TODO: Support by roles
	const premiumLevelsList = premiumLevelsStr.split(",")

	const userLocale = getUserLocale(interaction.user);

	const linkCreatedBy = String(interaction.user.id);
	const linkCreatedAt = String(Date.now());

	// TODO: Add all the new data
	const toInsert: LinkData = {
		guildId: String(interaction.guildId),
		link,
		cat,
		supportedPremiumLevels: ;
		created: {
			// The Discord snowflake ID of whoever  created the link
			by: linkCreatedBy,
			// This should be a UNIX timestamp
			at: linkCreatedAt,
		};
		lastModified: {
			// The Discord snowflake ID of whoever last updated the link
			by: linkCreatedBy,
			// This should be a UNIX timestamp
			at: linkCreatedAt,
		};
	};

	if (await linksDb.findOne(toInsert)) {
		await responder.respond(
			await accessConfig.getTranslation({
				type: "in_command",
				searchString: "You can't insert a duplicate link!",
				commandTarget: "add",
				isEmbed: false,
			}, userLocale),
		);
	} else {
		await linksDb.insertOne(toInsert);
		await responder.respond(`Added ${link} to ${cat}!`);
	}
}

export { commandConfig, data, handle };
