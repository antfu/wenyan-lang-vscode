import { window, workspace, TextDocumentChangeEvent, Range, Position, Selection, languages, CompletionItem, CompletionItemKind, TextDocument, CancellationToken, CompletionContext, Disposable } from 'vscode'
import { num2hanzi } from '@wenyan/core'
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

function provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext) {
  const line = document.lineAt(position)
  const lineText = line.text.substring(0, position.character)
  const letter = lineText.match(/-?[0-9,]*\.?[0-9,]+$/)
  if (letter === null) {
    const formorvari = document.getText().match(/[\u4E00-\u9FA5]*「[\u4E00-\u9FA5]{0,}」[\u4E00-\u9FA5]*$/)
    if (formorvari === null) return
    const vari = new Array(10)
    formorvari.forEach((element: string) => {
      vari.push(element.match(/「[\u4E00-\u9FA5]{0,}」$/))
    })
    if (vari === null) return
    return vari.map((dee) => {
      return new CompletionItem(dee, CompletionItemKind.Text)
    })
  }
  else {
    const de = [lineText]
    return de.map((dee) => {
      return new CompletionItem(dee, CompletionItemKind.Text)
    })
  }
}

function resolveCompletionItem(item: any, token: CancellationToken) {
  const letter = item.label.match(/-?[0-9,]*\.?[0-9,]+$/)
  const former = item.label.substring(0, item.label.length - letter[0].length)
  const i = Number(letter[0])
  const numm = num2hanzi(i)
  item = { label: former + numm, kind: 0 }
  return item
}

const m: ExtensionModule = (context: { subscriptions: Disposable[] }) => {
  context.subscriptions.push(languages.registerCompletionItemProvider('wenyan', {
    provideCompletionItems,
    resolveCompletionItem,
  }, '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '若', '書', '吾', '爻', '數', '批', '疏', '注', '恆', '乃', '凡', '為', '「', '」'))
  return workspace.onDidChangeTextDocument(e => onTextChanged(e))
}

export default m
