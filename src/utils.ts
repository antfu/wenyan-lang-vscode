export function parseQuery (queryString: string) {
  const query: Record<string, string> = {}
  const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&')
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=')
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '')
  }
  return query
}
