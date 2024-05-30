import type { MessageBundle } from "../v2/types.js"
import { normalizeMessageBundle } from "../v2/createMessageBundle.js"
import { getDirname, type NodeishFilesystem } from "@lix-js/fs"
import { acquireFileLock } from "./filelock/acquireFileLock.js"
import { releaseLock } from "./filelock/releaseLock.js"
import { batchedIO } from "./batchedIO.js"
import type { StoreApi } from "./storeApi.js"

import _debug from "debug"
const debug = _debug("sdk:store")

export async function openStore(args: {
	projectPath: string
	nodeishFs: NodeishFilesystem
}): Promise<StoreApi> {
	const nodeishFs = args.nodeishFs
	const filePath = args.projectPath + "/messages.json"
	const lockDirPath = args.projectPath + "/messagelock"

	// the index holds the in-memory state
	// TODO: reload when file changes on disk
	let index = await load()

	const batchedSave = batchedIO(acquireSaveLock, releaseSaveLock, save)

	return {
		messageBundles: {
			reload: async () => {
				index.clear()
				index = await load()
			},
			get: async (args: { id: string }) => {
				return index.get(args.id)
			},
			set: async (args: { data: MessageBundle }) => {
				index.set(args.data.id, args.data)
				await batchedSave(args.data.id)
			},
			delete: async (args: { id: string }) => {
				index.delete(args.id)
				await batchedSave(args.id)
			},
			getAll: async () => {
				return [...index.values()]
			},
		},
	}

	// load and save messages from file system atomically
	// using a lock file to prevent partial reads and writes
	async function load() {
		const lockTime = await acquireFileLock(nodeishFs, lockDirPath, "load")
		const messages = await readJSON({ filePath, nodeishFs: nodeishFs })
		const index = new Map<string, MessageBundle>(messages.map((message) => [message.id, message]))
		await releaseLock(nodeishFs, lockDirPath, "load", lockTime)
		return index
	}
	async function acquireSaveLock() {
		return await acquireFileLock(nodeishFs, lockDirPath, "save")
	}
	async function releaseSaveLock(lock: number) {
		return await releaseLock(nodeishFs, lockDirPath, "save", lock)
	}
	async function save() {
		await writeJSON({ filePath, nodeishFs: nodeishFs, messages: [...index.values()] })
	}
}

export async function readJSON(args: { filePath: string; nodeishFs: NodeishFilesystem }) {
	let result: MessageBundle[] = []

	debug("loadAll", args.filePath)
	try {
		const file = await args.nodeishFs.readFile(args.filePath, { encoding: "utf-8" })
		result = JSON.parse(file)
	} catch (error) {
		if ((error as any)?.code !== "ENOENT") {
			debug("loadMessages", error)
			throw error
		}
	}
	return result
}

export async function writeJSON(args: {
	filePath: string
	nodeishFs: NodeishFilesystem
	messages: MessageBundle[]
}) {
	debug("saveall", args.filePath)
	try {
		await createDirectoryIfNotExits(getDirname(args.filePath), args.nodeishFs)
		const output = JSON.stringify(args.messages.map(normalizeMessageBundle))
			// inject newlines between messages and bundles to improve git conflict resolution
			.replace(/"\}\]\}\]\}\]\},\{"id":"/g, '"}]}]}\n\n\n\n]},\n\n\n\n{"id":"')
			.replace(/"\}\]\}\]\}\]\}]/, '"}]}]}\n\n\n\n]}]')
			.replace(/"messages":\[\{"locale":"/g, '"messages":[\n\n\n\n{"locale":"')
			.replace(/\}\]\}\]\},\{"locale":"/g, '}]}]}\n\n\n\n,\n\n\n\n{"locale":"')
		await args.nodeishFs.writeFile(args.filePath, output)
	} catch (error) {
		debug("saveMessages", error)
		throw error
	}
}

async function createDirectoryIfNotExits(path: string, nodeishFs: NodeishFilesystem) {
	try {
		await nodeishFs.mkdir(path, { recursive: true })
	} catch (error: any) {
		if (error.code !== "EEXIST") {
			throw error
		}
	}
}
