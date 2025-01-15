import { Bot, Interaction } from "npm:@discordeno/bot";
import {
	ApplicationCommandOptionTypes,
	ApplicationCommandTypes,
	CreateSlashApplicationCommand,
} from "npm:@discordeno/types";

import { ServerUserData, usersDb } from "$db";

import Responder from "../util/responder.ts";

import { CommandConfig } from "../types/commands.d.ts";

const data: CreateSlashApplicationCommand = {
	name: "user",
	description: "Prints the user's info stored on the database",
	type: ApplicationCommandTypes.ChatInput,
	options: [
		{
			type: ApplicationCommandOptionTypes.User,
			name: "user",
			description: "The user to query",
		},
		{
			type: ApplicationCommandOptionTypes.String,
			name: "category",
			description: "The category to filter from",
		},
	],
	dmPermission: false,
};

const commandConfig: CommandConfig = {
	managementOnly: true,
};

async function handle(bot: Bot, interaction: Interaction): Promise<void> {
	const responder = new Responder(bot, interaction.id, interaction.token);

	const userArg = interaction.data?.options?.[0]?.value;
	const user = (userArg && (await bot.helpers.getUser(String(userArg)))) ||
		interaction.user;
	const userId = userArg || String(user.id);

	const cat = interaction.data?.options?.[1]?.value;

	if (userId == "983595671074512967") {
		return await responder.respond("Beep Boop 🤖");
	}

	if (cat) {
		const userData: ServerUserData = await usersDb.findOne({
			guildId: String(interaction.guildId),
			userId: userId,
			cat: cat,
		});

		if (!userData) {
			return await responder.respond(
				`${
					userId === String(interaction.user.id)
						? "You have"
						: `${user.username} has not`
				} used the bot`,
			);
		}

		return await responder.respond(
			`Links: ${userData.links.join(", \n")}\nTimes: ${userData.times}`,
		);
	} else {
		const userDataList: ServerUserData[] = await usersDb
			.find({
				guildId: String(interaction.guildId),
				userId: userId,
			})
			.toArray();

		if (userDataList.length <= 0) {
			return await responder.respond(
				`${
					user.id === interaction.user.id
						? "You have"
						: `${user.username} has`
				} not used the bot`,
			);
		}

		return await responder.respond(
			userDataList
				.map(
					(userData) =>
						`**${userData.cat}**\nLinks: ${
							userData.links.join(", ")
						}\nTimes: ${userData.times}\n`,
				)
				.join("\n"),
		);
	}
}

export { commandConfig, data, handle };
