import { CreateSlashApplicationCommand } from "npm:@discordeno/types";
import { accessConfig } from "./AccessConfig.ts";

// TODO: Fix import in bot.ts
export async default (
	config: CreateSlashApplicationCommand,
): CreateSlashApplicationCommand => {
	// TODO: Look for every "name" and replace it with the respective localization (use command name and string)

	let newConfig = { ...config };
	for (const [key, val] of Object.entries(config)) {
		{
			if (key === "description") {
				for (
					const [locale, translation] of Object.entries(
						await accessConfig.getTranslation(val),
					)
				) {
					config.descriptionLocalizations[locale] = translation;
				}
			}
		}
		return config;
	}
};
