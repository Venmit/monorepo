import type { InlangProject } from "@inlang/sdk"

export let mockSettings: ReturnType<InlangProject["settings"]> = {
	$schema: "https://inlang.com/schema/project-settings",
	sourceLanguageTag: "en",
	languageTags: ["en", "es", "fr", "pt-br", "ru", "zh-cn"],
	messageLintRuleLevels: {
		"messageLintRule.inlang.identicalPattern": "error",
	},
	modules: [
		"https://cdn.jsdelivr.net/npm/@inlang/plugin-i18next@4/dist/index.js",
		"https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-empty-pattern@latest/dist/index.js",
		"https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-identical-pattern@latest/dist/index.js",
		"https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-missing-translation@latest/dist/index.js",
		"https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-without-source@latest/dist/index.js",
	],
	"plugin.inlang.i18next": {
		pathPattern: {
			brain: "./frontend/public/locales/{languageTag}/brain.json",
			chat: "./frontend/public/locales/{languageTag}/chat.json",
			config: "./frontend/public/locales/{languageTag}/config.json",
			contact: "./frontend/public/locales/{languageTag}/contact.json",
			deleteOrUnsubscribeFormBrain:
				"./frontend/public/locales/{languageTag}/deleteOrUnsubscribeFormBrain.json",
			explore: "./frontend/public/locales/{languageTag}/explore.json",
			external_api_definition:
				"./frontend/public/locales/{languageTag}/external_api_definition.json",
			home: "./frontend/public/locales/{languageTag}/home.json",
			invitation: "./frontend/public/locales/{languageTag}/invitation.json",
			knowledge: "./frontend/public/locales/{languageTag}/knowledge.json",
			login: "./frontend/public/locales/{languageTag}/login.json",
			logout: "./frontend/public/locales/{languageTag}/logout.json",
			monetization: "./frontend/public/locales/{languageTag}/monetization.json",
			translation: "./frontend/public/locales/{languageTag}/translation.json",
			upload: "./frontend/public/locales/{languageTag}/upload.json",
			user: "./frontend/public/locales/{languageTag}/user.json",
		},
	},
}

export const mockProject = {
	id: "mock-project",
	installed: {
		plugins: () => [
			{
				id: "plugin.inlang.i18next",
				displayName: "i18next",
				description: "i18next",
				module: "https://cdn.jsdelivr.net/npm/@inlang/plugin-i18next@4/dist/index.js",
				settingsSchema: {
					type: "object",
					properties: {
						pathPattern: {
							anyOf: [
								{
									pattern: "^(\\./|\\../|/)[^*]*\\{languageTag\\}[^*]*\\.json",
									description: "The pathPattern must contain `{languageTag}` and end with `.json`.",
									examples: [
										"./{languageTag}/file.json",
										"../folder/{languageTag}/file.json",
										"./{languageTag}.json",
									],
									type: "string",
								},
								{
									type: "object",
									patternProperties: {
										"^[^.]+$": {
											pattern: "^(\\./|\\../|/)[^*]*\\{languageTag\\}[^*]*\\.json",
											description:
												"The pathPattern must contain `{languageTag}` and end with `.json`.",
											examples: [
												"./{languageTag}/file.json",
												"../folder/{languageTag}/file.json",
												"./{languageTag}.json",
											],
											type: "string",
										},
									},
								},
							],
						},
						variableReferencePattern: {
							type: "array",
							items: {
								type: "string",
							},
						},
						sourceLanguageFilePath: {
							anyOf: [
								{
									pattern: "^(\\./|\\../|/)[^*]*\\{languageTag\\}[^*]*\\.json",
									description: "The pathPattern must contain `{languageTag}` and end with `.json`.",
									examples: [
										"./{languageTag}/file.json",
										"../folder/{languageTag}/file.json",
										"./{languageTag}.json",
									],
									type: "string",
								},
								{
									type: "object",
									patternProperties: {
										"^[^.]+$": {
											pattern: "^(\\./|\\../|/)[^*]*\\{languageTag\\}[^*]*\\.json",
											description:
												"The pathPattern must contain `{languageTag}` and end with `.json`.",
											examples: [
												"./{languageTag}/file.json",
												"../folder/{languageTag}/file.json",
												"./{languageTag}.json",
											],
											type: "string",
										},
									},
								},
							],
						},
						ignore: {
							type: "array",
							items: {
								type: "string",
							},
						},
					},
					required: ["pathPattern"],
				},
			},
		],
		messageLintRules: () => [
			{
				id: "messageLintRule.inlang.emptyPattern",
				displayName: "Empty Pattern",
				description: "Empty Pattern",
				module:
					"https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-empty-pattern@latest/dist/index.js",
			},
			{
				id: "messageLintRule.inlang.identicalPattern",
				displayName: "Identical Pattern",
				description: "Identical Pattern",
				module:
					"https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-identical-pattern@latest/dist/index.js",
				settingsSchema: {
					type: "object",
					properties: {
						ignore: {
							type: "array",
							items: {
								pattern: "[^*]",
								description: "All items in the array need quotaion marks at the end and beginning",
								type: "string",
							},
						},
					},
				},
			},
			{
				id: "messageLintRule.inlang.missingTranslation",
				displayName: "Missing Translation",
				description: "Missing Translation",
				module:
					"https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-missing-translation@latest/dist/index.js",
			},
			{
				id: "messageLintRule.inlang.messageWithoutSource",
				displayName: "Without Source",
				description: "Without Source",
				module:
					"https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-without-source@latest/dist/index.js",
			},
		],
	},
	errors: () => [],
	settings: () => mockSettings,
	setSettings: (settings: any) => (mockSettings = settings),
}
