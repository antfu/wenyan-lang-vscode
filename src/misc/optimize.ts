const prefix = '_ans'
const regexDefine = new RegExp(`var (${prefix}[\\d]+)=(.*?);`, 'gm')
const regexUse = new RegExp(`(${prefix}[\\d]+?)[^=\\d]`, 'g')

function findAll (reg: RegExp, str: string) {
  const result = []
  let match
  while (match = reg.exec(str)) {
    const index = match.index
    const value = match[1]
    const context = match[2]
    const end = index + match[0].length
    result.push({ index, value, context, end })
  }
  return result
}

export function optimize (src: string) {
  const resultDefine = findAll(regexDefine, src)
  const resultUse = findAll(regexUse, src)

  const result = [
    ...resultDefine,
    ...resultUse,
  ].sort((a, b) => a.index - b.index)

  // count for temp vars
  const counter: Record<string, number> = {}
  for (const r of result) {
    if (!counter[r.value])
      counter[r.value] = 0
    counter[r.value]++
  }

  const changes = []

  for (let i = 0; i < result.length - 1;) {
    if (result[i].value === result[i + 1].value) {
      if (counter[result[i].value] === 2) {
        // only works for var that appears exact twice
        changes.push({ define: result[i], use: result[i + 1] })
      }

      i++
    }
    i++
  }

  // apply changes bottom up, preventing index messing up
  changes.reverse()

  let out = src
  for (const { define, use } of changes) {
    // apply the value for usage
    out = out.slice(0, use.index) + define.context + out.slice(use.index + use.value.length)
    // remove the define of temp var
    out = out.slice(0, define.index) + out.slice(define.end)
  }

  return out
    .replace(/\*\//g, '*/\n')
    .replace(/\/\*/g, '\n/*')
}
