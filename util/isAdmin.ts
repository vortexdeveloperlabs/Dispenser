import { Member } from "https://deno.land/x/discordeno@17.0.1/mod.ts";

import { validatePermissions } from "https://deno.land/x/discordeno@17.0.1/plugins/mod.ts";

import { rolesDb } from "../db.ts";

export default async (member: Member, guildId: string): Promise<boolean> => {
    if (validatePermissions(member.permissions || BigInt(0), ["ADMINISTRATOR"]))
        return true;

    const { admin } =
        (await rolesDb.findOne({
            guildId: guildId,
        })) || {};

    if (!admin) return false;

    return member.roles.includes(BigInt(admin));
};
