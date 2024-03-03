import initBot from "./bot.ts";
import faultTolerantAPI from "./faultToleranceAPI.ts";

import config from "$config";

initBot(config.bot.token, config.bot.id);

export default faultTolerantAPI(config.port);

export default {
    port: config.port,
    fetch: faultTolerantAPI,
};
