import { window } from 'vscode'
import prettier from 'prettier'
import { Exec } from '../exec'
import { showOutputAsDocument } from './output'

export async function compile () {
  const document = window.activeTextEditor?.document
  if (document?.languageId === 'wenyan') {
    try {
      let result = await Exec(document.uri.fsPath) || ''
      result = prettier.format(result, { semi: false })
      showOutputAsDocument(result, undefined, 'javascript')
    }
    catch (e) {
      console.error(e)
    }
  }
}
