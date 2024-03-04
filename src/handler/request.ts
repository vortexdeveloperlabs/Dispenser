import { Bot, Interaction } from "discordeno";

import getLinks from "../util/links.ts";
import Responder from "../util/Responder.ts";

import { catsDb, usersDb, limitsDb, filtersDb } from "$db";

import isPremium from "../util/isPremium.ts";
import isAdmin from "../util/isAdmin.ts";

export default async function (
    bot: Bot,
    interaction: Interaction,
    dmUser: boolean
) {
    const responder = new Responder(bot, interaction.id, interaction.token);

    const userId = String(interaction.user.id);
    const guildId = String(interaction.guildId);

    const name = interaction.user.username;

    const admin: boolean = await isAdmin(interaction.member, guildId);
    const premium: boolean =
        admin || (await isPremium(interaction.member, guildId));

    if (premium) console.log(`${name} has premium`);

    const { cat } =
        (await catsDb.findOne({
            userId: userId,
            guildId: guildId,
        })) || {};

    if (!cat) return await responder.respond("Please choose a category");

    let user = await usersDb.findOne({
        userId: userId,
        guildId: guildId,
        cat: cat,
    });

    if (!user) {
        const insertId = await usersDb.insertOne({
            userId: userId,
            guildId: guildId,
            cat: cat,
            links: [],
            times: 0,
        });

        user = await usersDb.findOne({
            _id: insertId,
        });

        console.log(`Added ${name} for ${cat}`);
    }

    const { filters } =
        (await filtersDb.findOne({
            userId: userId,
            guildId: guildId,
        })) || {};

    if (!filters)
        return await responder.respond("Please choose your filters first");

    console.log(`${name} uses ${filters.join(", ")}`);

    let { limit, premiumLimit } = (await limitsDb.findOne({
        guildId: guildId,
        cat: cat,
    })) || {
        limit: 0,
        premiumLimit: 0,
    };

    limit = premiumLimit || limit;

    const noLimit: boolean = limit === 0;

    console.log(noLimit ? `There is no limit` : `The limit is ${limit}`);

    const times: number = user?.times || 0;
    const links: Array<string> = user?.links || [];

    if (!noLimit && times >= limit) {
        console.log(
            `${name} reached the limit for ${cat}! ${user?.times}/${limit}`
        );
        return await responder.respond("You have reached the monthly limit");
    }

    const linksLeftMsg = (msg: string) =>
        noLimit
            ? premium
                ? `You have premium`
                : `There is no limits for ${cat}!`
            : msg + `${limit - times} links left`;

    console.log(
        `${name} requested a ${cat} link. So far ${name} has these links: ${links.join(
            ", "
        )}; having a total of ${times} links`
    );

    const link = await getLinks(guildId, links, filters, cat);

    if (link instanceof Error) return await responder.respond(link.message);
    else if (typeof link !== "string") {
        return await responder.respond(
            "Unknown error retrieving link; this incident has been reported!"
        );
    }

    await usersDb.updateMany(
        {
            _id: user?._id,
        },
        {
            $set: {
                links: [...links, link],
                times: times + 1,
            },
        },
        {
            upsert: true,
        }
    );

    if (dmUser) {
        const chan = await bot.helpers.getDmChannel(userId);
        const guild = await bot.helpers.getGuild(guildId);

        bot.helpers
            .sendMessage(chan.id, {
                embeds: [
                    {
                        type: "rich",
                        color: 0xe071ac,
                        title: cat,
                        description: `${link}\n${linksLeftMsg("You have ")}`,
                        footer: {
                            text: `Sent from ${guild.name}`,
                        },
                    },
                ],
            })
            .catch((error: Error): void => console.log(error));

        return await responder.respond("Check dms!");
    } else
        return await responder.respondEmbed({
            type: "rich",
            color: 0xe071ac,
            title: cat,
            description: `${link}`,
            footer: {
                text: linksLeftMsg("You have "),
            },
        });
}
