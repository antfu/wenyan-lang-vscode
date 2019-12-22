import cp from 'child_process'
import { Log } from './log'
import { Config, SupportTargetLanguage } from './config'

export interface ExecuteOptions {
  exec?: boolean
  lang?: SupportTargetLanguage
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
      if (typeof options[key] === 'string')
        parts.push(`"${options[key]}"`)
      else
        parts.push(options[key])
    }
  }

  return parts.join(' ')
}

export async function Run (cmd: string) {
  Log.info(`💻 ${cmd}`)
  return new Promise<string>((resolve, reject) => {
    cp.exec(cmd, (err, stdout, stderr) => {
      if (err || stderr) {
        Log.error(`error: ${err} ${stderr}`)
        reject(err || stderr)
      }
      else {
        resolve(stdout)
      }
    })
  })
}

export function Exec (filename: string, options?: ExecuteOptions) {
  return Run(`node "${Config.executablePath}" "${filename}" ${getOptionsString(options)}`)
}

export async function GetExecutableVersion () {
  try {
    return `v${await Run(`node "${Config.executablePath}" -v`)}`
  }
  catch (e) {
    Log.error('Failed to get compiler version')
    return 'Unknown'
  }
}
