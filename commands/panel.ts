import { MessageComponentTypes } from "https://deno.land/x/discordeno@13.0.0-rc18/mod.ts";
import {
    ApplicationCommandOptionTypes,
    ApplicationCommandTypes,
    Bot,
    ButtonStyles,
    Interaction,
    InteractionResponseTypes,
} from "https://deno.land/x/discordeno@13.0.0-rc45/mod.ts";

import { linksDb } from "../db.ts";

import Responder from "../util/responder.ts";

const data = {
    name: "panel",
    description: "Creates a link selection panel",
    options: [
        {
            type: ApplicationCommandOptionTypes.Boolean,
            name: "dm",
            description:
                "Message the user the link, rather than an hidden message in this channel",
            required: false,
        },
        {
            type: ApplicationCommandOptionTypes.Channel,
            name: "report",
            description: "The channel to send issues to",
            required: false,
        },
        {
            type: ApplicationCommandTypes.Message,
            name: "cat",
            description: "Category text",
            required: false,
        },
        {
            type: ApplicationCommandTypes.Message,
            name: "filter",
            description: "Filter text",
            required: false,
        },
        {
            type: ApplicationCommandTypes.Message,
            name: "title",
            description: "Title text",
            required: false,
        },
        {
            type: ApplicationCommandTypes.Message,
            name: "footer",
            description: "Footer text",
            required: false,
        },
        {
            type: ApplicationCommandTypes.Message,
            name: "button",
            description: "Button text",
            required: false,
        },
        {
            type: ApplicationCommandTypes.Message,
            name: "color",
            description: "Color",
            required: false,
        },
    ],
    dmPermission: false,
};

async function handle(bot: Bot, interaction: Interaction) {
    const responder = new Responder(bot, interaction.id, interaction.token);

    const dmUser = interaction.data?.options?.find(
        opt => opt.name === "dm"
    )?.value;
    const report = interaction.data?.options?.find(
        opt => opt.name === "report"
    )?.value;
    const title =
        interaction.data?.options?.find(opt => opt.name === "title")?.value ||
        "Selection";
    const catTitle =
        interaction.data?.options?.find(opt => opt.name === "cat")?.value ||
        "Select a proxy site";
    const filterTitle =
        interaction.data?.options?.find(opt => opt.name === "filter")?.value ||
        "Select your filters";
    const footer =
        interaction.data?.options?.find(opt => opt.name === "footer")?.value ||
        "Hosted by Vyper Group";
    const button =
        interaction.data?.options?.find(opt => opt.name === "button")?.value ||
        "Request";
    const color =
        interaction.data?.options?.find(opt => opt.name === "color")?.value ||
        "e071ac";

    const links = await linksDb
        .find({
            guildId: String(interaction.guildId),
        })
        .toArray();

    // TODO: Limit array to 25
    const cats: string[] = [
        ...new Set(
            links
                .map(entry => entry.cat)
                .filter(entry => typeof entry !== "undefined")
                .sort()
        ),
    ];

    if (cats.length === 0)
        return await responder.respond("There are no links!");

    // Create dropdown

    const options = cats.map(function (cat) {
        return {
            label: cat,
            value: cat,
        };
    });

    const filters = [
        {
            label: "Lightspeed",
            value: "ls",
        },
        {
            label: "Other",
            value: "other",
        },
    ];

    const embed = {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: {
            embeds: [
                {
                    type: "rich",
                    color: parseInt(`0x${color}`),
                    title: title,
                    footer: {
                        text: footer,
                    },
                },
            ],
            components: [
                {
                    type: MessageComponentTypes.ActionRow,
                    components: [
                        {
                            type: MessageComponentTypes.SelectMenu,
                            customId: "cat",
                            placeholder: catTitle,
                            options: options,
                        },
                    ],
                },
                {
                    type: MessageComponentTypes.ActionRow,
                    components: [
                        {
                            type: MessageComponentTypes.SelectMenu,
                            customId: "filter",
                            placeholder: filterTitle,
                            options: filters,
                            maxValues: filters.length,
                        },
                    ],
                },
                {
                    type: MessageComponentTypes.ActionRow,
                    components: [
                        {
                            type: MessageComponentTypes.Button,
                            label: button,
                            customId: dmUser ? "dmRequest" : "request",
                            style: ButtonStyles.Primary,
                            disabled: false,
                        },
                        {
                            type: MessageComponentTypes.Button,
                            label: "Report",
                            customId: "report",
                            style: ButtonStyles.Danger,
                            disabled: false,
                        },
                    ],
                },
            ],
        },
    };

    return await bot.helpers.sendInteractionResponse(
        interaction.id,
        interaction.token,
        embed
    );
}

const adminOnly = true;
export { data, handle, adminOnly };
