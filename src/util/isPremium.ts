import { Member } from "discordeno";

import { rolesDb, ServerRoleData } from "$db";

export default async (member: Member, guildId: string) => {
	const { premium: premiumRoleId }: ServerRoleData = (await rolesDb.findOne({
		guildId: guildId,
	})) || {};

	if (!premiumRoleId) return false;

	return member.roles.includes(BigInt(premiumRoleId));
};
