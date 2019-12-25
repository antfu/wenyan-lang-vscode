import { TextDocumentContentProvider, Uri, workspace, EventEmitter } from 'vscode'
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/parser-babylon'
import { parseQuery } from '../utils'
import { DOC_SCHEMA } from '../meta'
import { SupportTargetLanguage, Config } from '../config'
import { ExtensionModule } from '../module'
import { Exec } from '../exec'
import { optimize } from '../misc/optimize'

async function getCompiledResult (filepath: string, target: SupportTargetLanguage) {
  const result = await Exec(filepath, {
    lang: target,
    compile: true,
    roman: Config.romanizeMethod,
  }) || ''

  if (target === 'py')
    return result
  else
    return prettier.format(optimize(result), { semi: false, parser: 'babel', plugins: [parserBabel] })
}

async function getExecResult (filepath: string, target: SupportTargetLanguage) {
  return await Exec(filepath, {
    lang: target,
    roman: Config.romanizeMethod,
  }) || ''
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

    try {
      if (action === 'execute')
        return await getExecResult(filepath, target)
      if (action === 'compile')
        return await getCompiledResult(filepath, target)
    }
    catch (e) {
      const error = e.toString()

      if (action === 'compile') {
        if (target === 'js')
          return `/*\n${error}\n*/`

        if (target === 'py')
          return `'''\n${error}\n'''`
      }

      return error
    }
  }
}

export const documentProvider = new DocumentProvider()

const m: ExtensionModule = () => {
  return workspace.registerTextDocumentContentProvider(DOC_SCHEMA, documentProvider)
}

export default m
