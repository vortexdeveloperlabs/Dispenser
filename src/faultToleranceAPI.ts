import type { Meta, IsCommandWorkingResponse } from "../docs/types/index.d.ts";

import config from "$config";

import { Hono } from "https://deno.land/x/hono/mod.ts";
import type { Context } from "https://deno.land/x/hono/mod.ts";

import { faultToleranceDb } from "$db";

export default function faultTolerantAPI(): void {
    const app = new Hono();

    app.get("/", (c: Context) => {
        const meta: Meta = {
            nodes: config.nodes;
        }
        return c.json(meta);
    });
    app.get("/isAlive", (c: Context) => {
        return c.text("true");
    });
    app.get("/isCommandWorkingResponse", (c: Context) => {
        const commandResult = faultToleranceDb.find({ commandName: c.req.text()});
    
        let resp: IsCommandWorkingResponse = commandResult === null ? {
            status: false
        } : {
            status: true,
            error: commandResult.error
        };
    });

    app.get("");
}
