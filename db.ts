import {
    MongoClient,
    ObjectId,
} from "https://deno.land/x/mongo@v0.30.1/mod.ts";

import data from "./config.ts";

const client = new MongoClient();

await client.connect(data.mongoURL ?? "mongodb://127.0.0.1:27017");

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

const db = client.database("bot");

const filtersDb = db.collection<UserFilter>("filter");
const catsDb = db.collection<UserCategory>("cat");
const usersDb = db.collection<Users>("users");
const linksDb = db.collection<Links>("links");
const limitsDb = db.collection<Limit>("limit");
const rolesDb = db.collection<Roles>("roles");
const chansDb = db.collection<LogChannels>("chans");

export { catsDb, filtersDb, usersDb, linksDb, limitsDb, rolesDb, chansDb };
