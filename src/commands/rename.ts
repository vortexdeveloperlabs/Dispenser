import {
    ApplicationCommandTypes,
    ApplicationCommandOptionTypes,
    Bot,
    Interaction,
} from "https://deno.land/x/discordeno@17.0.1/mod.ts";

import { catsDb, linksDb } from "$db";

import Responder from "../util/responder.ts";

const data = {
    name: "rename",
    description: "Renames a category",
    type: ApplicationCommandTypes.ChatInput,
    options: [
        {
            type: ApplicationCommandOptionTypes.User,
            name: "category1",
            description: "The category to replace",
            required: true,
        },
        {
            type: ApplicationCommandTypes.Message,
            name: "category2",
            description: "The category to replace with",
            required: true,
        },
    ],
    dmPermission: false,
};

async function handle(bot: Bot, interaction: Interaction) {
    const responder = new Responder(bot, interaction.id, interaction.token);

    const cat1: string = interaction.data?.options?.[0]?.value;
    const cat2: string = interaction.data?.options?.[1]?.value;

    const guildId = String(interaction.guildId);

    await catsDb.updateMany(
        {
            guildId: guildId,
            cat: cat1,
        },
        {
            $set: {
                cat: cat2,
            },
        },
        {
            upsert: true,
        }
    );

    await linksDb.updateMany(
        {
            guildId: guildId,
            cat: cat1,
        },
        {
            $set: {
                cat: cat2,
            },
        },
        {
            upsert: true,
        }
    );

    responder(`Renamed ${cat1} to ${cat2}`);
}

const adminOnly = true;
export { data, handle, adminOnly };
