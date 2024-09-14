// The NPM version uses 19.0.0, but the Deno version use 18.0.1 which doesn't have what we need
import {
	CreateSlashApplicationCommand,
	InteractionTypes,
} from "npm:@discordeno/types";
import { Bot, createBot, Interaction, Member, User } from "npm:@discordeno/bot";
import { Collection } from "npm:@discordeno/utils";

import filterHandle from "./util/filter.ts";
import catHandle from "./util/cat.ts";
import requestHandle from "./util/request.ts";
import reportHandle from "./util/report.ts";

import Responder from "./util/responder.ts";
import createErrorEmbed from "./util/createErrorEmbed.ts";

import isAdmin from "./util/isAdmin.ts";

import { faultToleranceDb } from "$db";

import Logger from "./util/Logger.ts";

import wrapCommandConfigWithLocalizations from "./util/wrapCommandConfigWithLocalizations.ts";

import config from "$config";

import { accessConfig } from "./util/AccessConfig.ts";

const commands = new Collection();

const isDebug = Deno.args.includes("--debug");

const logger = new Logger();

export default async function initBot(
	token: string,
	botId: number,
): Promise<void> {
	const baseBot: Bot = createBot({
		token,
		botId: BigInt(botId),
		events: {
			ready(): void {
				logger.log("Ready!");
			},
			async guildMemberAdd(member: Member, user: User) {
				logger.log(
					`${user.username}#${user.discriminator} joined ${member.guildId}`,
				);

				// TODO: Check the user DB to see if the user has already onboarded before dming them
				// TODO: Create a command for dispenser managers to be able to dm everyone who hasn't onboarded yet or recieved an onboarding message to onboard them (this would likely be people who joined pre-Dispenser v1.2 or those who joined when the bot was offline)

				// TODO: Use .getConfig
				const shouldOnboardMemberUponJoiningRes = await accessConfig
					.getOverrideRich(
						"onboarding.onboardMemberUponJoining",
						member.guildId,
					);
				if (shouldOnboardMemberUponJoiningRes.isErr()) {
					logger.error(
						`Error while getting the config value for determining if the bot should send a welcome message: ${shouldOnboardMemberUponJoiningRes.error}`,
					);
					return;
				}

				const shouldOnboardMemberUponJoining =
					shouldOnboardMemberUponJoiningRes.value;
				if (typeof shouldOnboardMemberUponJoining !== "boolean") {
					logger.error(
						`Custom error while getting the config value for determining if the bot should send a welcome message: shouldOnboardMemberUponJoining is not of the expected type boolean`,
					);
					return;
				}

				if (shouldOnboardMemberUponJoining) {
					/*
						TODO: Send the user onboarding

						It will be of three parts

						1. Choose your filters or if your filter isn't there have the user fill out the form to request for a filter (that gets sent to the Dispenser support server in the config under config.supportServerGuildId)
						2. Choose the categories from the server that you want to subscribe to
						3. Thank the user for completing onboarding and tell them about the bot and advise them to go use the /crowdsource command so they get in more accurate cohorts. Also tell the user that he/she could also go back to onboarding at any time with /onboarding.
					*/
				}
			},
			async interactionCreate(interaction: Interaction) {
				// TODO: Make the user accept the ToS and Privacy Policy before they can use the bot

				const bot = interaction.bot;

				const responder = new Responder(
					bot,
					interaction.id,
					interaction.token,
				);
				const cmdNotFoundErr = await createErrorEmbed(
					"Command not found on our backend! Report this to the Dispenser dev.",
					"bot_error",
				);

				try {
					if (
						interaction.type === InteractionTypes.ApplicationCommand
					) {
						// deno-lint-ignore no-explicit-any
						const command: any = commands.get(
							interaction.data?.name,
						);

						if (!command) {
							responder.respondEmbed(cmdNotFoundErr);
							return;
						}

						const commandName = command.data.name;

						if (
							command?.managementOnly &&
							!(await isAdmin(
								await bot.helpers.getMember(
									String(interaction.guildId),
									interaction.user.id,
								),
								String(interaction.guildId),
							))
						) {
							logger.error(
								`${interaction.user.username} tried to run ${command.data.name} without permission`,
							);
							return await responder.respondEmbed(
								createErrorEmbed(
									"you don't have permission to run this command!",
									"user_error",
								),
							);
						}

						try {
							await command?.handle(bot, interaction);

							faultToleranceDb.deleteMany({
								commandName,
							});
						} catch (err) {
							const errFmt =
								`Error running ${command.data.name}: ${err.stack}`;
							if (isDebug) throw new Error(errFmt);
							else logger.error(errFmt);

							await faultToleranceDb.insertOne({
								commandName,
								error: err.message,
							});
						}
					} else if (
						interaction.type ===
							InteractionTypes.ApplicationCommandAutocomplete
					) {
						const command: {
							data: CreateSlashApplicationCommand;
							autocompleteHandle?: (
								interaction: Interaction,
								commandData: CreateSlashApplicationCommand,
							) => Promise<void>;
							adminOnly?: boolean;
						} = commands.get(
							interaction.data?.name,
						);

						if (!command) {
							responder.respondEmbed(cmdNotFoundErr);
							return;
						}

						try {
							if ("autocompleteHandle" in command) {
								await command.autocompleteHandle(
									interaction,
								);
							} else {
								// if no autocomplete for data
								const errMsg =
									"Unexpected: tried to get an autocomplete for a command that didn't have an autocomplete handler";
								await responder.respondEmbed(
									createErrorEmbed(errMsg, "bot_error"),
								);
								logger.error(errMsg);
							}
						} catch (err) {
							const errMsg =
								`Error while trying to get the autocomplete for the command, ${command.data.name}`;
							responder.respondEmbed(
								createErrorEmbed(errMsg, "bot_error"),
							);
							logger.error(errMsg + `:\n\t${err.stack}`);
						}
					} else if (
						interaction.type === InteractionTypes.MessageComponent
					) {
						if (!interaction.data) return;

						const id: string = interaction.data.customId || "";

						if (isDebug) logger.log(`Interacting with ${id}`);

						const isDmRequest = id === "dmRequest";
						const isRequest = id === "request";
						const isReport = id === "report";

						const isCat = id === "cat";
						const isFilter = id === "filter";

						if (isDmRequest) requestHandle(bot, interaction, true);
						else if (isRequest) {
							requestHandle(bot, interaction, false);
						} else if (isReport) reportHandle(bot, interaction);
						else if (isCat) catHandle(bot, interaction);
						else if (isFilter) filterHandle(bot, interaction);
					}
				} catch (err) {
					console.error(err);
				}
			},
		},
	});

	// deno-lint-ignore ban-ts-comment
	// @ts-ignore
	const bot = baseBot;

	for await (
		const file of Deno.readDir(new URL("./commands", import.meta.url))
	) {
		if (file.name.endsWith(".ts")) {
			try {
				const command: {
					data: CreateSlashApplicationCommand;
					handle: (
						bot: Bot,
						interaction: Interaction,
					) => Promise<void>;
				} = await import(`./commands/${file.name}`);

				command.data = wrapCommandConfigWithLocalizations(command.data);

				Object.freeze(command.data);
				Object.freeze(command);

				try {
					logger.log(`Uploading ${command.data.name}`);
					//console.log(bot.helpers);
					await bot.helpers.createGlobalApplicationCommand(
						command.data,
					);
				} catch (err) {
					logger.error(`Error in ${file.name}\n${err.stack}`);
				}

				commands.set(command.data.name, command);
			} catch (err) {
				logger.error(`Error importing ${file.name}\n${err}`);
			}
		}
	}

	// deno-lint-ignore ban-ts-comment
	// @ts-ignore
	await bot.start();
}
