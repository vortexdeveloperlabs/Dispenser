import {
    ApplicationCommandOptionTypes,
    ApplicationCommandTypes,
    Bot,
    Interaction,
} from "discordeno";

import { rolesDb } from "$db";

import Responder from "../util/responder.ts";

const data = {
    name: "admin",
    description: "Give admin status to a role",
    type: ApplicationCommandTypes.ChatInput,
    options: [
        {
            type: ApplicationCommandOptionTypes.Role,
            name: "role",
            description: "The role that gets the status",
            required: false,
        },
    ],
    dmPermission: false,
};

async function handle(bot: Bot, interaction: Interaction): Promise<void> {
    const responder = new Responder(bot, interaction.id, interaction.token);

    const guildId = String(interaction.guildId);

    const roleId = interaction.data?.options?.[0]?.value;

    rolesDb.updateMany(
        {
            guildId: guildId,
        },
        {
            $set: {
                admin: String(roleId),
            },
        },
        {
            upsert: true,
        }
    );

    await responder.respond(`Gave admin status to ${roleId}`);
}

const adminOnly = true;
export { data, handle, adminOnly };
