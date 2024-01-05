// Generic Types
type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type IsNumber<S extends string> = S extends `${Digit}${Rest}`
    ? Rest extends ""
        ? S
        : IsNumber<Rest>
    : never;

type FixedString<N extends Number> = { length: N } & string;
type FixedNumberString<N extends Number> = FixedString<N> & IsNumber<string>;

// Project specific types
type DiscordID = FixedNumberString<17> | FixedNumberString<18>;
// TODO: Define a Discord Token Type
//type DiscordToken = ;

type BotConfig = {
    // Your Discord's bot token
    token: string;
    // Bot ID,
    id: DiscordID;
    // ID of the testing server
    guildId: DiscordID;
};

declare namespace ConfigTypes {
    export interface config {
        bot: BotConfig;
        // This is useful if you have a bot for testing, so you can experiment without affecting your users.
        devBot?: BotConfig;
        mongoURL?: string;
    }
}
