import { ok } from "npm:neverthrow";

import { Embed } from "discordeno";
import { Locales } from "npm:@discordeno/types";

import { logger } from "./Logger.ts";

import config from "$config";
import { accessConfig } from "./AccessConfig.ts";

// TODO: Update everything to use await when using createErrorEmbe
/**
 * Creates an error embed
 * @returns: Note: there is no point of returning any real error back because it would need to be handled by this function, which we already know is broken, so instead it is logged here and no error needs to be logged outside of this function, therefore it sends back an empty string. Void can't be returned in neverthrow as a result.
 */
export default async (
	msg: string,
	type: "user_error" | "bot_error",
	locale?: Locale,
): Promise<Embed> => {
	const userErrStringRes = await accessConfig.getTranslation({
		type: "misc_string",
		locale: Locales,
		searchString: "User error",
		isPartOfError: true,
	});
	if (userErrStringRes.isErr()) {
		logger.error(
			`Error while getting the translation for the user error string: ${userErrStringRes.error}`,
		);
		return msg;
	}
	const userErrStr = userErrStringRes.value;
	const botErrStrRes = await accessConfig.getTranslation({
		type: "misc_string",
		searchString: "Bot error",
		isPartOfError: true,
	});
	if (botErrStrRes.isErr()) {
		logger.error(
			`Error while getting the translation for the bot error string: ${botErrStrRes.error}`,
		);
		return msg;
	}
	const botErrStr = botErrStrRes.value;

	const embed: Embed = {
		type: "rich",
		title: type === "user_error" ? userErrStr : botErrStr,
	};

	if (type === "user_error") {
		embed.description = `"${msg}"`;
	}
	if (type === "bot_error") {
		embed.description = `"${msg}". ${
			accessConfig.getTranslation({
				type: "misc_string",
				searchString:
					"This isn't your fault. Please report this in the support server",
				isPartOfError: true,
			})
		} ${config.supportServerInvite}.`;
	}

	return ok(embed);
};
