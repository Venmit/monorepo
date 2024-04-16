import consola from "consola"
import childProcess from "node:child_process"

/**
 * Executes a command asynchronously in a separate process.
 * It will not print the output to the console.
 *
 * @param command The command to execute.
 * @returns The stdout of the command.
 */
export function execAsync(command: string) {
	return new Promise<string>((resolve, reject) => {
		childProcess.exec(command, (error, stdout) => {
			if (error) {
				reject(error)
			} else {
				resolve(stdout)
			}
		})
	})
}

export function longestCommonPrefix(strA: string, strB: string): string {
	let commonPrefix = ""
	for (let i = 0; i < Math.min(strA.length, strB.length); i++) {
		if (strA[i] === strB[i]) {
			commonPrefix += strA[i]
		} else {
			break
		}
	}
	return commonPrefix
}

/**
 * Get's the common prefix of a set of strings.
 * If only one string is passed the prefix will be the empty string
 *
 * @example
 * ```ts
 * getCommonPrefix(["foo", "foobar"]) // "foo"
 * getCommonPrefix(["foobar"]) // ""
 * ```
 */
export function getCommonPrefix(strings: string[]): string {
	const strs = strings.filter(Boolean)
	if (strs.length <= 1) return ""

	const firstString = strs[0]
	if (firstString === undefined) {
		return ""
	}

	return strs.reduce((commonPrefix, str) => longestCommonPrefix(commonPrefix, str), firstString)
}

/**
 * Wrapper to exit the process if the user presses CTRL+C.
 */
export const prompt: typeof consola.prompt = async (message, options) => {
	const response = await consola.prompt(message, options)
	if (response?.toString() === "Symbol(clack:cancel)") {
		process.exit(0)
	}
	return response
}

export const promptSelection = async <T extends string>(
	message: string,
	options: { initial?: T; options: { label: string; value: T }[] } = { options: [] }
): Promise<T> => {
	return prompt(message, { type: "select", ...options }) as unknown as Promise<T>
}
