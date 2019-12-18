import path from 'path'
import { commands, window, Uri, workspace, ViewColumn } from 'vscode'
import { Exec } from '../exec'
import { CommandKeys, LANG_ID, DOC_SCHEMA } from '../meta'
import { ExtensionModule } from '../module'
import { documentProvider } from '../editor/documentProvider'

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(CommandKeys.execute, async () => {
      const document = window.activeTextEditor?.document
      if (document?.languageId === LANG_ID) {
        const { name } = path.parse(document.uri.fsPath)
        const filename = `${name}(Output)`
        const uri = Uri.parse(`${DOC_SCHEMA}:${filename}?action=execute&filepath=${encodeURIComponent(document.uri.fsPath)}`)
        documentProvider.onDidChangeEmitter.fire(uri)
        window.showTextDocument(await workspace.openTextDocument(uri), { preview: false, viewColumn: ViewColumn.Beside })
      }
    }),
    commands.registerCommand(CommandKeys.compile, async () => {
      const document = window.activeTextEditor?.document
      if (document?.languageId === LANG_ID) {
        const { name } = path.parse(document.uri.fsPath)
        const filename = `${name}(Compiled).js`
        const uri = Uri.parse(`${DOC_SCHEMA}:${filename}?action=compile&filepath=${encodeURIComponent(document.uri.fsPath)}`)
        documentProvider.onDidChangeEmitter.fire(uri)
        window.showTextDocument(await workspace.openTextDocument(uri), { preview: false, viewColumn: ViewColumn.Beside })
      }
    }),
    commands.registerCommand(CommandKeys.reload, async () => {
      const document = window.activeTextEditor?.document
      if (document?.uri.scheme === DOC_SCHEMA)
        documentProvider.onDidChangeEmitter.fire(document.uri)
    }),
    commands.registerCommand(CommandKeys.render, async () => {
      const document = window.activeTextEditor?.document
      if (document?.languageId !== LANG_ID)
        return
      const defaultUri = Uri.file(document.uri.fsPath.replace(/\.wy$/, '.svg'))
      const uri = await window.showSaveDialog({ defaultUri }) // TODO: filter
      if (!uri)
        return
      await Exec(document.uri.fsPath, { render: '佚名', output: uri.fsPath }) // TODO: enter title
    }),
  ]
}

export default m
