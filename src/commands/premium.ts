import {
    ApplicationCommandOptionTypes,
    ApplicationCommandTypes,
    Bot,
    Interaction,
} from "discordeno";

import { rolesDb } from "$db";

import Responder from "../util/responder.ts";

const data = {
    name: "premium",
    description: "Give premium perms to a role",
    type: ApplicationCommandTypes.ChatInput,
    options: [
        {
            type: ApplicationCommandOptionTypes.Role,
            name: "role",
            description: "The role that gets the perms",
            required: false,
        },
    ],
    dmPermission: false,
};

async function handle(bot: Bot, interaction: Interaction) {
    const responder = new Responder(bot, interaction.id, interaction.token);

    const guildId = String(interaction.guildId);

    const roleId = interaction.data?.options?.[0]?.value;

    rolesDb.updateMany(
        {
            guildId: guildId,
        },
        {
            $set: {
                premium: String(roleId),
            },
        },
        {
            upsert: true,
        }
    );

    return await responder.respond(`Gave premium status to ${roleId}`);
}

const adminOnly = true;
export { data, handle, adminOnly };
