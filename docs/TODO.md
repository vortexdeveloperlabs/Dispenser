# TODOs

# Last changes before the V2 update

-   [ ] Port to [NodeJS](https://nodejs.org/en) and [Bun](https://bun.sh), while maintaining [Deno](https://deno.com) compatibility.
    -   [ ] Make import maps to runtimes other than Node that redirect the imports to NPM to their native alernatives, so they don't have to rely on NodeJS emulation
        -   [x] Discordeno 17 imports
        -   [x] MongoDB imports
        -   [ ] Upgrade Discordeno 13 imports to 17, and replace it to the "discordeno" NPM import
    -   [ ] Finish the start scripts for the alternative runtimes
-   [ ] Allow a "link manager" role to be assigned that allows for users other than admins to be able to control Dispenser
-   [ ] Implement community links
    -   [x] Give community members access to the link management commands
    -   [x] Only use community links as a fallback and warn the users when they get a community link
    -   [ ] Allow users to prevent the bot from giving them community links created by a specific user with `/blacklistCommunityLinksBy <user>`
    -   [ ] Verify the integrity of the link (this requires Filter Lock's link bot integration library)
-   [ ] Implement link reporting
-   [ ] Implement [Enchanced logging functionality](./Logging.md):
    -   [ ] Add channel logging
    -   [ ] Colorize the output in the server logs by using a proper logger
-   [x] Implement [fault tolerance](./Fault%20tolerance.md):
    -   [x] Implement it in the bot itself
    -   [x] Implement the APIs
-   TODO: ...

# V3 updates

TODO: ...

## Documentation

-   [ ] Explain how to make and use a systemd service for Dispenser - Flyaway
