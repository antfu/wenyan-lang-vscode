import { window, Disposable, workspace, TextDocumentChangeEvent, Range, Position, Selection } from 'vscode'
import { ExtensionModule } from '../module'

function moveSelection (selection: Selection, shift: number): Selection {
  const newPosition = selection.active.translate(0, shift)
  const newSelection = new Selection(newPosition, newPosition)
  return newSelection
}

const dynamicSnippets: ExtensionModule = (ctx) => {
  function update (e: TextDocumentChangeEvent) {
    const editor = window.activeTextEditor

    const document = editor?.document
    if (!editor || !document || document !== e.document)
      return

    if (!e.contentChanges[0])
      return

    const selection = editor.selection
    const originalPosition = selection.start
    const currentPosition = selection.start.translate(0, 1)

    const text = editor.document.getText(new Range(new Position(0, 0), currentPosition))

    // TODO: extract the hard-coded to tmSnippets.json
    if (text.endsWith('"')) {
      editor.edit((editBuilder) => {
        editBuilder.replace(new Range(originalPosition, currentPosition), '「「」」')
      }).then(() => {
        editor.selection = moveSelection(editor.selection, -2)
      })
    }
    else if (text.endsWith('\'')) {
      editor.edit((editBuilder) => {
        editBuilder.replace(new Range(originalPosition, currentPosition), '「」')
      }).then(() => {
        editor.selection = moveSelection(editor.selection, -1)
      })
    }
    else if (text.endsWith('.')) {
      editor.edit((editBuilder) => {
        editBuilder.replace(new Range(originalPosition, currentPosition), '。')
      })
    }
    else if (text.endsWith('//')) {
      editor.edit((editBuilder) => {
        editBuilder.replace(new Range(originalPosition.translate(0, -1), currentPosition), '批曰。「「」」')
      }).then(() => {
        editor.selection = moveSelection(editor.selection, -2)
      })
    }
  }

  const disposables: Disposable[] = []
  disposables.push(workspace.onDidChangeTextDocument(e => update(e)))

  return disposables
}

export default dynamicSnippets
