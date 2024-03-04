import initBot from "./bot.ts";
import faultTolerantAPI from "./faultToleranceAPI.ts";

import config from "$config";

if (config.isDebug) initBot(config.bot.token, config.bot.id);
else initBot(config.devBot.token, config.devBot.id);

Deno.serve({ port: config.port }, faultTolerantAPI);
