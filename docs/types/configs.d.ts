// TODO: Document with JSDoc

interface DispenserConfig {
    serverId: string;
    config: {
        panel: {
            enabled: boolean;
            /** TODO: Import from discordeno */
            embed: EmbedOptions;
        };
        globalPanel: {
            enabled: boolean;
            embed: EmbedOptions;
        };
        accessModes: ("whitelist" | "blacklist")[];
        /** Discord User Snowflake IDs */
        blacklistUsers: string[];
        /** Discord User Snowflake IDs */
        whitelistUsers: string[];
        communityLinks: {
            enabled: boolean;
            blacklistLinks: string[];
            blacklistCategories: string[];
            integrityChecking: {
                enable: boolean; // checks with the content of an online official link. This also adds Access Token to BYOD links in /add
                supportByoassingFilterLock: boolean;
            };
        };
        manualDistributionMode: {
            enabled: boolean;
        };
        autoDistributionMode: {
            enabled: boolean;
        };
        globalLinks: {
            enabled: boolean;
            allowGallery: boolean;
            shareCategories: string[];
            exclusionMode: "blacklist" | "whitelist" | void;
            blacklistedLinks: string[];
            blacklistedMembers: string[]; // Strings of Discord user ids
            disallowBannedMembers: boolean; // This requires permission to view bans history
        };
    };
}

interface FilterLockConfig {
    // TODO: ...
}
