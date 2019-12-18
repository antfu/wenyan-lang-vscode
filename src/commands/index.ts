import { commands } from 'vscode'
import { ExtensionModule } from '../module'
import { execute } from './execute'
import { CommandKeys } from './keys'

const m: ExtensionModule = () => {
  return [
    commands.registerCommand(CommandKeys.execute, execute),
  ]
}

export default m
