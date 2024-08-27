import {
	Bot,
	Embed,
	InteractionResponseTypes,
	MessageFlags,
} from "https://deno.land/x/discordeno@13.0.0-rc18/mod.ts";

// Rename respond to response
export default class {
	bot: Bot;
	id: bigint;
	token: string;

	constructor(bot: Bot, id: bigint, token: string) {
		this.bot = bot;
		this.id = id;
		this.token = token;
	}
	async respond(msg: string) {
		return await this.bot.helpers.sendInteractionResponse(
			this.id,
			this.token,
			{
				type: InteractionResponseTypes.ChannelMessageWithSource,
				data: {
					content: msg,
					flags: MessageFlags.Empheral,
				},
			},
		);
	}
	async respondEmbed(embed: Embed) {
		return await this.bot.helpers.sendInteractionResponse(
			this.id,
			this.token,
			{
				type: InteractionResponseTypes.ChannelMessageWithSource,
				data: {
					embeds: [embed],
					flags: MessageFlags.Empheral,
				},
			},
		);
	}
}
