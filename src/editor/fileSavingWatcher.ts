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
    if (doc.languageId === LANG_ID) {
      documentProvider.onDidChangeEmitter.fire(getResultUrl(doc, 'execute'))
      documentProvider.onDidChangeEmitter.fire(getResultUrl(doc, 'compile'))
    }
    else if (doc.languageId === 'javascript') {
      documentProvider.onDidChangeEmitter.fire(getResultUrl(doc, 'wenyanize'))
    }
  })
}

export default m
