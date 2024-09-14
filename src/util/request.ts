import { Bot, Interaction } from "npm:@discordeno/bot";

import {
	catsDb,
	filtersDb,
	limitsDb,
	ServerLimitData,
	ServerUserData,
	UserChosenCategory,
	UserFilter,
	usersDb,
} from "$db";

import isPremium from "../util/isPremium.ts";
import isAdmin from "../util/isAdmin.ts";

import getLinks from "../util/links.ts";

import Responder from "../util/responder.ts";
import createErrorEmbed from "../util/createErrorEmbed.ts";
import { getUserLocale } from "./getIfExists.ts";

import { accessConfig } from "./AccessConfig.ts";

import Logger from "../util/Logger.ts";

const logger = new Logger();

/* For when the user requests a link */
export default async function (
	bot: Bot,
	interaction: Interaction,
	dmUser: boolean,
): Promise<void> {
	const responder = new Responder(bot, interaction.id, interaction.token);

	const userId = String(interaction.user.id);
	const guildId = String(interaction.guildId);

	const name = interaction.user.username;

	const member = await bot.helpers.getMember(guildId, userId);

	const userLocale = getUserLocale(interaction.user);

	if (!member) {
		await responder.respondEmbed(
			await createErrorEmbed(
				"I can't find you in this server. How is this even possible? Perhaps, you left before the interaction was fulfilled?",
				"user_error",
				userLocale,
			),
		);
		return;
	}

	const admin: boolean = await isAdmin(member, guildId);
	const premium: boolean = admin ||
		(await isPremium(member, guildId));

	if (premium) logger.log(`${name} has premium and is requesting a link`);

	const { cat }: UserChosenCategory = (await catsDb.findOne({
		userId: userId,
		guildId: guildId,
	})) || {};

	if (!cat) {
		await responder.respondEmbed(
			await createErrorEmbed(
				"choose a category first",
				"user_error",
				userLocale,
			),
		);
		return;
	}

	let user: ServerUserData = await usersDb.findOne({
		userId: userId,
		guildId: guildId,
		cat: cat,
	});

	if (!user) {
		const insertId = await usersDb.insertOne({
			userId: userId,
			guildId: guildId,
			cat: cat,
			links: [],
			times: 0,
		});

		user = await usersDb.findOne({
			_id: insertId,
		});

		console.log(`Added ${name} for ${cat}`);
	}

	const userFiltersObj: UserFilter = (await filtersDb.findOne({
		userId: userId,
		guildId: guildId,
	})) || {};

	const usersFilters = userFiltersObj.filters;

	if (!usersFilters) {
		await responder.respondEmbed(
			await createErrorEmbed(
				"choose your filters first",
				"user_error",
				userLocale,
			),
		);
		return;
	}

	console.log(`${name} uses ${usersFilters.join(", ")}`);

	let { limit, premiumLimit }: ServerLimitData = (await limitsDb.findOne({
		guildId: guildId,
		cat: cat,
	})) || {
		limit: 0,
		premiumLimit: 0,
	};

	limit = premiumLimit || limit;

	const noLimit: boolean = limit === 0;

	logger.log(noLimit ? `There is no limit` : `The limit is ${limit}`);

	const times: number = user?.times || 0;
	const links: Array<string> = user?.links || [];

	if (!noLimit && times >= limit) {
		logger.log(
			`${name} reached the limit for ${cat}! ${user?.times}/${limit}`,
		);
		await responder.respond("You have reached the monthly limit", {
			locale: userLocale,
		});
		return;
	}

	const linksLeftMsg = (msg: string) =>
		noLimit
			? premium
				? accessConfig.getTranslation({
					type: "misc_string",
					searchString: `You have premium`,
				}, userLocale)
				: `${
					accessConfig.getTranslation(
						{
							type: "misc_string",
							searchString: "There is no limits for",
						},
						userLocale,
					)
				} ${cat}!`
			: msg +
				`${limit - times} ${
					accessConfig.getTranslation({
						type: "misc_string",
						searchString: "links left",
					}, userLocale)
				}`;

	logger.log(
		`${name} ${
			accessConfig.getTranslation({
				type: "misc_string",
				searchString: "requested a",
			}, userLocale)
		} ${cat} ${
			accessConfig.getTranslation({
				type: "misc_string",
				searchString: "link",
			}, userLocale)
		} ${
			accessConfig.getTranslation({
				type: "misc_string",
				searchString: "So far",
			}, userLocale)
		} ${name} ${
			accessConfig.getTranslation({
				type: "misc_string",
				searchString: "has these links",
			}, userLocale)
		}: ${
			links.join(
				", ",
			)
		}; ${
			accessConfig.getTranslation({
				type: "misc_string",
				searchString: "requested a",
			}, userLocale)
		} ${times} ${
			accessConfig.getTranslation({
				type: "misc_string",
				searchString: "link",
			}, userLocale)
		}`,
	);

	const link = await getLinks(guildId, links, usersFilters, cat);

	if (link instanceof Error) {
		await responder.respond(link.message);
		return;
	} else if (typeof link !== "string") {
		await responder.respondEmbed(
			await createErrorEmbed(
				"An unknown error occurred while retrieving the link; this incident has been reported!",
				"bot_error",
				userLocale,
			),
		);
		return;
	}

	await usersDb.updateMany(
		{
			_id: user?._id,
		},
		{
			$set: {
				links: [...links, link],
				times: times + 1,
			},
		},
		{
			upsert: true,
		},
	);

	if (dmUser) {
		const chan = await bot.helpers.getDmChannel(userId);
		const guild = await bot.helpers.getGuild(guildId);

		bot.helpers
			.sendMessage(chan.id, {
				embeds: [
					{
						type: "rich",
						title: cat,
						description: `${link}\n${linksLeftMsg("You have ")}`,
						footer: {
							text: `${
								accessConfig.getTranslation({
									type: "misc_string",
									searchString: "Requested in",
								}, userLocale)
							} ${guild.name}`,
						},
					},
				],
			});

		await responder.respond(
			await accessConfig.getTranslation({
				type: "misc_string",
				searchString: "Check DMs!",
			}, userLocale) +
				(await accessConfig.getConfig()).successIndicator,
		);
		return;
	} else {
		await responder.respondEmbed({
			type: "rich",
			title: cat,
			description: `${link}`,
			footer: {
				text: linksLeftMsg(`${await accessConfig.getTranslation({
					type: "misc_string",
					searchString: "You have ",
				}, userLocale)} `),
			},
		});
		return;
	}
}
