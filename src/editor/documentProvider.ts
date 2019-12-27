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

async function readFile (uri: Uri) {
  const document = await workspace.openTextDocument(uri)
  return document.getText()
}

async function getCompiledResult (uri: Uri, target: SupportTargetLanguage) {
  const content = await readFile(uri)
  const result = await Exec(uri.fsPath, content, {
    lang: target,
    compile: true,
    roman: Config.romanizeMethod,
  }) || ''

  if (target === 'py') { return result }
  else {
    return prettier
      .format(
        optimize(result),
        {
          semi: false,
          parser: 'babel',
          plugins: [parserBabel],
        },
      )
  }
}

async function getExecResult (uri: Uri, target: SupportTargetLanguage) {
  const content = await readFile(uri)
  return await Exec(uri.fsPath, content, {
    lang: target,
    roman: Config.romanizeMethod,
  }) || ''
}

async function getWenyanizeResult (uri: Uri) {
  const content = await readFile(uri)
  return js2wy(content)
}

class DocumentProvider implements TextDocumentContentProvider {
  onDidChangeEmitter = new EventEmitter<Uri>()
  onDidChange = this.onDidChangeEmitter.event

  async provideTextDocumentContent (uri: Uri) {
    const query = parseQuery(uri.query)
    const path = query.path
    const action = query.action as ResultActions
    const target = query.target as SupportTargetLanguage

    if (!path || !action)
      return ''

    const fileUri = Uri.parse(path)

    try {
      if (action === 'wenyanize')
        return await getWenyanizeResult(fileUri)
      if (action === 'execute')
        return await getExecResult(fileUri, target)
      if (action === 'compile')
        return await getCompiledResult(fileUri, target)
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
