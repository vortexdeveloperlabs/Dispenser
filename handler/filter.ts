import { Bot, Interaction } from "https://deno.land/x/discordeno@17.0.1/mod.ts";

import Responder from "../util/responder.ts";

import { filtersDb } from "../db.ts";

export default async function (bot: Bot, interaction: Interaction) {
    const responder = new Responder(bot, interaction.id, interaction.token);

    const guildId = String(interaction.guildId);
    const userId = String(interaction.user.id);

    const name: string = interaction.user.username;

    const filters = interaction?.data?.values;

    if (filters) {
        console.log(`${name} now uses ${filters?.join(", ")}`);

        await filtersDb.updateMany(
            {
                guildId: guildId,
                userId: userId,
            },
            {
                $set: {
                    filters: filters,
                },
            },
            {
                upsert: true,
            },
        );

        return await responder.respond("Updated ✅");
    }
}
