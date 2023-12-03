import {
    ApplicationCommandTypes,
    Bot,
    Interaction,
} from "https://deno.land/x/discordeno@17.0.1/mod.ts";

import { linksDb } from "../db.ts";

import Responder from "../util/responder.ts";

const data = {
    name: "add",
    description: "Adds a new link",
    type: ApplicationCommandTypes.ChatInput,
    options: [
        {
            type: ApplicationCommandTypes.Message,
            name: "link",
            description: "The link to add",
            required: true,
        },
        {
            type: ApplicationCommandTypes.Message,
            name: "category",
            description: "The proxy site to categorize the link",
            required: true,
        },
    ],
    dmPermission: false,
};

async function handle(bot: Bot, interaction: Interaction): Promise<void> {
    const responder = new Responder(bot, interaction.id, interaction.token);

    const link = interaction.data?.options?.[0]?.value;
    const cat = interaction.data?.options?.[1]?.value;

    const toInsert = {
        guildId: String(interaction.guildId),
        link: link,
        cat: cat,
    };

    if (await linksDb.findOne(toInsert))
        await responder.respond("You can't insert a duplicate link!");
    else {
        await linksDb.insertOne(toInsert);
        await responder.respond(`Added ${link} to ${cat}!`);
    }
}

const adminOnly = true;
export { data, handle, adminOnly };
