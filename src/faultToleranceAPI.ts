import type { IsCommandWorkingResponse, Meta } from "../docs/types/index.d.ts";

import config from "$config";

import { Hono } from "https://deno.land/x/hono@v4.0.8/mod.ts";
import type { Context } from "https://deno.land/x/hono@v4.0.8/mod.ts";

import { faultToleranceDb } from "$db";

export default function faultTolerantAPI(): Hono {
	const app = new Hono();

	app.get("/", (c: Context) => {
		const meta: Meta = {
			nodes: JSON.stringify(config.nodes) ?? "[]",
		};
		return c.json(meta);
	});
	app.get("/isAlive", (c: Context) => {
		return c.text("true");
	});
	app.get("/isCommandWorking", async (c: Context) => {
		const commandResult = faultToleranceDb.findOne({
			commandName: await c.req.text(),
		});

		const resp: IsCommandWorkingResponse =
			// The mere presence of the command name in that collection is enough to determine if it is broken
			commandResult === null
				? {
					worked: true,
				}
				: {
					worked: false,
					error: commandResult.error,
				};

		return c.json(resp);
	});

	return app;
}
