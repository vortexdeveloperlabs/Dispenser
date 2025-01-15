import initBot from "./bot.ts";
import faultTolerantAPI from "./faultToleranceAPI.ts";

import config from "$config";

const botConfig = config.devMode ? config.devBot : config.bot;

console.log(botConfig);

initBot(botConfig.token, botConfig.id);

Deno.serve({ port: config.port }, faultTolerantAPI);
