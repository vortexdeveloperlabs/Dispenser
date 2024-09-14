import { ObjectId } from "npm:mongodb";

import config from "$config";

import { PerServerConfig } from "./types/config.d.ts";

export interface Cohort {
	guildId: string;
	districtShortname: string;
	/* The filters encountered in their districts */
	filters?: string[];
	/* For managed chromebooks */
	districtPolicy?: string;
	/* Object IDs of LinkData */
	linksRecieved: ObjectId[];
	/* When the Cohort was first formed */
	createdAt: number;
}

/* The filters the user has are collected in the corresponding cohorts created with the onboarding process, so they don't need to be here */
export interface CrowdsourceReport {
	relevantCohorts: Cohort[];
	/* The snowflake ID of the user who submitted it */
	by: string;
	chromePolicy?: string;
	/* This is only offered if they choose to not provide the policy (chrome://policy may also be blocked) */
	filteringExtURLs?: string[];
	appleMobileconfig?: string;
	blockpageURLs?: string[];
	forcedDNSServers?: string[];
	forcedDoHServers?: string[];
	created: {
		// The Discord snowflake ID of whoever  created the link
		by: string;
		// This should be a UNIX timestamp
		at: string;
	};
	// The UNIX timestamp of when the report was last modified
	lastModified: string;
}

export type PremiumLevel = {
	_id: ObjectId;
	guildId: string;
	userIds: string[];
} | {
	_id: ObjectId;
	guildId: string;
	roleIds: string;
} | {
	_id: ObjectId;
	guildId: string;
	userIds: string[];
	roleIds: string;
};

export interface UserFilter {
	guildId: string;
	userId: string;
	filters: Array<string>;
}

export interface UserChosenCategory {
	guildId: string;
	userId: string;
	cat: string;
}

export interface GlobalUserData {
	_id: ObjectId;
	guildId: string;
	/* The snowflake ID of the user */
	userId: string;
	cohortId: ObjectId;
	hasOnboarded: boolean;
	hasRecievedOnboarding: boolean;
	/* If they try to run an interaction for the first, it will tell them that they must read the Privacy Policy and Terms of Service and agree to them with three buttons "I agree", "Terms of Service", and "Privacy Policy." If they do another interaction and they still haven't agreed it will tell them in the first sentence. "You haven't yet agreed to the Terms of Service and Privacy Policy!" */
	hasRecievedLegalPrompt: boolean;
	hasAgreedToLegal: boolean;
}

export interface ServerUserData {
	_id: ObjectId;
	guildId: string;
	/* The snowflake ID of the user */
	userId: string;
	/* The links the user has already recieved */
	links: Array<string>;
	/* The amount of time the user has used the links post-reset */
	times: number;
	/* Is the user blocked from getting links to the server? */
	blocked: boolean;
	/* A list of categories the user is subscribed to */
	subscriptionList: string[];
}

export interface LinkData {
	guildId: string;
	cat: string;
	link: string;
	supportedPremiumLevels: string[];
	created: {
		// The Discord snowflake ID of whoever created the link
		by: string;
		// This should be a UNIX timestamp
		at: string;
	};
	lastModified: {
		// The Discord snowflake ID of whoever last updated the link
		by: string;
		// This should be a UNIX timestamp
		at: string;
	};
}

interface ServerGuildConfig {
	guildId: string;
	config: PerServerConfig;
}

export interface ServerLimitData {
	guildId: string;
	cat: string;
	limit: number;
	premiumLimit: number;
}

export interface ServerRoleData {
	guildId: string;
	admin: string;
	premium: string;
}

interface LogChannels {
	guildId: string;
	id: string;
}

interface PerServerConfigOverrides {
	guildId: string;
	config: PerServerConfig;
}

interface FaultToleranceAPI {
	// The key
	nodeHost: string;
	// The value
	brokenCommands: {
		commandName: string;
		errorMessage?: string;
	}[];
}

const db = config.mongoClient.db(config.devMode ? "devBot" : "bot");

const perServerConfigOverridesDb = db.collection<PerServerConfig>(
	"perServerConfigOverrides",
);
const filtersDb = db.collection<UserFilter>("filter");
const catsDb = db.collection<UserChosenCategory>("cat");
const usersDb = db.collection<ServerUserData>("users");
const linksDb = db.collection<Link>("links");
const limitsDb = db.collection<ServerLimitData>("limit");
const rolesDb = db.collection<ServerRoleData>("roles");
const chansDb = db.collection<LogChannels>("chans");

const faultToleranceDb = db.collection<FaultToleranceAPI>("faultToleranceAPI");

export {
	catsDb,
	chansDb,
	faultToleranceDb,
	filtersDb,
	limitsDb,
	linksDb,
	perServerConfigOverridesDb,
	rolesDb,
	usersDb,
};
