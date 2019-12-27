import { TextDocumentContentProvider, Uri, workspace, EventEmitter } from 'vscode'
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/parser-babylon'
import { js2wy } from 'wenyanizer'
import { parseQuery } from '../utils'
import { DOC_SCHEMA, ResultActions } from '../meta'
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

async function readFile (filepath: string) {
  const uri = Uri.file(filepath)
  const document = await workspace.openTextDocument(uri)
  return document.getText()
}

async function getWenyanizeResult (filepath: string) {
  const content = await readFile(filepath)
  return js2wy(content)
}

class DocumentProvider implements TextDocumentContentProvider {
  onDidChangeEmitter = new EventEmitter<Uri>()
  onDidChange = this.onDidChangeEmitter.event

  async provideTextDocumentContent (uri: Uri) {
    const query = parseQuery(uri.query)
    const filepath = query.filepath
    const action = query.action as ResultActions
    const target = query.target as SupportTargetLanguage

    if (!filepath || !action)
      return ''

    try {
      if (action === 'wenyanize')
        return await getWenyanizeResult(filepath)
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
