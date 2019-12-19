import { TextDocumentContentProvider, Uri, workspace, EventEmitter } from 'vscode'
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/parser-babylon'
import { parseQuery } from '../utils'
import { DOC_SCHEMA } from '../meta'
import { SupportTargetLanguage } from '../config'
import { ExtensionModule } from '../module'
import { Exec } from '../exec'

async function getCompiledResult (filepath: string, target: SupportTargetLanguage) {
  const result = await Exec(filepath, { lang: target }) || ''

  if (target === 'py')
    return result
  else
    return prettier.format(result, { semi: false, parser: 'babel', plugins: [parserBabel] })
}

async function getExecResult (filepath: string, target: SupportTargetLanguage) {
  const result = await Exec(filepath, { exec: true, lang: target }) || ''

  // remove first line or compiled code
  return result.split('\n').slice(1).join('\n')
}

class DocumentProvider implements TextDocumentContentProvider {
  onDidChangeEmitter = new EventEmitter<Uri>()
  onDidChange = this.onDidChangeEmitter.event

  async provideTextDocumentContent (uri: Uri) {
    const query = parseQuery(uri.query)
    const filepath = query.filepath
    const action = query.action
    const target = query.target as SupportTargetLanguage

    if (!filepath || !action)
      return ''

    if (action === 'execute')
      return await getExecResult(filepath, target)
    if (action === 'compile')
      return await getCompiledResult(filepath, target)
  }
}

export const documentProvider = new DocumentProvider()

const m: ExtensionModule = () => {
  return workspace.registerTextDocumentContentProvider(DOC_SCHEMA, documentProvider)
}

export default m
