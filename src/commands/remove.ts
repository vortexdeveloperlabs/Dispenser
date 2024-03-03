import { ApplicationCommandTypes, Bot, Interaction } from "discordeno";

import { linksDb } from "$db";

import Responder from "../util/responder.ts";

const data = {
    name: "remove",
    description: "Removes a link",
    type: ApplicationCommandTypes.ChatInput,
    options: [
        {
            type: ApplicationCommandTypes.Message,
            name: "category",
            description: "The proxy site to categorize the link",
            required: true,
        },
        {
            type: ApplicationCommandTypes.Message,
            name: "link",
            description: "The link to remove",
            required: false,
        },
    ],
    dmPermission: false,
};

async function handle(bot: Bot, interaction: Interaction) {
    const responder = new Responder(bot, interaction.id, interaction.token);

    const guildId = String(interaction.guildId);

    const cat = interaction.data?.options?.[0]?.value;
    const link = interaction.data?.options?.[1]?.value;

    if (!link) {
        await linksDb.deleteMany({
            guildId: guildId,
            cat: cat,
        });

        return await responder.respond(`Removed the category ${cat}`);
    } else {
        await linksDb.deleteMany({
            guildId: guildId,
            link: link,
            cat: cat,
        });

        return await responder.respond(`Removed ${link} from ${cat}`);
    }
}

const adminOnly = true;
export { data, handle, adminOnly };
