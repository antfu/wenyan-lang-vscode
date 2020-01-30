import cp from 'child_process'
import path from 'path'
import { Log } from './log'
import { Config, SupportTargetLanguage } from './config'

export interface ExecuteOptions {
  compile?: boolean
  lang?: SupportTargetLanguage
  roman?: string
  render?: boolean
  title?: string
  output?: string
}

export function getOptionsString(options?: ExecuteOptions) {
  const parts = []
  if (!options)
    return ''

  for (const key of Object.keys(options) as (keyof ExecuteOptions)[]) {
    if (options[key]) {
      parts.push(`--${key}`)
      if (typeof options[key] === 'string')
        parts.push(`"${options[key]}"`)
    }
  }

  return parts.join(' ')
}

export async function Run(cmd: string, cwd?: string) {
  Log.info(`💻 ${cmd}`)
  return new Promise<string>((resolve, reject) => {
    cp.exec(cmd, { cwd }, (err, stdout, stderr) => {
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

export function Exec(filepath: string | undefined, content: string, options?: ExecuteOptions) {
  return Run(`node "${Config.executablePath}" ${getOptionsString(options)} -e "${content.replace(/\n/g, '')}"`, filepath ? path.dirname(filepath) : undefined)
}

export async function GetExecutableVersion() {
  try {
    return `v${await Run(`node "${Config.executablePath}" -v`)}`
  }
  catch (e) {
    Log.error('Failed to get compiler version')
    return 'Unknown'
  }
}
