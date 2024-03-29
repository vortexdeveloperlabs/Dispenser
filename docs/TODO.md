# TODOs

## Last changes before the V2 update

-   [ ] Refactor the command handler to allow commands to be registered as a subcommand so `/link add` can be its own file itself, for example.
    -   [ ] Combine all of the link commands into subcommands on `/link <subcommand> ...`
-   [ ] Port to [NodeJS](https://nodejs.org/en) and [Bun](https://bun.sh), while maintaining [Deno](https://deno.com) compatibility.
    -   [ ] Make import maps to runtimes other than Node that redirect the imports to NPM to their native alernatives, so they don't have to rely on NodeJS emulation
        -   [x] Discordeno 17 imports
        -   [x] MongoDB imports
        -   [ ] Upgrade Discordeno 13 imports to 17, and replace it to the "discordeno" NPM import
    -   [ ] Finish the start scripts for the alternative runtimes
-   [ ] Make it so that you can use /list <category>
    -   [ ] Also, list the limit for the category
-   [ ] Allow a "link manager" role to be assigned that allows for users other than admins to be able to control Dispenser.
-   [ ] Implement community links
    -   [x] Give community members access to the link management commands
    -   [x] Only use community links as a fallback and warn the users when they get a community link
    -   [ ] Allow users to prevent the bot from giving them community links created by a specific user with `/blacklistCommunityLinksBy <user>`
    -   [ ] Seperate community link commands into `/community link` instead of the isAdmin check inside of the command as it is currently
    -   [ ] Make two different types of community links: BYOD and Self-hosted. The order of priority and trust while giving out these links will go `Official links > BYOD links > Self-hosted clone links`.
    -   [ ] Verify the integrity of the link (this requires Filter Lock's link bot integration library)
        -   [ ] BYOD links must match any of the DNS records of the official links. When a BYOD link is being dmed to the user, the footer of the embed will contain a warning saying that the domain may not always be under our control.
        -   [ ] Self-hosted links will have their HTML checked for similarity with the main site. Additionally in `/community link add ...` you will be able to add an argument for the Access Token, so that it may pass even when secured on Filter Lock. When a Self-hosted clone link is being dmed to the user, the footer of the embed will contain a warning saying we have no control of what happens in it and that their data may be used maliciously.
-   [ ] Implement the [Config System](./Config%20System.md)
    -   [ ] Implement the configuration options as per `types/configs.d.ts`
-   [ ] Implement link reporting
-   [ ] Implement [Enchanced logging functionality](./Logging.md):
    -   [ ] Add channel logging
    -   [ ] Colorize the output in the server logs by using a proper logger
-   [x] Implement [fault tolerance](./Fault%20tolerance.md):
    -   [x] Implement it in the bot itself
    -   [x] Implement the API
            I'm also going to make it so that you can sync yourself for roles related to the filters / classroom providers

## Cohorts

-   [ ] Implement the [Cohort System](./Cohorts.md)
-   [ ] Panel updates
    -   [ ] Support multiple "Classroom Providers" by making it so that there is a dropdown to select yours on the panel if you have district cohorts and account checking enabled.
    -   [ ] Whenever the user clicks on the dispense button they would be given a notice / recommendation to identify themselves with a District cohort through an empheral message reply. In auto mode (v3), the user would be given a notice the first time they activate it. This would be able to be opted out with `/opt-out district_cohorts_reminder` (with autocomplete ofc).

## V3 updates

-   [ ] Global links
    -   [ ] `/carousel` - This will be a paginator for subscribing to categories from servers outside of the one you are in.
            `btn:invite | select:category | btn: subscribe | btn:double-left (go to the most popular server) | btn:left | btn:right | btn:dice (randomly choose a category)`.
-   [ ] Global link button. When global link support is enabled `config.globalLinks.enabled` (enabled by default), the panel will have an extra button called "🌐 Global" This will respond with an ephemeral message that is similar to the panel, but only shows global servers and categories that the user is subscribed to. `drop-down:server name | drop-down:category | btn:submit`
-   [ ] Implement auto link distribution

### Documentation

-   [ ] Explain how to make and use a systemd service for Dispenser - Flyaway
