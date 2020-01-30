import { ExtensionContext } from 'vscode'
import dynamicSnippets from './editor/dynamicSnippets'
import documentProvider from './editor/documentProvider'
import fileSavingWatcher from './editor/fileSavingWatcher'
import statusBar, { statusBarProvider } from './editor/statusBar'
import commands from './commands'
import { setCTX } from './ctx'
import { Log } from './log'
import { GetExecutableVersion } from './exec'

export async function activate(ctx: ExtensionContext) {
  setCTX(ctx)

  const modules = [
    dynamicSnippets,
    documentProvider,
    fileSavingWatcher,
    statusBar,
    commands,
  ]

  const disposables = modules.flatMap(m => m(ctx))
  disposables.forEach(d => ctx.subscriptions.push(d))

  Log.info(`Activated with compiler ${await GetExecutableVersion()}`)

  statusBarProvider.update()
}

export function deactivate() {
}
