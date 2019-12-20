import { exec } from 'child_process'
import path from 'path'
import { Uri } from 'vscode'
import { ResultActions, DOC_SCHEMA } from './meta'
import { SupportTargetLanguage, Config } from './config'

export function parseQuery (queryString: string) {
  const query: Record<string, string> = {}
  const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&')
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=')
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '')
  }
  return query
}

export function openInDefaultViewer (filename: string) {
  const open = process.platform === 'darwin'
    ? 'open'
    : process.platform === 'win32'
      ? 'start'
      : 'xdg-open'

  exec(`${open} ${filename}`)
}

export function getResultUrl (filepath: string, action: ResultActions, targetLanguage: SupportTargetLanguage = Config.targetLanguage) {
  const { name } = path.parse(filepath)
  const filename = action === 'execute' ? `${name}(Output)` : `${name}(Compiled).${targetLanguage}`
  return Uri.parse(`${DOC_SCHEMA}:${filename}?action=${action}&filepath=${encodeURIComponent(filepath)}&target=${targetLanguage}`)
}
