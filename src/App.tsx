import { useState, useEffect } from "react";
import { 
  Book, Plus, Settings, ChevronRight, CheckCircle2, Circle, AlertCircle, 
  Calendar, User, Tag, FileText, ArrowLeft, Loader2, Database, Trash2
} from "lucide-react";

export default function App() {
  const [health, setHealth] = useState<{status: string, message?: string} | null>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'details' | 'config-error'>('list');
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [user, setUser] = useState<{id: number, username: string} | null>(null);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
      if (data.status === 'ok') {
        fetchBooks();
      } else {
        setView('config-error');
        setLoading(false);
      }
    } catch (e) {
      setHealth({ status: 'error', message: 'Failed to connect to server' });
      setView('config-error');
      setLoading(false);
    }
  };

  const initDb = async () => {
    setLoading(true);
    try {
      await fetch('/api/init-db', { method: 'POST' });
      await checkHealth();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/books');
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (view === 'config-error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-xl w-full bg-white p-8 rounded-xl shadow-sm border border-red-100/50 text-center">
          <Database className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro de Conexão com o Banco de Dados</h2>
          <div className="text-left text-sm text-gray-600 mb-6 space-y-3 bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold text-gray-900">Se você está usando HostGator, verifique os passos abaixo:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong>Não use "localhost":</strong> Como o app roda na nuvem, use o IP do seu servidor HostGator ou o endereço (ex: <code className="bg-gray-200 px-1 rounded">brXXXX.hostgator.com.br</code>).</li>
              <li><strong>Libere Acesso Remoto:</strong> No cPanel, procure por <strong>"MySQL Remoto"</strong> (Remote MySQL) e adicione <code className="bg-gray-200 px-1 rounded">%</code> ou o IP <code className="bg-gray-200 px-1 rounded">34.34.229.61</code>.</li>
              <li><strong>Usuário e Senha (Access Denied):</strong> Se você ver o erro "Access denied", verifique se a senha está 100% correta. Além disso, no cPanel, em bancos de dados MySQL, certifique-se de que adicionou o usuário ao banco de dados dando "Todos os privilégios".</li>
              <li><strong>Preencha as Variáveis:</strong> Vá no menu de Settings/Secrets e atualize <code className="bg-gray-200 px-1 rounded">DB_HOST</code>, <code className="bg-gray-200 px-1 rounded">DB_USER</code>, <code className="bg-gray-200 px-1 rounded">DB_PASSWORD</code>, e <code className="bg-gray-200 px-1 rounded">DB_NAME</code>.</li>
            </ol>
          </div>
          {health?.message && (
            <div className="text-left text-sm font-mono bg-red-50 text-red-700 p-3 rounded mb-6 break-words border border-red-100">
              <strong>Detalhes do erro:</strong> {health.message}
            </div>
          )}
          <button 
            onClick={initDb}
            className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex justify-center gap-2 items-center"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Testar Conexão / Inicializar
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
       <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('list')}>
            <img src="/logo_CAB.png" alt="Logo Editora CAB" className="h-10 w-auto" />
            <h1 className="text-xl font-semibold text-gray-900">Editora CAB</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
              <CheckCircle2 className="w-4 h-4" /> Conectado ao MySQL
            </span>
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <User className="w-4 h-4" /> {user.username}
              </span>
              <button onClick={() => setUser(null)} className="text-xs text-red-600 hover:text-red-700 font-medium">Sair</button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {view === 'list' ? (
          <BookList 
            books={books} 
            onSelectBook={(id) => { setSelectedBookId(id); setView('details'); }}
            onRefresh={fetchBooks}
          />
        ) : (
          <BookDetails 
            bookId={selectedBookId!} 
            onBack={() => setView('list')} 
          />
        )}
      </main>
    </div>
  );
}

