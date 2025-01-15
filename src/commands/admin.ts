import { Bot, Interaction } from "npm:@discordeno/bot";
import {
	ApplicationCommandOptionTypes,
	ApplicationCommandTypes,
	CreateSlashApplicationCommand,
} from "npm:@discordeno/types";

import { CommandConfig } from "../types/commands.d.ts";

import { rolesDb } from "$db";

import Responder from "../util/responder.ts";

import { getUserLocale } from "../util/getIfExists.ts";
import { accessConfig } from "../util/AccessConfig.ts";

const data: CreateSlashApplicationCommand = {
	name: "admin",
	description: "Give admin status to a role",
	type: ApplicationCommandTypes.ChatInput,
	options: [
		{
			type: ApplicationCommandOptionTypes.Role,
			name: "role",
			description: "The role that gets the status",
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

	const guildId = String(interaction.guildId);

	const roleId = interaction.data?.options?.[0]?.value;

	rolesDb.updateMany(
		{
			guildId: guildId,
		},
		{
			$set: {
				admin: String(roleId),
			},
		},
		{
			upsert: true,
		},
	);

	await responder.respond(`${
		accessConfig.getTranslation({
			type: "misc_string",
			searchString: "Gave admin status to",
		}, getUserLocale(interaction.user))
	} ${roleId}`);
}

export { commandConfig, data, handle };
