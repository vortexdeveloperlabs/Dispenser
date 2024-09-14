import { Bot, Interaction } from "npm:@discordeno/bot";
import {
	ApplicationCommandOptionTypes,
	ApplicationCommandTypes,
	CreateSlashApplicationCommand,
} from "npm:@discordeno/types";

import {
	limitsDb,
	Link,
	linksDb,
	rolesDb,
	ServerLimitData,
	ServerRoleData,
} from "$db";

import { CommandConfig } from "../types/commands.d.ts";

import Responder from "../util/responder.ts";

import { getUserLocale } from "../util/getIfExists.ts";
import { accessConfig } from "../util/AccessConfig.ts";

import autocompleteHandleCategoryOnly from "../util/autocompleteHandleCategoryOnly.ts";

const data: CreateSlashApplicationCommand = {
	name: "list",
	description: "Lists all the links in the guild",
	type: ApplicationCommandTypes.ChatInput,
	options: [
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

	const cursor = await linksDb.find({ guildId: String(interaction.guildId) });

	const links: Link[] = await cursor.toArray();

	const userLocale = getUserLocale(interaction.user);

	if (links.length === 0) {
		await responder.respond(
			await accessConfig.getTranslation({
				type: "in_command",
				searchString: "There are no links to query",
				commandTarget: "list",
				isEmbed: false,
			}, userLocale),
		);
		return;
	}

	const getList: () => Promise<string> = async (): Promise<string> => {
		const { admin: adminRoleId, premium: premiumRoleId }: ServerRoleData =
			(await rolesDb.findOne({
				guildId: String(interaction.guildId),
			})) || {};

		const list: string[] = await Promise.all(
			links.map(async (link) => {
				let line = "";

				const { limit: serverLimit, premiumLimit }: ServerLimitData =
					(await limitsDb.findOne({
						guildId: String(interaction.guildId),
						cat: link.cat,
					})) || {};

				const adminWord = await accessConfig.getTranslation({
					type: "in_command",
					searchString: "Admin",
					commandTarget: "list",
					isEmbed: false,
				}, userLocale);
				const premiumWord = await accessConfig.getTranslation({
					type: "in_command",
					searchString: "Premium",
					commandTarget: "list",
					isEmbed: false,
				}, userLocale);
				const limitWord = await accessConfig.getTranslation({
					type: "in_command",
					searchString: "Limit",
					commandTarget: "list",
					isEmbed: false,
				}, userLocale);
				const linkWord = await accessConfig.getTranslation({
					type: "in_command",
					searchString: "Link",
					commandTarget: "list",
					isEmbed: false,
				}, userLocale);

				const notSetPhrase = accessConfig.getTranslation({
					type: "in_command",
					searchString: "Not set",
					commandTarget: "list",
					isEmbed: false,
				}, userLocale);

				if (serverLimit && premiumLimit) {
					line +=
						`*${link.cat}* **${limitWord}**: ${serverLimit} **${premiumWord} ${limitWord}**: ${premiumLimit} **${linkWord}**: ${link.link}`;
				} else if (serverLimit) {
					line +=
						`*${link.cat}* **${limitWord}**: ${serverLimit} ${linkWord}: ${link.link}`;
				} else line += `*${link.cat}* ${linkWord}: ${link.link}`;

				return line;
			}),
		);

		return (
			`**${await accessConfig.getTranslation({
				type: "in_command",
				searchString: "Role Ids",
				commandTarget: "list",
				isEmbed: false,
			})}**\n` +
			`${adminWord}: ` +
			(adminRoleId ? adminRoleId : notSetPhrase) +
			"\n" +
			`${premiumWord}: ` +
			(premiumRoleId ? premiumRoleId : notSetPhrase) +
			"\n" +
			"\n" +
			list.join("\n")
		);
	};

	const list: string = await getList();

	await responder.respond(
		!list
			? await accessConfig.getTranslation({
				type: "in_command",
				searchString: "Failed to format the list",
				commandTarget: "list",
				isEmbed: false,
			}, userLocale)
			: list,
	);
}

export { autocompleteHandle, commandConfig, data, handle };
