import { window, StatusBarAlignment, StatusBarItem, Disposable } from 'vscode'
import { LANG_ID } from '../meta'
import { ExtensionModule } from '../module'
import { GetExecutableVersion } from '../exec'

class StatusBarProvider implements Disposable {
  version: StatusBarItem
  runningState: StatusBarItem

  private _disposbales: Disposable[] = []

  constructor () {
    this.version = window.createStatusBarItem(StatusBarAlignment.Right)
    this.runningState = window.createStatusBarItem(StatusBarAlignment.Right)
    this.setUpWatchers()
  }

  setUpWatchers () {
    this._disposbales.push(window.onDidChangeActiveTextEditor(() => this.updateVersionVisibility()))
  }

  update () {
    this.updateVersion()
  }

  updateVersionVisibility () {
    if (window.activeTextEditor?.document?.languageId === LANG_ID)
      this.version.show()
    else
      this.version.hide()
  }

  async updateVersion () {
    this.version.text = `文言 ${await GetExecutableVersion()}`
  }

  dispose () {
    Disposable.from(...this._disposbales).dispose()
  }
}

export const statusBarProvider = new StatusBarProvider()

const m: ExtensionModule = () => {
  return [statusBarProvider]
}

export default m
