import { Locales, Member, User } from "npm:@discordeno/bot";

import { accessConfig } from "./AccessConfig.ts";

export function getUserLocale(user: User | Member): Locales {
	let realUser: User | undefined;
	if ("user" in user) {
		// This is a member object
		realUser = user.user;
	}
	return realUser?.locale || "en";
}

export function getSuccessIndicator(guildId: string): string {
	// TODO: Get the
	const configRes = accessConfig.getConfig(guildId);
	if (configRes.isErr()) {
		return "";
	}
	return configRes.value.successIndicator;
}
