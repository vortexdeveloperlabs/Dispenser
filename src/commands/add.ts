import { ApplicationCommandTypes, Bot, Interaction } from "discordeno";

import { linksDb } from "$db";

import Responder from "../util/Responder.ts";

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
        {
            type: ApplicationCommandTypes.Message,
            name: "premium",
            description: "Is the link for premium users only (y/?)?",
            required: true,
        },
    ],
    dmPermission: false,
};

async function handle(
    bot: Bot,
    interaction: Interaction,
    isAdmin: true
): Promise<void> {
    const responder = new Responder(bot, interaction.id, interaction.token);

    const linksRaw: string = interaction.data?.options?.[0]?.value;
    const cat = interaction.data?.options?.[1]?.value;
    const isPremium =
        interaction.data?.options?.[1]?.value === "y" ||
        interaction.data?.options?.[1]?.value === "yes" ||
        interaction.data?.options?.[1]?.value === "true";
    if (isAdmin) {
        await insertLinks(interaction, responder, linksRaw, cat, isPremium);
    } else {
        await insertLinks(
            interaction,
            responder,
            linksRaw,
            cat,
            isPremium,
            interaction.user.id
        );
    }
}

/**
 * @param linksRaw - Arg 1 of the command
 * @param cat - Arg 2 of the command
 * @param isPremium - Arg 3 of the command
 * @param issuedBy - The mere presence of this means that it is a community link and shall be treated as such. This should the user's snowflake id of who is using the command
 */
async function insertLinks(
    interaction: Interaction,
    responder: Responder,
    linksRaw: string,
    cat: string,
    isPremium?: boolean,
    issuedBy?: string
) {
    const links: string[] = linksRaw.split(/\n| /);

    // If there are multiple links
    if (links.length > 1) {
        for (const link of links) {
            // There's only one link
            const toInsert = links.map(link => ({
                guildId: String(interaction.guildId),
                link,
                cat,
                isPremium,
                issuedBy,
            }));
            await linksDb.removeMany(toInsert);
            await linksDb.insertMany(toInsert);
            await responder.respond(`Added ${link} to ${cat}!`);
        }
    } else {
        // There's only one link
        const toInsert = {
            guildId: String(interaction.guildId),
            link: linksRaw,
            cat,
            isPremium,
        };
        if (await linksDb.findOne(toInsert)) {
            await responder.respond("That's a duplicate link");
        } else {
            await linksDb.insertOne(toInsert);
            await responder.respond(`Added ${linksRaw} to ${cat}!`);
        }
    }
}

const adminOnly = false;
export { data, handle, adminOnly };
