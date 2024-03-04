import { ObjectId } from "npm:mongodb";

import config from "$config";
import { Database } from "https://deno.land/x/atlas_sdk@v1.1.2/client.ts";

// TODO: Annotate with JSDoc annotations

interface UserFilter {
    guildId: string;
    userId: string;
    filters: Array<string>;
}

interface UserCategory {
    guildId: string;
    userId: string;
    cat: string;
}

interface Users {
    _id: ObjectId;
    guildId: string;
    userId: string;
    cat: string;
    links: Array<string>;
    times: number;
}

interface Links {
    guildId: string;
    cat: string;
    link: string;
    issuedBy: string;
}

interface Limit {
    guildId: string;
    cat: string;
    limit: number;
    premiumLimit: number;
}

interface Roles {
    guildId: string;
    admin: string;
    premium: string;
}

interface LogChannels {
    guildId: string;
    id: string;
}

interface FaultToleranceAPI {
    // The key
    nodeHost: string;
    // The value
    brokenCommands: {
        commandName: string;
        errorMessage?: string;
    }[];
}

let db: Database;
if (config.isDebug) db = config.devBot.mongoClient.db("bot");
else db = config.bot.mongoClient.db("bot");

const filtersDb = db.collection<UserFilter>("filter");
const catsDb = db.collection<UserCategory>("cat");
const usersDb = db.collection<Users>("users");
const linksDb = db.collection<Links>("links");
const limitsDb = db.collection<Limit>("limit");
const rolesDb = db.collection<Roles>("roles");
const chansDb = db.collection<LogChannels>("chans");

const faultToleranceDb = db.collection<FaultToleranceAPI>("faultToleranceAPI");

export {
    catsDb,
    filtersDb,
    usersDb,
    linksDb,
    limitsDb,
    rolesDb,
    chansDb,
    faultToleranceDb,
};
