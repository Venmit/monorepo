import { compileMessage } from "./compileMessage.js"
import { ProjectSettings, type Message } from "@inlang/sdk"
import { telemetry } from "../services/telemetry/implementation.js"
import { i } from "../services/codegen/identifier.js"
import { getLookupOrder } from "@inlang/language-tag"

const ignoreDirectory = `# ignore everything because the directory is auto-generated by inlang paraglide-js
# for more info visit https://inlang.com/m/gerre34r/paraglide-js
*
`

/**
 * A compile function takes a list of messages and project settings and returns
 * a map of file names to file contents.
 *
 * @example
 *   const output = compile({ messages, settings })
 *   console.log(output)
 *   >> { "messages.js": "...", "runtime.js": "..." }
 */
export const compile = (args: {
	messages: Readonly<Message[]>
	settings: ProjectSettings
}): Record<string, string> => {
	const lookupTable = getLookupOrder(args.settings.languageTags, args.settings.sourceLanguageTag)

	const compiledMessages = args.messages.map((message) =>
		compileMessage(message, args.settings.languageTags, lookupTable)
	)

	telemetry.capture({
		event: "PARAGLIDE-JS compile executed",
	})

	const resources: Record<string, string> = {}

	for (const compiledMessage of compiledMessages) {
		for (const languageTag of Object.keys(compiledMessage)) {
			if (languageTag === "index") continue
			if (!resources[languageTag]) resources[languageTag] = ""
			resources[languageTag] += "\n\n" + compiledMessage[languageTag]
		}
	}

	telemetry.shutdown()

	return {
		// boilerplate files
		".prettierignore": ignoreDirectory,
		".gitignore": ignoreDirectory,
		// resources
		// (messages/en.js)
		// (messages/de.js)
		// (etc...)
		...Object.fromEntries(
			Object.entries(resources).map(([languageTag, content]) => [
				`messages/${languageTag}.js`,
				`
/* eslint-disable */
/** 
* This file contains language specific message functions for tree-shaking. 
* 
*! WARNING: Only import messages from this file if you want to manually
*! optimize your bundle. Else, import from the \`messages.js\` file. 
* 
* Your bundler will (in the future) automatically replace the index function 
* with a language specific message function in the build step. 
*/` + content,
			])
		),
		// message index file
		"messages.js": `
/* eslint-disable */
import { languageTag } from "./runtime.js"
${Object.keys(resources)
	.map((languageTag) => `import * as ${i(languageTag)} from "./messages/${languageTag}.js"`)
	.join("\n")}

${compiledMessages.map((message) => message.index).join("\n\n")}
`,
		"runtime.js": `
/* eslint-disable */
/** @type {((tag: AvailableLanguageTag) => void) | undefined} */ 
let _onSetLanguageTag

/**
 * The project's source language tag.
 * 
 * @example
 *   if (newlySelectedLanguageTag === sourceLanguageTag){
 *     // do nothing as the source language tag is the default language
 *     return
 *   }
 */
export const sourceLanguageTag = "${args.settings.sourceLanguageTag}"

/**
 * The project's available language tags.
 * 
 * @example 
 *   if (availableLanguageTags.includes(userSelectedLanguageTag) === false){
 *     throw new Error("Language tag not available")
 *   }
 */
export const availableLanguageTags = /** @type {const} */ (${JSON.stringify(
			args.settings.languageTags
		)})

/**
 * Get the current language tag.
 * 
 * @example
 *   if (languageTag() === "de"){
 *     console.log("Germany 🇩🇪")
 *   } else if (languageTag() === "nl"){
 *     console.log("Netherlands 🇳🇱")
 *   }
 * 
 * @type {() => AvailableLanguageTag}
 */
export let languageTag = () => sourceLanguageTag

/**
 * Set the language tag.
 * 
 * @example 
 * 
 *   // changing to language 
 *   setLanguageTag("en")
 * 
 *   // passing a getter function also works. 
 *   // 
 *   // a getter function is useful for resolving a language tag 
 *   // on the server where every request has a different language tag
 *   setLanguageTag(() => {
 *     return request.langaugeTag
 *   }) 
 *
 * @param {AvailableLanguageTag | (() => AvailableLanguageTag)} tag
 */
export const setLanguageTag = (tag) => {
	if (typeof tag === "function") {
		languageTag = tag
	} else {
		languageTag = () => tag
	}
	// call the callback function if it has been defined
	if (_onSetLanguageTag !== undefined) {
		_onSetLanguageTag(languageTag())
	}
}

/**
 * Set the \`onSetLanguageTag()\` callback function.
 *
 * The function can be used to trigger client-side side-effects such as 
 * making a new request to the server with the updated language tag, 
 * or re-rendering the UI on the client (SPA apps).  
 * 
 * - Don't use this function on the server (!).
 *   Triggering a side-effect is only useful on the client because a server-side
 *   environment doesn't need to re-render the UI. 
 *     
 * - The \`onSetLanguageTag()\` callback can only be defined once to avoid unexpected behavior.
 * 
 * @example
 *   // if you use inlang paraglide on the server, make sure 
 *   // to not call \`onSetLanguageTag()\` on the server
 *   if (isServer === false) {
 *     onSetLanguageTag((tag) => {
 *       // (for example) make a new request to the 
 *       // server with the updated language tag
 *       window.location.href = \`/\${tag}/\${window.location.pathname}\`
 *     })
 *   }
 *
 * @param {(languageTag: AvailableLanguageTag) => void} fn
 */
export const onSetLanguageTag = (fn) => {
	_onSetLanguageTag = fn
}

/**
 * Check if something is an available language tag.
 * 
 * @example
 * 	if (isAvailableLanguageTag(params.locale)) {
 * 		setLanguageTag(params.locale)
 * 	} else {
 * 		setLanguageTag("en")
 * 	}
 * 
 * @param {any} thing
 * @returns {thing is AvailableLanguageTag}
 */
export function isAvailableLanguageTag(thing) {
	return availableLanguageTags.includes(thing)
}

// ------ TYPES ------

/**
 * A language tag that is available in the project.
 * 
 * @example
 *   setLanguageTag(request.languageTag as AvailableLanguageTag)
 * 
 * @typedef {typeof availableLanguageTags[number]} AvailableLanguageTag
 */
`,
	}
}
