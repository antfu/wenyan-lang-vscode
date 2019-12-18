import { window } from 'vscode'
import { Exec } from '../exec'

export async function execute () {
  const document = window.activeTextEditor?.document
  if (document?.languageId === 'wenyan') {
    try {
      console.log(await Exec(document.uri.fsPath, { exec: true }))
    }
    catch (e) {
      console.error(e)
    }
  }
}
