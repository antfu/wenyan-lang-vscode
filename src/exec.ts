import path from 'path'
import cp from 'child_process'
import { getCTX } from './ctx'

export interface ExecuteOptions {
  exec?: boolean
  lang?: 'js' | 'py'
  roman?: string
}

export function getWenyanPath () {
  const ctx = getCTX()
  // TODO: configurable
  return path.join(ctx.extensionPath, 'vendor', 'wenyan.js')
}

export function getOptionsString (options?: ExecuteOptions) {
  const parts = []
  if (!options)
    return ''

  if (options.exec) {
    parts.push('--exec')
    parts.push('true')
  }

  if (options.roman) {
    parts.push('--roman')
    parts.push(options.roman)
  }

  if (options.lang) {
    parts.push('--lang')
    parts.push(options.lang)
  }

  return parts.join(' ')
}

export function Exec (filename: string, options?: ExecuteOptions) {
  const cmd = `node "${getWenyanPath()}" "${filename}" ${getOptionsString(options)}`
  console.log(`Executing ${cmd}`)
  return new Promise<string>((resolve, reject) => {
    cp.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.log(`error: ${err}`)
        reject(err)
      }
      else {
        resolve(stdout)
      }
    })
  })
}
