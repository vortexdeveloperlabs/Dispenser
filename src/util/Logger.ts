const isDebug = Deno.args.includes("--debug");

export default class Logger {
	log(msg: string) {
		// TODO: Also log this in the Discord channel as per the `/log` command (regardless of the isDebug)
		if (isDebug) {
			console.log(msg);
		}
	}
	logToSupport(msg: string) {
		// TODO: Will use config.supportChannel
		// TODO: This will be used when the report form under the button "My filter isn't here" isn't submitted (on onboarding)
	}
	error(msg: string) {
		// TODO: Also log this in the Discord channel as per the `/log` command
		console.error(msg);
	}
}

// TODO: Switch to using the already constructed logger in the rest of the codebase
const logger = new Logger();

export { logger };
