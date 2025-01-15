import { Member } from "discordeno";

import { validatePermissions } from "https://deno.land/x/discordeno@17.0.1/plugins/mod.ts";

import { rolesDb, ServerRoleData } from "$db";

export default async (member: Member, guildId: string): Promise<boolean> => {
	if (
		validatePermissions(member.permissions || BigInt(0), ["ADMINISTRATOR"])
	) {
		return true;
	}

	const { admin: adminRoleId }: ServerRoleData = (await rolesDb.findOne({
		guildId: guildId,
	})) || {};

	if (!adminRoleId) return false;

	return member.roles.includes(BigInt(adminRoleId));
};
