export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white p-10">
      <h1 className="text-4xl font-bold mb-8">Dashboard IA Collector</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20">
          <h2 className="text-lg opacity-80">Cobranças do mês</h2>
          <p className="text-3xl font-bold mt-2">R$ 12.420</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20">
          <h2 className="text-lg opacity-80">Pagamentos confirmados</h2>
          <p className="text-3xl font-bold mt-2">87</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20">
          <h2 className="text-lg opacity-80">Clientes ativos</h2>
          <p className="text-3xl font-bold mt-2">142</p>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20 mb-10">
        <h2 className="text-2xl font-bold mb-4">Tabela de Cobranças</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white/20">
              <th className="p-3 text-left">Cliente</th>
              <th className="p-3 text-left">Valor</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/20">
              <td className="p-3">João da Silva</td>
              <td className="p-3">R$ 320</td>
              <td className="p-3 text-green-300">Pago</td>
            </tr>
            <tr className="border-b border-white/20">
              <td className="p-3">Empresa XPTO</td>
              <td className="p-3">R$ 2.100</td>
              <td className="p-3 text-yellow-300">Pendente</td>
            </tr>
            <tr>
              <td className="p-3">Agência Criativa</td>
              <td className="p-3">R$ 780</td>
              <td className="p-3 text-red-300">Atrasado</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Chat IA */}
      <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20">
        <h2 className="text-2xl font-bold mb-4">Chat com IA</h2>
        <textarea
          className="w-full p-3 rounded-lg text-black"
          placeholder="Digite sua pergunta..."
          rows={3}
        />
        <button className="mt-3 bg-blue-600 hover:bg-blue-800 transition p-3 rounded-lg w-full">
          Enviar pergunta
        </button>
      </div>
    </div>
  );
}
