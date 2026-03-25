import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Returns the equivalent of __dirname for ES Modules.
 * @param {string} metaUrl - You must always pass `import.meta.url` of the current file.
 * @returns {string} The absolute path of the directory.
 */
export const getDirname = (metaUrl) => {
  const __filename = fileURLToPath(metaUrl)
  return path.dirname(__filename)
}
