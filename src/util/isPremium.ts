import { Member } from "https://deno.land/x/discordeno@13.0.0-rc45/mod.ts";
import { rolesDb } from "$db";

export default async (member: Member, guildId: string) => {
	const { premium } = (await rolesDb.findOne({
		guildId: guildId,
	})) || {};

	if (!premium) return false;

	return member.roles.includes(BigInt(premium));
};
