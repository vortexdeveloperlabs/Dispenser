import blockedOnLS from "./checker/ls.ts";

import { Link, linksDb } from "$db";

const noLinksMessage = (filter: string): string =>
	`There are no links unblocked for ${filter}`;

export default async (
	guildId: string,
	ownedLinks: Array<string>,
	filters: Array<string>,
	cat: string,
) => {
	const cursor = await linksDb.find({
		guildId: guildId,
		cat: cat,
	});
	const links: Link[] = await cursor.toArray();

	if (links.length === 0) return "There are no links!";

	let filteredLinks: Array<string> = [];

	if (ownedLinks) {
		filteredLinks = links
			.map((entry) => entry.link)
			.filter((entry) => !ownedLinks.includes(entry));
	}

	if (filteredLinks.length === 0) {
		return new Error("We ran out of links to give you!");
	}

	let unblockedList = filteredLinks;

	if (filters.includes("ls")) {
		unblockedList = unblockedList.filter(async (link) =>
			await !blockedOnLS(link)
		);

		/*
        TODO: For debug mode only
        console.log(
            `These ${cat} links are unblocked for Lightspeed ${unblockedList.join(
                ", ",
            )}`,
        );
        */

		if (links.length === 0) return noLinksMessage("Lightspeed");
	}

	return unblockedList[Math.floor(Math.random() * unblockedList.length)];
};
