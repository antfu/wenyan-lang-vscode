import { window, workspace, TextDocumentChangeEvent, Range, Position, Selection } from 'vscode'
import { ExtensionModule } from '../module'
import DynamicSnippets from '../../snippets/dynamic.json'
import { LANG_ID } from '../meta'

const BODY_PARAMETER_REGEX = /\$\d+/g

function moveSelection(selection: Selection, shift: number): Selection {
  const newPosition = selection.active.translate(0, shift)
  const newSelection = new Selection(newPosition, newPosition)
  return newSelection
}

function parseBody(body: string[]) {
  const rawBody = body.join('\n')
  const parsed = rawBody.replace(BODY_PARAMETER_REGEX, '')
  let shiftBack = 0

  const match = rawBody.match(BODY_PARAMETER_REGEX)
  if (match && match[0])
    shiftBack = parsed.length - rawBody.indexOf(match[0]) || 0 - match[0].length

  return { parsed, shiftBack }
}

function onTextChanged(e: TextDocumentChangeEvent) {
  const editor = window.activeTextEditor

  const document = editor?.document
  if (!editor || !document || document !== e.document)
    return

  if (document.languageId !== LANG_ID)
    return

  if (!e.contentChanges[0]?.text)
    return

  const selection = editor.selection
  const currentPosition = selection.start.translate(0, 1)

  const text = editor.document.getText(new Range(new Position(0, 0), currentPosition))

  for (const define of Object.values(DynamicSnippets)) {
    for (const prefix of define.prefix) {
      if (text.endsWith(prefix)) {
        const t = text.slice(-prefix.length - 1, -prefix.length)
        if (t.match(/[\d\w\.\_]/))
          continue // if the input is after an english letter or number, do not replace

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

const m: ExtensionModule = () => {
  return workspace.onDidChangeTextDocument(e => onTextChanged(e))
}

export default m
