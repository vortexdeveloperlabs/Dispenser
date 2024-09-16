import { err, ok, ResultAsync } from "npm:neverthrow";

import { LinkData, linksDb } from "$db";
import { logger } from "./Logger.ts";

export default async function (
	guildId: string,
): Promise<ResultAsync<string[], string>> {
	let links: LinkData[];

	try {
		const cursor = await linksDb.find({ guildId });

		links = await cursor.toArray();
	} catch (error) {
		const errMsg =
			"Error while trying to get all the categories from the database:";
		logger.error(`${errMsg}:\n\t${error.stack}`);
		return err(`${errMsg} ${error.message}`);
	}

	const allCats = links.map((links) => links.cat);

	// Sets aren't allowed to have duplicates
	const allCatsNoDuplicates = [...new Set(allCats)];

	return ok(allCatsNoDuplicates);
}
