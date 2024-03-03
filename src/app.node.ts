// TODO: This Node port isn't complete yet

import initBot from "./bot.ts";
import faultTolerantAPI from "./faultToleranceAPI.ts";

import { serve } from "@hono/node-server";

import config from "$config";

initBot(config.bot.token, config.bot.id);

if (config.nodes)
    serve({
        fetch: faultTolerantAPI,
        port: config.port,
    });
