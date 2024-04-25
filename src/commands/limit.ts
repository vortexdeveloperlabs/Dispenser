import { ApplicationCommandTypes, Bot, Interaction } from "discordeno";

import { limitsDb } from "$db";

import Responder from "../util/responder.ts";

const data = {
    name: "limit",
    description: "Sets the monthly limit for a category",
    type: ApplicationCommandTypes.ChatInput,
    options: [
        {
            type: ApplicationCommandTypes.Message,
            name: "limit",
            description: "The limit",
            required: true,
        },
        {
            type: ApplicationCommandTypes.Message,
            name: "category",
            description: "The category",
            required: true,
        },
        {
            type: ApplicationCommandTypes.Message,
            name: "premiumlimit",
            description: "The limit for premium users",
            required: false,
        },
    ],
    dmPermission: false,
};

async function handle(bot: Bot, interaction: Interaction): Promise<void> {
    const responder = new Responder(bot, interaction.id, interaction.token);

    const limit = interaction.data?.options?.[0]?.value;
    const cat = interaction.data?.options?.[2]?.value;
    const premiumLimit = interaction.data?.options?.[3]?.value;

    // Check if limit and premium limit is a number
    if (isNaN(Number(limit)) || isNaN(Number(premiumLimit)) {
        await responder.respond("The limit must be a number!");
        return;
    } else if (Number(limit) < 0 || Number(premiumLimit) < 0) {
        await responder.respond("The limit must be a positive number!");
        return;
    } else {
        await limitsDb.updateMany(
            {
                guildId: String(interaction.guildId),
                cat: cat,
            },
            {
                $set: {
                    limit: Number(limit),
                    premiumLimit: Number(premiumLimit),
                },
            },
            {
                upsert: true,
            }
        );

        await responder.respond(
            `Set the limit to ${limit}` +
                (!isNaN(premiumLimit) && premiumLimit !== undefined ? `and the premium limit to ${premiumLimit}!` : "!")
        );
    }
}

const adminOnly = true;
export { data, handle, adminOnly };
