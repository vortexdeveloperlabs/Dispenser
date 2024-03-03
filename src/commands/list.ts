import {
    ApplicationCommandTypes,
    Bot,
    Interaction,
} from "https://deno.land/x/discordeno@17.0.1/mod.ts";

import { linksDb, limitsDb, rolesDb } from "$db";

import Responder from "../util/responder.ts";

const data = {
    name: "list",
    description: "Lists all the links in the guild",
    type: ApplicationCommandTypes.ChatInput,
    options: [
        {
            type: ApplicationCommandTypes.Message,
            name: "category",
            description: "The category to get the links from",
            required: false,
        },
    ],
    dmPermission: false,
};

async function handle(bot: Bot, interaction: Interaction): Promise<void> {
    const responder = new Responder(bot, interaction.id, interaction.token);

    const cursor = await linksDb.find({ guildId: String(interaction.guildId) });

    const links = await cursor.toArray();

    if (links.length === 0) {
        await responder.respond("There are no links to query");
        return;
    }

    const getList: () => Promise<string> = async (): Promise<string> => {
        const { admin, premium } =
            (await rolesDb.findOne({
                guildId: String(interaction.guildId),
            })) || {};

        const list: string[] = await Promise.all(
            links.map(async link => {
                let line = "";

                const { limit, premiumLimit } =
                    (await limitsDb.findOne({
                        guildId: String(interaction.guildId),
                        cat: link.cat,
                    })) || {};

                if (limit && premiumLimit)
                    line += `*${link.cat}* **Limit**: ${limit} **Premium Limit**: ${premiumLimit} **Link**: ${link.link}`;
                else if (limit)
                    line += `*${link.cat}* **Limit**: ${limit} Link: ${link.link}`;
                else line += `*${link.cat}* Link: ${link.link}`;

                return line;
            })
        );

        return (
            "**Role Ids**\n" +
            "Admin: " +
            (admin ? admin : "Not set") +
            "\n" +
            "Premium: " +
            (premium ? premium : "Not set") +
            "\n" +
            "\n" +
            list.join("\n")
        );
    };

    const list: string = await getList();

    await responder.respond(!list ? "Unable to format the list" : list);
}

const adminOnly = true;
export { data, handle, adminOnly };
