import cp from 'child_process'
import { Log } from './log'
import { Config } from './config'

export interface ExecuteOptions {
  exec?: boolean
  lang?: 'js' | 'py'
  roman?: string
  render?: string
  output?: string
}

export function getOptionsString (options?: ExecuteOptions) {
  const parts = []
  if (!options)
    return ''

  for (const key of Object.keys(options) as (keyof ExecuteOptions)[]) {
    if (options[key]) {
      parts.push(`--${key}`)
      parts.push(options[key])
    }
  }

  return parts.join(' ')
}

export function Exec (filename: string, options?: ExecuteOptions) {
  const cmd = `node "${Config.executablePath}" "${filename}" ${getOptionsString(options)}`
  Log.info(`💻 ${cmd}`)
  return new Promise<string>((resolve, reject) => {
    cp.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        Log.error(`error: ${err}`)
        reject(err)
      }
      else {
        resolve(stdout)
      }
    })
  })
}
