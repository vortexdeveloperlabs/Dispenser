import { ResultAsync } from "npm:neverthrow";

import { Interaction, Member } from "npm:@discordeno/bot";

import { ServerUserData, usersDb } from "$db";
import type Responder from "./responder.ts";

import createErrorEmbed from "./createErrorEmbed.ts";

import { accessConfig } from "./AccessConfig.ts";
import { getUserLocale } from "./getIfExists.ts";

interface OnboardConditions {
	requiresFirstTime: boolean;
	requriesNotRecievedOnboarding: boolean;
}

export default async (
	interaction: Interaction,
	member: Member,
	onboardConditions: OnboardConditions,
	responder: Responder,
): void => {
	let userData: ServerUserData;

	try {
		userData = await usersDb.findOne({ id: member.id });
	} catch (err) {
		responder.respondEmbed(
			await createErrorEmbed(
				// TODO: Use locale
				`Error trying to get the user from the db while trying to onboard the user: ${err}`,
				"bot_error",
				getUserLocale(member),
			),
		);
		return;
	}
	if (userData === null) {
		responder.respondEmbed(
			await createErrorEmbed(
				`Error while trying to onboard user: failed to get the user from the id of ${member.id}`,
				"bot_error",
				getUserLocale(member),
			),
		);
		return;
	}

	const hasNotOnboarded = userData.hasOnboarded !== true;
	const hasNotRecievedOnboarding = userData.hasRecievedOnboarding !== true;

	if (onboardConditions.requiresFirstTime === true) {
		if (!hasNotOnboarded) {
			return;
		}
	}
	if (onboardConditions.requriesNotRecievedOnboarding === true) {
		if (!hasNotRecievedOnboarding) {
			return;
		}
	}

	// TODO: Implement the onboarding process
	const onboardRes = await sendMemberOnboardingMessage(interaction, member);
	if (onboardRes.isErr()) {
		responder.respondEmbed(
			await createErrorEmbed(
				onboardRes.error,
				"bot_error",
				getUserLocale(member),
			),
		);
		return;
	}

	if (hasNotOnboarded) {
		usersDb.updateOne({ id: member.id }, {
			$set: { hasOnboarded: true },
		});
	}
	if (hasNotRecievedOnboarding) {
		usersDb.updateOne({ id: member.id }, {
			$set: { hasRecievedOnboarding: true },
		});
	}
};

/* Skips the condition checking and just onboards the user */
async function sendMemberOnboardingMessage(
	interaction: Interaction,
	member: Member,
): ResultAsync<void, string> {
	try {
		await respondToUser;
	} catch (err) {
		err(`Error while trying to onboard user: ${err}`);
	}
}
