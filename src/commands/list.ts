import { ApplicationCommandTypes, Bot, Interaction } from "discordeno";

import { linksDb, limitsDb, rolesDb } from "$db";

import Responder from "../util/Responder.ts";

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
        {
            type: ApplicationCommandTypes.User,
            name: "filter by users",
            description:
                "Only get links that are community links and from a specific user",
            required: false,
        },
    ],
    dmPermission: false,
};

async function handle(
    bot: Bot,
    interaction: Interaction,
    isAdmin: boolean
): Promise<void> {
    const responder = new Responder(bot, interaction.id, interaction.token);

    // deno-lint-ignore no-explicit-any
    let query: any = {
        guildId: String(interaction.guildId),
    };

    if (!isAdmin) query.issuedBy = String(interaction.user.id);

    const cursor = await linksDb.find(query);

    const links = await cursor.toArray();

    const noGlobalPermsWarning = isAdmin
        ? ""
        : "This command only lists community links that you create, because you don't have permissions to view the official links or other other user's links.";

    if (links.length === 0) {
        await responder.respond(
            "There are no links to query" + isAdmin
                ? ""
                : ".\n" + noGlobalPermsWarning
        );
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

        return "**Role Ids**\n" +
            "Admin: " +
            (admin ? admin : "Not set") +
            "\n" +
            "Premium: " +
            (premium ? premium : "Not set") +
            "\n" +
            "\n" +
            (list.length > 0)
            ? list.join("\n") + "\n" + "\n"
            : "" + noGlobalPermsWarning;
    };

    const list: string = await getList();

    await responder.respond(!list ? "Unable to format the list" : list);
}

const adminOnly = false;
export { data, handle, adminOnly };
