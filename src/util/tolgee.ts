import { recursiveReaddir } from "https://deno.land/x/recursive_readdir@v2.0.0/mod.ts";
import { extname, join } from "https://deno.land/std@0.224.0/path/mod.ts";

import { parse, print } from "https://deno.land/x/swc@0.2.1/mod.ts";
import { walk } from "npm:estree-walkie";

import { BackendFetch, FormatSimple, Tolgee } from "npm:@tolgee/web";

import type { TranslationQuery } from "./AccessConfig.ts";

import config from "$config";

const tolgee = Tolgee()
	// .use(FormatSimple())
	/*.use(
        BackendFetch({
            prefix: config.tolgee.cdnURL,
        }),
    )
    =*/
	.init({
		apiKey: config.tolgee.apiKey,
		apiUrl: "https://app.tolgee.io",
		defaultLanguage: "en-US",
		observerType: "text",
		observerOptions: { inputPrefix: "{{", inputSuffix: "}}" },
	});

await tolgee.run();

const files = await recursiveReaddir(join(".", "src"));
const tsFilePaths = files.filter(
	(file: string) => extname(file) === ".ts",
);
for (const tsFilePath of tsFilePaths) {
	/*
	const tsFileData = await Deno.readFile(tsFilePath);
	const decoder = new TextDecoder("utf-8");
	const tsFileContent = decoder.decode(tsFileData);

	let ast;
	try {
		ast = parse(tsFileContent, {
			target: "es2022",
			syntax: "typescript",
			comments: false,
		});
	} catch (err) {
		console.warn(
			`Error while trying to parse the AST for the file, ${tsFilePath}: "${err}"`,
		);
		continue;
	}

	// Use https://swc.rs/playground (set to TS) for testing
	walk(ast, {
		AwaitExpression(node) {
			if (node.argument.type === "CallExpression" && node.argument.callee.type === "Identifier" && argument.callee.value === "createErrorEmbed") && node.arguments) {
				if (node.arguments.length === 3) {
					if (node.arguments[2].expression.type === "StringLiteral") {
						uploadTranslationKey(node.arguments[0].expression.value)
					}
				}
			}
		}
		VariableDeclarator(node) {
			// Command Data description
			if (node.id.value === "data" && node.init.type === "ObjectExpression") {
				for (const property of node.init.properties) {
					if (property.type === "KeyValueProperty" && property.key.value === "description") {
						uploadTranslationKey("description", property.value.value);
					}
				}
			}
		}
		CallExpression(node) {
			// TODO: respond.respond/respond.RespondEmbed with the third arg
			// accessConfig.getTranslation
			if (
				node.callee.type === "MemberExpression" &&
				node.callee.object.value === "accessConfig" &&
				node.callee.property.value === "getTranslation" &&
				node.arguments?.[0] &&
				node.arguments[0].expression.type === "ObjectExpression"
			) {
				for (
					const property of node.arguments[0].expression
						.properties
				) {
					if (property.key.value === "searchString") {
						const translationKey = property.value.value;
						console.log(
							`Processing "${translationKey}" for Tolgee`,
						);
						const translationQueryAST =
						node.arguments[0].expression;

						let namespace = "misc_string";
						// @ts-ignore: this is AST
						const typeKV = translationQueryAST
							.properties.find((property) =>
								property.key.value === "type"
							);
						if (
							typeKV !==
								null
						) {
							namespace = typeKV.value.value;
						}

							uploadTranslationKey(translationKey, namespace);
						}
				}
			}
		},
	});
	*/
}
const cmdFiles = await recursiveReaddir(join(".", "src/commands"));
const tsCmdFilePaths = cmdFiles.filter(
	(file: string) => extname(file) === ".ts",
);
for (const tsCmdFilePath of tsCmdFilePaths) {
	// TODO: Get all of the description, name properties from the command data, command options, and subcommands and make localizations
}

async function uploadTranslationKey(translationKey: string, namespace: string) {
	// Upload the search string as a key if it doesn't already exist
	// Upload the key
	let resp: Response;
	try {
		resp = await fetch(
			`https://app.tolgee.io/v2/projects/${config.tolgee.projectId}/keys`,
			{
				method: "POST",
				body: JSON.stringify({
					name: translationKey,
					namespace,
					isPlural: false,
				}),
				headers: {
					"Content-Type": "application/json",
					"Accept": "*/*",
					"X-API-Key": config.tolgee.apiKey,
				},
			},
		);
	} catch (err) {
		console.error(
			`Error while trying to upload the translation key, ${translationKey}, for Tolgee: "${err.stack}"`,
		);
	}
	const json = await resp.json();
	if ("id" in json) {
		console.log(
			`Successfully added the translation key, ${translationKey}, to Tolgee`,
		);
	} else if (
		"CUSTOM_VALIDATION" in json &&
		typeof json.CUSTOM_VALIDATION
				.key_exists === "object"
	) {
		console.log(
			`The translation key, "${translationKey}", already exists in Tolgee! Updating instead...`,
		);
		// TODO: Update the key
	} else {
		console.error(
			`Unknown JSON came back from Tolgee when trying to add the translation key: ${
				JSON.stringify(json)
			}`,
		);
	}
}

//export default tolgee;
