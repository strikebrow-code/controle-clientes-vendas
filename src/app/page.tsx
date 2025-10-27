"use client"

import { useState } from 'react'
import { Plus, MapPin, Calendar, ShoppingBag, User, Phone, Mail, Search, Filter, Home, Package, Route, BarChart3, Menu, X, Navigation, Trash2, Edit, Building2, FileText, CreditCard, Lock, Eye, EyeOff, UserCheck, UserX, Shield, UserPlus, TrendingUp, DollarSign, Target, Users, Clock, Key, Truck, CheckCircle, AlertCircle } from 'lucide-react'

interface Cliente {
  id: number
  nomeEmpresa: string
  responsavelCompra: string
  tipoDocumento: 'CNPJ' | 'CPF'
  documento: string
  email: string
  telefone: string
  endereco: string
  cidade: string
  estado: string
  latitude?: number
  longitude?: number
  diasVisita: string[]
  vendedorResponsavel: string
  observacoes: string
  ultimaCompra: string
  valorUltimaCompra: number
  totalCompras: number
  criadoPor: string // Admin que criou o cliente
}

interface Produto {
  id: number
  nome: string
  preco: number
  categoria: string
  estoque: number
  descricao: string
}

interface Venda {
  id: number
  clienteId: number
  produtoId: number
  data: string
  quantidade: number
  precoUnitario: number
  valorTotal: number
  formaPagamento: string
  observacoes: string
  status: 'Concluída' | 'Pendente' | 'Cancelada'
  vendedorResponsavel: string
  numeroNota?: string // Campo opcional para número da nota
  statusPagamento?: 'Pago' | 'Pendente' // Status de pagamento para notas
}

interface Usuario {
  id: number
  nome: string
  email: string
  senha: string
  tipo: 'admin' | 'vendedor'
  ativo: boolean
  dataRegistro: string
  criadoPor?: string // Admin que criou o vendedor
  comissao?: number // Comissão do vendedor (%)
}

interface EstoqueVendedor {
  id: number
  vendedorId: number
  vendedorNome: string
  produtoId: number
  produtoNome: string
  quantidadeLevada: number
  quantidadeVendida: number
  quantidadeDevolver: number
  data: string
  status: 'ativo' | 'finalizado'
}

