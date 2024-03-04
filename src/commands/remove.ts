import { ApplicationCommandTypes, Bot, Interaction } from "discordeno";

import { linksDb } from "$db";

import Responder from "../util/Responder.ts";

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

async function handle(bot: Bot, interaction: Interaction, isAdmin: boolean) {
    const responder = new Responder(bot, interaction.id, interaction.token);

    const guildId = String(interaction.guildId);

    const cat = interaction.data?.options?.[0]?.value;
    const link = interaction.data?.options?.[1]?.value;

    if (!link) {
        if (isAdmin) {
            await linksDb.deleteMany({
                guildId: guildId,
                cat: cat,
            });

            return await responder.respond(`Removed the category ${cat}`);
        } else {
            await linksDb.deleteMany({
                guildId: guildId,
                cat: cat,
                issuedBy: String(interaction.user.id),
            });

            return await responder.respond(
                `Removed your links from the category ${cat}`
            );
        }
    } else {
        // deno-lint-ignore no-explicit-any prefer-const
        let basicQuery: any = {
            guildId: guildId,
            link: link,
            cat: cat,
        };
        if (isAdmin) basicQuery.issuedBy = String(interaction.user.id);

        if (linksDb.findOne(basicQuery) !== null)
            await linksDb.deleteMany(basicQuery);
        else await responder.respond(`${link} does not exist in ${cat}`);

        return await responder.respond(`Removed ${link} from ${cat}`);
    }
}

const adminOnly = false;
export { data, handle, adminOnly };
