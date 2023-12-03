import { Bot, Interaction } from "https://deno.land/x/discordeno@17.0.1/mod.ts";

import Responder from "../util/responder.ts";

export default async function (
    bot: Bot,
    interaction: Interaction,
): Promise<void> {
    const responder = new Responder(bot, interaction.id, interaction.token);

    await responder.respond("Reports are a work in progress");
}
