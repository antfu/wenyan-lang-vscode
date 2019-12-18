import { window } from 'vscode'
import { Exec } from '../exec'
import { showOutputAsDocument } from './output'

export async function compile () {
  const document = window.activeTextEditor?.document
  if (document?.languageId === 'wenyan') {
    try {
      const result = await Exec(document.uri.fsPath) || ''

      showOutputAsDocument(result, undefined, 'javascript')
    }
    catch (e) {
      console.error(e)
    }
  }
}
