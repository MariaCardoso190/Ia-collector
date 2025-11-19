import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className="bg-zinc-900 text-white">
        <header className="p-4 border-b border-zinc-700">
          <h1 className="text-2xl font-bold">IA Collector</h1>
        </header>

        <main className="p-8">{children}</main>
      </body>
    </html>
  );
}
