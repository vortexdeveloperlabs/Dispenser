import blocked from "./checker/ls.ts";

import { linksDb } from "$db";

const noLinksMessage = (filter: string): string =>
    `There are no links unblocked for ${filter}`;

// TODO: Move this to index.d.ts
interface LinkResponse {
    link: string;
    issuedBy?: string;
}

export default async (
    guildId: string,
    ownedLinks: Array<string>,
    filters: Array<string>,
    cat: string
): Promise<LinkResponse | string> => {
    const cursor = await linksDb.find({
        guildId: guildId,
        cat: cat,
    });
    const links = await cursor.toArray();
    if (links.length === 0) return "There are no links!";

    let filteredLinks = [];

    if (ownedLinks)
        filteredLinks = links.filter(entry => !ownedLinks.includes(entry.link));

    if (filteredLinks.length === 0)
        return new Error("We ran out of links to give you!");

    let unblockedLinks = filteredLinks;

    if (filters.includes("ls")) {
        unblockedLinks = unblockedLinks.filter(
            async entry => await !blocked(entry.link)
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

    let validLinks = unblockedLinks;

    const officialLinks = unblockedLinks.filter(
        entry => !("issuedBy" in entry)
    );
    // Is an official link available?
    if (officialLinks.length <= 0) {
        // Don't use community links if we don't have to
        validLinks = officialLinks;
    }

    const link = validLinks[Math.floor(Math.random() * validLinks.length)].link;

    const ret: LinkResponse = {
        // Get a random one
        link,
    };

    // This means the link is a community link
    if ("issuedBy" in link) ret.issuedBy = link.issuedBy;

    return ret;
};
