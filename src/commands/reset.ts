import {
    ApplicationCommandTypes,
    ApplicationCommandOptionTypes,
    Bot,
    Interaction,
} from "discordeno";

import { usersDb } from "$db";

import Responder from "../util/Responder.ts";

const data = {
    name: "reset",
    description: "Resets a user's proxy limit",
    type: ApplicationCommandTypes.ChatInput,
    options: [
        {
            type: ApplicationCommandOptionTypes.User,
            name: "user",
            description: "The user to query",
            required: true,
        },
        {
            type: ApplicationCommandTypes.Message,
            name: "category",
            description: "The category to get the links from",
            required: false,
        },
    ],
    dmPermission: false,
};

async function handle(bot: Bot, interaction: Interaction) {
    const responder = new Responder(bot, interaction.id, interaction.token);

    const user = interaction.data?.options?.[0]?.value;
    const cat: string | undefined = interaction.data?.options?.[1]?.value;

    const filter: {
        guildId: string;
        userId: string;
        cat?: string;
    } = {
        guildId: String(interaction.guildId),
        userId: user,
    };

    if (cat) filter.cat = cat;

    await usersDb.updateMany(
        filter,
        {
            $set: {
                links: [],
                times: 0,
            },
        },
        {
            upsert: true,
        }
    );

    return await responder.respond(`Reset ${user}'s proxy limit!`);
}

const adminOnly = true;
export { data, handle, adminOnly };
