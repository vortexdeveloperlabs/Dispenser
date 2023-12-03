import { Bot, Interaction } from "https://deno.land/x/discordeno@17.0.1/mod.ts";

import getLinks from "../util/links.ts";
import Responder from "../util/responder.ts";

import { catsDb } from "../db.ts";

export default async function (bot: Bot, interaction: Interaction) {
    const responder = new Responder(bot, interaction.id, interaction.token);

    const userId = String(interaction.user.id);
    const guildId = String(interaction.guildId);

    const name = interaction.user.username;

    const [cat] = interaction.data.values;

    console.log(`${name} selected ${cat}`);

    await catsDb.updateMany(
        {
            guildId: guildId,
            userId: userId,
        },
        {
            $set: {
                cat: cat,
            },
        },
        {
            upsert: true,
        },
    );

    return await responder.respond("Updated ✅");
}
