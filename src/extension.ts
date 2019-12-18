import { ExtensionContext } from 'vscode'
import dynamicSnippets from './editor/dynamicSnippets'

export function activate (ctx: ExtensionContext) {
  const modules = [
    dynamicSnippets,
  ]

  const disposables = modules.flatMap(m => m(ctx))
  disposables.forEach(d => ctx.subscriptions.push(d))
}

export function deactivate () {
}
