import { Interaction } from "npm:@discordeno/bot";
import { CreateSlashApplicationCommand } from "npm:@discordeno/types";

import getAllCats from "./getAllCats.ts";

export default async (
	interaction: Interaction,
	commandData: CreateSlashApplicationCommand,
): Promise<void> => {
	const categoryOption = commandData.options?.find((option) =>
		option.name === "category"
	);
	if (categoryOption && categoryOption.autocomplete === true) {
		const cats = await getAllCats(String(interaction.guildId));
		if (cats.isErr()) {
			// TODO: Handle error
		} else {
			interaction.respond(cats);
		}
	}
};
