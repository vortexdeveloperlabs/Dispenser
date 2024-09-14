import { Bot, Interaction } from "npm:discordeno";

import Responder from "../util/responder.ts";

import { catsDb } from "$db";

import { accessConfig } from "./AccessConfig.ts";
import createErrorEmbed from "./createErrorEmbed.ts";
import { getUserLocale } from "./getIfExists.ts";

export default async function (bot: Bot, interaction: Interaction): Promise<void> {
	const responder = new Responder(bot, interaction.id, interaction.token);

	const userId = String(interaction.user.id);
	const guildId = String(interaction.guildId);

	const name = interaction.user.username;

	if (!interaction.data) {
		return await responder.respondEmbed(
			await createErrorEmbed(
				await accessConfig.getTranslation(
					"Failed to get your category choice",
				),
				"bot_error",
				getUserLocale(interaction.user),
			),
		);
	}

	const catArr = interaction.data.values;
	if (!catArr) {
		return await responder.respondEmbed(
			await createErrorEmbed(
				await accessConfig.getTranslation(
					"Failed to get your category choice",
				),
				"bot_error",
				getUserLocale(interaction.user),
			),
		);
	}
	const [cat] = catArr;

	console.log(`${name} selected ${cat}`);

	await catsDb.updateMany(
		{
			guildId: guildId,
			userId: userId,
		},
		{
			$set: {
				cat: cat,
			},
		},
		{
			upsert: true,
		},
	);

	return await responder.respond(
		`${await accessConfig.getTranslation({
			type: "misc_string",
			searchString: "Categories updated",
		})}${.checkmarkText}`,
	);
}
