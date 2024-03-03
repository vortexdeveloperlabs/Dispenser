# Fault Tolerance

Because, the link bot is the most likely crucial part of the proxy community itself and uses a remote database, it makes sense to have fallbacks. The best way to do this would be to host all of the nodes at once and before the interaction in the is served. The command handle itself shouldn't have these checks, but it should be in the command handler (what runs the command handles). This is You We need control over this. My proposed solution involves hosting all of the bots at once, but intercepting the interaction and stopping the command handler from responding if the other nodes of higher importance remain functioning. This allows for redundancy.

## The APIs

### `/`

-   Returns: the meta (see types/index.d.ts)

### `/isAlive`

#### Returns:

-   A `200` status code and a body of `true`

### `/isCommandWorking`

#### Post

The command name

#### Returns:

-   If the command doesn't exist, a `400` status code
-   If the command exists and...
    -   The last execution of it was valid, a `200` status code with the body of "true".
    -   Or else, a `500` status code and a body of "false".

## Glossary

-   command handler - the method involved with invoking the correct command handler. This is used in Discord bots to abstract the commands away from the main file and have a place to control the execution of all commands.
-   command handle - The methods that the command handler invokes. These actually respond to the interaction.
-   dormant node - The nodes that are not yet ready, are referred to as being "dormant".
    nodes of higher importance - The nodes that are above it in the queue, as per the meta itself
