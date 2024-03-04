import { Bot, Interaction } from "discordeno";

import getLinks from "../util/links.ts";
import Responder from "../util/Responder.ts";

import { catsDb } from "$db";

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
        }
    );

    return await responder.respond("Updated ✅");
}
