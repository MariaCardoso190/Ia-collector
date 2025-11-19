export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <aside className="w-64 min-h-screen bg-zinc-800 p-6 space-y-4 border-r border-zinc-700">
        <nav className="flex flex-col space-y-3">
          <a href="/dashboard" className="hover:text-purple-300">Início</a>
          <a href="/dashboard/cobrancas" className="hover:text-purple-300">Cobranças</a>
          <a href="/dashboard/relatorios" className="hover:text-purple-300">Relatórios</a>
          <a href="/dashboard/config" className="hover:text-purple-300">Configurações</a>
        </nav>
      </aside>

      <section className="flex-1 p-10">
        {children}
      </section>
    </div>
  );
}
