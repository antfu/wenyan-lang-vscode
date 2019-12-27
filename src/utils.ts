import { exec } from 'child_process'
import path from 'path'
import { Uri, TextDocument } from 'vscode'
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

export function getResultUrl (document: TextDocument, action: ResultActions, targetLanguage: SupportTargetLanguage = Config.targetLanguage) {
  const uri = document.uri
  const { name } = path.parse(uri.fsPath)
  let filename = name
  switch (action) {
    case 'compile':
      filename = `${name}(Compiled).${targetLanguage}`
      break
    case 'execute':
      filename = `${name}(Output)`
      break
    case 'wenyanize':
      filename = `${name}(Wenyanized).wy`
      break
  }
  return Uri.parse(`${DOC_SCHEMA}:${filename}?action=${action}&path=${encodeURIComponent(uri.path)}&target=${targetLanguage}`)
}
