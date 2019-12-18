import { ExtensionContext } from 'vscode'

let _ctx: ExtensionContext

export function setCTX (ctx: ExtensionContext) {
  _ctx = ctx
}

export function getCTX () {
  return _ctx
}
