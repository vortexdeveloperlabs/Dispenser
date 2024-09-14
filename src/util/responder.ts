import { Bot, Interaction, Locales, User } from "npm:@discordeno/bot";
import { InteractionResponseTypes, MessageFlags } from "npm:@discordeno/types";

import { accessConfig } from "./AccessConfig.ts";
import createErrorEmbed from "./createErrorEmbed.ts";
import { getUserLocale } from "./getIfExists.ts";

import { logger } from "./Logger.ts";

interface RespondOptions {
	dmChannelId?: string;
	locale?: Locales;
}

async function createUnableToGetChanWhenDmingUserErrorMsg(
	err: string,
	locale: string,
	elaboration = "in dms",
) {
	return (`${await accessConfig.getTranslation({
		type: "misc_string",
		searchString:
			"Failed to get the channel when trying to respond to a user",
		isPartOfError: true,
	})} ${elaboration}: ${err}\n${await accessConfig.getTranslation({
		type: "misc_string",
		searchString: "This will cause the interaction to fail",
		isPartOfError: true,
	})}`);
}

export default class {
	bot: Bot;
	id: bigint;
	token: string;

	constructor(bot: Bot, id: bigint, token: string) {
		this.bot = bot;
		this.id = id;
		this.token = token;
	}
	async respond(msg: string, options?: RespondOptions): Promise<void> {
		let possiblyTranslatedMsg = msg;
		if (typeof options !== "undefined" && "translate" in options) {
			if ("dmChannelId" in options) {
				await this.bot.helpers
					.sendMessage(options.dmChannelId, {
						content: msg,
					});
				return;
			}
			if (
				"interaction" in options.translate &&
				"locale" in options.translate
			) {
				const translationRes = await accessConfig.getTranslation({
					type: "misc_string",
					searchString: msg,
				}, options.translate.locale);
				if (translationRes.isOk()) {
					possiblyTranslatedMsg = translationRes.value;
				}
			}
		}
		try {
			await this.bot.helpers.sendInteractionResponse(
				this.id,
				this.token,
				{
					type: InteractionResponseTypes.ChannelMessageWithSource,
					data: {
						content: msg,
						flags: MessageFlags.Ephemeral,
					},
				},
			);
			return;
		} catch (err) {
			logger.error(
				`${await accessConfig.getTranslation({
					type: "misc_string",
					searchString:
						"Fatal error while trying to respond to an interaction",
					isPartOfError: true,
				})}: ${err}\n${await accessConfig.getTranslation({
					type: "misc_string",
					searchString: "This will cause the interaction to fail",
					isPartOfError: true,
				})}`,
			);
		}
	}
	async respondToUserInDms(msg: string, user: string | User) {
		const userIsId = typeof user === "string";
		const userId = userIsId ? user : user.id;
		try {
			const chan = await this.bot.helpers.getDmChannel(
				userId,
			);
			return await this.respond(msg, {
				dmChannelId: String(chan.id),
			});
		} catch (err) {
			logger.error(await createUnableToGetChanWhenDmingUserErrorMsg(err));
		}
	}
	async respondEmbed(embed: Embed, dmChannelId?: string) {
		if (!("color" in embed)) {
			// TODO: Instead look in the config for the default color
			embed.color = 0xe071ac;
		}
		if (dmChannelId) {
			return await this.bot.helpers
				.sendMessage(dmChannelId, {
					embeds: [embed],
				});
		}
		return await this.bot.helpers.sendInteractionResponse(
			this.id,
			this.token,
			{
				type: InteractionResponseTypes.ChannelMessageWithSource,
				data: {
					embeds: [embed],
					flags: MessageFlags.Ephemeral,
				},
			},
		);
	}
	async respondToUserInDmsEmbed(embed: Embed, user: User | string) {
		try {
			const chan = await this.bot.helpers.getDmChannel(
				typeof user === "string" ? user : user.id,
			);
			return await this.respondEmbed(embed, String(chan.id));
		} catch (err) {
			logger.error(
				await createUnableToGetChanWhenDmingUserErrorMsg(
					err,
					// TODO: Convert to user
					getUserLocale(user),
					await accessConfig.getTranslation("in dms with Embed"),
				),
			);
		}
	}
}
