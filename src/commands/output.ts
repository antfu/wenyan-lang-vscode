import { window, workspace, ViewColumn } from 'vscode'

export async function showOutputAsDocument (content: string, id?: string, language?: string) {
  // TODO: cache document and update
  const document = await workspace.openTextDocument({
    content,
    language,
  })
  await window.showTextDocument(document, { preview: false, viewColumn: ViewColumn.Beside })
}
