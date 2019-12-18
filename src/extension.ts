import { ExtensionContext } from 'vscode'
import dynamicSnippets from './editor/dynamicSnippets'
import documentProvider from './editor/documentProvider'
import commands from './commands'
import { setCTX } from './ctx'

export function activate (ctx: ExtensionContext) {
  setCTX(ctx)

  const modules = [
    dynamicSnippets,
    documentProvider,
    commands,
  ]

  const disposables = modules.flatMap(m => m(ctx))
  disposables.forEach(d => ctx.subscriptions.push(d))
}

export function deactivate () {
}
