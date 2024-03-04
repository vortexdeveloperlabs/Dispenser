import {
    Collection,
    createBot,
    InteractionTypes,
    startBot,
    Bot,
    Interaction,
} from "discordeno";

import {
    enableCachePlugin,
    enableCacheSweepers,
} from "https://deno.land/x/discordeno_cache_plugin@0.0.21/mod.ts";

import filterHandle from "./handler/filter.ts";
import catHandle from "./handler/cat.ts";
import requestHandle from "./handler/request.ts";
import reportHandle from "./handler/report.ts";

import Responder from "./util/Responder.ts";

import isAdmin from "./util/isAdmin.ts";

import { faultToleranceDb } from "$db";
import runCommand from "./runCommand.ts";

const commands = new Collection();

const isDebug = Deno.args.includes("--debug");

export default async function initBot(
    token: string,
    botId: number
): Promise<void> {
    const baseBot: Bot = createBot({
        token,
        botId: BigInt(botId),
        events: {
            ready(): void {
                console.log("Ready!");
            },
            async interactionCreate(bot: Bot, interaction: Interaction) {
                try {
                    if (
                        interaction.type === InteractionTypes.ApplicationCommand
                    ) {
                        const responder = new Responder(
                            bot,
                            interaction.id,
                            interaction.token
                        );

                        // deno-lint-ignore no-explicit-any
                        const command: any = commands.get(
                            interaction.data?.name
                        );

                        if (!command) return;

                        const commandName = command.data.name;

                        const isAdmin = await isAdmin(
                            interaction.member,
                            String(interaction.guildId)
                        );

                        if (command?.adminOnly && !isAdmin) {
                            console.error(
                                `${interaction.user.username} tried to run ${commandName} without permission`
                            );
                            return await responder.respond(
                                "You don't have permission to run this command!"
                            );
                        }

                        runCommand(bot, interaction, command, isAdmin);
                    } else if (
                        interaction.type === InteractionTypes.MessageComponent
                    ) {
                        if (!interaction.data) return;

                        const id: string = interaction.data.customId || "";

                        if (isDebug) console.log(`Interacting with ${id}`);

                        const isDmRequest = id === "dmRequest";
                        const isRequest = id === "request";
                        const isReport = id === "report";

                        const isCat = id === "cat";
                        const isFilter = id === "filter";

                        if (isDmRequest) requestHandle(bot, interaction, true);
                        else if (isRequest)
                            requestHandle(bot, interaction, false);
                        else if (isReport) reportHandle(bot, interaction);
                        else if (isCat) catHandle(bot, interaction);
                        else if (isFilter) filterHandle(bot, interaction);
                    }
                } catch (err) {
                    console.log(err);
                }
            },
        },
    });

    const bot = enableCachePlugin(baseBot);

    enableCacheSweepers(bot);

    for await (const file of Deno.readDir(
        new URL("./commands", import.meta.url)
    ))
        if (file.name.endsWith(".ts")) {
            try {
                const command: {
                    // deno-lint-ignore no-explicit-any
                    data: any;
                    list: (bot: Bot, interaction: Interaction) => void;
                    adminOnly: boolean;
                } = await import(`./commands/${file.name}`);

                try {
                    console.log(`Uploading ${command.data.name}`);
                    bot.helpers.createGlobalApplicationCommand(command.data);
                } catch (err) {
                    console.info(`Error in ${file.name}\n${err.stack}`);
                }

                commands.set(command.data.name, command);
            } catch (err) {
                console.log(`Error importing ${file.name}\n${err}`);
            }
        }

    await startBot(bot);
}
