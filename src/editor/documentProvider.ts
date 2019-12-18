import { TextDocumentContentProvider, Uri, workspace, EventEmitter } from 'vscode'
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/parser-babylon'
import { parseQuery } from '../utils'
import { DOC_SCHEMA } from '../meta'
import { ExtensionModule } from '../module'
import { Exec } from '../exec'

async function getCompiledResult (filepath: string) {
  const result = await Exec(filepath) || ''

  return prettier.format(result, { semi: false, parser: 'babel', plugins: [parserBabel] })
}

async function getExecResult (filepath: string) {
  const result = await Exec(filepath, { exec: true }) || ''

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

    if (!filepath || !action)
      return ''

    if (action === 'execute')
      return await getExecResult(filepath)
    if (action === 'compile')
      return await getCompiledResult(filepath)
  }
}

export const documentProvider = new DocumentProvider()

const m: ExtensionModule = () => {
  return workspace.registerTextDocumentContentProvider(DOC_SCHEMA, documentProvider)
}

export default m
