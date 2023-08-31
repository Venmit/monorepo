import type { MessageLintRule } from "@inlang/lint-rule"

export const emptyPatternRule: MessageLintRule = {
	type: "MessageLint",
	meta: {
		id: "inlang.lintRule.emptyPattern",
		displayName: {
			en: "Empty Pattern",
		},
		description: {
			en: `
Checks for empty pattern in a language tag.

If a message exists in the reference resource but the pattern
in a target resource is empty, it is likely that the message has not
been translated yet.
`,
		},
		marketplace: {
			icon: "https://raw.githubusercontent.com/inlang/inlang/main/source-code/plugins/standard-lint-rules/assets/icon.png",
			linkToReadme: {
				en: "https://github.com/inlang/inlang/blob/main/source-code/plugins/standard-lint-rules/README.md",
			},
			keywords: ["lint-rule", "standard", "empty-pattern"],
			publisherName: "inlang",
			publisherIcon: "https://inlang.com/favicon/safari-pinned-tab.svg",
			license: "Apache-2.0",
		},
	},
	message: ({ message: { id, variants }, languageTags, sourceLanguageTag, report }) => {
		const translatedLanguageTags = languageTags.filter(
			(languageTag) => languageTag !== sourceLanguageTag,
		)
		for (const translatedLanguageTag of translatedLanguageTags) {
			const filteredVariants =
				variants.filter((variant) => variant.languageTag === translatedLanguageTag) ?? []
			if (filteredVariants.length === 0) return
			const patterns = filteredVariants.flatMap(({ pattern }) => pattern)
			if (!patterns.length) {
				report({
					messageId: id,
					languageTag: translatedLanguageTag,
					body: {
						en: `Message with id '${id}' has no patterns for language tag '${translatedLanguageTag}'.`,
					},
				})
			} else if (
				patterns.length === 1 &&
				patterns[0]?.type === "Text" &&
				patterns[0]?.value === ""
			) {
				report({
					messageId: id,
					languageTag: translatedLanguageTag,
					body: {
						en: `Message with id '${id}' has no content for language tag '${translatedLanguageTag}'.`,
					},
				})
			}
		}
	},
}
