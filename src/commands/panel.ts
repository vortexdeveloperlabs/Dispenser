import { Bot, Interaction } from "npm:@discordeno/bot";
import {
	ApplicationCommandOptionTypes,
	ButtonStyles,
	CreateSlashApplicationCommand,
	InteractionResponseTypes,
	MessageComponentTypes,
} from "npm:@discordeno/types";

import { linksDb } from "$db";

import { CommandConfig } from "../types/commands.d.ts";

import Responder from "../util/responder.ts";

import { getUserLocale } from "../util/getIfExists.ts";

import { accessConfig } from "../util/AccessConfig.ts";

// TODO: Instead of retrieving values inside of the panel, look inside of the server `/config`
// TODO: Support panel updating `/panel update <messageLink>`. TODO: Also make it so that when the user adds the bot they can go use the context and click on apps to update.
const data: CreateSlashApplicationCommand = {
	name: "panel",
	description: "Creates a link selection panel",
	options: [
		/*
		{
			type: ApplicationCommandOptionTypes.Mentionable,
			name: "usersWithAccess",
			description:
				"This will make the panel only accessible to the users or users with the role provided",
		},
		*/
		{
			type: ApplicationCommandOptionTypes.Boolean,
			name: "dm",
			description:
				"Message the user the link, rather than an hidden message in this channel",
		},
		{
			type: ApplicationCommandOptionTypes.Channel,
			name: "report",
			description: "The channel to send issues to",
		},
		{
			type: ApplicationCommandOptionTypes.String,
			name: "cat",
			description: "Category text",
		},
		{
			type: ApplicationCommandOptionTypes.String,
			name: "filter",
			description: "Filter text",
		},
		{
			type: ApplicationCommandOptionTypes.String,
			name: "title",
			description: "Title text",
		},
		{
			type: ApplicationCommandOptionTypes.String,
			name: "footer",
			description: "Footer text",
		},
		{
			type: ApplicationCommandOptionTypes.String,
			name: "button",
			description: "Button text",
		},
		{
			type: ApplicationCommandOptionTypes.String,
			name: "color",
			description: "Color",
		},
	],
	dmPermission: false,
};

const commandConfig: CommandConfig = {
	managementOnly: true,
};

// TODO: Create a config: isUserAllowedToUseNonEmpherals

async function handle(bot: Bot, interaction: Interaction): Promise<void> {
	const responder = new Responder(bot, interaction.id, interaction.token);

	const userLocale = getUserLocale(interaction.user);

	// TODO: Remove all configuration options and make the server managers use /config
	const dmUser = interaction.data?.options?.find(
		(opt) => opt.name === "dm",
	)?.value;
	//const report = interaction.data?.options?.find(
	//(opt) => opt.name === "report",
	//)?.value;
	const title =
		interaction.data?.options?.find((opt) => opt.name === "title")?.value ||
		"Selection";
	const catTitle = await accessConfig.getTranslation({
		type: "in_command",
		searchString: "Select a proxy site",
		commandTarget: "panel",
		isEmbed: true,
	}, userLocale);
	const filterTitle = await accessConfig.getTranslation({
		type: "in_command",
		searchString: "Select your filters",
		commandTarget: "panel",
		isEmbed: true,
	}, userLocale);
	const footer = await accessConfig.getTranslation({
		type: "in_command",
		searchString: "Hosted by Vyper Group",
		commandTarget: "panel",
		isEmbed: true,
	}, userLocale);
	const button = await accessConfig.getTranslation({
		type: "in_command",
		searchString: "Request",
		commandTarget: "panel",
		isEmbed: true,
	}, userLocale);
	const color = "e071ac";

	const links = await linksDb
		.find({
			guildId: String(interaction.guildId),
		})
		.toArray();

	// TODO: Limit array to 25
	const cats: string[] = [
		...new Set(
			links
				.map((entry) => entry.cat)
				.filter((entry) => typeof entry !== "undefined")
				.sort(),
		),
	];

	if (cats.length === 0) {
		await responder.respond("There are no links!", {
			locale: userLocale,
		});
		return;
	}

	// Create dropdown

	const options = cats.map(function (cat) {
		return {
			label: cat,
			value: cat,
		};
	});

	const filters = [
		{
			label: await accessConfig.getTranslation({
				type: "in_command",
				searchString: "Lightspeed",
				commandTarget: "panel",
				isEmbed: true,
			}, userLocale),
			value: "ls",
		},
		{
			label: await accessConfig.getTranslation({
				type: "in_command",
				searchString: "other",
				commandTarget: "panel",
				isEmbed: true,
			}, userLocale),
			value: "other",
		},
	];

	const embed = {
		type: InteractionResponseTypes.ChannelMessageWithSource,
		data: {
			embeds: [
				{
					type: "rich",
					color: parseInt(`0x${color}`),
					title: title,
					footer: {
						text: footer,
					},
				},
			],
			components: [
				{
					type: MessageComponentTypes.ActionRow,
					components: [
						{
							type: MessageComponentTypes.SelectMenu,
							customId: "cat",
							placeholder: catTitle,
							options: options,
						},
					],
				},
				{
					type: MessageComponentTypes.ActionRow,
					components: [
						{
							type: MessageComponentTypes.SelectMenu,
							customId: "filter",
							placeholder: filterTitle,
							options: filters,
							maxValues: filters.length,
						},
					],
				},
				{
					type: MessageComponentTypes.ActionRow,
					components: [
						{
							type: MessageComponentTypes.Button,
							label: button,
							customId: dmUser ? "dmRequest" : "request",
							style: ButtonStyles.Primary,
							disabled: false,
						},
						{
							type: MessageComponentTypes.Button,
							label: await accessConfig.getTranslation({
								type: "in_command",
								searchString: "Report",
								commandTarget: "panel",
								isEmbed: true,
							}, userLocale),
							customId: "report",
							style: ButtonStyles.Danger,
							disabled: false,
						},
					],
				},
			],
		},
	};

	return await bot.helpers.sendInteractionResponse(
		interaction.id,
		interaction.token,
		embed,
	);
}

export { commandConfig, data, handle };
