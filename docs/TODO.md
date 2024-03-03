# TODOs

# Last changes before V3 updated

-   [ ] Port to [NodeJS](https://nodejs.org/en) and maintain [Deno](https://deno.com) compatibility.
    -   [ ] Make it run on Node by switching the imports to the NPM equivalents
    -   [ ] Publish to [NPM](https://npmjs.org)
    -   [ ] Provide deno builds through [Denoify](https://www.denoify.land/) and import maps converting the NodeJS ports to the native Deno versions (for Discordeno)
-   Implement [Enchanced logging functionality](./Logging.md):
    -   Add channel logging
    -   Colorize the output in the server logs by using a proper logger
-   Implement [fault tolerance](./Fault%20tolerance.md):
    -   In the command handler, whenever it errors, set in the database using the command name as a key, true, meaning the command threw an error in the last execution. Even if successful, check if the under that key, the value is false. If it is false, reset it, to bring it back to true.
-   TODO: ...

## Documentation

-   [ ] Explain how to make and use a systemd service for Dispenser - Flyaway
