import path from 'path'
import { workspace } from 'vscode'
import { EXT_NAMESPACE } from './meta'
import { getCTX } from './ctx'

export type SupportTargetLanguage = 'py' | 'js'

export class Config {
  static get executablePath () {
    return this.getConfig<string>('executablePath') || path.join(getCTX().extensionPath, 'vendor', 'wenyan.js')
  }

  static get targetLanguage (): SupportTargetLanguage {
    if (this.getConfig<string>('targetLanguage') === 'python')
      return 'py'
    else
      return 'js'
  }

  static get runOnSave () {
    return this.getConfig<boolean>('runOnSave') || false
  }

  private static getConfig<T = any> (key: string): T | undefined {
    const config = workspace
      .getConfiguration(EXT_NAMESPACE)
      .get<T>(key)

    return config
  }

  // @ts-ignore
  private static async setConfig (key: string, value: any, isGlobal = false) {
    return await workspace
      .getConfiguration(EXT_NAMESPACE)
      .update(key, value, isGlobal)
  }
}
