import {
    ApplicationCommandOptionTypes,
    ApplicationCommandTypes,
    Bot,
    Interaction,
} from "https://deno.land/x/discordeno@17.0.1/mod.ts";

import { chansDb } from "../db.ts";

import Responder from "../util/responder.ts";

const data = {
    name: "logs",
    description: "Sets the channel for bot logs",
    type: ApplicationCommandTypes.ChatInput,
    options: [
        {
            type: ApplicationCommandOptionTypes.Channel,
            name: "channel",
            description: "The channel to log to",
            required: true,
        },
    ],
    dmPermission: false,
};

async function handle(bot: Bot, interaction: Interaction) {
    const responder = new Responder(bot, interaction.id, interaction.token);

    const chan = interaction.data?.options?.[0]?.value;

    await responder.respond(`The channel is ${chan}`);
}

const adminOnly = true;
export { data, handle, adminOnly };
