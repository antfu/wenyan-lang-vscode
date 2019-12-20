import { workspace } from 'vscode'
import { getResultUrl } from '../utils'
import { ExtensionModule } from '../module'
import { Config } from '../config'
import { LANG_ID } from '../meta'
import { documentProvider } from './documentProvider'

const m: ExtensionModule = () => {
  return workspace.onDidSaveTextDocument((doc) => {
    if (!Config.runOnSave)
      return
    if (doc.languageId !== LANG_ID)
      return

    console.log(doc.uri.fsPath)
    documentProvider.onDidChangeEmitter.fire(getResultUrl(doc.uri.fsPath, 'execute'))
    documentProvider.onDidChangeEmitter.fire(getResultUrl(doc.uri.fsPath, 'compile'))
  })
}

export default m
