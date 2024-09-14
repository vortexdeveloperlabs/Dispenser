import { Bot, Interaction } from "discordeno";

import Responder from "../util/responder.ts";

import { filtersDb } from "$db";

import { accessConfig } from "./AccessConfig.ts";

import { logger } from "./Logger.ts";

export default async function (
	bot: Bot,
	interaction: Interaction,
): Promise<void> {
	const responder = new Responder(bot, interaction.id, interaction.token);

	const guildId = String(interaction.guildId);
	const userId = String(interaction.user.id);

	const name: string = interaction.user.username;

	const filters = interaction?.data?.values;

	if (filters) {
		logger.log(`${name} now uses ${filters?.join(", ")}`);

		await filtersDb.updateMany(
			{
				guildId: guildId,
				userId: userId,
			},
			{
				$set: {
					filters: filters,
				},
			},
			{
				upsert: true,
			},
		);

		await responder.respond(
			await accessConfig.getTranslation({
				type: "misc_string",
				searchString: "Filters updated",
			}) + (await accessConfig.getConfig()).successIndicator,
		);

		return;
	}
}
