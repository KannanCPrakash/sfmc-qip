export function SQLEditor({ sql }: { sql: string}) {
  return (
    <pre className="h-full p-4 text-xs font-mono bg-black text-green-400 overflow-auto">
      {sql}
    </pre>
  );
}