export default function ControleClientesVendas() {
  // Estados de autenticação
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null)
  const [telaLogin, setTelaLogin] = useState(true)
  const [tipoLogin, setTipoLogin] = useState<'admin' | 'vendedor'>('admin')
  const [dadosLogin, setDadosLogin] = useState({ email: '', senha: '' })
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erroLogin, setErroLogin] = useState('')
  const [mostrarCriarConta, setMostrarCriarConta] = useState(false)
  const [dadosCriarConta, setDadosCriarConta] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    tipo: 'vendedor' as 'admin' | 'vendedor'
  })
  const [erroCriarConta, setErroCriarConta] = useState('')

  // Estados para adicionar vendedor (admin)
  const [mostrarAdicionarVendedor, setMostrarAdicionarVendedor] = useState(false)
  const [novoVendedor, setNovoVendedor] = useState({
    nome: '',
    email: '',
    senha: ''
  })
  const [erroAdicionarVendedor, setErroAdicionarVendedor] = useState('')

  // Estados para editar vendedor
  const [vendedorEditando, setVendedorEditando] = useState<Usuario | null>(null)
  const [dadosEdicaoVendedor, setDadosEdicaoVendedor] = useState({
    nome: '',
    email: ''
  })

  // Estados para trocar senha do vendedor (admin)
  const [vendedorTrocandoSenha, setVendedorTrocandoSenha] = useState<Usuario | null>(null)
  const [novaSenhaVendedor, setNovaSenhaVendedor] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')
  const [erroTrocarSenha, setErroTrocarSenha] = useState('')

  // Estados para editar cliente
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null)
  const [dadosEdicaoCliente, setDadosEdicaoCliente] = useState<Cliente | null>(null)

  // Estados para alterar dia da rota
  const [clienteAlterandoRota, setClienteAlterandoRota] = useState<Cliente | null>(null)
  const [novosDiasVisita, setNovosDiasVisita] = useState<string[]>([])

  // Estados para acompanhar vendedores (admin)
  const [vendedorSelecionado, setVendedorSelecionado] = useState<string>('')

  // Estados para fechamento do dia (admin)
  const [vendedorFechamento, setVendedorFechamento] = useState<string>('')

  // Estados para controle de estoque do vendedor
  const [estoqueVendedores, setEstoqueVendedores] = useState<EstoqueVendedor[]>([
    {
      id: 1,
      vendedorId: 4,
      vendedorNome: 'Welton Silva',
      produtoId: 1,
      produtoNome: 'Pacote Premium',
      quantidadeLevada: 30,
      quantidadeVendida: 28,
      quantidadeDevolver: 2,
      data: new Date().toISOString().split('T')[0],
      status: 'ativo'
    }
  ])
  const [mostrarControleEstoque, setMostrarControleEstoque] = useState(false)
  const [novoEstoque, setNovoEstoque] = useState({
    vendedorId: 0,
    produtoId: 0,
    quantidadeLevada: 0
  })

  // Usuários do sistema (simulando banco de dados) - ADMIN PRINCIPAL CONFIGURADO
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      id: 1,
      nome: 'Administrador Principal',
      email: 'paodequeijomeufavorito@gmail.com',
      senha: 'giovanin16',
      tipo: 'admin',
      ativo: true,
      dataRegistro: '2024-01-01'
    },
    {
      id: 2,
      nome: 'João Vendedor',
      email: 'joao@meufavorito.com',
      senha: 'joao123',
      tipo: 'vendedor',
      ativo: true,
      dataRegistro: '2024-01-15',
      criadoPor: 'Administrador Principal',
      comissao: 5
    },
    {
      id: 3,
      nome: 'Maria Vendedora',
      email: 'maria@meufavorito.com',
      senha: 'maria123',
      tipo: 'vendedor',
      ativo: false,
      dataRegistro: '2024-01-20',
      criadoPor: 'Administrador Principal',
      comissao: 5
    },
    {
      id: 4,
      nome: 'Welton Silva',
      email: 'welton@meufavorito.com',
      senha: 'welton123',
      tipo: 'vendedor',
      ativo: true,
      dataRegistro: '2024-01-25',
      criadoPor: 'Administrador Principal',
      comissao: 5
    }
  ])

  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: 1,
      nomeEmpresa: "Padaria São José",
      responsavelCompra: "Maria Silva",
      tipoDocumento: "CNPJ",
      documento: "12.345.678/0001-90",
      email: "maria@padariasaojose.com",
      telefone: "(11) 99999-9999",
      endereco: "Rua das Flores, 123",
      cidade: "São Paulo",
      estado: "SP",
      latitude: -23.5505,
      longitude: -46.6333,
      diasVisita: ["Segunda", "Quarta", "Sexta"],
      vendedorResponsavel: "João Vendedor",
      observacoes: "Cliente preferencial, sempre paga à vista",
      ultimaCompra: "2024-01-15",
      valorUltimaCompra: 250.00,
      totalCompras: 15,
      criadoPor: "Administrador Principal"
    },
    {
      id: 2,
      nomeEmpresa: "Mercado Central",
      responsavelCompra: "João Santos",
      tipoDocumento: "CNPJ",
      documento: "98.765.432/0001-10",
      email: "joao@mercadocentral.com",
      telefone: "(11) 88888-8888",
      endereco: "Av. Principal, 456",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      latitude: -22.9068,
      longitude: -43.1729,
      diasVisita: ["Terça", "Quinta"],
      vendedorResponsavel: "Maria Vendedora",
      observacoes: "Prefere entregas pela manhã",
      ultimaCompra: "2024-01-12",
      valorUltimaCompra: 180.00,
      totalCompras: 8,
      criadoPor: "Administrador Principal"
    },
    {
      id: 3,
      nomeEmpresa: "Loja do Felipe",
      responsavelCompra: "Felipe Costa",
      tipoDocumento: "CNPJ",
      documento: "11.222.333/0001-44",
      email: "felipe@lojadofelipe.com",
      telefone: "(11) 77777-7777",
      endereco: "Rua Comercial, 789",
      cidade: "São Paulo",
      estado: "SP",
      latitude: -23.5489,
      longitude: -46.6388,
      diasVisita: ["Segunda", "Quinta"],
      vendedorResponsavel: "Welton Silva",
      observacoes: "Prefere pagamento no boleto",
      ultimaCompra: "2024-01-20",
      valorUltimaCompra: 500.00,
      totalCompras: 12,
      criadoPor: "Administrador Principal"
    },
    {
      id: 4,
      nomeEmpresa: "Distribuidora Lucas",
      responsavelCompra: "Lucas Oliveira",
      tipoDocumento: "CNPJ",
      documento: "55.666.777/0001-88",
      email: "lucas@distribuidoralucas.com",
      telefone: "(11) 66666-6666",
      endereco: "Av. Industrial, 321",
      cidade: "São Paulo",
      estado: "SP",
      latitude: -23.5505,
      longitude: -46.6333,
      diasVisita: ["Terça", "Sexta"],
      vendedorResponsavel: "Welton Silva",
      observacoes: "Sempre paga em dinheiro",
      ultimaCompra: "2024-01-18",
      valorUltimaCompra: 1000.00,
      totalCompras: 25,
      criadoPor: "Administrador Principal"
    }
  ])

  const [produtos, setProdutos] = useState<Produto[]>([
    {
      id: 1,
      nome: "Pacote Premium",
      preco: 50.00,
      categoria: "Pacotes",
      estoque: 100,
      descricao: "Pacote premium com produtos selecionados"
    },
    {
      id: 2,
      nome: "Pacote Standard",
      preco: 25.00,
      categoria: "Pacotes",
      estoque: 150,
      descricao: "Pacote padrão com boa variedade"
    },
    {
      id: 3,
      nome: "Pacote Básico",
      preco: 15.00,
      categoria: "Pacotes",
      estoque: 200,
      descricao: "Pacote básico para iniciantes"
    },
    {
      id: 4,
      nome: "Pacote Executivo",
      preco: 75.00,
      categoria: "Pacotes",
      estoque: 80,
      descricao: "Pacote executivo com produtos premium"
    },
    {
      id: 5,
      nome: "Pacote Família",
      preco: 40.00,
      categoria: "Pacotes",
      estoque: 120,
      descricao: "Pacote ideal para famílias"
    },
    {
      id: 6,
      nome: "Pacote Empresarial",
      preco: 90.00,
      categoria: "Pacotes",
      estoque: 60,
      descricao: "Pacote especial para empresas"
    },
    {
      id: 7,
      nome: "Pacote Econômico",
      preco: 12.00,
      categoria: "Pacotes",
      estoque: 250,
      descricao: "Pacote econômico com ótimo custo-benefício"
    },
    {
      id: 8,
      nome: "Pacote Deluxe",
      preco: 120.00,
      categoria: "Pacotes",
      estoque: 40,
      descricao: "Pacote deluxe com produtos exclusivos"
    },
    {
      id: 9,
      nome: "Pacote Promocional",
      preco: 20.00,
      categoria: "Pacotes",
      estoque: 180,
      descricao: "Pacote promocional por tempo limitado"
    },
    {
      id: 10,
      nome: "Pacote Especial",
      preco: 35.00,
      categoria: "Pacotes",
      estoque: 90,
      descricao: "Pacote especial com produtos sazonais"
    }
  ])

  const [vendas, setVendas] = useState<Venda[]>([
    {
      id: 1,
      clienteId: 1,
      produtoId: 1,
      data: "2024-01-15",
      quantidade: 5,
      precoUnitario: 50.00,
      valorTotal: 250.00,
      formaPagamento: "Dinheiro",
      observacoes: "Entrega urgente",
      status: "Concluída",
      vendedorResponsavel: "João Vendedor",
      statusPagamento: "Pago"
    },
    {
      id: 2,
      clienteId: 2,
      produtoId: 3,
      data: "2024-01-12",
      quantidade: 12,
      precoUnitario: 15.00,
      valorTotal: 180.00,
      formaPagamento: "PIX",
      observacoes: "",
      status: "Concluída",
      vendedorResponsavel: "Maria Vendedora",
      statusPagamento: "Pago"
    },
    {
      id: 3,
      clienteId: 3,
      produtoId: 1,
      data: new Date().toISOString().split('T')[0], // Data de hoje
      quantidade: 10,
      precoUnitario: 50.00,
      valorTotal: 500.00,
      formaPagamento: "Boleto",
      observacoes: "Venda do dia",
      status: "Concluída",
      vendedorResponsavel: "Welton Silva",
      statusPagamento: "Pago"
    },
    {
      id: 4,
      clienteId: 4,
      produtoId: 2,
      data: new Date().toISOString().split('T')[0], // Data de hoje
      quantidade: 20,
      precoUnitario: 25.00,
      valorTotal: 500.00,
      formaPagamento: "Dinheiro",
      observacoes: "Pagamento à vista",
      status: "Concluída",
      vendedorResponsavel: "Welton Silva",
      statusPagamento: "Pago"
    },
    {
      id: 5,
      clienteId: 1,
      produtoId: 2,
      data: new Date().toISOString().split('T')[0], // Data de hoje
      quantidade: 8,
      precoUnitario: 25.00,
      valorTotal: 200.00,
      formaPagamento: "PIX",
      observacoes: "Cliente fiel",
      status: "Concluída",
      vendedorResponsavel: "João Vendedor",
      statusPagamento: "Pago"
    },
    {
      id: 6,
      clienteId: 2,
      produtoId: 1,
      data: new Date().toISOString().split('T')[0], // Data de hoje
      quantidade: 5,
      precoUnitario: 50.00,
      valorTotal: 250.00,
      formaPagamento: "Nota Feita",
      numeroNota: "001234",
      observacoes: "Nota fiscal emitida",
      status: "Concluída",
      vendedorResponsavel: "Maria Vendedora",
      statusPagamento: "Pendente"
    },
    {
      id: 7,
      clienteId: 3,
      produtoId: 2,
      data: new Date().toISOString().split('T')[0], // Data de hoje
      quantidade: 15,
      precoUnitario: 25.00,
      valorTotal: 375.00,
      formaPagamento: "Nota Feita",
      numeroNota: "001235",
      observacoes: "Aguardando pagamento",
      status: "Concluída",
      vendedorResponsavel: "Welton Silva",
      statusPagamento: "Pendente"
    }
  ])

  const [abaSelecionada, setAbaSelecionada] = useState<'dashboard' | 'clientes' | 'produtos' | 'vendas' | 'rotas' | 'relatorios' | 'adicionar' | 'adicionarProduto' | 'registrarVenda' | 'usuarios' | 'perfilVendedor' | 'acompanharVendedores' | 'fechamentoDia' | 'fechamentoDiaAdmin' | 'controleEstoque' | 'notasReceber'>('dashboard')
  const [busca, setBusca] = useState('')
  const [sidebarAberta, setSidebarAberta] = useState(false)
  const [localizacaoAtual, setLocalizacaoAtual] = useState<{latitude: number, longitude: number} | null>(null)
  const [carregandoLocalizacao, setCarregandoLocalizacao] = useState(false)
  const [filtroRotas, setFiltroRotas] = useState('')
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null)
  
  const [novoCliente, setNovoCliente] = useState({
    nomeEmpresa: '',
    responsavelCompra: '',
    tipoDocumento: 'CNPJ' as 'CNPJ' | 'CPF',
    documento: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    diasVisita: [] as string[],
    vendedorResponsavel: '',
    observacoes: ''
  })

  const [novoProduto, setNovoProduto] = useState({
    nome: '',
    preco: 0,
    categoria: '',
    estoque: 0,
    descricao: ''
  })

  const [novaVenda, setNovaVenda] = useState({
    clienteId: 0,
    produtoId: 0,
    data: new Date().toISOString().split('T')[0],
    quantidade: 1,
    precoUnitario: 0,
    formaPagamento: 'Dinheiro',
    observacoes: '',
    numeroNota: '' // Campo para número da nota
  })

  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
  // Buscar vendedores ativos do sistema em vez de lista fixa
  const vendedoresAtivos = usuarios.filter(u => u.tipo === 'vendedor' && u.ativo).map(u => u.nome)
  const formasPagamento = ['Dinheiro', 'PIX', 'Boleto', 'Nota Feita']

  // Função para obter vendas do dia atual do vendedor logado
  const obterVendasDoDia = () => {
    if (!usuarioLogado || usuarioLogado.tipo !== 'vendedor') return []
    
    const hoje = new Date().toISOString().split('T')[0]
    return vendas.filter(venda => 
      venda.vendedorResponsavel === usuarioLogado.nome && 
      venda.data === hoje
    )
  }

  // Função para obter vendas do dia de um vendedor específico (admin)
  const obterVendasDoDiaVendedor = (nomeVendedor: string) => {
    const hoje = new Date().toISOString().split('T')[0]
    return vendas.filter(venda => 
      venda.vendedorResponsavel === nomeVendedor && 
      venda.data === hoje
    )
  }

  // Função para obter notas a receber (vendas com pagamento "Nota Feita" e status "Pendente")
  const obterNotasAReceber = () => {
    return vendas.filter(venda => 
      venda.formaPagamento === 'Nota Feita' && 
      venda.statusPagamento === 'Pendente'
    )
  }

  // Função para marcar nota como paga (apenas admin)
  const marcarNotaComoPaga = (vendaId: number) => {
    if (usuarioLogado?.tipo !== 'admin') return
    
    setVendas(vendas.map(venda => 
      venda.id === vendaId 
        ? { ...venda, statusPagamento: 'Pago' as 'Pago' | 'Pendente' }
        : venda
    ))
    
    alert('Nota marcada como paga com sucesso!')
  }

  // Função para calcular totais por forma de pagamento
  const calcularTotaisPorPagamento = () => {
    const vendasDoDia = obterVendasDoDia()
    const totais: { [key: string]: { quantidade: number, valor: number } } = {}
    
    formasPagamento.forEach(forma => {
      totais[forma] = { quantidade: 0, valor: 0 }
    })
    
    vendasDoDia.forEach(venda => {
      if (totais[venda.formaPagamento]) {
        totais[venda.formaPagamento].quantidade += venda.quantidade
        totais[venda.formaPagamento].valor += venda.valorTotal
      }
    })
    
    return totais
  }

  // Função para calcular totais por forma de pagamento de um vendedor específico (admin)
  const calcularTotaisPorPagamentoVendedor = (nomeVendedor: string) => {
    const vendasDoDia = obterVendasDoDiaVendedor(nomeVendedor)
    const totais: { [key: string]: { quantidade: number, valor: number } } = {}
    
    formasPagamento.forEach(forma => {
      totais[forma] = { quantidade: 0, valor: 0 }
    })
    
    vendasDoDia.forEach(venda => {
      if (totais[venda.formaPagamento]) {
        totais[venda.formaPagamento].quantidade += venda.quantidade
        totais[venda.formaPagamento].valor += venda.valorTotal
      }
    })
    
    return totais
  }

  // Função para obter estoque do vendedor logado
  const obterEstoqueVendedor = () => {
    if (!usuarioLogado || usuarioLogado.tipo !== 'vendedor') return []
    
    return estoqueVendedores.filter(estoque => 
      estoque.vendedorNome === usuarioLogado.nome && 
      estoque.status === 'ativo'
    )
  }

  // Função para obter estoque de um vendedor específico (admin)
  const obterEstoqueVendedorEspecifico = (nomeVendedor: string) => {
    return estoqueVendedores.filter(estoque => 
      estoque.vendedorNome === nomeVendedor && 
      estoque.status === 'ativo'
    )
  }

  // Função para calcular quantidade vendida baseada nas vendas do dia
  const calcularQuantidadeVendida = (produtoId: number) => {
    if (!usuarioLogado || usuarioLogado.tipo !== 'vendedor') return 0
    
    const hoje = new Date().toISOString().split('T')[0]
    const vendasDoProduto = vendas.filter(venda => 
      venda.vendedorResponsavel === usuarioLogado.nome && 
      venda.produtoId === produtoId &&
      venda.data === hoje
    )
    
    return vendasDoProduto.reduce((total, venda) => total + venda.quantidade, 0)
  }

  // Função para calcular quantidade vendida de um vendedor específico (admin)
  const calcularQuantidadeVendidaVendedor = (nomeVendedor: string, produtoId: number) => {
    const hoje = new Date().toISOString().split('T')[0]
    const vendasDoProduto = vendas.filter(venda => 
      venda.vendedorResponsavel === nomeVendedor && 
      venda.produtoId === produtoId &&
      venda.data === hoje
    )
    
    return vendasDoProduto.reduce((total, venda) => total + venda.quantidade, 0)
  }

  // Função para atualizar estoque do vendedor baseado nas vendas
  const atualizarEstoqueVendedor = () => {
    setEstoqueVendedores(estoques => 
      estoques.map(estoque => {
        const quantidadeVendida = calcularQuantidadeVendida(estoque.produtoId)
        return {
          ...estoque,
          quantidadeVendida,
          quantidadeDevolver: estoque.quantidadeLevada - quantidadeVendida
        }
      })
    )
  }

  // Função para adicionar estoque para vendedor (admin)
  const adicionarEstoqueVendedor = () => {
    if (usuarioLogado?.tipo !== 'admin') return
    
    if (!novoEstoque.vendedorId || !novoEstoque.produtoId || novoEstoque.quantidadeLevada <= 0) {
      alert('Todos os campos são obrigatórios e a quantidade deve ser maior que zero')
      return
    }

    const vendedor = usuarios.find(u => u.id === novoEstoque.vendedorId)
    const produto = produtos.find(p => p.id === novoEstoque.produtoId)
    
    if (!vendedor || !produto) {
      alert('Vendedor ou produto não encontrado')
      return
    }

    const novoEstoqueItem: EstoqueVendedor = {
      id: estoqueVendedores.length + 1,
      vendedorId: novoEstoque.vendedorId,
      vendedorNome: vendedor.nome,
      produtoId: novoEstoque.produtoId,
      produtoNome: produto.nome,
      quantidadeLevada: novoEstoque.quantidadeLevada,
      quantidadeVendida: 0,
      quantidadeDevolver: novoEstoque.quantidadeLevada,
      data: new Date().toISOString().split('T')[0],
      status: 'ativo'
    }

    setEstoqueVendedores([...estoqueVendedores, novoEstoqueItem])
    setNovoEstoque({ vendedorId: 0, produtoId: 0, quantidadeLevada: 0 })
    setMostrarControleEstoque(false)
    alert('Estoque adicionado com sucesso!')
  }

  // Função para criar conta
  const criarConta = () => {
    setErroCriarConta('')
    
    if (!dadosCriarConta.nome || !dadosCriarConta.email || !dadosCriarConta.senha) {
      setErroCriarConta('Todos os campos são obrigatórios')
      return
    }

    if (dadosCriarConta.senha !== dadosCriarConta.confirmarSenha) {
      setErroCriarConta('As senhas não coincidem')
      return
    }

    if (usuarios.find(u => u.email === dadosCriarConta.email)) {
      setErroCriarConta('Este email já está cadastrado')
      return
    }

    const novoUsuario: Usuario = {
      id: usuarios.length + 1,
      nome: dadosCriarConta.nome,
      email: dadosCriarConta.email,
      senha: dadosCriarConta.senha,
      tipo: dadosCriarConta.tipo,
      ativo: dadosCriarConta.tipo === 'admin' ? true : false, // Vendedores precisam ser liberados
      dataRegistro: new Date().toISOString().split('T')[0],
      comissao: dadosCriarConta.tipo === 'vendedor' ? 5 : undefined
    }

    setUsuarios([...usuarios, novoUsuario])
    setDadosCriarConta({
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      tipo: 'vendedor'
    })
    setMostrarCriarConta(false)
    alert(`Conta criada com sucesso! ${dadosCriarConta.tipo === 'vendedor' ? 'Aguarde a liberação do administrador.' : 'Você já pode fazer login.'}`)
  }

  // Função de login
  const fazerLogin = () => {
    setErroLogin('')
    
    const usuario = usuarios.find(u => 
      u.email === dadosLogin.email && 
      u.senha === dadosLogin.senha && 
      u.tipo === tipoLogin
    )

    if (!usuario) {
      setErroLogin('Email ou senha incorretos')
      return
    }

    if (usuario.tipo === 'vendedor' && !usuario.ativo) {
      setErroLogin('Sua conta ainda não foi liberada pelo administrador')
      return
    }

    setUsuarioLogado(usuario)
    setTelaLogin(false)
    setDadosLogin({ email: '', senha: '' })
    setErroLogin('')
  }

  // Função de logout
  const fazerLogout = () => {
    setUsuarioLogado(null)
    setTelaLogin(true)
    setAbaSelecionada('dashboard')
  }

  // Função para adicionar vendedor (apenas admin)
  const adicionarVendedor = () => {
    if (usuarioLogado?.tipo !== 'admin') return
    
    setErroAdicionarVendedor('')
    
    if (!novoVendedor.nome || !novoVendedor.email || !novoVendedor.senha) {
      setErroAdicionarVendedor('Todos os campos são obrigatórios')
      return
    }

    if (usuarios.find(u => u.email === novoVendedor.email)) {
      setErroAdicionarVendedor('Este email já está cadastrado')
      return
    }

    const vendedor: Usuario = {
      id: usuarios.length + 1,
      nome: novoVendedor.nome,
      email: novoVendedor.email,
      senha: novoVendedor.senha,
      tipo: 'vendedor',
      ativo: true, // Admin pode ativar diretamente
      dataRegistro: new Date().toISOString().split('T')[0],
      criadoPor: usuarioLogado.nome,
      comissao: 5
    }

    setUsuarios([...usuarios, vendedor])
    setNovoVendedor({ nome: '', email: '', senha: '' })
    setMostrarAdicionarVendedor(false)
    alert('Vendedor adicionado com sucesso!')
  }

  // Função para alternar status do vendedor (apenas admin)
  const alternarStatusVendedor = (id: number) => {
    if (usuarioLogado?.tipo !== 'admin') return
    
    setUsuarios(usuarios.map(u => 
      u.id === id ? { ...u, ativo: !u.ativo } : u
    ))
  }

  // Função para iniciar edição de vendedor
  const iniciarEdicaoVendedor = (vendedor: Usuario) => {
    setVendedorEditando(vendedor)
    setDadosEdicaoVendedor({
      nome: vendedor.nome,
      email: vendedor.email
    })
  }

  // Função para salvar edição de vendedor
  const salvarEdicaoVendedor = () => {
    if (!vendedorEditando || usuarioLogado?.tipo !== 'admin') return

    if (!dadosEdicaoVendedor.nome || !dadosEdicaoVendedor.email) {
      alert('Nome e email são obrigatórios')
      return
    }

    // Verificar se email já existe (exceto o próprio vendedor)
    if (usuarios.find(u => u.email === dadosEdicaoVendedor.email && u.id !== vendedorEditando.id)) {
      alert('Este email já está sendo usado por outro usuário')
      return
    }

    setUsuarios(usuarios.map(u => 
      u.id === vendedorEditando.id 
        ? { ...u, nome: dadosEdicaoVendedor.nome, email: dadosEdicaoVendedor.email }
        : u
    ))

    setVendedorEditando(null)
    setDadosEdicaoVendedor({ nome: '', email: '' })
    alert('Vendedor atualizado com sucesso!')
  }

  // Função para iniciar troca de senha do vendedor (admin)
  const iniciarTrocaSenhaVendedor = (vendedor: Usuario) => {
    if (usuarioLogado?.tipo !== 'admin') return
    setVendedorTrocandoSenha(vendedor)
    setNovaSenhaVendedor('')
    setConfirmarNovaSenha('')
    setErroTrocarSenha('')
  }

  // Função para trocar senha do vendedor (admin)
  const trocarSenhaVendedor = () => {
    if (!vendedorTrocandoSenha || usuarioLogado?.tipo !== 'admin') return

    setErroTrocarSenha('')

    if (!novaSenhaVendedor || !confirmarNovaSenha) {
      setErroTrocarSenha('Todos os campos são obrigatórios')
      return
    }

    if (novaSenhaVendedor !== confirmarNovaSenha) {
      setErroTrocarSenha('As senhas não coincidem')
      return
    }

    if (novaSenhaVendedor.length < 6) {
      setErroTrocarSenha('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setUsuarios(usuarios.map(u => 
      u.id === vendedorTrocandoSenha.id 
        ? { ...u, senha: novaSenhaVendedor }
        : u
    ))

    setVendedorTrocandoSenha(null)
    setNovaSenhaVendedor('')
    setConfirmarNovaSenha('')
    setErroTrocarSenha('')
    alert(`Senha do vendedor ${vendedorTrocandoSenha.nome} alterada com sucesso!`)
  }

  // Função para excluir vendedor
  const excluirVendedor = (id: number) => {
    if (usuarioLogado?.tipo !== 'admin') return
    
    if (confirm('Tem certeza que deseja excluir este vendedor? Esta ação não pode ser desfeita.')) {
      setUsuarios(usuarios.filter(u => u.id !== id))
      alert('Vendedor excluído com sucesso!')
    }
  }

  // Função para iniciar edição de cliente (admin)
  const iniciarEdicaoCliente = (cliente: Cliente) => {
    if (usuarioLogado?.tipo !== 'admin') return
    setClienteEditando(cliente)
    setDadosEdicaoCliente({...cliente})
  }

  // Função para salvar edição de cliente
  const salvarEdicaoCliente = () => {
    if (!clienteEditando || !dadosEdicaoCliente || usuarioLogado?.tipo !== 'admin') return

    if (!dadosEdicaoCliente.nomeEmpresa || !dadosEdicaoCliente.responsavelCompra || !dadosEdicaoCliente.email) {
      alert('Nome da empresa, responsável e email são obrigatórios')
      return
    }

    setClientes(clientes.map(c => 
      c.id === clienteEditando.id ? dadosEdicaoCliente : c
    ))

    setClienteEditando(null)
    setDadosEdicaoCliente(null)
    alert('Cliente atualizado com sucesso!')
  }

  // Função para iniciar alteração de rota (vendedor)
  const iniciarAlteracaoRota = (cliente: Cliente) => {
    // Vendedor só pode alterar clientes que são seus
    if (usuarioLogado?.tipo === 'vendedor' && cliente.vendedorResponsavel !== usuarioLogado.nome) {
      alert('Você só pode alterar rotas dos seus clientes')
      return
    }
    
    setClienteAlterandoRota(cliente)
    setNovosDiasVisita([...cliente.diasVisita])
  }

  // Função para salvar alteração de rota
  const salvarAlteracaoRota = () => {
    if (!clienteAlterandoRota) return

    setClientes(clientes.map(c => 
      c.id === clienteAlterandoRota.id 
        ? { ...c, diasVisita: novosDiasVisita }
        : c
    ))

    setClienteAlterandoRota(null)
    setNovosDiasVisita([])
    alert('Dias de visita atualizados com sucesso!')
  }

  // Função para alternar dia na alteração de rota
  const toggleDiaRota = (dia: string) => {
    setNovosDiasVisita(prev => 
      prev.includes(dia)
        ? prev.filter(d => d !== dia)
        : [...prev, dia]
    )
  }

  // Função para calcular estatísticas do vendedor
  const calcularEstatisticasVendedor = (nomeVendedor: string) => {
    const clientesVendedor = clientes.filter(c => c.vendedorResponsavel === nomeVendedor)
    const vendasVendedor = vendas.filter(v => v.vendedorResponsavel === nomeVendedor)
    
    const mesAtual = new Date().getMonth()
    const anoAtual = new Date().getFullYear()
    
    const vendasMesAtual = vendasVendedor.filter(v => {
      const dataVenda = new Date(v.data)
      return dataVenda.getMonth() === mesAtual && dataVenda.getFullYear() === anoAtual
    })
    
    const totalVendasMes = vendasMesAtual.reduce((acc, v) => acc + v.valorTotal, 0)
    const quantidadeVendasMes = vendasMesAtual.length
    
    // Buscar comissão do vendedor
    const vendedor = usuarios.find(u => u.nome === nomeVendedor)
    const percentualComissao = (vendedor?.comissao || 5) / 100
    const comissao = totalVendasMes * percentualComissao
    
    return {
      totalClientes: clientesVendedor.length,
      vendasMes: quantidadeVendasMes,
      faturamentoMes: totalVendasMes,
      comissaoMes: comissao,
      percentualComissao: vendedor?.comissao || 5
    }
  }

  // Filtros baseados no usuário logado
  const clientesFiltrados = clientes.filter(cliente => {
    // Se for vendedor, mostrar apenas seus clientes
    if (usuarioLogado?.tipo === 'vendedor' && cliente.vendedorResponsavel !== usuarioLogado.nome) {
      return false
    }
    
    // Aplicar filtro de busca
    return cliente.nomeEmpresa.toLowerCase().includes(busca.toLowerCase()) ||
           cliente.responsavelCompra.toLowerCase().includes(busca.toLowerCase()) ||
           cliente.cidade.toLowerCase().includes(busca.toLowerCase()) ||
           cliente.email.toLowerCase().includes(busca.toLowerCase())
  })

  const vendasFiltradas = vendas.filter(venda => {
    // Se for vendedor, mostrar apenas suas vendas
    if (usuarioLogado?.tipo === 'vendedor' && venda.vendedorResponsavel !== usuarioLogado.nome) {
      return false
    }
    return true
  })

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
    produto.categoria.toLowerCase().includes(busca.toLowerCase())
  )

  // Função para contar clientes por dia da semana (filtrado por vendedor)
  const contarClientesPorDia = (dia: string) => {
    const clientesParaContar = usuarioLogado?.tipo === 'vendedor' 
      ? clientes.filter(c => c.vendedorResponsavel === usuarioLogado.nome)
      : clientes
    
    return clientesParaContar.filter(cliente => cliente.diasVisita.includes(dia)).length
  }

  // Função para filtrar clientes por dia (filtrado por vendedor)
  const clientesPorDia = (dia: string) => {
    const clientesParaFiltrar = usuarioLogado?.tipo === 'vendedor' 
      ? clientes.filter(c => c.vendedorResponsavel === usuarioLogado.nome)
      : clientes
    
    return clientesParaFiltrar.filter(cliente => cliente.diasVisita.includes(dia))
  }

  // Cores para os cartões dos dias
  const coresDias = {
    'Segunda': 'from-blue-500 to-blue-600',
    'Terça': 'from-green-500 to-green-600',
    'Quarta': 'from-yellow-500 to-yellow-600',
    'Quinta': 'from-purple-500 to-purple-600',
    'Sexta': 'from-red-500 to-red-600',
    'Sábado': 'from-indigo-500 to-indigo-600',
    'Domingo': 'from-gray-500 to-gray-600'
  }

  const obterLocalizacao = () => {
    setCarregandoLocalizacao(true)
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLocalizacaoAtual({ latitude, longitude })
          setNovoCliente(prev => ({
            ...prev,
            latitude,
            longitude
          }))
          setCarregandoLocalizacao(false)
        },
        (error) => {
          console.error('Erro ao obter localização:', error)
          alert('Erro ao obter localização. Verifique se você permitiu o acesso à localização.')
          setCarregandoLocalizacao(false)
        }
      )
    } else {
      alert('Geolocalização não é suportada neste navegador.')
      setCarregandoLocalizacao(false)
    }
  }

  const adicionarCliente = () => {
    if (novoCliente.nomeEmpresa && novoCliente.responsavelCompra && novoCliente.email) {
      const cliente: Cliente = {
        id: clientes.length + 1,
        ...novoCliente,
        ultimaCompra: new Date().toISOString().split('T')[0],
        valorUltimaCompra: 0,
        totalCompras: 0,
        criadoPor: usuarioLogado?.nome || 'Sistema'
      }
      setClientes([...clientes, cliente])
      setNovoCliente({
        nomeEmpresa: '',
        responsavelCompra: '',
        tipoDocumento: 'CNPJ',
        documento: '',
        email: '',
        telefone: '',
        endereco: '',
        cidade: '',
        estado: '',
        latitude: undefined,
        longitude: undefined,
        diasVisita: [],
        vendedorResponsavel: '',
        observacoes: ''
      })
      setLocalizacaoAtual(null)
      setAbaSelecionada('clientes')
    }
  }

  const adicionarProduto = () => {
    if (novoProduto.nome && novoProduto.preco > 0) {
      const produto: Produto = {
        id: produtos.length + 1,
        ...novoProduto
      }
      setProdutos([...produtos, produto])
      setNovoProduto({
        nome: '',
        preco: 0,
        categoria: '',
        estoque: 0,
        descricao: ''
      })
      setAbaSelecionada('produtos')
    }
  }

  const registrarVenda = () => {
    if (novaVenda.clienteId && novaVenda.produtoId && novaVenda.quantidade > 0) {
      // Validação para "Nota Feita" - número da nota é obrigatório
      if (novaVenda.formaPagamento === 'Nota Feita' && !novaVenda.numeroNota.trim()) {
        alert('Para pagamento "Nota Feita", o número da nota é obrigatório!')
        return
      }

      const produto = produtos.find(p => p.id === novaVenda.produtoId)
      const valorTotal = novaVenda.quantidade * (produto?.preco || 0)
      
      const venda: Venda = {
        id: vendas.length + 1,
        ...novaVenda,
        precoUnitario: produto?.preco || 0,
        valorTotal,
        status: 'Concluída',
        vendedorResponsavel: usuarioLogado?.nome || 'Sistema',
        // Se for "Nota Feita", status de pagamento é "Pendente", senão é "Pago"
        statusPagamento: novaVenda.formaPagamento === 'Nota Feita' ? 'Pendente' : 'Pago'
      }
      
      setVendas([...vendas, venda])
      
      // Atualizar estoque do produto
      setProdutos(produtos.map(p => 
        p.id === novaVenda.produtoId 
          ? { ...p, estoque: p.estoque - novaVenda.quantidade }
          : p
      ))
      
      // Atualizar dados do cliente
      setClientes(clientes.map(c => 
        c.id === novaVenda.clienteId
          ? { 
              ...c, 
              ultimaCompra: novaVenda.data,
              valorUltimaCompra: valorTotal,
              totalCompras: c.totalCompras + 1
            }
          : c
      ))
      
      // Atualizar estoque do vendedor automaticamente
      atualizarEstoqueVendedor()
      
      setNovaVenda({
        clienteId: 0,
        produtoId: 0,
        data: new Date().toISOString().split('T')[0],
        quantidade: 1,
        precoUnitario: 0,
        formaPagamento: 'Dinheiro',
        observacoes: '',
        numeroNota: ''
      })
      
      setAbaSelecionada('vendas')
    }
  }

  const removerProduto = (id: number) => {
    setProdutos(produtos.filter(produto => produto.id !== id))
  }

  const toggleDiaVisita = (dia: string) => {
    setNovoCliente(prev => ({
      ...prev,
      diasVisita: prev.diasVisita.includes(dia)
        ? prev.diasVisita.filter(d => d !== dia)
        : [...prev.diasVisita, dia]
    }))
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'clientes', label: 'Clientes', icon: User },
    { id: 'produtos', label: 'Produtos', icon: Package },
    { id: 'vendas', label: 'Vendas', icon: ShoppingBag },
    { id: 'rotas', label: 'Rotas', icon: Route },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    ...(usuarioLogado?.tipo === 'admin' ? [
      { id: 'usuarios', label: 'Usuários', icon: Shield },
      { id: 'acompanharVendedores', label: 'Acompanhar Vendedores', icon: Users },
      { id: 'fechamentoDiaAdmin', label: 'Fechamento do Dia', icon: Clock },
      { id: 'controleEstoque', label: 'Controle de Estoque', icon: Truck },
      { id: 'notasReceber', label: 'Notas a Receber', icon: FileText }
    ] : []),
    ...(usuarioLogado?.tipo === 'vendedor' ? [
      { id: 'perfilVendedor', label: 'Meu Perfil', icon: TrendingUp },
      { id: 'fechamentoDia', label: 'Fechamento do Dia', icon: Clock },
      { id: 'controleEstoque', label: 'Meu Estoque', icon: Package }
    ] : []),
  ]

  // Tela de Login
  if (telaLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          {/* Tela de Criar Conta */}
          {mostrarCriarConta ? (
            <>
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Criar Conta</h1>
                <p className="text-gray-600">Cadastre-se no sistema</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); criarConta(); }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                  <input
                    type="text"
                    value={dadosCriarConta.nome}
                    onChange={(e) => setDadosCriarConta({...dadosCriarConta, nome: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={dadosCriarConta.email}
                    onChange={(e) => setDadosCriarConta({...dadosCriarConta, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Conta</label>
                  <select
                    value={dadosCriarConta.tipo}
                    onChange={(e) => setDadosCriarConta({...dadosCriarConta, tipo: e.target.value as 'admin' | 'vendedor'})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="vendedor">Vendedor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                  <input
                    type="password"
                    value={dadosCriarConta.senha}
                    onChange={(e) => setDadosCriarConta({...dadosCriarConta, senha: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Sua senha"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
                  <input
                    type="password"
                    value={dadosCriarConta.confirmarSenha}
                    onChange={(e) => setDadosCriarConta({...dadosCriarConta, confirmarSenha: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Confirme sua senha"
                    required
                  />
                </div>

                {erroCriarConta && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {erroCriarConta}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105"
                >
                  Criar Conta
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setMostrarCriarConta(false)
                    setErroCriarConta('')
                    setDadosCriarConta({
                      nome: '',
                      email: '',
                      senha: '',
                      confirmarSenha: '',
                      tipo: 'vendedor'
                    })
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Voltar ao Login
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Tela de Login Normal */}
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Meu Favorito</h1>
                <p className="text-gray-600">Sistema de Vendas</p>
              </div>

              {/* Seletor de Tipo de Login */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                <button
                  onClick={() => setTipoLogin('admin')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    tipoLogin === 'admin'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Administrador
                </button>
                <button
                  onClick={() => setTipoLogin('vendedor')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    tipoLogin === 'vendedor'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Vendedor
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); fazerLogin(); }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={dadosLogin.email}
                    onChange={(e) => setDadosLogin({...dadosLogin, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                  <div className="relative">
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      value={dadosLogin.senha}
                      onChange={(e) => setDadosLogin({...dadosLogin, senha: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                      placeholder="Sua senha"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {erroLogin && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {erroLogin}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  Entrar
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setMostrarCriarConta(true)}
                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  Criar Nova Conta
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarAberta ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Meu Favorito</h1>
            <p className="text-sm text-gray-600">Sistema de Vendas</p>
          </div>
          <button
            onClick={() => setSidebarAberta(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Info do Usuário */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              usuarioLogado?.tipo === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
            }`}>
              {usuarioLogado?.tipo === 'admin' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="font-medium text-gray-800">{usuarioLogado?.nome}</div>
              <div className="text-sm text-gray-600 capitalize">{usuarioLogado?.tipo}</div>
            </div>
          </div>
          <button
            onClick={fazerLogout}
            className="mt-3 w-full text-left text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            Sair
          </button>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setAbaSelecionada(item.id as any)
                  setSidebarAberta(false)
                  setDiaSelecionado(null) // Reset dia selecionado ao mudar de aba
                  setVendedorSelecionado('') // Reset vendedor selecionado
                  setVendedorFechamento('') // Reset vendedor fechamento
                }}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                  abaSelecionada === item.id
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Overlay para mobile */}
      {sidebarAberta && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarAberta(false)}
        />
      )}

      {/* Conteúdo Principal */}
      <div className="flex-1 lg:ml-0">
        {/* Header Mobile */}
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarAberta(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Meu Favorito</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="p-4 lg:p-6">
          {/* Notas a Receber (apenas admin) */}
          {abaSelecionada === 'notasReceber' && usuarioLogado?.tipo === 'admin' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 w-16 h-16 rounded-2xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Notas a Receber</h2>
                    <p className="text-gray-600">Vendas com pagamento "Nota Feita" pendentes de recebimento</p>
                  </div>
                </div>

                {/* Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <FileText className="w-8 h-8" />
                      <div className="text-right">
                        <div className="text-2xl font-bold">{obterNotasAReceber().length}</div>
                        <div className="text-sm opacity-90">Notas Pendentes</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <DollarSign className="w-8 h-8" />
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {formatarMoeda(obterNotasAReceber().reduce((acc, venda) => acc + venda.valorTotal, 0))}
                        </div>
                        <div className="text-sm opacity-90">Valor Total</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <Clock className="w-8 h-8" />
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {obterNotasAReceber().reduce((acc, venda) => acc + venda.quantidade, 0)}
                        </div>
                        <div className="text-sm opacity-90">Pacotes Vendidos</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista de Notas a Receber */}
                {obterNotasAReceber().length > 0 ? (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Lista de Notas Pendentes</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 rounded-l-lg">Cliente</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Produto</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Vendedor</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Data</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nota Nº</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Qtd</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Valor</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 rounded-r-lg">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {obterNotasAReceber().map((venda) => {
                            const cliente = clientes.find(c => c.id === venda.clienteId)
                            const produto = produtos.find(p => p.id === venda.produtoId)
                            return (
                              <tr key={venda.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <div className="font-medium text-gray-900">{cliente?.nomeEmpresa}</div>
                                  <div className="text-sm text-gray-500">{cliente?.responsavelCompra}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">{produto?.nome}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{venda.vendedorResponsavel}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{formatarData(venda.data)}</td>
                                <td className="px-4 py-3">
                                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-lg text-xs font-medium">
                                    #{venda.numeroNota}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{venda.quantidade}</td>
                                <td className="px-4 py-3 text-sm font-bold text-green-600">{formatarMoeda(venda.valorTotal)}</td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => marcarNotaComoPaga(venda.id)}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-1"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Marcar como Pago
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Parabéns!</h3>
                    <p className="text-gray-600">Não há notas pendentes de recebimento no momento.</p>
                    <p className="text-sm text-gray-500 mt-2">Todas as vendas com "Nota Feita" foram pagas.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fechamento do Dia Admin */}
          {abaSelecionada === 'fechamentoDiaAdmin' && usuarioLogado?.tipo === 'admin' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 w-16 h-16 rounded-2xl flex items-center justify-center">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Fechamento do Dia - Admin</h2>
                    <p className="text-gray-600">Acompanhe o fechamento de qualquer vendedor - {formatarData(new Date().toISOString().split('T')[0])}</p>
                  </div>
                </div>

                {/* Seletor de Vendedor */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selecione um vendedor:</label>
                  <select
                    value={vendedorFechamento}
                    onChange={(e) => setVendedorFechamento(e.target.value)}
                    className="w-full max-w-md px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Escolha um vendedor</option>
                    {usuarios.filter(u => u.tipo === 'vendedor' && u.ativo).map((vendedor) => (
                      <option key={vendedor.id} value={vendedor.nome}>{vendedor.nome}</option>
                    ))}
                  </select>
                </div>

                {/* Conteúdo do Vendedor Selecionado */}
                {vendedorFechamento && (
                  <div className="space-y-6">
                    {/* Resumo Geral */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                          <ShoppingBag className="w-8 h-8" />
                          <div className="text-right">
                            <div className="text-2xl font-bold">{obterVendasDoDiaVendedor(vendedorFechamento).length}</div>
                            <div className="text-sm opacity-90">Vendas Hoje</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                          <Package className="w-8 h-8" />
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {obterVendasDoDiaVendedor(vendedorFechamento).reduce((acc, venda) => acc + venda.quantidade, 0)}
                            </div>
                            <div className="text-sm opacity-90">Pacotes Vendidos</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                          <DollarSign className="w-8 h-8" />
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {formatarMoeda(obterVendasDoDiaVendedor(vendedorFechamento).reduce((acc, venda) => acc + venda.valorTotal, 0))}
                            </div>
                            <div className="text-sm opacity-90">Faturamento Total</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tabela de Vendas do Dia */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-8">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Vendas Realizadas Hoje - {vendedorFechamento}</h3>
                      
                      {obterVendasDoDiaVendedor(vendedorFechamento).length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-white">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 rounded-l-lg">Cliente</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Produto</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Qtd</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Pagamento</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 rounded-r-lg">Valor</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {obterVendasDoDiaVendedor(vendedorFechamento).map((venda) => {
                                const cliente = clientes.find(c => c.id === venda.clienteId)
                                const produto = produtos.find(p => p.id === venda.produtoId)
                                return (
                                  <tr key={venda.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                      <div className="font-medium text-gray-900">{cliente?.nomeEmpresa}</div>
                                      <div className="text-sm text-gray-500">{cliente?.responsavelCompra}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{produto?.nome}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{venda.quantidade}</td>
                                    <td className="px-4 py-3">
                                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        venda.formaPagamento === 'Dinheiro' ? 'bg-green-100 text-green-800' :
                                        venda.formaPagamento === 'PIX' ? 'bg-blue-100 text-blue-800' :
                                        venda.formaPagamento === 'Boleto' ? 'bg-yellow-100 text-yellow-800' :
                                        venda.formaPagamento === 'Nota Feita' ? 'bg-purple-100 text-purple-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {venda.formaPagamento}
                                        {venda.formaPagamento === 'Nota Feita' && venda.numeroNota && (
                                          <span className="ml-1">#{venda.numeroNota}</span>
                                        )}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-bold text-green-600">{formatarMoeda(venda.valorTotal)}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600">Nenhuma venda realizada hoje por {vendedorFechamento}.</p>
                        </div>
                      )}
                    </div>

                    {/* Resumo por Forma de Pagamento */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-8">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Resumo por Forma de Pagamento</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(calcularTotaisPorPagamentoVendedor(vendedorFechamento)).map(([forma, dados]) => (
                          <div key={forma} className="bg-white rounded-lg p-4 border">
                            <div className="flex items-center justify-between mb-2">
                              <CreditCard className={`w-6 h-6 ${
                                forma === 'Dinheiro' ? 'text-green-500' :
                                forma === 'PIX' ? 'text-blue-500' :
                                forma === 'Boleto' ? 'text-yellow-500' :
                                forma === 'Nota Feita' ? 'text-purple-500' :
                                'text-gray-500'
                              }`} />
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-800">{dados.quantidade}</div>
                                <div className="text-xs text-gray-600">pacotes</div>
                              </div>
                            </div>
                            <div className="border-t pt-2">
                              <div className="text-sm font-medium text-gray-700">{forma}</div>
                              <div className="text-lg font-bold text-green-600">{formatarMoeda(dados.valor)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Estoque do Vendedor */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-8">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Estoque de {vendedorFechamento}</h3>
                      
                      {obterEstoqueVendedorEspecifico(vendedorFechamento).length > 0 ? (
                        <div className="space-y-4">
                          {obterEstoqueVendedorEspecifico(vendedorFechamento).map((estoque) => (
                            <div key={estoque.id} className="bg-white rounded-lg p-4 border">
                              <h4 className="font-medium text-gray-800 mb-3">{estoque.produtoNome}</h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                  <div className="bg-blue-100 rounded-lg p-3">
                                    <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-blue-600">{estoque.quantidadeLevada}</div>
                                    <div className="text-sm text-gray-600">Levou no Carro</div>
                                  </div>
                                </div>

                                <div className="text-center">
                                  <div className="bg-green-100 rounded-lg p-3">
                                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-green-600">
                                      {calcularQuantidadeVendidaVendedor(vendedorFechamento, estoque.produtoId)}
                                    </div>
                                    <div className="text-sm text-gray-600">Vendeu</div>
                                  </div>
                                </div>

                                <div className="text-center">
                                  <div className="bg-orange-100 rounded-lg p-3">
                                    <AlertCircle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-orange-600">
                                      {estoque.quantidadeLevada - calcularQuantidadeVendidaVendedor(vendedorFechamento, estoque.produtoId)}
                                    </div>
                                    <div className="text-sm text-gray-600">Deve Devolver</div>
                                  </div>
                                </div>

                                <div className="text-center">
                                  <div className="bg-purple-100 rounded-lg p-3">
                                    <DollarSign className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-purple-600">
                                      {formatarMoeda(
                                        calcularQuantidadeVendidaVendedor(vendedorFechamento, estoque.produtoId) * 
                                        (produtos.find(p => p.id === estoque.produtoId)?.preco || 0)
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-600">Valor Vendido</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Truck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600">{vendedorFechamento} não tem estoque configurado para hoje.</p>
                        </div>
                      )}
                    </div>

                    {/* Comissão do Vendedor */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-2">Comissão de {vendedorFechamento}</h3>
                          <p className="text-sm opacity-90">
                            Percentual: {calcularEstatisticasVendedor(vendedorFechamento).percentualComissao}%
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">
                            {formatarMoeda(
                              obterVendasDoDiaVendedor(vendedorFechamento).reduce((acc, venda) => acc + venda.valorTotal, 0) * 
                              (calcularEstatisticasVendedor(vendedorFechamento).percentualComissao / 100)
                            )}
                          </div>
                          <div className="text-sm opacity-90">Comissão do Dia</div>
                        </div>
                      </div>
                    </div>

                    {/* Total Geral */}
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-bold">Total do Dia - {vendedorFechamento}</h4>
                          <p className="text-sm opacity-90">Resumo completo das vendas</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {formatarMoeda(obterVendasDoDiaVendedor(vendedorFechamento).reduce((acc, venda) => acc + venda.valorTotal, 0))}
                          </div>
                          <div className="text-sm opacity-90">
                            {obterVendasDoDiaVendedor(vendedorFechamento).reduce((acc, venda) => acc + venda.quantidade, 0)} pacotes vendidos
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!vendedorFechamento && (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Selecione um vendedor para ver o fechamento do dia.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Controle de Estoque */}
          {abaSelecionada === 'controleEstoque' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 w-16 h-16 rounded-2xl flex items-center justify-center">
                      <Truck className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {usuarioLogado?.tipo === 'admin' ? 'Controle de Estoque dos Vendedores' : 'Meu Estoque do Dia'}
                      </h2>
                      <p className="text-gray-600">
                        {usuarioLogado?.tipo === 'admin' 
                          ? 'Gerencie o que cada vendedor leva e deve devolver'
                          : 'Acompanhe o que você levou e precisa devolver'
                        }
                      </p>
                    </div>
                  </div>
                  {usuarioLogado?.tipo === 'admin' && (
                    <button
                      onClick={() => setMostrarControleEstoque(true)}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Estoque
                    </button>
                  )}
                </div>

                {/* Lista de Estoque */}
                <div className="space-y-4">
                  {(usuarioLogado?.tipo === 'admin' ? estoqueVendedores : obterEstoqueVendedor()).map((estoque) => (
                    <div key={estoque.id} className="bg-gray-50 rounded-xl p-6 border">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{estoque.vendedorNome}</h3>
                          <p className="text-sm text-gray-600">Data: {formatarData(estoque.data)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            estoque.status === 'ativo' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {estoque.status === 'ativo' ? 'Ativo' : 'Finalizado'}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-800 mb-3">{estoque.produtoNome}</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="bg-blue-100 rounded-lg p-3">
                              <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-blue-600">{estoque.quantidadeLevada}</div>
                              <div className="text-sm text-gray-600">Levou no Carro</div>
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="bg-green-100 rounded-lg p-3">
                              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-green-600">
                                {usuarioLogado?.tipo === 'vendedor' 
                                  ? calcularQuantidadeVendida(estoque.produtoId)
                                  : estoque.quantidadeVendida
                                }
                              </div>
                              <div className="text-sm text-gray-600">Vendeu</div>
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="bg-orange-100 rounded-lg p-3">
                              <AlertCircle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-orange-600">
                                {usuarioLogado?.tipo === 'vendedor' 
                                  ? estoque.quantidadeLevada - calcularQuantidadeVendida(estoque.produtoId)
                                  : estoque.quantidadeDevolver
                                }
                              </div>
                              <div className="text-sm text-gray-600">Deve Devolver</div>
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="bg-purple-100 rounded-lg p-3">
                              <DollarSign className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-purple-600">
                                {formatarMoeda(
                                  (usuarioLogado?.tipo === 'vendedor' 
                                    ? calcularQuantidadeVendida(estoque.produtoId)
                                    : estoque.quantidadeVendida
                                  ) * produtos.find(p => p.id === estoque.produtoId)?.preco || 0
                                )}
                              </div>
                              <div className="text-sm text-gray-600">Valor Vendido</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Barra de Progresso */}
                      <div className="bg-gray-200 rounded-full h-3 mb-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min(100, (
                              (usuarioLogado?.tipo === 'vendedor' 
                                ? calcularQuantidadeVendida(estoque.produtoId)
                                : estoque.quantidadeVendida
                              ) / estoque.quantidadeLevada
                            ) * 100)}%` 
                          }}
                        />
                      </div>
                      <div className="text-sm text-gray-600 text-center">
                        {Math.round((
                          (usuarioLogado?.tipo === 'vendedor' 
                            ? calcularQuantidadeVendida(estoque.produtoId)
                            : estoque.quantidadeVendida
                          ) / estoque.quantidadeLevada
                        ) * 100)}% vendido
                      </div>
                    </div>
                  ))}
                </div>

                {(usuarioLogado?.tipo === 'admin' ? estoqueVendedores : obterEstoqueVendedor()).length === 0 && (
                  <div className="text-center py-12">
                    <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {usuarioLogado?.tipo === 'admin' 
                        ? 'Nenhum estoque configurado para os vendedores ainda.'
                        : 'Você ainda não tem estoque configurado para hoje.'
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Modal para Adicionar Estoque (Admin) */}
              {mostrarControleEstoque && usuarioLogado?.tipo === 'admin' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Adicionar Estoque para Vendedor</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vendedor</label>
                        <select
                          value={novoEstoque.vendedorId}
                          onChange={(e) => setNovoEstoque({...novoEstoque, vendedorId: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value={0}>Selecione um vendedor</option>
                          {usuarios.filter(u => u.tipo === 'vendedor' && u.ativo).map((vendedor) => (
                            <option key={vendedor.id} value={vendedor.id}>{vendedor.nome}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Produto</label>
                        <select
                          value={novoEstoque.produtoId}
                          onChange={(e) => setNovoEstoque({...novoEstoque, produtoId: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value={0}>Selecione um produto</option>
                          {produtos.map((produto) => (
                            <option key={produto.id} value={produto.id}>{produto.nome}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade que vai levar</label>
                        <input
                          type="number"
                          min="1"
                          value={novoEstoque.quantidadeLevada}
                          onChange={(e) => setNovoEstoque({...novoEstoque, quantidadeLevada: parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Quantidade"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <button
                        onClick={adicionarEstoqueVendedor}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-red-700 transition-all"
                      >
                        Adicionar
                      </button>
                      <button
                        onClick={() => {
                          setMostrarControleEstoque(false)
                          setNovoEstoque({ vendedorId: 0, produtoId: 0, quantidadeLevada: 0 })
                        }}
                        className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fechamento do Dia (apenas vendedor) */}
          {abaSelecionada === 'fechamentoDia' && usuarioLogado?.tipo === 'vendedor' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 w-16 h-16 rounded-2xl flex items-center justify-center">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Fechamento do Dia</h2>
                    <p className="text-gray-600">Resumo das vendas de hoje - {formatarData(new Date().toISOString().split('T')[0])}</p>
                  </div>
                </div>

                {/* Resumo Geral */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <ShoppingBag className="w-8 h-8" />
                      <div className="text-right">
                        <div className="text-2xl font-bold">{obterVendasDoDia().length}</div>
                        <div className="text-sm opacity-90">Vendas Hoje</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <Package className="w-8 h-8" />
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {obterVendasDoDia().reduce((acc, venda) => acc + venda.quantidade, 0)}
                        </div>
                        <div className="text-sm opacity-90">Pacotes Vendidos</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <DollarSign className="w-8 h-8" />
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {formatarMoeda(obterVendasDoDia().reduce((acc, venda) => acc + venda.valorTotal, 0))}
                        </div>
                        <div className="text-sm opacity-90">Faturamento Total</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabela de Vendas do Dia */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Vendas Realizadas Hoje</h3>
                  
                  {obterVendasDoDia().length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 rounded-l-lg">Cliente</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Produto</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Qtd</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Pagamento</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 rounded-r-lg">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {obterVendasDoDia().map((venda) => {
                            const cliente = clientes.find(c => c.id === venda.clienteId)
                            const produto = produtos.find(p => p.id === venda.produtoId)
                            return (
                              <tr key={venda.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <div className="font-medium text-gray-900">{cliente?.nomeEmpresa}</div>
                                  <div className="text-sm text-gray-500">{cliente?.responsavelCompra}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">{produto?.nome}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{venda.quantidade}</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    venda.formaPagamento === 'Dinheiro' ? 'bg-green-100 text-green-800' :
                                    venda.formaPagamento === 'PIX' ? 'bg-blue-100 text-blue-800' :
                                    venda.formaPagamento === 'Boleto' ? 'bg-yellow-100 text-yellow-800' :
                                    venda.formaPagamento === 'Nota Feita' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {venda.formaPagamento}
                                    {venda.formaPagamento === 'Nota Feita' && venda.numeroNota && (
                                      <span className="ml-1">#{venda.numeroNota}</span>
                                    )}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm font-bold text-green-600">{formatarMoeda(venda.valorTotal)}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">Nenhuma venda realizada hoje.</p>
                    </div>
                  )}
                </div>

                {/* Resumo por Forma de Pagamento */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Resumo por Forma de Pagamento</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(calcularTotaisPorPagamento()).map(([forma, dados]) => (
                      <div key={forma} className="bg-white rounded-lg p-4 border">
                        <div className="flex items-center justify-between mb-2">
                          <CreditCard className={`w-6 h-6 ${
                            forma === 'Dinheiro' ? 'text-green-500' :
                            forma === 'PIX' ? 'text-blue-500' :
                            forma === 'Boleto' ? 'text-yellow-500' :
                            forma === 'Nota Feita' ? 'text-purple-500' :
                            'text-gray-500'
                          }`} />
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-800">{dados.quantidade}</div>
                            <div className="text-xs text-gray-600">pacotes</div>
                          </div>
                        </div>
                        <div className="border-t pt-2">
                          <div className="text-sm font-medium text-gray-700">{forma}</div>
                          <div className="text-lg font-bold text-green-600">{formatarMoeda(dados.valor)}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Geral */}
                  <div className="mt-6 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-bold">Total do Dia</h4>
                        <p className="text-sm opacity-90">Resumo completo das vendas</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {formatarMoeda(obterVendasDoDia().reduce((acc, venda) => acc + venda.valorTotal, 0))}
                        </div>
                        <div className="text-sm opacity-90">
                          {obterVendasDoDia().reduce((acc, venda) => acc + venda.quantidade, 0)} pacotes vendidos
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Acompanhar Vendedores (apenas admin) */}
          {abaSelecionada === 'acompanharVendedores' && usuarioLogado?.tipo === 'admin' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Acompanhar Vendedores</h2>
                    <p className="text-gray-600">Monitore o desempenho individual de cada vendedor</p>
                  </div>
                </div>

                {/* Seletor de Vendedor */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selecione um vendedor:</label>
                  <select
                    value={vendedorSelecionado}
                    onChange={(e) => setVendedorSelecionado(e.target.value)}
                    className="w-full max-w-md px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Escolha um vendedor</option>
                    {usuarios.filter(u => u.tipo === 'vendedor' && u.ativo).map((vendedor) => (
                      <option key={vendedor.id} value={vendedor.nome}>{vendedor.nome}</option>
                    ))}
                  </select>
                </div>

                {/* Conteúdo do Vendedor Selecionado */}
                {vendedorSelecionado && (
                  <div className="space-y-6">
                    {/* Estatísticas do Vendedor */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Estatísticas de {vendedorSelecionado}</h3>
                      {(() => {
                        const stats = calcularEstatisticasVendedor(vendedorSelecionado)
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-lg border">
                              <div className="flex items-center justify-between">
                                <User className="w-8 h-8 text-blue-500" />
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-gray-800">{stats.totalClientes}</div>
                                  <div className="text-sm text-gray-600">Total de Clientes</div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border">
                              <div className="flex items-center justify-between">
                                <ShoppingBag className="w-8 h-8 text-green-500" />
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-gray-800">{stats.vendasMes}</div>
                                  <div className="text-sm text-gray-600">Vendas no Mês</div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border">
                              <div className="flex items-center justify-between">
                                <DollarSign className="w-8 h-8 text-purple-500" />
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-gray-800">{formatarMoeda(stats.faturamentoMes)}</div>
                                  <div className="text-sm text-gray-600">Faturamento Mês</div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border">
                              <div className="flex items-center justify-between">
                                <Target className="w-8 h-8 text-orange-500" />
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-gray-800">{formatarMoeda(stats.comissaoMes)}</div>
                                  <div className="text-sm text-gray-600">Comissão ({stats.percentualComissao}%)</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </div>

                    {/* Clientes do Vendedor */}
                    <div className="bg-white rounded-xl border p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Clientes de {vendedorSelecionado}</h3>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {clientes.filter(c => c.vendedorResponsavel === vendedorSelecionado).map((cliente) => (
                          <div key={cliente.id} className="bg-gray-50 rounded-lg p-4 border">
                            <div className="mb-3">
                              <h4 className="font-bold text-gray-800">{cliente.nomeEmpresa}</h4>
                              <p className="text-sm text-gray-600">{cliente.responsavelCompra}</p>
                              <p className="text-sm text-gray-600">{cliente.cidade}, {cliente.estado}</p>
                            </div>
                            
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 mb-1"><strong>Dias de Visita:</strong></p>
                              <div className="flex flex-wrap gap-1">
                                {cliente.diasVisita.map((dia) => (
                                  <span key={dia} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                    {dia}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="border-t pt-3 space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Última Compra:</span>
                                <span className="font-medium">{formatarData(cliente.ultimaCompra)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Valor:</span>
                                <span className="font-bold text-green-600">{formatarMoeda(cliente.valorUltimaCompra)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total Compras:</span>
                                <span className="font-medium text-blue-600">{cliente.totalCompras}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {clientes.filter(c => c.vendedorResponsavel === vendedorSelecionado).length === 0 && (
                        <div className="text-center py-8">
                          <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600">Este vendedor ainda não tem clientes atribuídos.</p>
                        </div>
                      )}
                    </div>

                    {/* Vendas do Vendedor */}
                    <div className="bg-white rounded-xl border p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Vendas de {vendedorSelecionado}</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Cliente</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Produto</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Data</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Valor</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {vendas.filter(v => v.vendedorResponsavel === vendedorSelecionado).map((venda) => {
                              const cliente = clientes.find(c => c.id === venda.clienteId)
                              const produto = produtos.find(p => p.id === venda.produtoId)
                              return (
                                <tr key={venda.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-900">{cliente?.nomeEmpresa}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{produto?.nome}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{formatarData(venda.data)}</td>
                                  <td className="px-4 py-3 text-sm font-bold text-green-600">{formatarMoeda(venda.valorTotal)}</td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      venda.status === 'Concluída' ? 'bg-green-100 text-green-800' :
                                      venda.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {venda.status}
                                    </span>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {vendas.filter(v => v.vendedorResponsavel === vendedorSelecionado).length === 0 && (
                        <div className="text-center py-8">
                          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600">Este vendedor ainda não realizou vendas.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!vendedorSelecionado && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Selecione um vendedor para ver suas informações detalhadas.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Perfil do Vendedor */}
          {abaSelecionada === 'perfilVendedor' && usuarioLogado?.tipo === 'vendedor' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Meu Perfil</h2>
                    <p className="text-gray-600">Estatísticas e desempenho</p>
                  </div>
                </div>

                {(() => {
                  const stats = calcularEstatisticasVendedor(usuarioLogado.nome)
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <User className="w-8 h-8" />
                          <div className="text-right">
                            <div className="text-2xl font-bold">{stats.totalClientes}</div>
                            <div className="text-sm opacity-90">Total de Clientes</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <ShoppingBag className="w-8 h-8" />
                          <div className="text-right">
                            <div className="text-2xl font-bold">{stats.vendasMes}</div>
                            <div className="text-sm opacity-90">Vendas no Mês</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <DollarSign className="w-8 h-8" />
                          <div className="text-right">
                            <div className="text-2xl font-bold">{formatarMoeda(stats.faturamentoMes)}</div>
                            <div className="text-sm opacity-90">Faturamento Mês</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <Target className="w-8 h-8" />
                          <div className="text-right">
                            <div className="text-2xl font-bold">{formatarMoeda(stats.comissaoMes)}</div>
                            <div className="text-sm opacity-90">Comissão ({stats.percentualComissao}%)</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Meus Clientes */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Meus Clientes</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {clientes.filter(c => c.vendedorResponsavel === usuarioLogado?.nome).map((cliente) => (
                    <div key={cliente.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 mb-1">{cliente.nomeEmpresa}</h4>
                          <p className="text-sm text-gray-600 mb-1">{cliente.responsavelCompra}</p>
                          <p className="text-sm text-gray-600">{cliente.cidade}, {cliente.estado}</p>
                        </div>
                        <button
                          onClick={() => iniciarAlteracaoRota(cliente)}
                          className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                          title="Alterar dias de visita"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-2"><strong>Dias de Visita:</strong></p>
                        <div className="flex flex-wrap gap-1">
                          {cliente.diasVisita.map((dia) => (
                            <span key={dia} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs">
                              {dia}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-3 space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Última Compra:</span>
                          <span className="font-medium">{formatarData(cliente.ultimaCompra)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Valor:</span>
                          <span className="font-bold text-green-600">{formatarMoeda(cliente.valorUltimaCompra)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Total Compras:</span>
                          <span className="font-medium text-blue-600">{cliente.totalCompras}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {clientes.filter(c => c.vendedorResponsavel === usuarioLogado?.nome).length === 0 && (
                  <div className="text-center py-12">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Você ainda não tem clientes atribuídos.</p>
                  </div>
                )}
              </div>

              {/* Minhas Vendas Recentes */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Minhas Vendas Recentes</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Cliente</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Produto</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Data</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {vendas.filter(v => v.vendedorResponsavel === usuarioLogado?.nome).slice(0, 5).map((venda) => {
                        const cliente = clientes.find(c => c.id === venda.clienteId)
                        const produto = produtos.find(p => p.id === venda.produtoId)
                        return (
                          <tr key={venda.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{cliente?.nomeEmpresa}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{produto?.nome}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatarData(venda.data)}</td>
                            <td className="px-4 py-3 text-sm font-bold text-green-600">{formatarMoeda(venda.valorTotal)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {vendas.filter(v => v.vendedorResponsavel === usuarioLogado?.nome).length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Você ainda não realizou vendas.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal para Alterar Rota */}
          {clienteAlterandoRota && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Alterar Dias de Visita</h3>
                <p className="text-gray-600 mb-4">Cliente: <strong>{clienteAlterandoRota.nomeEmpresa}</strong></p>
                
                <div className="space-y-3 mb-6">
                  <label className="block text-sm font-medium text-gray-700">Selecione os dias:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {diasSemana.map((dia) => (
                      <button
                        key={dia}
                        onClick={() => toggleDiaRota(dia)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                          novosDiasVisita.includes(dia)
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {dia}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={salvarAlteracaoRota}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      setClienteAlterandoRota(null)
                      setNovosDiasVisita([])
                    }}
                    className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Gerenciamento de Usuários (apenas admin) */}
          {abaSelecionada === 'usuarios' && usuarioLogado?.tipo === 'admin' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Gerenciar Usuários</h2>
                  <button
                    onClick={() => setMostrarAdicionarVendedor(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Adicionar Vendedor
                  </button>
                </div>
                
                <div className="grid gap-6">
                  {usuarios.filter(u => u.tipo === 'vendedor').map((usuario) => (
                    <div key={usuario.id} className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            usuario.ativo ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">{usuario.nome}</h3>
                            <p className="text-sm text-gray-600">{usuario.email}</p>
                            <p className="text-xs text-gray-500">
                              Registrado em: {formatarData(usuario.dataRegistro)}
                              {usuario.criadoPor && ` • Criado por: ${usuario.criadoPor}`}
                              {usuario.comissao && ` • Comissão: ${usuario.comissao}%`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            usuario.ativo 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {usuario.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => iniciarEdicaoVendedor(usuario)}
                              className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                              title="Editar vendedor"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => iniciarTrocaSenhaVendedor(usuario)}
                              className="p-2 bg-yellow-100 text-yellow-600 hover:bg-yellow-200 rounded-lg transition-colors"
                              title="Trocar senha"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => alternarStatusVendedor(usuario.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                usuario.ativo
                                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                  : 'bg-green-100 text-green-600 hover:bg-green-200'
                              }`}
                              title={usuario.ativo ? 'Desativar vendedor' : 'Ativar vendedor'}
                            >
                              {usuario.ativo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                            
                            <button
                              onClick={() => excluirVendedor(usuario.id)}
                              className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                              title="Excluir vendedor"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {usuarios.filter(u => u.tipo === 'vendedor').length === 0 && (
                  <div className="text-center py-12">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum vendedor cadastrado ainda.</p>
                  </div>
                )}
              </div>

              {/* Modal para Adicionar Vendedor */}
              {mostrarAdicionarVendedor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Adicionar Novo Vendedor</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                        <input
                          type="text"
                          value={novoVendedor.nome}
                          onChange={(e) => setNovoVendedor({...novoVendedor, nome: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Nome do vendedor"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={novoVendedor.email}
                          onChange={(e) => setNovoVendedor({...novoVendedor, email: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="email@exemplo.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                        <input
                          type="password"
                          value={novoVendedor.senha}
                          onChange={(e) => setNovoVendedor({...novoVendedor, senha: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Senha do vendedor"
                        />
                      </div>
                    </div>

                    {erroAdicionarVendedor && (
                      <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                        {erroAdicionarVendedor}
                      </div>
                    )}

                    <div className="flex gap-4 mt-6">
                      <button
                        onClick={adicionarVendedor}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
                      >
                        Adicionar
                      </button>
                      <button
                        onClick={() => {
                          setMostrarAdicionarVendedor(false)
                          setNovoVendedor({ nome: '', email: '', senha: '' })
                          setErroAdicionarVendedor('')
                        }}
                        className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal para Editar Vendedor */}
              {vendedorEditando && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Editar Vendedor</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                        <input
                          type="text"
                          value={dadosEdicaoVendedor.nome}
                          onChange={(e) => setDadosEdicaoVendedor({...dadosEdicaoVendedor, nome: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nome do vendedor"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={dadosEdicaoVendedor.email}
                          onChange={(e) => setDadosEdicaoVendedor({...dadosEdicaoVendedor, email: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="email@exemplo.com"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <button
                        onClick={salvarEdicaoVendedor}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => {
                          setVendedorEditando(null)
                          setDadosEdicaoVendedor({ nome: '', email: '' })
                        }}
                        className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal para Trocar Senha do Vendedor */}
              {vendedorTrocandoSenha && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <Key className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Trocar Senha</h3>
                        <p className="text-sm text-gray-600">Vendedor: {vendedorTrocandoSenha.nome}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                        <input
                          type="password"
                          value={novaSenhaVendedor}
                          onChange={(e) => setNovaSenhaVendedor(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          placeholder="Digite a nova senha"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
                        <input
                          type="password"
                          value={confirmarNovaSenha}
                          onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          placeholder="Confirme a nova senha"
                        />
                      </div>
                    </div>

                    {erroTrocarSenha && (
                      <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                        {erroTrocarSenha}
                      </div>
                    )}

                    <div className="flex gap-4 mt-6">
                      <button
                        onClick={trocarSenhaVendedor}
                        className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:from-yellow-600 hover:to-orange-700 transition-all"
                      >
                        Alterar Senha
                      </button>
                      <button
                        onClick={() => {
                          setVendedorTrocandoSenha(null)
                          setNovaSenhaVendedor('')
                          setConfirmarNovaSenha('')
                          setErroTrocarSenha('')
                        }}
                        className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal para Editar Cliente (admin) */}
          {clienteEditando && dadosEdicaoCliente && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Editar Cliente</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa</label>
                    <input
                      type="text"
                      value={dadosEdicaoCliente.nomeEmpresa}
                      onChange={(e) => setDadosEdicaoCliente({...dadosEdicaoCliente, nomeEmpresa: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Responsável</label>
                    <input
                      type="text"
                      value={dadosEdicaoCliente.responsavelCompra}
                      onChange={(e) => setDadosEdicaoCliente({...dadosEdicaoCliente, responsavelCompra: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={dadosEdicaoCliente.email}
                      onChange={(e) => setDadosEdicaoCliente({...dadosEdicaoCliente, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={dadosEdicaoCliente.telefone}
                      onChange={(e) => setDadosEdicaoCliente({...dadosEdicaoCliente, telefone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                    <input
                      type="text"
                      value={dadosEdicaoCliente.endereco}
                      onChange={(e) => setDadosEdicaoCliente({...dadosEdicaoCliente, endereco: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                    <input
                      type="text"
                      value={dadosEdicaoCliente.cidade}
                      onChange={(e) => setDadosEdicaoCliente({...dadosEdicaoCliente, cidade: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <input
                      type="text"
                      value={dadosEdicaoCliente.estado}
                      onChange={(e) => setDadosEdicaoCliente({...dadosEdicaoCliente, estado: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vendedor Responsável</label>
                    <select
                      value={dadosEdicaoCliente.vendedorResponsavel}
                      onChange={(e) => setDadosEdicaoCliente({...dadosEdicaoCliente, vendedorResponsavel: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione um vendedor</option>
                      {vendedoresAtivos.map((vendedor) => (
                        <option key={vendedor} value={vendedor}>{vendedor}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dias de Visita</label>
                    <div className="grid grid-cols-4 gap-2">
                      {diasSemana.map((dia) => (
                        <button
                          key={dia}
                          onClick={() => {
                            const novosDias = dadosEdicaoCliente.diasVisita.includes(dia)
                              ? dadosEdicaoCliente.diasVisita.filter(d => d !== dia)
                              : [...dadosEdicaoCliente.diasVisita, dia]
                            setDadosEdicaoCliente({...dadosEdicaoCliente, diasVisita: novosDias})
                          }}
                          className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                            dadosEdicaoCliente.diasVisita.includes(dia)
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {dia}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                    <textarea
                      value={dadosEdicaoCliente.observacoes}
                      onChange={(e) => setDadosEdicaoCliente({...dadosEdicaoCliente, observacoes: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={salvarEdicaoCliente}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      setClienteEditando(null)
                      setDadosEdicaoCliente(null)
                    }}
                    className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard */}
          {abaSelecionada === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl">
                    <div className="text-3xl font-bold">{clientesFiltrados.length}</div>
                    <div className="text-sm opacity-90">
                      {usuarioLogado?.tipo === 'vendedor' ? 'Meus Clientes' : 'Total de Clientes'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl">
                    <div className="text-3xl font-bold">{produtos.length}</div>
                    <div className="text-sm opacity-90">Total de Produtos</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-xl">
                    <div className="text-3xl font-bold">
                      {formatarMoeda(vendasFiltradas.reduce((acc, venda) => acc + venda.valorTotal, 0))}
                    </div>
                    <div className="text-sm opacity-90">
                      {usuarioLogado?.tipo === 'vendedor' ? 'Meu Faturamento' : 'Faturamento Total'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-xl">
                    <div className="text-3xl font-bold">
                      {vendasFiltradas.filter(v => v.status === 'Pendente').length}
                    </div>
                    <div className="text-sm opacity-90">Vendas Pendentes</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    {usuarioLogado?.tipo === 'vendedor' ? 'Meus Últimos Clientes' : 'Últimos Clientes'}
                  </h3>
                  <div className="space-y-3">
                    {clientesFiltrados.slice(0, 3).map((cliente) => (
                      <div key={cliente.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-800">{cliente.nomeEmpresa}</div>
                          <div className="text-sm text-gray-600">{cliente.cidade}, {cliente.estado}</div>
                          <div className="text-xs text-gray-500">Criado por: {cliente.criadoPor}</div>
                        </div>
                        <div className="text-sm text-gray-500">{formatarData(cliente.ultimaCompra)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Produtos em Estoque</h3>
                  <div className="space-y-3">
                    {produtos.slice(0, 3).map((produto) => (
                      <div key={produto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-800">{produto.nome}</div>
                          <div className="text-sm text-gray-600">{produto.categoria}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{formatarMoeda(produto.preco)}</div>
                          <div className="text-sm text-gray-500">Estoque: {produto.estoque}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Produtos */}
          {abaSelecionada === 'produtos' && (
            <div className="space-y-6">
              {/* Header Produtos */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Produtos</h2>
                  <button
                    onClick={() => setAbaSelecionada('adicionarProduto')}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Produto
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar produtos por nome ou categoria..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Lista de Produtos */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {produtosFiltrados.map((produto) => (
                  <div key={produto.id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{produto.nome}</h3>
                        <div className="text-sm text-gray-600 mb-2">{produto.categoria}</div>
                        <div className="text-2xl font-bold text-green-600 mb-2">{formatarMoeda(produto.preco)}</div>
                      </div>
                      <button
                        onClick={() => removerProduto(produto.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <strong>Descrição:</strong> {produto.descricao}
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-sm text-gray-600">Estoque:</span>
                        <span className={`text-sm font-bold ${produto.estoque > 10 ? 'text-green-600' : produto.estoque > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {produto.estoque} unidades
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Adicionar Produto */}
          {abaSelecionada === 'adicionarProduto' && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Adicionar Novo Produto</h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Produto *</label>
                  <input
                    type="text"
                    value={novoProduto.nome}
                    onChange={(e) => setNovoProduto({...novoProduto, nome: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Nome do produto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preço *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={novoProduto.preco}
                    onChange={(e) => setNovoProduto({...novoProduto, preco: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <input
                    type="text"
                    value={novoProduto.categoria}
                    onChange={(e) => setNovoProduto({...novoProduto, categoria: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Categoria do produto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estoque</label>
                  <input
                    type="number"
                    value={novoProduto.estoque}
                    onChange={(e) => setNovoProduto({...novoProduto, estoque: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Quantidade em estoque"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <textarea
                    value={novoProduto.descricao}
                    onChange={(e) => setNovoProduto({...novoProduto, descricao: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Descrição do produto"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={adicionarProduto}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
                >
                  Adicionar Produto
                </button>
                <button
                  onClick={() => setAbaSelecionada('produtos')}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Rotas */}
          {abaSelecionada === 'rotas' && (
            <div className="space-y-6">
              {/* Barra de Busca e Filtro */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {usuarioLogado?.tipo === 'vendedor' ? 'Minhas Rotas de Entrega' : 'Rotas de Entrega'}
                  </h2>
                  {diaSelecionado && (
                    <button
                      onClick={() => setDiaSelecionado(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-600 transition-all flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Voltar
                    </button>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar clientes..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={filtroRotas}
                      onChange={(e) => setFiltroRotas(e.target.value)}
                      className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="">Todos os dias</option>
                      {diasSemana.map((dia) => (
                        <option key={dia} value={dia}>{dia}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Se um dia foi selecionado, mostrar apenas os clientes desse dia */}
              {diaSelecionado ? (
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <Calendar className="w-6 h-6 mr-2 text-blue-500" />
                    Clientes de {diaSelecionado}
                    {usuarioLogado?.tipo === 'vendedor' && ' (Meus Clientes)'}
                  </h3>
                  
                  {clientesPorDia(diaSelecionado).length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {clientesPorDia(diaSelecionado).map((cliente) => (
                        <div key={cliente.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800 mb-1">{cliente.nomeEmpresa}</h4>
                              <p className="text-sm text-gray-600 mb-1">{cliente.responsavelCompra}</p>
                              <p className="text-sm text-gray-600">{cliente.cidade}, {cliente.estado}</p>
                            </div>
                            {cliente.latitude && cliente.longitude && (
                              <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-3">
                            <p className="mb-1"><strong>Endereço:</strong> {cliente.endereco}</p>
                            <p><strong>Telefone:</strong> {cliente.telefone}</p>
                          </div>

                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-2"><strong>Vendedor:</strong></p>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-xs">
                              {cliente.vendedorResponsavel}
                            </span>
                          </div>
                          
                          {cliente.latitude && cliente.longitude && (
                            <>
                              <div className="text-xs text-gray-500 mb-3">
                                <strong>Coordenadas:</strong><br />
                                Lat: {cliente.latitude.toFixed(6)}<br />
                                Lng: {cliente.longitude.toFixed(6)}
                              </div>
                              
                              <button
                                onClick={() => window.open(`https://www.google.com/maps?q=${cliente.latitude},${cliente.longitude}`, '_blank')}
                                className="w-full bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                              >
                                <Navigation className="w-4 h-4" />
                                Ver no Google Maps
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {usuarioLogado?.tipo === 'vendedor' 
                          ? `Você não tem clientes agendados para ${diaSelecionado}.`
                          : `Nenhum cliente agendado para ${diaSelecionado}.`
                        }
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Cartões dos Dias da Semana */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                    {diasSemana.map((dia) => (
                      <div 
                        key={dia} 
                        onClick={() => setDiaSelecionado(dia)}
                        className={`bg-gradient-to-r ${coresDias[dia as keyof typeof coresDias]} text-white p-4 rounded-xl text-center hover:shadow-lg transition-all cursor-pointer transform hover:scale-105`}
                      >
                        <Calendar className="w-8 h-8 mx-auto mb-2" />
                        <h3 className="font-bold text-lg">{dia}</h3>
                        <p className="text-sm opacity-90">
                          {contarClientesPorDia(dia)} cliente{contarClientesPorDia(dia) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Cartões de Resumo */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                      <Route className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                      <h3 className="text-2xl font-bold text-gray-800">{clientesFiltrados.length}</h3>
                      <p className="text-gray-600">
                        {usuarioLogado?.tipo === 'vendedor' ? 'Meus Clientes' : 'Total de Clientes'}
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                      <MapPin className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <h3 className="text-2xl font-bold text-gray-800">
                        {clientesFiltrados.filter(c => c.latitude && c.longitude).length}
                      </h3>
                      <p className="text-gray-600">Com Localização</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                      <Navigation className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                      <h3 className="text-2xl font-bold text-gray-800">
                        {diasSemana.reduce((acc, dia) => acc + (contarClientesPorDia(dia) > 0 ? 1 : 0), 0)}
                      </h3>
                      <p className="text-gray-600">Rotas Ativas</p>
                    </div>
                  </div>

                  {/* Lista de Clientes por Localização */}
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">
                      {usuarioLogado?.tipo === 'vendedor' ? 'Meus Clientes com Localização' : 'Clientes com Localização'}
                    </h3>
                    
                    {clientesFiltrados.filter(cliente => 
                      cliente.latitude && 
                      cliente.longitude &&
                      (filtroRotas === '' || cliente.diasVisita.includes(filtroRotas)) &&
                      (busca === '' || 
                       cliente.nomeEmpresa.toLowerCase().includes(busca.toLowerCase()) ||
                       cliente.cidade.toLowerCase().includes(busca.toLowerCase()) ||
                       cliente.responsavelCompra.toLowerCase().includes(busca.toLowerCase())
                      )
                    ).length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {clientesFiltrados.filter(cliente => 
                          cliente.latitude && 
                          cliente.longitude &&
                          (filtroRotas === '' || cliente.diasVisita.includes(filtroRotas)) &&
                          (busca === '' || 
                           cliente.nomeEmpresa.toLowerCase().includes(busca.toLowerCase()) ||
                           cliente.cidade.toLowerCase().includes(busca.toLowerCase()) ||
                           cliente.responsavelCompra.toLowerCase().includes(busca.toLowerCase())
                          )
                        ).map((cliente) => (
                          <div key={cliente.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors border border-gray-200">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-800 mb-1">{cliente.nomeEmpresa}</h4>
                                <p className="text-sm text-gray-600 mb-1">{cliente.responsavelCompra}</p>
                                <p className="text-sm text-gray-600">{cliente.cidade}, {cliente.estado}</p>
                              </div>
                              <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-3">
                              <p className="mb-1"><strong>Endereço:</strong> {cliente.endereco}</p>
                              <p><strong>Telefone:</strong> {cliente.telefone}</p>
                            </div>

                            <div className="mb-3">
                              <p className="text-sm text-gray-600 mb-2"><strong>Dias de Visita:</strong></p>
                              <div className="flex flex-wrap gap-1">
                                {cliente.diasVisita.map((dia) => (
                                  <span key={dia} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs">
                                    {dia}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="text-xs text-gray-500 mb-3">
                              <strong>Coordenadas:</strong><br />
                              Lat: {cliente.latitude?.toFixed(6)}<br />
                              Lng: {cliente.longitude?.toFixed(6)}
                            </div>
                            
                            <button
                              onClick={() => window.open(`https://www.google.com/maps?q=${cliente.latitude},${cliente.longitude}`, '_blank')}
                              className="w-full bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                            >
                              <Navigation className="w-4 h-4" />
                              Ver no Google Maps
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                          {filtroRotas || busca ? 'Nenhum cliente encontrado com os filtros aplicados.' : 
                           usuarioLogado?.tipo === 'vendedor' ? 'Você ainda não tem clientes com localização cadastrada.' :
                           'Nenhum cliente com localização cadastrada ainda.'}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          {!filtroRotas && !busca && 'Adicione clientes com localização para ver as rotas aqui.'}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Relatórios */}
          {abaSelecionada === 'relatorios' && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Relatórios</h2>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Seção de relatórios em desenvolvimento</p>
              </div>
            </div>
          )}

          {/* Clientes */}
          {abaSelecionada === 'clientes' && (
            <div className="space-y-6">
              {/* Busca */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {usuarioLogado?.tipo === 'vendedor' ? 'Meus Clientes' : 'Clientes'}
                  </h2>
                  <button
                    onClick={() => setAbaSelecionada('adicionar')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Cliente
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar clientes por empresa, responsável, cidade ou email..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Lista de Clientes */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {clientesFiltrados.map((cliente) => (
                  <div key={cliente.id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{cliente.nomeEmpresa}</h3>
                        <div className="text-sm text-gray-600 mb-2">Responsável: {cliente.responsavelCompra}</div>
                        <div className="flex items-center text-gray-600 mb-2">
                          <Building2 className="w-4 h-4 mr-2" />
                          <span className="text-sm">{cliente.documento}</span>
                        </div>
                        <div className="flex items-center text-gray-600 mb-2">
                          <Mail className="w-4 h-4 mr-2" />
                          <span className="text-sm">{cliente.email}</span>
                        </div>
                        <div className="flex items-center text-gray-600 mb-2">
                          <Phone className="w-4 h-4 mr-2" />
                          <span className="text-sm">{cliente.telefone}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {usuarioLogado?.tipo === 'admin' && (
                          <button
                            onClick={() => iniciarEdicaoCliente(cliente)}
                            className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                            title="Editar cliente"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {(usuarioLogado?.tipo === 'vendedor' && cliente.vendedorResponsavel === usuarioLogado.nome) && (
                          <button
                            onClick={() => iniciarAlteracaoRota(cliente)}
                            className="p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg transition-colors"
                            title="Alterar dias de visita"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <div>{cliente.endereco}</div>
                          <div>{cliente.cidade}, {cliente.estado}</div>
                          {cliente.latitude && cliente.longitude && (
                            <div className="text-xs text-gray-500 mt-1">
                              GPS: {cliente.latitude.toFixed(4)}, {cliente.longitude.toFixed(4)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <div className="text-sm text-gray-600 mb-2">Dias de Visita:</div>
                        <div className="flex flex-wrap gap-1">
                          {cliente.diasVisita.map((dia) => (
                            <span key={dia} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs">
                              {dia}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <div className="text-sm text-gray-600 mb-1">Vendedor Responsável:</div>
                        <div className="text-sm font-medium text-gray-800">{cliente.vendedorResponsavel}</div>
                      </div>

                      <div className="border-t pt-3">
                        <div className="text-sm text-gray-600 mb-1">Criado por:</div>
                        <div className="text-sm font-medium text-blue-600">{cliente.criadoPor}</div>
                      </div>

                      {cliente.observacoes && (
                        <div className="border-t pt-3">
                          <div className="text-sm text-gray-600 mb-1">Observações:</div>
                          <div className="text-sm text-gray-800">{cliente.observacoes}</div>
                        </div>
                      )}

                      <div className="border-t pt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Última Compra:</span>
                          <span className="text-sm font-medium">{formatarData(cliente.ultimaCompra)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Valor:</span>
                          <span className="text-sm font-bold text-green-600">{formatarMoeda(cliente.valorUltimaCompra)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total de Compras:</span>
                          <span className="text-sm font-medium text-blue-600">{cliente.totalCompras}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {clientesFiltrados.length === 0 && (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {usuarioLogado?.tipo === 'vendedor' 
                      ? 'Você ainda não tem clientes atribuídos.'
                      : 'Nenhum cliente encontrado.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Vendas */}
          {abaSelecionada === 'vendas' && (
            <div className="space-y-6">
              {/* Header Vendas */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {usuarioLogado?.tipo === 'vendedor' ? 'Minhas Vendas' : 'Histórico de Vendas'}
                  </h2>
                  <button
                    onClick={() => setAbaSelecionada('registrarVenda')}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Registrar Venda
                  </button>
                </div>
              </div>

              {/* Lista de Vendas */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Cliente</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Produto</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Data</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Qtd</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Valor Total</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Pagamento</th>
                        {usuarioLogado?.tipo === 'admin' && (
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Vendedor</th>
                        )}
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {vendasFiltradas.map((venda) => {
                        const cliente = clientes.find(c => c.id === venda.clienteId)
                        const produto = produtos.find(p => p.id === venda.produtoId)
                        return (
                          <tr key={venda.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{cliente?.nomeEmpresa}</div>
                              <div className="text-sm text-gray-500">{cliente?.cidade}, {cliente?.estado}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{produto?.nome}</div>
                              <div className="text-sm text-gray-500">{formatarMoeda(venda.precoUnitario)} cada</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{formatarData(venda.data)}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{venda.quantidade}</td>
                            <td className="px-6 py-4 text-sm font-bold text-green-600">{formatarMoeda(venda.valorTotal)}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                venda.formaPagamento === 'Dinheiro' ? 'bg-green-100 text-green-800' :
                                venda.formaPagamento === 'PIX' ? 'bg-blue-100 text-blue-800' :
                                venda.formaPagamento === 'Boleto' ? 'bg-yellow-100 text-yellow-800' :
                                venda.formaPagamento === 'Nota Feita' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {venda.formaPagamento}
                                {venda.formaPagamento === 'Nota Feita' && venda.numeroNota && (
                                  <span className="ml-1">#{venda.numeroNota}</span>
                                )}
                              </span>
                            </td>
                            {usuarioLogado?.tipo === 'admin' && (
                              <td className="px-6 py-4 text-sm text-gray-900">{venda.vendedorResponsavel}</td>
                            )}
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                venda.status === 'Concluída' ? 'bg-green-100 text-green-800' :
                                venda.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {venda.status}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {vendasFiltradas.length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {usuarioLogado?.tipo === 'vendedor' 
                        ? 'Você ainda não realizou vendas.'
                        : 'Nenhuma venda registrada ainda.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Registrar Venda */}
          {abaSelecionada === 'registrarVenda' && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Nova Venda</h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
                  <select
                    value={novaVenda.clienteId}
                    onChange={(e) => setNovaVenda({...novaVenda, clienteId: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={0}>Selecione um cliente</option>
                    {clientesFiltrados.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nomeEmpresa} - {cliente.responsavelCompra}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Produto *</label>
                  <select
                    value={novaVenda.produtoId}
                    onChange={(e) => {
                      const produtoId = parseInt(e.target.value)
                      const produto = produtos.find(p => p.id === produtoId)
                      setNovaVenda({
                        ...novaVenda, 
                        produtoId,
                        precoUnitario: produto?.preco || 0
                      })
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={0}>Selecione um produto</option>
                    {produtos.map((produto) => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome} - {formatarMoeda(produto.preco)} (Estoque: {produto.estoque})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade *</label>
                  <input
                    type="number"
                    min="1"
                    value={novaVenda.quantidade}
                    onChange={(e) => setNovaVenda({...novaVenda, quantidade: parseInt(e.target.value) || 1})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preço Unitário</label>
                  <input
                    type="number"
                    step="0.01"
                    value={novaVenda.precoUnitario}
                    onChange={(e) => setNovaVenda({...novaVenda, precoUnitario: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                    placeholder="0.00"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data da Venda *</label>
                  <input
                    type="date"
                    value={novaVenda.data}
                    onChange={(e) => setNovaVenda({...novaVenda, data: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento *</label>
                  <select
                    value={novaVenda.formaPagamento}
                    onChange={(e) => setNovaVenda({...novaVenda, formaPagamento: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {formasPagamento.map((forma) => (
                      <option key={forma} value={forma}>{forma}</option>
                    ))}
                  </select>
                </div>

                {/* Campo condicional para número da nota */}
                {novaVenda.formaPagamento === 'Nota Feita' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número da Nota *
                      <span className="text-red-500 ml-1">(Obrigatório para Nota Feita)</span>
                    </label>
                    <input
                      type="text"
                      value={novaVenda.numeroNota}
                      onChange={(e) => setNovaVenda({...novaVenda, numeroNota: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Digite o número da nota"
                      required
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valor Total</label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-2xl font-bold text-green-600">
                    {formatarMoeda(novaVenda.quantidade * novaVenda.precoUnitario)}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                  <textarea
                    value={novaVenda.observacoes}
                    onChange={(e) => setNovaVenda({...novaVenda, observacoes: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Observações sobre a venda..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={registrarVenda}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transition-all"
                >
                  Registrar Venda
                </button>
                <button
                  onClick={() => setAbaSelecionada('vendas')}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Adicionar Cliente */}
          {abaSelecionada === 'adicionar' && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Novo Cliente</h2>
              
              {/* Informações Básicas */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Informações Básicas
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa/Cliente *</label>
                    <input
                      type="text"
                      value={novoCliente.nomeEmpresa}
                      onChange={(e) => setNovoCliente({...novoCliente, nomeEmpresa: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome da empresa ou cliente"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Responsável pela Compra *</label>
                    <input
                      type="text"
                      value={novoCliente.responsavelCompra}
                      onChange={(e) => setNovoCliente({...novoCliente, responsavelCompra: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome do responsável"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento</label>
                    <select
                      value={novoCliente.tipoDocumento}
                      onChange={(e) => setNovoCliente({...novoCliente, tipoDocumento: e.target.value as 'CNPJ' | 'CPF'})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="CNPJ">CNPJ</option>
                      <option value="CPF">CPF</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{novoCliente.tipoDocumento}</label>
                    <input
                      type="text"
                      value={novoCliente.documento}
                      onChange={(e) => setNovoCliente({...novoCliente, documento: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={novoCliente.tipoDocumento === 'CNPJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                    />
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Contato
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={novoCliente.email}
                      onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={novoCliente.telefone}
                      onChange={(e) => setNovoCliente({...novoCliente, telefone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Endereço
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Endereço Completo</label>
                    <input
                      type="text"
                      value={novoCliente.endereco}
                      onChange={(e) => setNovoCliente({...novoCliente, endereco: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Rua, número, bairro"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                    <input
                      type="text"
                      value={novoCliente.cidade}
                      onChange={(e) => setNovoCliente({...novoCliente, cidade: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome da cidade"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <input
                      type="text"
                      value={novoCliente.estado}
                      onChange={(e) => setNovoCliente({...novoCliente, estado: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="SP, RJ, MG..."
                    />
                  </div>
                </div>

                {/* Seção de Localização */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-800">Capturar Localização</h4>
                    <button
                      onClick={obterLocalizacao}
                      disabled={carregandoLocalizacao}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {carregandoLocalizacao ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Obtendo...
                        </>
                      ) : (
                        <>
                          <Navigation className="w-4 h-4" />
                          Obter Localização
                        </>
                      )}
                    </button>
                  </div>
                  
                  {localizacaoAtual && (
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-sm text-gray-600">
                        <strong>Localização capturada:</strong><br />
                        Latitude: {localizacaoAtual.latitude.toFixed(6)}<br />
                        Longitude: {localizacaoAtual.longitude.toFixed(6)}
                      </div>
                      <button
                        onClick={() => window.open(`https://www.google.com/maps?q=${localizacaoAtual.latitude},${localizacaoAtual.longitude}`, '_blank')}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        <MapPin className="w-4 h-4" />
                        Ver no Google Maps
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Dias de Visita */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Dias de Visita
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {diasSemana.map((dia) => (
                    <button
                      key={dia}
                      onClick={() => toggleDiaVisita(dia)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                        novoCliente.diasVisita.includes(dia)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {dia}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vendedor Responsável */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Vendedor Responsável
                </h3>
                <select
                  value={novoCliente.vendedorResponsavel}
                  onChange={(e) => setNovoCliente({...novoCliente, vendedorResponsavel: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione um vendedor</option>
                  {vendedoresAtivos.map((vendedor) => (
                    <option key={vendedor} value={vendedor}>{vendedor}</option>
                  ))}
                </select>
              </div>

              {/* Observações */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Observações
                </h3>
                <textarea
                  value={novoCliente.observacoes}
                  onChange={(e) => setNovoCliente({...novoCliente, observacoes: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Observações gerais sobre o cliente..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={adicionarCliente}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setAbaSelecionada('clientes')}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}