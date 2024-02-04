# Dispenser V3 Proposal

> A lot of the things haven't yet been ported from the [old Hedgedoc](https://hedge.soundar.eu.org/fOOtzKNwTJiHDEfZ7hm6Fw?view=), so please read that

## How to setup

You must assign filter roles on the bot with `/config add Filter Role {Filter Name} {Role ID}`

> You should prompt the user to choose their filter roles in onboarding

Server staff will be able to configure with:

-   How often you will be able to request links - `Config option: dispense.interval {time}`. _For Manual Mode_
-   Number of links dispensed at a time - `Config option: dispense.quantity {number} | all`

## How to use

### How the config system works

You will be able to configure an `option` through `/config {reset|set|change|list} {option}.{suboption (if applicable)} {value}`. Additionally for booleans you will be able to do `/config change`

> Anywhere that you see anything like "how to configure..." or "the option...", it will be succeeded with the following `Config option: {option}.{suboption (if applicable} {value}`

Description of the change options (first argument):

-   `reset` - It will change the option to the default value
-   `change` - This is how you would traditionally specify a value. It will accept JSON-like values `string|boolean`. Boolean will be `enabled|disabled`, if you put `true|false` it will correct to the corresponding value. If there there is no value, it would either warn, or if it is a boolean it would toggle it

#### What list outputs

List will display the options in whatever format you want, such as JSON, TOML, YAML, and more.

### Filter Lock integrations

TODO: ...

> This is already described in the Filter Lock docs

### Smart Mode

This will allows Dispenser to be used without having to interface with the bot

In "smart" mode will will DMs you links automatically that are personalized to you. When those links get blocked in your cohert, you will automatically be given a new one

#### How the user interacts with the bot

There is a subscription system. The bot will DM you new links for links in each category you subscribe to. By default, you are subscribed to every category in the server. Additionally, you will be able to unsubscribe from any of them with and you will be able to subscribe to links and categories from each server. You will be able to do this through through browsing the gallery or through `/(un)subscribe ?{Server Name that has Dispenser in it}?/{category}`.
Finally, your users will be able to opt-out for a number of time with `/opt-out ${?time}`

##### Gallery

This will let you discover new proxy Discord servers and links.

Through `/browse-gallery` you will be presented with a UI with these components in a gallery-style UI (a browseable embed):

-   Title: Your Discord server's name
-   Icon: Your Discord server's icon
-   The color: This will come from averaging the colors of the Discord server icon. You will be able to also set `Config option: yourserver.color {string of the hexadecimal or RGB?A color}`
-   Description: If the server is discoverable, it would use that Description, or else the server staff will be able to change `Config option: yourserver.description {string}`.
-   Buttons:

    -   `←` - The previous server
    -   `→` - The next server
    -   `🎲` - Switches to a random server
    -   `💬` - This will send you a Discord invite to that server as an emphermal message, but that will be able to be a DM with configuring `Config option: gallery.dmUser {boolean}` or `Config option: gallery.dmUser.discordInvite {boolean}`

###### Order of servers

The servers in the gallery will be sorted in this way:

1. The first server would be the one you are in, obviously
2. By site users - there will be OAuth integrations with analytic platforms like Post Hog and Google Analytics
3. If that is not available, then it will be ranked by recent Discord server growth This ensures that a dead servers won't be ranked higher unfairly, and that new communities have a good chance. Optionally, it will be able to simply be ranked by server users; if the current proxy server owner chooses, this option will be default

###### How to configure the gallery

You will be able to configure the gallery in these ways:

-   Opt-out - `Config option: gallery.status {boolean}`
-   Blacklist server - `/config gallery.blacklist {string: The Server ID or Name for participating servers}`

### Manual Mode (legacy)

This will be developed at a substantial time after Dispenser's release

TODO: ...