function BookList({ books, onSelectBook, onRefresh }: { books: any[], onSelectBook: (id: number) => void, onRefresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Coleção de Livros</h2>
          <p className="text-gray-500 mt-1">Gerencie o fluxo de trabalho editorial da sua coleção.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" /> Novo Livro
        </button>
      </div>

      {showAdd && <AddBookForm onAdded={() => { setShowAdd(false); onRefresh(); }} onCancel={() => setShowAdd(false)} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.length === 0 && !showAdd ? (
          <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
            Nenhum livro catalogado ainda. Clique em "Novo Livro" para começar.
          </div>
        ) : (
          books.map(book => (
            <div 
              key={book.id} 
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer group"
              onClick={() => onSelectBook(book.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-100">
                  {book.genre || 'Sem Gênero'}
                </div>
                <span className="text-xs text-gray-400 font-mono">#{book.id}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition">{book.title}</h3>
              <p className="text-gray-600 text-sm mb-4">Por {book.author}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-50 mt-auto">
                <div className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 rounded">
                   Ano: {book.publication_year || '-'}
                </div>
                <div className="flex items-center text-blue-600 font-medium">
                  Acessar <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AddBookForm({ onAdded, onCancel }: { onAdded: () => void, onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      author: formData.get('author'),
      genre: formData.get('genre'),
      publication_year: parseInt(formData.get('publication_year') as string) || null,
      condition_status: formData.get('condition_status'),
      tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map(t => t.trim()) : [],
      notes: formData.get('notes')
    };

    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) onAdded();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Adicionar Novo Livro</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input required name="title" type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Ex: Livro 06 - Ensino Fundamental" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
            <input required name="author" type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Ex: Josi Neide Gomes Barros" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gênero/Coleção</label>
            <input name="genre" type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" defaultValue="Educação Financeira" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
              <input name="publication_year" type="number" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="2026" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="condition_status" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option value="Em Planejamento">Em Planejamento</option>
                <option value="Em Produção">Em Produção</option>
                <option value="Publicado">Publicado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
            <input name="tags" type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Ex: fundamental, professor" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea name="notes" rows={3} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Observações adicionais..."></textarea>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancelar</button>
          <button disabled={loading} type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Salvar Livro
          </button>
        </div>
      </form>
    </div>
  );
}

function BookDetails({ bookId, onBack }: { bookId: number, onBack: () => void }) {
  const [book, setBook] = useState<any>(null);
  const [localStages, setLocalStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [bookId]);

  const fetchDetails = async () => {
    try {
      const res = await fetch(`/api/books/${bookId}`);
      if (res.ok) {
        const data = await res.json();
        setBook(data);
        setLocalStages(JSON.parse(JSON.stringify(data.stages || [])));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleStageChange = (stageId: number, field: string, value: any) => {
    setLocalStages(prev => prev.map(s => s.id === stageId ? { ...s, [field]: value } : s));
  };

  const saveModifications = async () => {
    setSaving(true);
    try {
      const promises = localStages.map(async (localStage) => {
        const originalStage = book.stages.find((s: any) => s.id === localStage.id);
        if (JSON.stringify(localStage) !== JSON.stringify(originalStage)) {
          await fetch(`/api/stages/${localStage.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localStage)
          });
        }
      });
      await Promise.all(promises);
      await fetchDetails();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const deleteBook = async () => {
    if (confirm('Tem certeza que deseja excluir esse livro e todo o fluxo de trabalho associado?')) {
      try {
        await fetch(`/api/books/${book.id}`, { method: 'DELETE' });
        onBack();
      } catch (e) {
        console.error(e);
        alert('Erro ao excluir livro.');
      }
    }
  };

  if (loading || !book) return (
    <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Coleção
        </button>
        
        <button 
          onClick={deleteBook}
          className="flex items-center text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
        >
          <Trash2 className="w-4 h-4 mr-1" /> Excluir Livro
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-900 px-6 py-8 text-white relative">
          <div className="absolute top-4 right-4 bg-gray-800 text-xs px-2 py-1 rounded font-mono text-gray-300">ID: {book.id}</div>
          <h2 className="text-3xl font-bold mb-2">{book.title}</h2>
          <p className="text-gray-400 text-lg flex items-center gap-2">
            <User className="w-5 h-5" /> {book.author}
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100 border-b border-gray-100">
          <div className="p-4 flex flex-col justify-center">
            <span className="text-xs text-gray-500 uppercase font-semibold mb-1">Gênero</span>
            <span className="font-medium text-gray-900">{book.genre || '-'}</span>
          </div>
          <div className="p-4 flex flex-col justify-center">
            <span className="text-xs text-gray-500 uppercase font-semibold mb-1">Ano de Publicação</span>
            <span className="font-medium text-gray-900">{book.publication_year || '-'}</span>
          </div>
          <div className="p-4 flex flex-col justify-center">
            <span className="text-xs text-gray-500 uppercase font-semibold mb-1">Condição/Status</span>
            <span className="font-medium text-gray-900">{book.condition_status || '-'}</span>
          </div>
          <div className="p-4 flex flex-col justify-center">
            <span className="text-xs text-gray-500 uppercase font-semibold mb-1">Tags</span>
            <span className="font-medium text-gray-900">
              {(() => {
                let tagsArray = [];
                if (Array.isArray(book.tags)) {
                  tagsArray = book.tags;
                } else if (typeof book.tags === 'string') {
                  try { tagsArray = JSON.parse(book.tags); } catch (_) { tagsArray = []; }
                }
                
                return tagsArray.length > 0 ? (
                 <div className="flex flex-wrap gap-1 mt-1">
                   {tagsArray.map((tag: string, i: number) => (
                     <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">{tag}</span>
                   ))}
                 </div>
                ) : '-';
              })()}
            </span>
          </div>
        </div>
        {book.notes && (
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <span className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Notas</span>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{book.notes}</p>
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4 mt-8">
          <h3 className="text-xl font-bold text-gray-900">Fluxo de Trabalho (Etapas)</h3>
          {JSON.stringify(localStages) !== JSON.stringify(book.stages) && (
            <button 
              onClick={saveModifications}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
               Salvar Modificações
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {localStages.map((stage: any) => (
            <div key={stage.id} className="bg-white border text-sm border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center font-medium">
                <span className="text-gray-800">{stage.stage_name}</span>
                <select 
                  className={
                    `text-xs font-semibold px-2 py-1 rounded-full border border-transparent appearance-none outline-none cursor-pointer ${
                      stage.status === 'Concluído' ? 'bg-green-100 text-green-700' : 
                      stage.status === 'Em Andamento' ? 'bg-blue-100 text-blue-700' : 
                      'bg-gray-100 text-gray-600'
                    }`
                  }
                  value={stage.status}
                  onChange={(e) => handleStageChange(stage.id, 'status', e.target.value)}
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluído">Concluído</option>
                </select>
              </div>
              <div className="p-4 space-y-3 flex-1 flex flex-col">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Responsável..." 
                    className="flex-1 border-b border-transparent hover:border-gray-200 focus:border-blue-500 outline-none px-1 py-0.5 transition text-gray-700"
                    value={stage.responsible || ''}
                    onChange={(e) => handleStageChange(stage.id, 'responsible', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>
                    <span className="block mb-1">Início</span>
                    <input 
                      type="date" 
                      className="w-full border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-500"
                      value={stage.start_date ? stage.start_date.split('T')[0] : ''}
                      onChange={(e) => handleStageChange(stage.id, 'start_date', e.target.value || null)}
                    />
                  </div>
                  <div>
                    <span className="block mb-1">Término</span>
                    <input 
                      type="date" 
                      className="w-full border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-500"
                      value={stage.end_date ? stage.end_date.split('T')[0] : ''}
                      onChange={(e) => handleStageChange(stage.id, 'end_date', e.target.value || null)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onLogin }: { onLogin: (user: {id: number, username: string}) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [needsInit, setNeedsInit] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNeedsInit(false);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.user);
      } else {
        setError(data.error || 'Erro ao fazer login');
        if (data.needsInit) {
          setNeedsInit(true);
        }
      }
    } catch (e) {
      setError('Erro de conexão ao servidor.');
    }
    setLoading(false);
  };

  const handleInitDb = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/init-db', { method: 'POST' });
      if (res.ok) {
        setError('');
        setNeedsInit(false);
        alert('Tabelas inicializadas com sucesso! Tente fazer login novamente.');
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Erro ao inicializar tabelas.');
      }
    } catch (e) {
      setError('Erro de conexão ao inicializar tabelas.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src="/logo_CAB.png" alt="Logo Editora CAB" className="h-16 w-auto" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Editora CAB</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Acesse o sistema de gerenciamento de fluxo</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">{error}</span>
              </div>
              {needsInit && (
                <button 
                  onClick={handleInitDb}
                  disabled={loading}
                  className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm mt-1 self-start hover:bg-red-700 transition flex items-center gap-1 font-medium"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                  Inicializar Tabelas do Banco de Dados
                </button>
              )}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuário</label>
              <div className="mt-1">
                <input required type="text" value={username} onChange={e => setUsername(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <div className="mt-1">
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <button disabled={loading} type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center text-xs text-gray-500">
            * O usuário padrão é <strong>admin</strong> e a senha é <strong>admin123</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

