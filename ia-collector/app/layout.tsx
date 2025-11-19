import "./globals.css";

export const metadata = {
  title: "IA Collector",
  description: "Colete e organize prompts, modelos e ferramentas de IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>
        <header style={{ padding: "20px", background: "#0a0a0a", color: "#fff" }}>
          <h1>IA Collector</h1>
        </header>

        <main style={{ padding: "40px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
