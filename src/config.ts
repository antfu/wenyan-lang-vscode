import path from 'path'
import { workspace } from 'vscode'
import { EXT_NAMESPACE } from './meta'
import { getCTX } from './ctx'

export class Config {
  static get executablePath () {
    return this.getConfig<string>('executablePath') || path.join(getCTX().extensionPath, 'vendor', 'wenyan.js')
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
