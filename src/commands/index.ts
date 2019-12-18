import { commands } from 'vscode'
import { ExtensionModule } from '../module'
import { execute } from './execute'
import { CommandKeys } from './keys'
import { compile } from './compile'

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(CommandKeys.execute, execute),
    commands.registerCommand(CommandKeys.compile, compile),
  ]
}

export default m
