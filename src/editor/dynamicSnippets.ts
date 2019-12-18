import { window, Disposable, workspace, TextDocumentChangeEvent, Range, Position, Selection } from 'vscode'
import { ExtensionModule } from '../module'
import DynamicSnippets from '../../snippets/dynamic.json'

const BODY_PARAMETER_REGEX = /\$\d+/g

function moveSelection (selection: Selection, shift: number): Selection {
  const newPosition = selection.active.translate(0, shift)
  const newSelection = new Selection(newPosition, newPosition)
  return newSelection
}

function parseBody (body: string[]) {
  const rawBody = body.join('\n')
  const parsed = rawBody.replace(BODY_PARAMETER_REGEX, '')
  let shiftBack = 0

  const match = rawBody.match(BODY_PARAMETER_REGEX)
  if (match && match[0])
    shiftBack = parsed.length - rawBody.indexOf(match[0]) || 0 - match[0].length

  return { parsed, shiftBack }
}

const dynamicSnippets: ExtensionModule = (ctx) => {
  function update (e: TextDocumentChangeEvent) {
    const editor = window.activeTextEditor

    const document = editor?.document
    if (!editor || !document || document !== e.document)
      return

    if (document.languageId !== 'wenyan')
      return

    if (!e.contentChanges[0])
      return

    const selection = editor.selection
    const currentPosition = selection.start.translate(0, 1)

    const text = editor.document.getText(new Range(new Position(0, 0), currentPosition))

    for (const define of Object.values(DynamicSnippets)) {
      for (const prefix of define.prefix) {
        if (text.endsWith(prefix)) {
          const range = new Range(currentPosition.translate(0, -prefix.length), currentPosition)
          const { parsed, shiftBack } = parseBody(define.body)

          editor.edit((editBuilder) => {
            editBuilder.replace(range, parsed)
          }).then(() => {
            editor.selection = moveSelection(editor.selection, -shiftBack)
          })
          return
        }
      }
    }
  }

  const disposables: Disposable[] = []
  disposables.push(workspace.onDidChangeTextDocument(e => update(e)))

  return disposables
}

export default dynamicSnippets
