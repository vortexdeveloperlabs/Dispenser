import { err, ok, Result } from "npm:neverthrow";

import { MongoClient } from "npm:mongodb";

import { perServerConfigOverridesDb } from "$db";

import {
	//PerServerConfig,
	possiblePerServerConfigOptionTypes,
} from "../types/config.d.ts";
import config from "$config";

import Logger from "./Logger.ts";
import { Locales } from "npm:discordeno";

const logger = new Logger();

interface AccessConfigError {
	type: "cannotFindProp";
	msg: string;
	atFault: "user" | "bot";
}

type TranslationQuery =
	| {
		type: "in_command";
		searchString: string;
		commandTarget?: string;
		isEmbed: boolean;
	}
	| {
		type: "misc_string";
		searchString: string;
		/* Errors are divided into parts it is split where the actual error message is. Defaults to false. */
		isPartOfError?: string;
	};

export default class AccessConfig {
	db: MongoClient;

	constructor(db: MongoClient) {
		this.db = db;
	}

	// TODO: remove propPath nonesense and use (get/set)Config

	async resetOverride(
		propPath: string,
	): Promise<Result<void, AccessConfigError>> {
		// TODO: Implement
		return ok("");
	}

	// Helpers
	/* This method returns the entire config object. */
	async getConfig() /*: Result<PerServerConfig, AccessConfigError>*/ {
		// TODO: Implement
	}
	/* Applies the translation if it exists */
	async getTranslation(
		translationsQuery: TranslationQuery,
		/* TODO: Without locale, it should return an object with all translations (key locale, value translation) */
		locale?: Locales,
	): Promise<AsyncResult<string, AccessConfigError>> {
		let stringToTranslate = config.translationsQuery.searchString;
		if (translationsQuery.isEmbed) {
			return this.getOverrideRaw(
				`defaultPerServerConfig.embedOverride.${translationsQuery.commandTarget}`,
			);
		}
	}
	// TODO: Make this the default getTranslation of and remove it
	applyTranslationIfExists(
		translationsQuery: TranslationQuery,
		interaction: Interaction,
	): string {
		const possibleTranslation = this.getTranslation(translationsQuery);
		if (
			possibleTranslation.isErr()
		) {
			// TODO: Log the error
			return translationsQuery.searchString;
		}
		return possibleTranslation.value;
	}

	#createCannotFindPropError(propPath: string): AccessConfigError {
		return {
			type: "cannotFindProp",
			msg: `No default value found under the property provided ${propPath}`,
			atFault: "user",
		};
	}
}

const accessConfig = new AccessConfig(config.mongoClient);

export { accessConfig };
