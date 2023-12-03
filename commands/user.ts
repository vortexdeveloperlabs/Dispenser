import {
    ApplicationCommandOptionTypes,
    ApplicationCommandTypes,
    Bot,
    Interaction,
} from "https://deno.land/x/discordeno@17.0.1/mod.ts";

import { usersDb } from "../db.ts";

import Responder from "../util/responder.ts";

const data = {
    name: "user",
    description: "Prints the user's info stored on the database",
    type: ApplicationCommandTypes.ChatInput,
    options: [
        {
            type: ApplicationCommandOptionTypes.User,
            name: "user",
            description: "The user to query",
            required: false,
        },
        {
            type: ApplicationCommandTypes.Message,
            name: "category",
            description: "The category to filter from",
            required: false,
        },
    ],
    dmPermission: false,
};

async function handle(bot: Bot, interaction: Interaction) {
    const responder = new Responder(bot, interaction.id, interaction.token);

    const userArg = interaction.data?.options?.[0]?.value;
    const user =
        (userArg && (await bot.helpers.getUser(userArg))) || interaction.user;
    const userId = userArg || String(user.id);

    const cat = interaction.data?.options?.[1]?.value;

    if (userId == "983595671074512967")
        return await responder.respond("Beep Boop 🤖");

    if (cat) {
        const data = await usersDb.findOne({
            guildId: String(interaction.guildId),
            userId: userId,
            cat: cat,
        });

        if (!data)
            return await responder.respond(
                `${
                    userId === interaction.user.id
                        ? "You have"
                        : `${user.username} has not`
                } used the bot`,
            );

        return await responder.respond(
            `Links: ${data.links.join(", \n")}\nTimes: ${data.times}`,
        );
    } else {
        const data = await usersDb
            .find({
                guildId: String(interaction.guildId),
                userId: userId,
            })
            .toArray();

        if (data.length <= 0)
            return await responder.respond(
                `${
                    user.id === interaction.user.id
                        ? "You have"
                        : `${user.username} has`
                } not used the bot`,
            );

        return await responder.respond(
            data
                .map(
                    o =>
                        `**${o.cat}**\nLinks: ${o.links.join(", ")}\nTimes: ${
                            o.times
                        }\n`,
                )
                .join("\n"),
        );
    }
}

const adminOnly = true;
export { data, handle, adminOnly };
