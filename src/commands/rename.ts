import {
    ApplicationCommandTypes,
    ApplicationCommandOptionTypes,
    Bot,
    Interaction,
} from "discordeno";

import { catsDb, linksDb } from "$db";

import Responder from "../util/Responder.ts";

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

async function handle(bot: Bot, interaction: Interaction, isAdmin: boolean) {
    const responder = new Responder(bot, interaction.id, interaction.token);

    const cat1: string = interaction.data?.options?.[0]?.value;
    const cat2: string = interaction.data?.options?.[1]?.value;

    const guildId = String(interaction.guildId);

    // deno-lint-ignore no-explicit-any prefer-const
    let match: any = {
        guildId: guildId,
        cat: cat1,
    };

    if (isAdmin) match.issuedBy = String(interaction.user.id);

    await catsDb.updateMany(
        match,
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
        match,
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

const adminOnly = false;
export { data, handle, adminOnly };
