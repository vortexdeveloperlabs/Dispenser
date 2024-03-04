import config from "$config";

export default async function runCommand(bot, interaction, command, isAdmin) {
    // If it is the main node or if the other nodes above it fail
    let shouldRun = false;
    // If it's not the main node, then act as a fallback
    if (config.nodes.length > 0) {
        let workingNodesFound = false;
        for (const node of config.nodes) {
            const isAliveResp = await fetch(`${node.host}/isAlive`);
            const isAlive = !!(await isAliveResp.text());

            if (!isAlive) continue;

            const isCommandWorkingResp = await fetch(
                `${node.host}/isCommandWorking`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "text/plain",
                    },
                    body: commandName,
                }
            );
            const isCommandWorkingJSON = await isCommandWorkingResp.json();
            const isCommandWorking = isCommandWorkingJSON.isCommandWorking;

            if (!isCommandWorking) workingNodesFound = true;
        }
        shouldRun = workingNodesFound;
    } else shouldRun = true;

    if (shouldRun)
        try {
            await command?.handle(bot, interaction);

            faultToleranceDb.deleteMany({
                commandName,
            });
        } catch (err) {
            const errFmt = `Error running ${command.data.name}: ${err.stack}`;
            if (isDebug) throw new Error(errFmt);
            else console.error(errFmt);

            await faultToleranceDb.insertOne({
                commandName,
                error: err.message,
            });
        }
}
