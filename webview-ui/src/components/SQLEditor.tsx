// SQLEditorWithSquiggles.tsx  
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';

export function SQLEditor({ sqlQuery }: { sqlQuery: string; }) {
  return (
    <div className="h-full flex flex-col">
      <CodeMirror
        value={sqlQuery || '-- No SQL found'}
        height="100%"           // This is the magic line
        width="100%"
        theme={oneDark}
        extensions={[sql()]}
        editable={false}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          rectangularSelection: false,
          highlightActiveLine: false,
        }}
        style={{ fontSize: 13 }}
        // Critical Tailwind fixes — forces proper internal layout
        className="flex-1 [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto [&_.cm-content]:whitespace-pre-wrap [&_.cm-content]:wrap-break-word [&_.cm-content]:min-h-full [&_.cm-line]:py-0.5"
      />
    </div>
  );
}  