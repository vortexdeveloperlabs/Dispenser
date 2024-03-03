import {
    Collection,
    createBot,
    InteractionTypes,
    startBot,
    Bot,
    Interaction,
} from "https://deno.land/x/discordeno@17.0.1/mod.ts";

import {
    enableCachePlugin,
    enableCacheSweepers,
} from "https://deno.land/x/discordeno_cache_plugin@0.0.21/mod.ts";

import filterHandle from "./util/filter.ts";
import catHandle from "./util/cat.ts";
import requestHandle from "./util/request.ts";
import reportHandle from "./util/report.ts";

import Responder from "./util/responder.ts";

import isAdmin from "./util/isAdmin.ts";

import config from "$config";

const commands = new Collection();

const isDebug = Deno.args.includes("--debug");

async function initBot(token: string): Promise<void> {
    const baseBot: Bot = createBot({
        token,
        botId: BigInt(config.bot.id),
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

                        if (
                            command?.adminOnly &&
                            !(await isAdmin(
                                interaction.member,
                                String(interaction.guildId)
                            ))
                        ) {
                            console.error(
                                `${interaction.user.username} tried to run ${command.data.name} without permission`
                            );
                            return await responder.respond(
                                "You don't have permission to run this command!"
                            );
                        }

                        try {
                            await command?.handle(bot, interaction);
                        } catch (err) {
                            const errFmt = `Error running ${command.data.name}: ${err.stack}`;
                            if (isDebug) throw new Error(errFmt);
                            else console.error(errFmt);
                        }
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

initBot(config.bot.token);
//initBot(config.devBot.token);
