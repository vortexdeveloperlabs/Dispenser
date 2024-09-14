import { Bot, Interaction } from "npm:@discordeno/bot";
import {
	ApplicationCommandOptionTypes,
	ApplicationCommandTypes,
	CreateSlashApplicationCommand,
} from "npm:@discordeno/types";

import { rolesDb } from "$db";

import Responder from "../util/responder.ts";

import { CommandConfig } from "../types/commands.d.ts";

import { accessConfig } from "../util/AccessConfig.ts";
import { getUserLocale } from "../util/getIfExists.ts";

const data: CreateSlashApplicationCommand = {
	name: "premium",
	description: "Give premium perms to a role",
	type: ApplicationCommandTypes.ChatInput,
	options: [
		{
			type: ApplicationCommandOptionTypes.Role,
			name: "role",
			description: "The role that gets the perms",
		},
	],
};

const commandConfig: CommandConfig = {
	managementOnly: true,
};

async function handle(bot: Bot, interaction: Interaction): Promise<void> {
	const responder = new Responder(bot, interaction.id, interaction.token);

	const guildId = String(interaction.guildId);

	const roleId = interaction.data?.options?.[0]?.value;

	rolesDb.updateMany(
		{
			guildId: guildId,
		},
		{
			$set: {
				premium: String(roleId),
			},
		},
		{
			upsert: true,
		},
	);

	return await responder.respond(
		`${
			accessConfig.getTranslation({
				type: "in_command",
				searchString: "Gave premium status to",
				commandTarget: "premium",
				isEmbed: false,
			}, getUserLocale(interaction.user))
		} ${roleId}`,
	);
}

export { commandConfig, data, handle };
