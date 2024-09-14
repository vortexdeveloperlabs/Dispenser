import { MongoClient } from "https://deno.land/x/atlas_sdk@v1.1.2/mod.ts";

import { Embed } from "npm:@discordeno/bot";

// Generic Types
type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type IsNumber<S extends string> = S extends `${Digit}${rest}`
	? rest extends "" ? S
	: IsNumber<rest>
	: never;

type FixedString<N extends Number> = { length: N } & string;
type FixedNumberString<N extends Number> = FixedString<N> & IsNumber<string>;

// Project specific types
type DiscordId = FixedNumberString<17> | FixedNumberString<18>;
// TODO: Define a Discord Token Type

type BotConfig = {
	// Your Discord's bot token
	token: string;
	// Bot ID,
	id: DiscordId;
	// ID of the testing server
	guildId: DiscordId;
};

/* The server owners may override this with /config. You are supposed to provide sensible defaults here. */
/**
 * @returns the new string
 */
type StringReplacementHandler = (str: string) => string;
interface PerServerConfig {
	defaultEmbed?: Embed;
	/* The key is the string to replace (in english) and the value is the locale override for it */
	localeStringOverrides?: { [key: string]: LocaleStringOverride };
	/* string to replace: replacement regexp (as a string) */
	regExpStringReplacements: { [key: string]: string };
	/* Button text to look for: button color type on Discord */
	buttonColorOverrides: {
		[key: string]: "blurple" | "grey" | "green" | "red";
	};
	/* You must specify the name of the command as the key */
	embedOverride?: { [key: string]: Embed };
	/* The text after a successful command that results in user, cohort, or link data being modified on the db stores */
	successIndicator: string;
	/* Defaults to true */
	isUserAllowedToUseNonEmpherals?: boolean;
	/* Participates in the users getting links without being in the server */
	globalLinks: boolean;
	/* Can the server be found in the server gallery? */
	publiclyListed: boolean;
	onboarding: {
		onboardMemberUponJoining: boolean;
	};
	supportsLinkCatSubscriptions: boolean;
}
interface LocaleStringOverride {
	locale: string;
	newString: string;
}
type PossiblePerServerConfigOptionTypes =
	| string
	| boolean
	| number
	| Embed
	| LocaleStringOverride;

export interface Config {
	devMode: boolean;
	bot: BotConfig;
	// This is useful if you have a bot for testing, so you can experiment without affecting your users.
	devBot?: BotConfig;
	tolgee: {
		projectId: string;
		cdnURL: string;
		apiKey: string;
	};
	mongoClient: MongoClient;
	defaultPerServerConfig: PerServerConfig;
	// TODO: Make a type for guildIds and use it here
	supportServerGuildId: string;
	supportServerInvite: string;
}
