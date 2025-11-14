"use client"

import { useState, useEffect } from 'react'
import { Plus, MapPin, Calendar, ShoppingBag, User, Phone, Mail, Search, Filter, Home, Package, Route, BarChart3, Menu, X, Navigation, Trash2, Edit, Building2, FileText, CreditCard, Lock, Eye, EyeOff, UserCheck, UserX, Shield, UserPlus, TrendingUp, DollarSign, Target, Users, Clock, Key, Truck, CheckCircle, AlertCircle, Database, Settings, Minus } from 'lucide-react'

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
  criadoPor: string
}

interface Produto {
  id: number
  nome: string
  preco: number
  categoria: string
  estoque: number
  descricao: string
}

interface ItemCarrinho {
  produtoId: number
  quantidade: number
  precoUnitario: number
  precoComDesconto: number
}

interface Venda {
  id: number
  clienteId: number
  produtoId: number
  data: string
  quantidade: number
  precoUnitario: number
  precoComDesconto: number
  valorTotal: number
  formaPagamento: string
  observacoes: string
  status: 'Concluída' | 'Pendente' | 'Cancelada'
  vendedorResponsavel: string
  numeroNota?: string
  statusPagamento?: 'Pago' | 'Pendente'
}

interface Usuario {
  id: number
  nome: string
  email: string
  senha: string
  tipo: 'admin' | 'vendedor'
  ativo: boolean
  dataRegistro: string
  criadoPor?: string
  comissao?: number
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
  const [mostrarCriarConta, setMostrarCriarConta] = useState(false)
  const [dadosCriarConta, setDadosCriarConta] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    tipo: 'vendedor' as 'admin' | 'vendedor'
  })

  // Estados para filtros de relatórios (vendedor)
  const [dataInicialRelatorio, setDataInicialRelatorio] = useState<string>(new Date().toISOString().split('T')[0])
  const [dataFinalRelatorio, setDataFinalRelatorio] = useState<string>(new Date().toISOString().split('T')[0])
  const [filtroAtivoRelatorio, setFiltroAtivoRelatorio] = useState<'hoje' | 'ontem' | 'semana' | 'mes' | 'personalizado'>('hoje')

  // Estados para adicionar vendedor (admin)
  const [mostrarAdicionarVendedor, setMostrarAdicionarVendedor] = useState(false)
  const [novoVendedor, setNovoVendedor] = useState({
    nome: '',
    email: '',
    senha: '',
    comissao: 5
  })

  // Estados para editar vendedor
  const [vendedorEditando, setVendedorEditando] = useState<Usuario | null>(null)
  const [dadosEdicaoVendedor, setDadosEdicaoVendedor] = useState({
    nome: '',
    email: '',
    comissao: 5
  })

  // Estados para trocar senha do vendedor (admin)
  const [vendedorTrocandoSenha, setVendedorTrocandoSenha] = useState<Usuario | null>(null)
  const [novaSenhaVendedor, setNovaSenhaVendedor] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')

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
  const [dataInicialFechamento, setDataInicialFechamento] = useState<string>(new Date().toISOString().split('T')[0])
  const [dataFinalFechamento, setDataFinalFechamento] = useState<string>(new Date().toISOString().split('T')[0])

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

  // Estados para edição de produtos (admin)
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null)
  const [dadosEdicaoProduto, setDadosEdicaoProduto] = useState<Produto | null>(null)

  // Estados para configuração do banco
  const [mostrarConfigBanco, setMostrarConfigBanco] = useState(false)
  const [statusBanco, setStatusBanco] = useState<'conectado' | 'desconectado' | 'configurando'>('desconectado')

  // Estados para carrinho de compras
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])

  // Usuários do sistema
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      id: 1,
      nome: 'Admin',
      email: 'admin',
      senha: 'admin',
      tipo: 'admin',
      ativo: true,
      dataRegistro: '2024-01-01'
    },
    {
      id: 2,
      nome: 'João Silva',
      email: 'joao@vendas.com',
      senha: '123456',
      tipo: 'vendedor',
      ativo: true,
      dataRegistro: '2024-01-15',
      criadoPor: 'Admin',
      comissao: 5
    },
    {
      id: 3,
      nome: 'Maria Santos',
      email: 'maria@vendas.com',
      senha: '123456',
      tipo: 'vendedor',
      ativo: true,
      dataRegistro: '2024-01-20',
      criadoPor: 'Admin',
      comissao: 7
    },
    {
      id: 4,
      nome: 'Welton Silva',
      email: 'welton@vendas.com',
      senha: '123456',
      tipo: 'vendedor',
      ativo: true,
      dataRegistro: '2024-01-25',
      criadoPor: 'Admin',
      comissao: 6
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
      vendedorResponsavel: "João Silva",
      observacoes: "Cliente preferencial, sempre paga em dia",
      ultimaCompra: "2024-01-15",
      valorUltimaCompra: 250.00,
      totalCompras: 15,
      criadoPor: "Admin"
    },
    {
      id: 2,
      nomeEmpresa: "Mercadinho Central",
      responsavelCompra: "José Santos",
      tipoDocumento: "CNPJ",
      documento: "98.765.432/0001-10",
      email: "jose@mercadinhocentral.com",
      telefone: "(11) 88888-8888",
      endereco: "Av. Central, 456",
      cidade: "São Paulo",
      estado: "SP",
      latitude: -23.5489,
      longitude: -46.6388,
      diasVisita: ["Terça", "Quinta"],
      vendedorResponsavel: "Maria Santos",
      observacoes: "Gosta de produtos premium",
      ultimaCompra: "2024-01-18",
      valorUltimaCompra: 180.00,
      totalCompras: 8,
      criadoPor: "Admin"
    },
    {
      id: 3,
      nomeEmpresa: "Lanchonete do Bairro",
      responsavelCompra: "Ana Costa",
      tipoDocumento: "CNPJ",
      documento: "11.222.333/0001-44",
      email: "ana@lanchonete.com",
      telefone: "(11) 77777-7777",
      endereco: "Rua do Comércio, 789",
      cidade: "São Paulo",
      estado: "SP",
      latitude: -23.5520,
      longitude: -46.6300,
      diasVisita: ["Segunda", "Quinta", "Sábado"],
      vendedorResponsavel: "Welton Silva",
      observacoes: "Pedidos grandes aos sábados",
      ultimaCompra: "2024-01-20",
      valorUltimaCompra: 320.00,
      totalCompras: 12,
      criadoPor: "Admin"
    },
    {
      id: 4,
      nomeEmpresa: "Restaurante Sabor Caseiro",
      responsavelCompra: "Carlos Oliveira",
      tipoDocumento: "CNPJ",
      documento: "55.666.777/0001-88",
      email: "carlos@saborcaseiro.com",
      telefone: "(11) 66666-6666",
      endereco: "Praça da Alimentação, 321",
      cidade: "São Paulo",
      estado: "SP",
      latitude: -23.5470,
      longitude: -46.6420,
      diasVisita: ["Quarta", "Sexta"],
      vendedorResponsavel: "João Silva",
      observacoes: "Sempre negocia preços, bom pagador",
      ultimaCompra: "2024-01-22",
      valorUltimaCompra: 450.00,
      totalCompras: 20,
      criadoPor: "Admin"
    },
    {
      id: 5,
      nomeEmpresa: "Café da Esquina",
      responsavelCompra: "Lucia Ferreira",
      tipoDocumento: "CNPJ",
      documento: "33.444.555/0001-66",
      email: "lucia@cafedaesquina.com",
      telefone: "(11) 55555-5555",
      endereco: "Esquina da Paz, 147",
      cidade: "São Paulo",
      estado: "SP",
      latitude: -23.5530,
      longitude: -46.6280,
      diasVisita: ["Terça", "Quinta", "Sábado"],
      vendedorResponsavel: "Maria Santos",
      observacoes: "Prefere entregas pela manhã",
      ultimaCompra: "2024-01-25",
      valorUltimaCompra: 195.00,
      totalCompras: 6,
      criadoPor: "Admin"
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
      nome: "Chocolate Especial",
      preco: 8.50,
      categoria: "Doces",
      estoque: 80,
      descricao: "Chocolate artesanal premium"
    },
    {
      id: 5,
      nome: "Bala Sortida",
      preco: 3.20,
      categoria: "Doces",
      estoque: 300,
      descricao: "Mix de balas variadas"
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
      precoComDesconto: 50.00,
      valorTotal: 250.00,
      formaPagamento: "Dinheiro",
      observacoes: "Entrega realizada com sucesso",
      status: "Concluída",
      vendedorResponsavel: "João Silva",
      statusPagamento: "Pago"
    },
    {
      id: 2,
      clienteId: 2,
      produtoId: 2,
      data: "2024-01-18",
      quantidade: 7,
      precoUnitario: 25.00,
      precoComDesconto: 25.00,
      valorTotal: 175.00,
      formaPagamento: "PIX",
      observacoes: "Cliente satisfeito",
      status: "Concluída",
      vendedorResponsavel: "Maria Santos",
      statusPagamento: "Pago"
    }
  ])

  const [abaSelecionada, setAbaSelecionada] = useState<'dashboard' | 'clientes' | 'produtos' | 'vendas' | 'rotas' | 'relatorios' | 'adicionar' | 'adicionarProduto' | 'registrarVenda' | 'usuarios' | 'perfilVendedor' | 'acompanharVendedores' | 'fechamentoDia' | 'fechamentoDiaAdmin' | 'controleEstoque' | 'notasReceber' | 'configuracoes'>('dashboard')
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
    data: new Date().toISOString().split('T')[0],
    formaPagamento: 'Dinheiro',
    observacoes: '',
    numeroNota: ''
  })

  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
  const vendedoresAtivos = usuarios.filter(u => u.tipo === 'vendedor' && u.ativo).map(u => u.nome)
  const formasPagamento = ['Dinheiro', 'PIX', 'Boleto', 'Nota Feita']

  // Simulação de persistência no localStorage
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('sistemaVendas')
    if (dadosSalvos) {
      try {
        const dados = JSON.parse(dadosSalvos)
        if (dados.usuarios) setUsuarios(dados.usuarios)
        if (dados.clientes) setClientes(dados.clientes)
        if (dados.produtos) setProdutos(dados.produtos)
        if (dados.vendas) setVendas(dados.vendas)
        if (dados.estoqueVendedores) setEstoqueVendedores(dados.estoqueVendedores)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
    }
  }, [])

  // Salvar dados no localStorage sempre que houver mudanças
  useEffect(() => {
    const dados = {
      usuarios,
      clientes,
      produtos,
      vendas,
      estoqueVendedores
    }
    localStorage.setItem('sistemaVendas', JSON.stringify(dados))
  }, [usuarios, clientes, produtos, vendas, estoqueVendedores])

  // Função para aplicar filtros rápidos de data
  const aplicarFiltroRapido = (filtro: 'hoje' | 'ontem' | 'semana' | 'mes') => {
    const hoje = new Date()
    let dataInicial = new Date()
    let dataFinal = new Date()

    switch (filtro) {
      case 'hoje':
        dataInicial = hoje
        dataFinal = hoje
        break
      case 'ontem':
        dataInicial = new Date(hoje.setDate(hoje.getDate() - 1))
        dataFinal = dataInicial
        break
      case 'semana':
        dataInicial = new Date(hoje.setDate(hoje.getDate() - 7))
        dataFinal = new Date()
        break
      case 'mes':
        dataInicial = new Date(hoje.setMonth(hoje.getMonth() - 1))
        dataFinal = new Date()
        break
    }

    setDataInicialRelatorio(dataInicial.toISOString().split('T')[0])
    setDataFinalRelatorio(dataFinal.toISOString().split('T')[0])
    setFiltroAtivoRelatorio(filtro)
  }

  // Função para obter vendas do vendedor logado por período
  const obterVendasVendedorPorPeriodo = (dataInicial: string, dataFinal: string) => {
    if (!usuarioLogado || usuarioLogado.tipo !== 'vendedor') return []
    
    return vendas.filter(venda => 
      venda.vendedorResponsavel === usuarioLogado.nome && 
      venda.data >= dataInicial && 
      venda.data <= dataFinal
    )
  }

  // Função para calcular totais por forma de pagamento (vendedor por período)
  const calcularTotaisPorPagamentoVendedorPeriodo = (dataInicial: string, dataFinal: string) => {
    const vendasDoPeriodo = obterVendasVendedorPorPeriodo(dataInicial, dataFinal)
    const totais: { [key: string]: { quantidade: number, valor: number } } = {}
    
    formasPagamento.forEach(forma => {
      totais[forma] = { quantidade: 0, valor: 0 }
    })
    
    vendasDoPeriodo.forEach(venda => {
      if (totais[venda.formaPagamento]) {
        totais[venda.formaPagamento].quantidade += venda.quantidade
        totais[venda.formaPagamento].valor += venda.valorTotal
      }
    })
    
    return totais
  }

  // Função para iniciar edição de produto (admin)
  const iniciarEdicaoProduto = (produto: Produto) => {
    if (usuarioLogado?.tipo !== 'admin') return
    setProdutoEditando(produto)
    setDadosEdicaoProduto({...produto})
  }

  // Função para salvar edição de produto
  const salvarEdicaoProduto = () => {
    if (!produtoEditando || !dadosEdicaoProduto || usuarioLogado?.tipo !== 'admin') return

    if (!dadosEdicaoProduto.nome || dadosEdicaoProduto.preco <= 0) {
      alert('Nome e preço são obrigatórios e o preço deve ser maior que zero')
      return
    }

    setProdutos(produtos.map(p => 
      p.id === produtoEditando.id ? dadosEdicaoProduto : p
    ))

    setProdutoEditando(null)
    setDadosEdicaoProduto(null)
    alert('Produto atualizado com sucesso!')
  }

  // Função para obter vendas do dia atual do vendedor logado
  const obterVendasDoDia = () => {
    if (!usuarioLogado || usuarioLogado.tipo !== 'vendedor') return []
    
    const hoje = new Date().toISOString().split('T')[0]
    return vendas.filter(venda => 
      venda.vendedorResponsavel === usuarioLogado.nome && 
      venda.data === hoje
    )
  }

  // Função para obter vendas do vendedor em um período específico (admin)
  const obterVendasPorPeriodoVendedor = (nomeVendedor: string, dataInicial: string, dataFinal: string) => {
    return vendas.filter(venda => 
      venda.vendedorResponsavel === nomeVendedor && 
      venda.data >= dataInicial && 
      venda.data <= dataFinal
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

  // Função para obter notas a receber (todas para admin)
  const obterNotasAReceber = () => {
    return vendas.filter(venda => 
      venda.formaPagamento === 'Nota Feita' && 
      venda.statusPagamento === 'Pendente'
    )
  }

  // Função para obter notas a receber do vendedor logado
  const obterNotasAReceberVendedor = () => {
    if (!usuarioLogado || usuarioLogado.tipo !== 'vendedor') return []
    
    return vendas.filter(venda => 
      venda.formaPagamento === 'Nota Feita' && 
      venda.statusPagamento === 'Pendente' &&
      venda.vendedorResponsavel === usuarioLogado.nome
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

  // Função para calcular totais por forma de pagamento de um vendedor por período (admin)
  const calcularTotaisPorPagamentoPeriodoVendedor = (nomeVendedor: string, dataInicial: string, dataFinal: string) => {
    const vendasDoPeriodo = obterVendasPorPeriodoVendedor(nomeVendedor, dataInicial, dataFinal)
    const totais: { [key: string]: { quantidade: number, valor: number } } = {}
    
    formasPagamento.forEach(forma => {
      totais[forma] = { quantidade: 0, valor: 0 }
    })
    
    vendasDoPeriodo.forEach(venda => {
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

  // Funções do carrinho com desconto
  const adicionarAoCarrinho = (produtoId: number) => {
    const produto = produtos.find(p => p.id === produtoId)
    if (!produto) return

    const itemExistente = carrinho.find(item => item.produtoId === produtoId)
    
    if (itemExistente) {
      setCarrinho(carrinho.map(item => 
        item.produtoId === produtoId 
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ))
    } else {
      setCarrinho([...carrinho, {
        produtoId,
        quantidade: 1,
        precoUnitario: produto.preco,
        precoComDesconto: produto.preco
      }])
    }
  }

  const removerDoCarrinho = (produtoId: number) => {
    const itemExistente = carrinho.find(item => item.produtoId === produtoId)
    
    if (itemExistente && itemExistente.quantidade > 1) {
      setCarrinho(carrinho.map(item => 
        item.produtoId === produtoId 
          ? { ...item, quantidade: item.quantidade - 1 }
          : item
      ))
    } else {
      setCarrinho(carrinho.filter(item => item.produtoId !== produtoId))
    }
  }

  // Nova função para alterar preço com desconto no carrinho
  const alterarPrecoCarrinho = (produtoId: number, novoPreco: number) => {
    setCarrinho(carrinho.map(item => 
      item.produtoId === produtoId 
        ? { ...item, precoComDesconto: novoPreco }
        : item
    ))
  }

  const limparCarrinho = () => {
    setCarrinho([])
  }

  const calcularTotalCarrinho = () => {
    return carrinho.reduce((total, item) => total + (item.quantidade * item.precoComDesconto), 0)
  }

  // Função para registrar venda com múltiplos produtos
  const registrarVendaCarrinho = () => {
    if (!novaVenda.clienteId || carrinho.length === 0) {
      alert('Selecione um cliente e adicione produtos ao carrinho!')
      return
    }

    if (novaVenda.formaPagamento === 'Nota Feita' && !novaVenda.numeroNota.trim()) {
      alert('Para pagamento "Nota Feita", o número da nota é obrigatório!')
      return
    }

    // Criar uma venda para cada produto no carrinho
    const novasVendas: Venda[] = carrinho.map((item, index) => ({
      id: vendas.length + index + 1,
      clienteId: novaVenda.clienteId,
      produtoId: item.produtoId,
      data: novaVenda.data,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
      precoComDesconto: item.precoComDesconto,
      valorTotal: item.quantidade * item.precoComDesconto,
      formaPagamento: novaVenda.formaPagamento,
      observacoes: novaVenda.observacoes,
      status: 'Concluída',
      vendedorResponsavel: usuarioLogado?.nome || 'Sistema',
      numeroNota: novaVenda.numeroNota || undefined,
      statusPagamento: novaVenda.formaPagamento === 'Nota Feita' ? 'Pendente' : 'Pago'
    }))

    setVendas([...vendas, ...novasVendas])

    // Atualizar estoque dos produtos
    carrinho.forEach(item => {
      setProdutos(produtos => produtos.map(p => 
        p.id === item.produtoId 
          ? { ...p, estoque: p.estoque - item.quantidade }
          : p
      ))
    })

    // Atualizar dados do cliente
    const valorTotalVenda = calcularTotalCarrinho()
    setClientes(clientes.map(c => 
      c.id === novaVenda.clienteId
        ? { 
            ...c, 
            ultimaCompra: novaVenda.data,
            valorUltimaCompra: valorTotalVenda,
            totalCompras: c.totalCompras + 1
          }
        : c
    ))

    atualizarEstoqueVendedor()

    // Limpar formulário e carrinho
    setNovaVenda({
      clienteId: 0,
      data: new Date().toISOString().split('T')[0],
      formaPagamento: 'Dinheiro',
      observacoes: '',
      numeroNota: ''
    })
    limparCarrinho()

    setAbaSelecionada('vendas')
    alert('Venda registrada com sucesso!')
  }

  // Função de login simples
  const fazerLogin = () => {
    const usuario = usuarios.find(u => 
      u.email === dadosLogin.email && 
      u.senha === dadosLogin.senha && 
      u.tipo === tipoLogin
    )

    if (!usuario) {
      alert('Email ou senha incorretos')
      return
    }

    if (usuario.tipo === 'vendedor' && !usuario.ativo) {
      alert('Sua conta foi desativada. Entre em contato com o administrador.')
      return
    }

    setUsuarioLogado(usuario)
    setTelaLogin(false)
    setDadosLogin({ email: '', senha: '' })
    setStatusBanco('conectado')
  }

  // Função para criar conta
  const criarConta = () => {
    if (!dadosCriarConta.nome || !dadosCriarConta.email || !dadosCriarConta.senha) {
      alert('Todos os campos são obrigatórios')
      return
    }

    if (dadosCriarConta.senha !== dadosCriarConta.confirmarSenha) {
      alert('As senhas não coincidem')
      return
    }

    if (usuarios.find(u => u.email === dadosCriarConta.email)) {
      alert('Este email já está cadastrado')
      return
    }

    const novoUsuario: Usuario = {
      id: usuarios.length + 1,
      nome: dadosCriarConta.nome,
      email: dadosCriarConta.email,
      senha: dadosCriarConta.senha,
      tipo: dadosCriarConta.tipo,
      ativo: dadosCriarConta.tipo === 'admin' ? true : false,
      dataRegistro: new Date().toISOString().split('T')[0],
      comissao: dadosCriarConta.tipo === 'vendedor' ? 5 : undefined
    }

    setUsuarios([...usuarios, novoUsuario])
    setDadosCriarConta({ nome: '', email: '', senha: '', confirmarSenha: '', tipo: 'vendedor' })
    setMostrarCriarConta(false)
    
    if (dadosCriarConta.tipo === 'admin') {
      alert('Conta de administrador criada com sucesso!')
    } else {
      alert('Conta criada com sucesso! Aguarde a ativação pelo administrador.')
    }
  }

  // Função de logout
  const fazerLogout = () => {
    setUsuarioLogado(null)
    setTelaLogin(true)
    setAbaSelecionada('dashboard')
    setStatusBanco('desconectado')
  }

  // Função para adicionar vendedor (apenas admin)
  const adicionarVendedor = () => {
    if (usuarioLogado?.tipo !== 'admin') return
    
    if (!novoVendedor.nome || !novoVendedor.email || !novoVendedor.senha) {
      alert('Todos os campos são obrigatórios')
      return
    }

    if (usuarios.find(u => u.email === novoVendedor.email)) {
      alert('Este email já está cadastrado')
      return
    }

    const vendedor: Usuario = {
      id: usuarios.length + 1,
      nome: novoVendedor.nome,
      email: novoVendedor.email,
      senha: novoVendedor.senha,
      tipo: 'vendedor',
      ativo: true,
      dataRegistro: new Date().toISOString().split('T')[0],
      criadoPor: usuarioLogado.nome,
      comissao: novoVendedor.comissao
    }

    setUsuarios([...usuarios, vendedor])
    setNovoVendedor({ nome: '', email: '', senha: '', comissao: 5 })
    setMostrarAdicionarVendedor(false)
    alert(`Vendedor ${vendedor.nome} adicionado com sucesso!\nEmail: ${vendedor.email}\nSenha: ${vendedor.senha}`)
  }

  // Função para alternar status do vendedor (apenas admin)
  const alternarStatusVendedor = (id: number) => {
    if (usuarioLogado?.tipo !== 'admin') return
    
    const vendedor = usuarios.find(u => u.id === id)
    if (!vendedor) return
    
    const novoStatus = !vendedor.ativo
    setUsuarios(usuarios.map(u => 
      u.id === id ? { ...u, ativo: novoStatus } : u
    ))
    
    alert(`Vendedor ${vendedor.nome} ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`)
  }

  // Função para iniciar edição de vendedor
  const iniciarEdicaoVendedor = (vendedor: Usuario) => {
    setVendedorEditando(vendedor)
    setDadosEdicaoVendedor({
      nome: vendedor.nome,
      email: vendedor.email,
      comissao: vendedor.comissao || 5
    })
  }

  // Função para salvar edição de vendedor
  const salvarEdicaoVendedor = () => {
    if (!vendedorEditando || usuarioLogado?.tipo !== 'admin') return

    if (!dadosEdicaoVendedor.nome || !dadosEdicaoVendedor.email) {
      alert('Nome e email são obrigatórios')
      return
    }

    if (usuarios.find(u => u.email === dadosEdicaoVendedor.email && u.id !== vendedorEditando.id)) {
      alert('Este email já está sendo usado por outro usuário')
      return
    }

    setUsuarios(usuarios.map(u => 
      u.id === vendedorEditando.id 
        ? { 
            ...u, 
            nome: dadosEdicaoVendedor.nome, 
            email: dadosEdicaoVendedor.email,
            comissao: dadosEdicaoVendedor.comissao
          }
        : u
    ))

    setVendedorEditando(null)
    setDadosEdicaoVendedor({ nome: '', email: '', comissao: 5 })
    alert('Vendedor atualizado com sucesso!')
  }

  // Função para iniciar troca de senha do vendedor (admin)
  const iniciarTrocaSenhaVendedor = (vendedor: Usuario) => {
    if (usuarioLogado?.tipo !== 'admin') return
    setVendedorTrocandoSenha(vendedor)
    setNovaSenhaVendedor('')
    setConfirmarNovaSenha('')
  }

  // Função para trocar senha do vendedor (admin)
  const trocarSenhaVendedor = () => {
    if (!vendedorTrocandoSenha || usuarioLogado?.tipo !== 'admin') return

    if (!novaSenhaVendedor || !confirmarNovaSenha) {
      alert('Todos os campos são obrigatórios')
      return
    }

    if (novaSenhaVendedor !== confirmarNovaSenha) {
      alert('As senhas não coincidem')
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
    alert(`Senha do vendedor ${vendedorTrocandoSenha.nome} alterada com sucesso!\nNova senha: ${novaSenhaVendedor}`)
  }

  // Função para excluir vendedor
  const excluirVendedor = (id: number) => {
    if (usuarioLogado?.tipo !== 'admin') return
    
    const vendedor = usuarios.find(u => u.id === id)
    if (!vendedor) return
    
    if (confirm(`Tem certeza que deseja excluir o vendedor ${vendedor.nome}?`)) {
      setUsuarios(usuarios.filter(u => u.id !== id))
      alert(`Vendedor ${vendedor.nome} excluído com sucesso!`)
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
    if (usuarioLogado?.tipo === 'vendedor' && cliente.vendedorResponsavel !== usuarioLogado.nome) {
      return false
    }
    
    return cliente.nomeEmpresa.toLowerCase().includes(busca.toLowerCase()) ||
           cliente.responsavelCompra.toLowerCase().includes(busca.toLowerCase()) ||
           cliente.cidade.toLowerCase().includes(busca.toLowerCase()) ||
           cliente.email.toLowerCase().includes(busca.toLowerCase())
  })

  const vendasFiltradas = vendas.filter(venda => {
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
  const coresDias: { [key: string]: string } = {
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
      alert('Cliente adicionado com sucesso!')
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
      alert('Produto adicionado com sucesso!')
    }
  }

  const removerProduto = (id: number) => {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      setProdutos(produtos.filter(produto => produto.id !== id))
      alert('Produto removido com sucesso!')
    }
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
      { id: 'notasReceber', label: 'Notas a Receber', icon: FileText },
      { id: 'configuracoes', label: 'Configurações', icon: Settings }
    ] : []),
    ...(usuarioLogado?.tipo === 'vendedor' ? [
      { id: 'perfilVendedor', label: 'Meu Perfil', icon: TrendingUp },
      { id: 'fechamentoDia', label: 'Fechamento do Dia', icon: Clock },
      { id: 'controleEstoque', label: 'Meu Estoque', icon: Package },
      { id: 'notasReceber', label: 'Notas a Receber', icon: FileText }
    ] : []),
  ]

  // Tela de Login
  if (telaLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Meu Favorito</h1>
            <p className="text-gray-600">Sistema de Vendas</p>
          </div>

          {!mostrarCriarConta ? (
            <>
              {/* Seletor de Tipo de Login */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                <button
                  onClick={() => setTipoLogin('admin')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    tipoLogin === 'admin'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  Admin
                </button>
                <button
                  onClick={() => setTipoLogin('vendedor')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    tipoLogin === 'vendedor'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Vendedor
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="text"
                    value={dadosLogin.email}
                    onChange={(e) => setDadosLogin({...dadosLogin, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Digite seu email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                  <input
                    type="password"
                    value={dadosLogin.senha}
                    onChange={(e) => setDadosLogin({...dadosLogin, senha: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Digite sua senha"
                  />
                </div>

                <button
                  onClick={fazerLogin}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-[1.02]"
                >
                  Entrar
                </button>
              </div>

              {/* Opções de Conta */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setMostrarCriarConta(true)}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Criar Conta
                </button>
              </div>
            </>
          ) : (
            /* Formulário de Criar Conta */
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setMostrarCriarConta(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold text-gray-800">Criar Nova Conta</h3>
              </div>

              {/* Seletor de Tipo de Conta */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
                <button
                  onClick={() => setDadosCriarConta({...dadosCriarConta, tipo: 'vendedor'})}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all text-sm ${
                    dadosCriarConta.tipo === 'vendedor'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Vendedor
                </button>
                <button
                  onClick={() => setDadosCriarConta({...dadosCriarConta, tipo: 'admin'})}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all text-sm ${
                    dadosCriarConta.tipo === 'admin'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  Admin
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={dadosCriarConta.nome}
                  onChange={(e) => setDadosCriarConta({...dadosCriarConta, nome: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Digite seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={dadosCriarConta.email}
                  onChange={(e) => setDadosCriarConta({...dadosCriarConta, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Digite seu email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                <input
                  type="password"
                  value={dadosCriarConta.senha}
                  onChange={(e) => setDadosCriarConta({...dadosCriarConta, senha: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Digite sua senha"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
                <input
                  type="password"
                  value={dadosCriarConta.confirmarSenha}
                  onChange={(e) => setDadosCriarConta({...dadosCriarConta, confirmarSenha: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Confirme sua senha"
                />
              </div>

              <button
                onClick={criarConta}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all transform hover:scale-[1.02] ${
                  dadosCriarConta.tipo === 'admin'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                }`}
              >
                Criar Conta {dadosCriarConta.tipo === 'admin' ? 'de Administrador' : 'de Vendedor'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                {dadosCriarConta.tipo === 'admin' 
                  ? 'Sua conta de administrador será ativada imediatamente.'
                  : 'Sua conta será criada como vendedor e precisará ser ativada pelo administrador.'
                }
              </p>
            </div>
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
          
          {/* Status do Banco */}
          <div className="mt-3 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              statusBanco === 'conectado' ? 'bg-green-500' : 
              statusBanco === 'configurando' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-gray-600">
              {statusBanco === 'conectado' ? 'Sistema Online' : 
               statusBanco === 'configurando' ? 'Configurando...' : 'Modo Local'}
            </span>
          </div>
          
          <button
            onClick={fazerLogout}
            className="mt-3 w-full text-left text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            Sair
          </button>
        </div>
        
        <nav className="mt-6 overflow-y-auto max-h-[calc(100vh-250px)]">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setAbaSelecionada(item.id as any)
                  setSidebarAberta(false)
                  setDiaSelecionado(null)
                  setVendedorSelecionado('')
                  setVendedorFechamento('')
                  // Resetar filtros ao entrar em relatórios
                  if (item.id === 'relatorios') {
                    aplicarFiltroRapido('hoje')
                  }
                }}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                  abaSelecionada === item.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
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
      <div className="flex-1 lg:ml-0 overflow-auto">
        {/* Header Mobile */}
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 sticky top-0 z-30">
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
          {/* Dashboard */}
          {abaSelecionada === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Bem-vindo, {usuarioLogado?.nome}!
                    </h2>
                    <p className="text-gray-600">
                      {usuarioLogado?.tipo === 'admin' ? 'Painel administrativo' : 'Seu painel de vendas'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusBanco === 'conectado' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {statusBanco === 'conectado' ? 'Online' : 'Local'}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-500 text-white p-6 rounded-lg">
                    <div className="text-3xl font-bold">{clientesFiltrados.length}</div>
                    <div className="text-sm opacity-90">
                      {usuarioLogado?.tipo === 'vendedor' ? 'Meus Clientes' : 'Total de Clientes'}
                    </div>
                  </div>
                  <div className="bg-green-500 text-white p-6 rounded-lg">
                    <div className="text-3xl font-bold">{produtos.length}</div>
                    <div className="text-sm opacity-90">Total de Produtos</div>
                  </div>
                  <div className="bg-purple-500 text-white p-6 rounded-lg">
                    <div className="text-3xl font-bold">
                      {formatarMoeda(vendasFiltradas.reduce((acc, venda) => acc + venda.valorTotal, 0))}
                    </div>
                    <div className="text-sm opacity-90">
                      {usuarioLogado?.tipo === 'vendedor' ? 'Meu Faturamento' : 'Faturamento Total'}
                    </div>
                  </div>
                  <div className="bg-orange-500 text-white p-6 rounded-lg">
                    <div className="text-3xl font-bold">
                      {vendasFiltradas.filter(v => v.status === 'Pendente').length}
                    </div>
                    <div className="text-sm opacity-90">Vendas Pendentes</div>
                  </div>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setAbaSelecionada('adicionar')}
                    className="flex items-center justify-center gap-2 bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Adicionar Cliente
                  </button>
                  <button
                    onClick={() => setAbaSelecionada('registrarVenda')}
                    className="flex items-center justify-center gap-2 bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Registrar Venda
                  </button>
                  <button
                    onClick={() => setAbaSelecionada('rotas')}
                    className="flex items-center justify-center gap-2 bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <Route className="w-5 h-5" />
                    Ver Rotas
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CLIENTES */}
          {abaSelecionada === 'clientes' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
                <button
                  onClick={() => setAbaSelecionada('adicionar')}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Cliente
                </button>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Buscar clientes..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clientesFiltrados.map((cliente) => (
                    <div key={cliente.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{cliente.nomeEmpresa}</h3>
                          <p className="text-sm text-gray-600">{cliente.responsavelCompra}</p>
                        </div>
                        {usuarioLogado?.tipo === 'admin' && (
                          <button
                            onClick={() => iniciarEdicaoCliente(cliente)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          {cliente.email}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          {cliente.telefone}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {cliente.cidade}, {cliente.estado}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          {cliente.vendedorResponsavel}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex flex-wrap gap-1">
                          {cliente.diasVisita.map((dia) => (
                            <span key={dia} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {dia}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>Última compra:</span>
                          <span className="font-medium">{formatarData(cliente.ultimaCompra)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 mt-1">
                          <span>Valor:</span>
                          <span className="font-medium text-green-600">{formatarMoeda(cliente.valorUltimaCompra)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {clientesFiltrados.length === 0 && (
                  <div className="text-center py-12">
                    <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Nenhum cliente encontrado</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ADICIONAR CLIENTE */}
          {abaSelecionada === 'adicionar' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Adicionar Novo Cliente</h2>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa *</label>
                    <input
                      type="text"
                      value={novoCliente.nomeEmpresa}
                      onChange={(e) => setNovoCliente({...novoCliente, nomeEmpresa: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Padaria São José"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Responsável pela Compra *</label>
                    <input
                      type="text"
                      value={novoCliente.responsavelCompra}
                      onChange={(e) => setNovoCliente({...novoCliente, responsavelCompra: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Maria Silva"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento</label>
                    <select
                      value={novoCliente.tipoDocumento}
                      onChange={(e) => setNovoCliente({...novoCliente, tipoDocumento: e.target.value as 'CNPJ' | 'CPF'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="CNPJ">CNPJ</option>
                      <option value="CPF">CPF</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Documento</label>
                    <input
                      type="text"
                      value={novoCliente.documento}
                      onChange={(e) => setNovoCliente({...novoCliente, documento: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: 12.345.678/0001-90"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={novoCliente.email}
                      onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={novoCliente.telefone}
                      onChange={(e) => setNovoCliente({...novoCliente, telefone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                    <input
                      type="text"
                      value={novoCliente.endereco}
                      onChange={(e) => setNovoCliente({...novoCliente, endereco: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Rua, número, complemento"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                    <input
                      type="text"
                      value={novoCliente.cidade}
                      onChange={(e) => setNovoCliente({...novoCliente, cidade: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="São Paulo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <input
                      type="text"
                      value={novoCliente.estado}
                      onChange={(e) => setNovoCliente({...novoCliente, estado: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Localização GPS</label>
                    <button
                      onClick={obterLocalizacao}
                      disabled={carregandoLocalizacao}
                      className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400"
                    >
                      <MapPin className="w-4 h-4" />
                      {carregandoLocalizacao ? 'Obtendo localização...' : 'Usar Localização Atual'}
                    </button>
                    {localizacaoAtual && (
                      <p className="text-sm text-green-600 mt-2">
                        Localização obtida: {localizacaoAtual.latitude.toFixed(6)}, {localizacaoAtual.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dias de Visita</label>
                    <div className="flex flex-wrap gap-2">
                      {diasSemana.map((dia) => (
                        <button
                          key={dia}
                          onClick={() => toggleDiaVisita(dia)}
                          className={`px-4 py-2 rounded-md transition-colors ${
                            novoCliente.diasVisita.includes(dia)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {dia}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vendedor Responsável</label>
                    <select
                      value={novoCliente.vendedorResponsavel}
                      onChange={(e) => setNovoCliente({...novoCliente, vendedorResponsavel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione um vendedor</option>
                      {vendedoresAtivos.map((vendedor) => (
                        <option key={vendedor} value={vendedor}>{vendedor}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                    <textarea
                      value={novoCliente.observacoes}
                      onChange={(e) => setNovoCliente({...novoCliente, observacoes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Observações sobre o cliente..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setAbaSelecionada('clientes')}
                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={adicionarCliente}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Adicionar Cliente
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PRODUTOS */}
          {abaSelecionada === 'produtos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Produtos</h2>
                {usuarioLogado?.tipo === 'admin' && (
                  <button
                    onClick={() => setAbaSelecionada('adicionarProduto')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Produto
                  </button>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {produtosFiltrados.map((produto) => (
                    <div key={produto.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{produto.nome}</h3>
                          <p className="text-sm text-gray-600">{produto.categoria}</p>
                        </div>
                        {usuarioLogado?.tipo === 'admin' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => iniciarEdicaoProduto(produto)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removerProduto(produto.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Preço:</span>
                          <span className="text-lg font-bold text-green-600">{formatarMoeda(produto.preco)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Estoque:</span>
                          <span className={`font-medium ${produto.estoque > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                            {produto.estoque} unidades
                          </span>
                        </div>
                      </div>

                      {produto.descricao && (
                        <p className="mt-3 text-sm text-gray-600 border-t pt-3">
                          {produto.descricao}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {produtosFiltrados.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ADICIONAR PRODUTO */}
          {abaSelecionada === 'adicionarProduto' && usuarioLogado?.tipo === 'admin' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Adicionar Novo Produto</h2>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Produto *</label>
                    <input
                      type="text"
                      value={novoProduto.nome}
                      onChange={(e) => setNovoProduto({...novoProduto, nome: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Pacote Premium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preço *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={novoProduto.preco}
                      onChange={(e) => setNovoProduto({...novoProduto, preco: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                    <input
                      type="text"
                      value={novoProduto.categoria}
                      onChange={(e) => setNovoProduto({...novoProduto, categoria: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Pacotes"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estoque Inicial</label>
                    <input
                      type="number"
                      value={novoProduto.estoque}
                      onChange={(e) => setNovoProduto({...novoProduto, estoque: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                    <textarea
                      value={novoProduto.descricao}
                      onChange={(e) => setNovoProduto({...novoProduto, descricao: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Descrição do produto..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setAbaSelecionada('produtos')}
                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={adicionarProduto}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Adicionar Produto
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VENDAS */}
          {abaSelecionada === 'vendas' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Vendas</h2>
                <button
                  onClick={() => setAbaSelecionada('registrarVenda')}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nova Venda
                </button>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cliente</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Produto</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Qtd</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Valor</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Pagamento</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                        {usuarioLogado?.tipo === 'admin' && (
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vendedor</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {vendasFiltradas.map((venda) => {
                        const cliente = clientes.find(c => c.id === venda.clienteId)
                        const produto = produtos.find(p => p.id === venda.produtoId)
                        return (
                          <tr key={venda.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm">{formatarData(venda.data)}</td>
                            <td className="py-3 px-4 text-sm">{cliente?.nomeEmpresa || 'N/A'}</td>
                            <td className="py-3 px-4 text-sm">{produto?.nome || 'N/A'}</td>
                            <td className="py-3 px-4 text-sm">{venda.quantidade}</td>
                            <td className="py-3 px-4 text-sm font-medium text-green-600">{formatarMoeda(venda.valorTotal)}</td>
                            <td className="py-3 px-4 text-sm">{venda.formaPagamento}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                venda.status === 'Concluída' ? 'bg-green-100 text-green-800' :
                                venda.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {venda.status}
                              </span>
                            </td>
                            {usuarioLogado?.tipo === 'admin' && (
                              <td className="py-3 px-4 text-sm">{venda.vendedorResponsavel}</td>
                            )}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {vendasFiltradas.length === 0 && (
                    <div className="text-center py-12">
                      <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">Nenhuma venda registrada</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* REGISTRAR VENDA - COM CARRINHO E DESCONTO */}
          {abaSelecionada === 'registrarVenda' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Registrar Nova Venda</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulário de Venda */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações da Venda</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                        <select
                          value={novaVenda.clienteId}
                          onChange={(e) => setNovaVenda({...novaVenda, clienteId: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value={0}>Selecione um cliente</option>
                          {clientesFiltrados.map((cliente) => (
                            <option key={cliente.id} value={cliente.id}>
                              {cliente.nomeEmpresa} - {cliente.responsavelCompra}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                          <input
                            type="date"
                            value={novaVenda.data}
                            onChange={(e) => setNovaVenda({...novaVenda, data: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
                          <select
                            value={novaVenda.formaPagamento}
                            onChange={(e) => setNovaVenda({...novaVenda, formaPagamento: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {formasPagamento.map((forma) => (
                              <option key={forma} value={forma}>{forma}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {novaVenda.formaPagamento === 'Nota Feita' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Número da Nota</label>
                          <input
                            type="text"
                            value={novaVenda.numeroNota}
                            onChange={(e) => setNovaVenda({...novaVenda, numeroNota: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: NF-2024-001"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                        <textarea
                          value={novaVenda.observacoes}
                          onChange={(e) => setNovaVenda({...novaVenda, observacoes: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                          placeholder="Observações sobre a venda..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lista de Produtos */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Produtos Disponíveis</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {produtos.map((produto) => (
                        <div key={produto.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-800">{produto.nome}</h4>
                              <p className="text-sm text-gray-500">{produto.categoria}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">{formatarMoeda(produto.preco)}</div>
                              <div className="text-xs text-gray-500">Estoque: {produto.estoque}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => adicionarAoCarrinho(produto.id)}
                            disabled={produto.estoque === 0}
                            className={`w-full mt-2 py-2 px-4 rounded-md transition-colors ${
                              produto.estoque === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            <Plus className="w-4 h-4 inline mr-2" />
                            Adicionar ao Carrinho
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Carrinho com Desconto */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
                      <span>Carrinho</span>
                      <span className="text-sm text-gray-500">({carrinho.length} {carrinho.length === 1 ? 'item' : 'itens'})</span>
                    </h3>

                    {carrinho.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Carrinho vazio</p>
                        <p className="text-sm text-gray-400 mt-1">Adicione produtos para continuar</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                          {carrinho.map((item) => {
                            const produto = produtos.find(p => p.id === item.produtoId)
                            if (!produto) return null

                            return (
                              <div key={item.produtoId} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-800 text-sm">{produto.nome}</h4>
                                    <p className="text-xs text-gray-500">Preço original: {formatarMoeda(item.precoUnitario)}</p>
                                  </div>
                                  <button
                                    onClick={() => setCarrinho(carrinho.filter(i => i.produtoId !== item.produtoId))}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                
                                {/* Campo para alterar preço */}
                                <div className="mb-2">
                                  <label className="block text-xs text-gray-600 mb-1">Preço de venda:</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={item.precoComDesconto}
                                    onChange={(e) => alterarPrecoCarrinho(item.produtoId, parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                  />
                                  {item.precoComDesconto < item.precoUnitario && (
                                    <p className="text-xs text-green-600 mt-1">
                                      Desconto: {formatarMoeda(item.precoUnitario - item.precoComDesconto)}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => removerDoCarrinho(item.produtoId)}
                                      className="w-7 h-7 bg-gray-200 rounded-md flex items-center justify-center hover:bg-gray-300"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-medium">{item.quantidade}</span>
                                    <button
                                      onClick={() => adicionarAoCarrinho(item.produtoId)}
                                      className="w-7 h-7 bg-blue-500 text-white rounded-md flex items-center justify-center hover:bg-blue-600"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="font-bold text-gray-800">
                                    {formatarMoeda(item.quantidade * item.precoComDesconto)}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <div className="border-t pt-4 space-y-2">
                          <div className="flex justify-between text-lg font-bold text-gray-800">
                            <span>Total:</span>
                            <span className="text-green-600">{formatarMoeda(calcularTotalCarrinho())}</span>
                          </div>
                          
                          <button
                            onClick={limparCarrinho}
                            className="w-full py-2 px-4 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                          >
                            Limpar Carrinho
                          </button>
                          
                          <button
                            onClick={registrarVendaCarrinho}
                            disabled={!novaVenda.clienteId || carrinho.length === 0}
                            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                              !novaVenda.clienteId || carrinho.length === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                          >
                            <CheckCircle className="w-5 h-5 inline mr-2" />
                            Finalizar Venda
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ROTAS */}
          {abaSelecionada === 'rotas' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Rotas de Visita</h2>
              
              {!diaSelecionado ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {diasSemana.map((dia) => {
                    const qtdClientes = contarClientesPorDia(dia)
                    return (
                      <button
                        key={dia}
                        onClick={() => setDiaSelecionado(dia)}
                        className={`bg-gradient-to-r ${coresDias[dia]} text-white p-6 rounded-lg hover:shadow-lg transition-all transform hover:scale-105`}
                      >
                        <div className="text-4xl font-bold mb-2">{qtdClientes}</div>
                        <div className="text-sm opacity-90">{dia}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {qtdClientes === 1 ? 'cliente' : 'clientes'}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setDiaSelecionado(null)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-5 h-5" />
                      Voltar para visão geral
                    </button>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Clientes de {diaSelecionado}
                    </h3>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {clientesPorDia(diaSelecionado).map((cliente) => (
                        <div key={cliente.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-800">{cliente.nomeEmpresa}</h4>
                              <p className="text-sm text-gray-600">{cliente.responsavelCompra}</p>
                            </div>
                            <button
                              onClick={() => iniciarAlteracaoRota(cliente)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              {cliente.endereco}, {cliente.cidade}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-4 h-4" />
                              {cliente.telefone}
                            </div>
                          </div>

                          {cliente.latitude && cliente.longitude && (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${cliente.latitude},${cliente.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                            >
                              <Navigation className="w-4 h-4" />
                              Abrir no Google Maps
                            </a>
                          )}
                        </div>
                      ))}
                    </div>

                    {clientesPorDia(diaSelecionado).length === 0 && (
                      <div className="text-center py-12">
                        <Route className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Nenhum cliente para {diaSelecionado}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RELATÓRIOS - COM FILTROS DE DATA */}
          {abaSelecionada === 'relatorios' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Relatórios de Vendas</h2>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtrar Período</h3>
                
                {/* Filtros Rápidos */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => aplicarFiltroRapido('hoje')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filtroAtivoRelatorio === 'hoje'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Hoje
                  </button>
                  <button
                    onClick={() => aplicarFiltroRapido('ontem')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filtroAtivoRelatorio === 'ontem'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Ontem
                  </button>
                  <button
                    onClick={() => aplicarFiltroRapido('semana')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filtroAtivoRelatorio === 'semana'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Última Semana
                  </button>
                  <button
                    onClick={() => aplicarFiltroRapido('mes')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filtroAtivoRelatorio === 'mes'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Último Mês
                  </button>
                  <button
                    onClick={() => setFiltroAtivoRelatorio('personalizado')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filtroAtivoRelatorio === 'personalizado'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Personalizado
                  </button>
                </div>

                {/* Filtro Personalizado */}
                {filtroAtivoRelatorio === 'personalizado' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data Inicial</label>
                      <input
                        type="date"
                        value={dataInicialRelatorio}
                        onChange={(e) => setDataInicialRelatorio(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data Final</label>
                      <input
                        type="date"
                        value={dataFinalRelatorio}
                        onChange={(e) => setDataFinalRelatorio(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Resumo do Período */}
                {(() => {
                  const vendasDoPeriodo = obterVendasVendedorPorPeriodo(dataInicialRelatorio, dataFinalRelatorio)
                  const totaisPorPagamento = calcularTotaisPorPagamentoVendedorPeriodo(dataInicialRelatorio, dataFinalRelatorio)
                  const totalGeral = vendasDoPeriodo.reduce((acc, v) => acc + v.valorTotal, 0)
                  
                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-sm text-blue-600 mb-1">Total de Vendas</div>
                          <div className="text-2xl font-bold text-blue-700">{vendasDoPeriodo.length}</div>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-sm text-green-600 mb-1">Faturamento Total</div>
                          <div className="text-2xl font-bold text-green-700">{formatarMoeda(totalGeral)}</div>
                        </div>
                        
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-sm text-purple-600 mb-1">Produtos Vendidos</div>
                          <div className="text-2xl font-bold text-purple-700">
                            {vendasDoPeriodo.reduce((acc, v) => acc + v.quantidade, 0)}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Por Forma de Pagamento</h4>
                        <div className="space-y-2">
                          {formasPagamento.map((forma) => (
                            <div key={forma} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium text-gray-700">{forma}</span>
                              <div className="text-right">
                                <div className="font-bold text-gray-800">
                                  {formatarMoeda(totaisPorPagamento[forma]?.valor || 0)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {totaisPorPagamento[forma]?.quantidade || 0} unidades
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          )}

          {/* PERFIL DO VENDEDOR */}
          {abaSelecionada === 'perfilVendedor' && usuarioLogado?.tipo === 'vendedor' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Meu Perfil</h2>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{usuarioLogado.nome}</h3>
                    <p className="text-gray-600">{usuarioLogado.email}</p>
                    <p className="text-sm text-gray-500">Vendedor desde {formatarData(usuarioLogado.dataRegistro)}</p>
                  </div>
                </div>

                {(() => {
                  const stats = calcularEstatisticasVendedor(usuarioLogado.nome)
                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-sm text-blue-600 mb-1">Meus Clientes</div>
                          <div className="text-2xl font-bold text-blue-700">{stats.totalClientes}</div>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-sm text-green-600 mb-1">Vendas no Mês</div>
                          <div className="text-2xl font-bold text-green-700">{stats.vendasMes}</div>
                        </div>
                        
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-sm text-purple-600 mb-1">Faturamento Mês</div>
                          <div className="text-2xl font-bold text-purple-700">{formatarMoeda(stats.faturamentoMes)}</div>
                        </div>
                        
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <div className="text-sm text-orange-600 mb-1">Comissão ({stats.percentualComissao}%)</div>
                          <div className="text-2xl font-bold text-orange-700">{formatarMoeda(stats.comissaoMes)}</div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Informações da Conta</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Taxa de Comissão:</span>
                            <span className="font-medium">{stats.percentualComissao}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className="font-medium text-green-600">Ativo</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          )}

          {/* USUÁRIOS (ADMIN) */}
          {abaSelecionada === 'usuarios' && usuarioLogado?.tipo === 'admin' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Gerenciar Usuários</h2>
                <button
                  onClick={() => setMostrarAdicionarVendedor(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Vendedor
                </button>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendedores</h3>
                
                <div className="space-y-4">
                  {usuarios.filter(u => u.tipo === 'vendedor').map((vendedor) => (
                    <div key={vendedor.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-800">{vendedor.nome}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              vendedor.ativo 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {vendedor.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {vendedor.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Registrado em: {formatarData(vendedor.dataRegistro)}
                            </div>
                            {vendedor.comissao && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                Comissão: {vendedor.comissao}%
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => iniciarEdicaoVendedor(vendedor)}
                            className="p-2 text-blue-500 hover:text-blue-700"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => iniciarTrocaSenhaVendedor(vendedor)}
                            className="p-2 text-purple-500 hover:text-purple-700"
                            title="Trocar Senha"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => alternarStatusVendedor(vendedor.id)}
                            className={`p-2 ${vendedor.ativo ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'}`}
                            title={vendedor.ativo ? 'Desativar' : 'Ativar'}
                          >
                            {vendedor.ativo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => excluirVendedor(vendedor.id)}
                            className="p-2 text-red-500 hover:text-red-700"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {usuarios.filter(u => u.tipo === 'vendedor').length === 0 && (
                  <div className="text-center py-12">
                    <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Nenhum vendedor cadastrado</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ACOMPANHAR VENDEDORES (ADMIN) */}
          {abaSelecionada === 'acompanharVendedores' && usuarioLogado?.tipo === 'admin' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Acompanhar Vendedores</h2>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selecione um Vendedor</label>
                  <select
                    value={vendedorSelecionado}
                    onChange={(e) => setVendedorSelecionado(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um vendedor</option>
                    {vendedoresAtivos.map((vendedor) => (
                      <option key={vendedor} value={vendedor}>{vendedor}</option>
                    ))}
                  </select>
                </div>

                {vendedorSelecionado && (
                  <div className="space-y-6">
                    {(() => {
                      const stats = calcularEstatisticasVendedor(vendedorSelecionado)
                      return (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <div className="text-sm text-blue-600 mb-1">Total de Clientes</div>
                              <div className="text-2xl font-bold text-blue-700">{stats.totalClientes}</div>
                            </div>
                            
                            <div className="bg-green-50 p-4 rounded-lg">
                              <div className="text-sm text-green-600 mb-1">Vendas no Mês</div>
                              <div className="text-2xl font-bold text-green-700">{stats.vendasMes}</div>
                            </div>
                            
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <div className="text-sm text-purple-600 mb-1">Faturamento Mês</div>
                              <div className="text-2xl font-bold text-purple-700">{formatarMoeda(stats.faturamentoMes)}</div>
                            </div>
                            
                            <div className="bg-orange-50 p-4 rounded-lg">
                              <div className="text-sm text-orange-600 mb-1">Comissão ({stats.percentualComissao}%)</div>
                              <div className="text-2xl font-bold text-orange-700">{formatarMoeda(stats.comissaoMes)}</div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-800 mb-3">Clientes do Vendedor</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {clientes.filter(c => c.vendedorResponsavel === vendedorSelecionado).map((cliente) => (
                                <div key={cliente.id} className="border border-gray-200 rounded-lg p-3">
                                  <h5 className="font-medium text-gray-800">{cliente.nomeEmpresa}</h5>
                                  <p className="text-sm text-gray-600">{cliente.responsavelCompra}</p>
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {cliente.diasVisita.map((dia) => (
                                      <span key={dia} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        {dia}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                )}

                {!vendedorSelecionado && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Selecione um vendedor para ver as estatísticas</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FECHAMENTO DO DIA - VENDEDOR */}
          {abaSelecionada === 'fechamentoDia' && usuarioLogado?.tipo === 'vendedor' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Fechamento do Dia</h2>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo de Hoje</h3>
                
                {(() => {
                  const vendasDoDia = obterVendasDoDia()
                  const totaisPorPagamento = calcularTotaisPorPagamento()
                  const totalGeral = vendasDoDia.reduce((acc, v) => acc + v.valorTotal, 0)
                  
                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-sm text-blue-600 mb-1">Total de Vendas</div>
                          <div className="text-2xl font-bold text-blue-700">{vendasDoDia.length}</div>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-sm text-green-600 mb-1">Faturamento Total</div>
                          <div className="text-2xl font-bold text-green-700">{formatarMoeda(totalGeral)}</div>
                        </div>
                        
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-sm text-purple-600 mb-1">Produtos Vendidos</div>
                          <div className="text-2xl font-bold text-purple-700">
                            {vendasDoDia.reduce((acc, v) => acc + v.quantidade, 0)}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Por Forma de Pagamento</h4>
                        <div className="space-y-2">
                          {formasPagamento.map((forma) => (
                            <div key={forma} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium text-gray-700">{forma}</span>
                              <div className="text-right">
                                <div className="font-bold text-gray-800">
                                  {formatarMoeda(totaisPorPagamento[forma]?.valor || 0)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {totaisPorPagamento[forma]?.quantidade || 0} unidades
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          )}

          {/* FECHAMENTO DO DIA - ADMIN */}
          {abaSelecionada === 'fechamentoDiaAdmin' && usuarioLogado?.tipo === 'admin' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Fechamento do Dia</h2>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vendedor</label>
                    <select
                      value={vendedorFechamento}
                      onChange={(e) => setVendedorFechamento(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione um vendedor</option>
                      {vendedoresAtivos.map((vendedor) => (
                        <option key={vendedor} value={vendedor}>{vendedor}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data Inicial</label>
                    <input
                      type="date"
                      value={dataInicialFechamento}
                      onChange={(e) => setDataInicialFechamento(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data Final</label>
                    <input
                      type="date"
                      value={dataFinalFechamento}
                      onChange={(e) => setDataFinalFechamento(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {vendedorFechamento && (
                  <div className="space-y-6">
                    {(() => {
                      const vendasPeriodo = obterVendasPorPeriodoVendedor(vendedorFechamento, dataInicialFechamento, dataFinalFechamento)
                      const totaisPorPagamento = calcularTotaisPorPagamentoPeriodoVendedor(vendedorFechamento, dataInicialFechamento, dataFinalFechamento)
                      const totalGeral = vendasPeriodo.reduce((acc, v) => acc + v.valorTotal, 0)
                      
                      return (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <div className="text-sm text-blue-600 mb-1">Total de Vendas</div>
                              <div className="text-2xl font-bold text-blue-700">{vendasPeriodo.length}</div>
                            </div>
                            
                            <div className="bg-green-50 p-4 rounded-lg">
                              <div className="text-sm text-green-600 mb-1">Faturamento Total</div>
                              <div className="text-2xl font-bold text-green-700">{formatarMoeda(totalGeral)}</div>
                            </div>
                            
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <div className="text-sm text-purple-600 mb-1">Produtos Vendidos</div>
                              <div className="text-2xl font-bold text-purple-700">
                                {vendasPeriodo.reduce((acc, v) => acc + v.quantidade, 0)}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-800 mb-3">Por Forma de Pagamento</h4>
                            <div className="space-y-2">
                              {formasPagamento.map((forma) => (
                                <div key={forma} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <span className="font-medium text-gray-700">{forma}</span>
                                  <div className="text-right">
                                    <div className="font-bold text-gray-800">
                                      {formatarMoeda(totaisPorPagamento[forma]?.valor || 0)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {totaisPorPagamento[forma]?.quantidade || 0} unidades
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                )}

                {!vendedorFechamento && (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Selecione um vendedor e período para ver o fechamento</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CONTROLE DE ESTOQUE - VENDEDOR */}
          {abaSelecionada === 'controleEstoque' && usuarioLogado?.tipo === 'vendedor' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Meu Estoque</h2>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Produtos em Estoque</h3>
                
                {obterEstoqueVendedor().length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Nenhum produto em estoque</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {obterEstoqueVendedor().map((estoque) => (
                      <div key={estoque.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-800">{estoque.produtoNome}</h4>
                            <p className="text-sm text-gray-600">Data: {formatarData(estoque.data)}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            estoque.status === 'ativo' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {estoque.status === 'ativo' ? 'Ativo' : 'Finalizado'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">{estoque.quantidadeLevada}</div>
                            <div className="text-xs text-gray-600">Levado</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">{calcularQuantidadeVendida(estoque.produtoId)}</div>
                            <div className="text-xs text-gray-600">Vendido</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-orange-600">
                              {estoque.quantidadeLevada - calcularQuantidadeVendida(estoque.produtoId)}
                            </div>
                            <div className="text-xs text-gray-600">A Devolver</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CONTROLE DE ESTOQUE - ADMIN */}
          {abaSelecionada === 'controleEstoque' && usuarioLogado?.tipo === 'admin' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Controle de Estoque</h2>
                <button
                  onClick={() => setMostrarControleEstoque(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Estoque
                </button>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Estoque por Vendedor</h3>
                
                {estoqueVendedores.filter(e => e.status === 'ativo').length === 0 ? (
                  <div className="text-center py-12">
                    <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Nenhum estoque ativo</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {vendedoresAtivos.map((vendedor) => {
                      const estoqueVendedor = obterEstoqueVendedorEspecifico(vendedor)
                      if (estoqueVendedor.length === 0) return null
                      
                      return (
                        <div key={vendedor} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-500" />
                            {vendedor}
                          </h4>
                          
                          <div className="space-y-3">
                            {estoqueVendedor.map((estoque) => (
                              <div key={estoque.id} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h5 className="font-medium text-gray-800">{estoque.produtoNome}</h5>
                                    <p className="text-xs text-gray-600">Data: {formatarData(estoque.data)}</p>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                                  <div>
                                    <div className="text-xl font-bold text-blue-600">{estoque.quantidadeLevada}</div>
                                    <div className="text-xs text-gray-600">Levado</div>
                                  </div>
                                  <div>
                                    <div className="text-xl font-bold text-green-600">
                                      {calcularQuantidadeVendidaVendedor(vendedor, estoque.produtoId)}
                                    </div>
                                    <div className="text-xs text-gray-600">Vendido</div>
                                  </div>
                                  <div>
                                    <div className="text-xl font-bold text-orange-600">
                                      {estoque.quantidadeLevada - calcularQuantidadeVendidaVendedor(vendedor, estoque.produtoId)}
                                    </div>
                                    <div className="text-xs text-gray-600">A Devolver</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NOTAS A RECEBER (ADMIN) */}
          {abaSelecionada === 'notasReceber' && usuarioLogado?.tipo === 'admin' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Notas a Receber</h2>
              
              <div className="bg-white rounded-lg shadow p-6">
                {obterNotasAReceber().length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Nenhuma nota pendente</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {obterNotasAReceber().map((venda) => {
                      const cliente = clientes.find(c => c.id === venda.clienteId)
                      const produto = produtos.find(p => p.id === venda.produtoId)
                      
                      return (
                        <div key={venda.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-800">Nota: {venda.numeroNota}</h4>
                              <p className="text-sm text-gray-600">{cliente?.nomeEmpresa}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">{formatarMoeda(venda.valorTotal)}</div>
                              <div className="text-xs text-gray-500">{formatarData(venda.data)}</div>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm mb-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Produto:</span>
                              <span className="font-medium">{produto?.nome}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Quantidade:</span>
                              <span className="font-medium">{venda.quantidade}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Vendedor:</span>
                              <span className="font-medium">{venda.vendedorResponsavel}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => marcarNotaComoPaga(venda.id)}
                            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Marcar como Paga
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NOTAS A RECEBER (VENDEDOR) */}
          {abaSelecionada === 'notasReceber' && usuarioLogado?.tipo === 'vendedor' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Minhas Notas a Receber</h2>
              
              <div className="bg-white rounded-lg shadow p-6">
                {obterNotasAReceberVendedor().length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Nenhuma nota pendente</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {obterNotasAReceberVendedor().map((venda) => {
                      const cliente = clientes.find(c => c.id === venda.clienteId)
                      const produto = produtos.find(p => p.id === venda.produtoId)
                      
                      return (
                        <div key={venda.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-800">Nota: {venda.numeroNota}</h4>
                              <p className="text-sm text-gray-600">{cliente?.nomeEmpresa}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">{formatarMoeda(venda.valorTotal)}</div>
                              <div className="text-xs text-gray-500">{formatarData(venda.data)}</div>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm mb-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Produto:</span>
                              <span className="font-medium">{produto?.nome}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Quantidade:</span>
                              <span className="font-medium">{venda.quantidade}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                Aguardando Pagamento
                              </span>
                            </div>
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
                            <AlertCircle className="w-4 h-4 inline mr-2" />
                            Apenas o administrador pode dar baixa nesta nota
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CONFIGURAÇÕES (ADMIN) */}
          {abaSelecionada === 'configuracoes' && usuarioLogado?.tipo === 'admin' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Configurações</h2>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Sistema</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">Status do Sistema</div>
                      <div className="text-sm text-gray-600">Sistema funcionando em modo local</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      statusBanco === 'conectado' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {statusBanco === 'conectado' ? 'Online' : 'Local'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">Total de Usuários</div>
                      <div className="text-sm text-gray-600">{usuarios.length} usuários cadastrados</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{usuarios.length}</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">Total de Clientes</div>
                      <div className="text-sm text-gray-600">{clientes.length} clientes cadastrados</div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{clientes.length}</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">Total de Produtos</div>
                      <div className="text-sm text-gray-600">{produtos.length} produtos cadastrados</div>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">{produtos.length}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modais (mantidos iguais) */}
      {/* Modal de Adicionar Vendedor (Admin) */}
      {mostrarAdicionarVendedor && usuarioLogado?.tipo === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Adicionar Novo Vendedor</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={novoVendedor.nome}
                  onChange={(e) => setNovoVendedor({...novoVendedor, nome: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome do vendedor"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={novoVendedor.email}
                  onChange={(e) => setNovoVendedor({...novoVendedor, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                <input
                  type="text"
                  value={novoVendedor.senha}
                  onChange={(e) => setNovoVendedor({...novoVendedor, senha: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Senha inicial"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comissão (%)</label>
                <input
                  type="number"
                  value={novoVendedor.comissao}
                  onChange={(e) => setNovoVendedor({...novoVendedor, comissao: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setMostrarAdicionarVendedor(false)
                  setNovoVendedor({ nome: '', email: '', senha: '', comissao: 5 })
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={adicionarVendedor}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Vendedor */}
      {vendedorEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Editar Vendedor</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={dadosEdicaoVendedor.nome}
                  onChange={(e) => setDadosEdicaoVendedor({...dadosEdicaoVendedor, nome: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={dadosEdicaoVendedor.email}
                  onChange={(e) => setDadosEdicaoVendedor({...dadosEdicaoVendedor, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comissão (%)</label>
                <input
                  type="number"
                  value={dadosEdicaoVendedor.comissao}
                  onChange={(e) => setDadosEdicaoVendedor({...dadosEdicaoVendedor, comissao: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setVendedorEditando(null)
                  setDadosEdicaoVendedor({ nome: '', email: '', comissao: 5 })
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvarEdicaoVendedor}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Trocar Senha do Vendedor */}
      {vendedorTrocandoSenha && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Trocar Senha - {vendedorTrocandoSenha.nome}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                <input
                  type="text"
                  value={novaSenhaVendedor}
                  onChange={(e) => setNovaSenhaVendedor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite a nova senha"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
                <input
                  type="text"
                  value={confirmarNovaSenha}
                  onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirme a nova senha"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setVendedorTrocandoSenha(null)
                  setNovaSenhaVendedor('')
                  setConfirmarNovaSenha('')
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={trocarSenhaVendedor}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
              >
                Trocar Senha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Cliente */}
      {clienteEditando && dadosEdicaoCliente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Editar Cliente</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa</label>
                <input
                  type="text"
                  value={dadosEdicaoCliente.nomeEmpresa}
                  onChange={(e) => setDadosEdicaoCliente({...dadosEdicaoCliente, nomeEmpresa: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Responsável</label>
                <input
                  type="text"
                  value={dadosEdicaoCliente.responsavelCompra}
                  onChange={(e) => setDadosEdicaoCliente({...dadosEdicaoCliente, responsavelCompra: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={dadosEdicaoCliente.email}
                  onChange={(e) => setDadosEdicaoCliente({...dadosEdicaoCliente, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                <input
                  type="tel"
                  value={dadosEdicaoCliente.telefone}
                  onChange={(e) => setDadosEdicaoCliente({...dadosEdicaoCliente, telefone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                <input
                  type="text"
                  value={dadosEdicaoCliente.endereco}
                  onChange={(e) => setDadosEdicaoCliente({...dadosEdicaoCliente, endereco: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                <input
                  type="text"
                  value={dadosEdicaoCliente.cidade}
                  onChange={(e) => setDadosEdicaoCliente({...dadosEdicaoCliente, cidade: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <input
                  type="text"
                  value={dadosEdicaoCliente.estado}
                  onChange={(e) => setDadosEdicaoCliente({...dadosEdicaoCliente, estado: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={2}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setClienteEditando(null)
                  setDadosEdicaoCliente(null)
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvarEdicaoCliente}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Alterar Rota */}
      {clienteAlterandoRota && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Alterar Dias de Visita - {clienteAlterandoRota.nomeEmpresa}
            </h3>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Selecione os dias de visita:</p>
              <div className="flex flex-wrap gap-2">
                {diasSemana.map((dia) => (
                  <button
                    key={dia}
                    onClick={() => toggleDiaRota(dia)}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      novosDiasVisita.includes(dia)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {dia}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setClienteAlterandoRota(null)
                  setNovosDiasVisita([])
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvarAlteracaoRota}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Estoque (Admin) */}
      {mostrarControleEstoque && usuarioLogado?.tipo === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Adicionar Estoque para Vendedor</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendedor</label>
                <select
                  value={novoEstoque.vendedorId}
                  onChange={(e) => setNovoEstoque({...novoEstoque, vendedorId: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={0}>Selecione um produto</option>
                  {produtos.map((produto) => (
                    <option key={produto.id} value={produto.id}>{produto.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade</label>
                <input
                  type="number"
                  value={novoEstoque.quantidadeLevada}
                  onChange={(e) => setNovoEstoque({...novoEstoque, quantidadeLevada: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setMostrarControleEstoque(false)
                  setNovoEstoque({ vendedorId: 0, produtoId: 0, quantidadeLevada: 0 })
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={adicionarEstoqueVendedor}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Produto */}
      {produtoEditando && dadosEdicaoProduto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Editar Produto</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Produto</label>
                <input
                  type="text"
                  value={dadosEdicaoProduto.nome}
                  onChange={(e) => setDadosEdicaoProduto({...dadosEdicaoProduto, nome: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preço</label>
                  <input
                    type="number"
                    step="0.01"
                    value={dadosEdicaoProduto.preco}
                    onChange={(e) => setDadosEdicaoProduto({...dadosEdicaoProduto, preco: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estoque</label>
                  <input
                    type="number"
                    value={dadosEdicaoProduto.estoque}
                    onChange={(e) => setDadosEdicaoProduto({...dadosEdicaoProduto, estoque: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <input
                  type="text"
                  value={dadosEdicaoProduto.categoria}
                  onChange={(e) => setDadosEdicaoProduto({...dadosEdicaoProduto, categoria: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea
                  value={dadosEdicaoProduto.descricao}
                  onChange={(e) => setDadosEdicaoProduto({...dadosEdicaoProduto, descricao: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setProdutoEditando(null)
                  setDadosEdicaoProduto(null)
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvarEdicaoProduto}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
