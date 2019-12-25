import path from 'path'
import { commands, window, Uri, workspace, ViewColumn } from 'vscode'
import { openInDefaultViewer, getResultUrl } from '../utils'
import { Config } from '../config'
import { Exec } from '../exec'
import { CommandKeys, LANG_ID, DOC_SCHEMA } from '../meta'
import { ExtensionModule } from '../module'
import { documentProvider } from '../editor/documentProvider'
import i18n from '../i18n'

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(CommandKeys.execute, async () => {
      const document = window.activeTextEditor?.document
      if (document?.languageId !== LANG_ID)
        return
      const uri = getResultUrl(document.uri.fsPath, 'execute', Config.targetLanguage)
      documentProvider.onDidChangeEmitter.fire(uri)
      window.showTextDocument(await workspace.openTextDocument(uri), { preview: false, viewColumn: ViewColumn.Beside })
    }),

    commands.registerCommand(CommandKeys.compile, async () => {
      const document = window.activeTextEditor?.document
      if (document?.languageId !== LANG_ID)
        return
      const uri = getResultUrl(document.uri.fsPath, 'compile', Config.targetLanguage)
      documentProvider.onDidChangeEmitter.fire(uri)
      window.showTextDocument(await workspace.openTextDocument(uri), { preview: false, viewColumn: ViewColumn.Beside })
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

      const { name: defaultTitle } = path.parse(document.uri.fsPath)
      const title = await window.showInputBox({
        prompt: i18n.t('prompt.enter_the_title_for_rendering'),
        value: defaultTitle,
      })
      if (!title)
        return

      const defaultUri = Uri.file(path.join(path.dirname(document.uri.fsPath), `${title}.svg`))
      const uri = await window.showSaveDialog({
        defaultUri,
        filters: { SVG: ['svg'] },
      })
      if (!uri)
        return

      const output = await Exec(document.uri.fsPath, { render: true, title, output: uri.fsPath }) || ''
      const filenames = output.split('\n').map(i => i.trim()).filter(i => i)
      if (filenames.length) {
        const openInEditor = i18n.t('prompt.open_in_vscode')
        const openInImageViewer = i18n.t('prompt.open_in_viewer')
        const result = await window.showInformationMessage(i18n.t('prompt.successfully_rendered'), { modal: true }, openInEditor, openInImageViewer)
        if (result === openInEditor)
          window.showTextDocument(await workspace.openTextDocument(Uri.file(filenames[0])))
        if (result === openInImageViewer)
          openInDefaultViewer(filenames[0])
      }
    }),
  ]
}

export default m
