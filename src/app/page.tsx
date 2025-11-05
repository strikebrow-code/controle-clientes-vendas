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
  const [estoqueVendedores, setEstoqueVendedores] = useState<EstoqueVendedor[]>([])
  const [mostrarControleEstoque, setMostrarControleEstoque] = useState(false)
  const [novoEstoque, setNovoEstoque] = useState({
    vendedorId: 0,
    produtoId: 0,
    quantidadeLevada: 0
  })

  // Estados para configuração do banco
  const [mostrarConfigBanco, setMostrarConfigBanco] = useState(false)
  const [statusBanco, setStatusBanco] = useState<'conectado' | 'desconectado' | 'configurando'>('desconectado')

  // Estados para carrinho de compras
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])

  // Usuários do sistema - LIMPOS E SUBSTITUÍDOS POR 15 VENDEDORES ATIVOS
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
      nome: 'Vendedor 01',
      email: 'vendedor01@vendas.com',
      senha: '123456',
      tipo: 'vendedor',
      ativo: true,
      dataRegistro: '2024-01-15',
      criadoPor: 'Admin',
      comissao: 5
    },
    {
      id: 3,
      nome: 'Vendedor 02',
      email: 'vendedor02@vendas.com',
      senha: '123456',
      tipo: 'vendedor',
      ativo: true,
      dataRegistro: '2024-01-16',
      criadoPor: 'Admin',
      comissao: 6
    },
    {
      id: 4,
      nome: 'Vendedor 03',
      email: 'vendedor03@vendas.com',
      senha: '123456',
      tipo: 'vendedor',
      ativo: true,
      dataRegistro: '2024-01-17',
      criadoPor: 'Admin',
      comissao: 5.5
    },
    {
      id: 5,
      nome: 'Vendedor 04',
      email: 'vendedor04@vendas.com',
      senha: '123456',
      tipo: 'vendedor',
      ativo: true,
      dataRegistro: '2024-01-18',
      criadoPor: 'Admin',
      comissao: 7
    },
    {
      id: 6,
      nome: 'Vendedor 05',
      email: 'vendedor05@vendas.com',
      senha: '123456',
      tipo: 'vendedor',
      ativo: true,
      dataRegistro: '2024-01-19',
      criadoPor: 'Admin',
      comissao: 6.5
    },
    {
      id: 7,
      nome: 'Vendedor 06',
      email: 'vendedor06@vendas.com',
      senha: '123456',
      tipo: 'vendedor',
      ativo: true,
      dataRegistro: '2024-01-20',
      criadoPor: 'Admin',
      comissao: 5
    },
    {
      id: 8,
      nome: 'Vendedor 07',
      email: 'vendedor07@vendas.com',
      senha: '123456',
      tipo: 'vendedor',
      ativo: true,
      dataRegistro: '2024-01-21',
      criadoPor: 'Admin',
      comissao: 6
    },
    {
      id: 9,
      nome: 'Vendedor 08',
      email: 'vendedor08@vendas.com',
      senha: '123456',
      tipo: 'vendedor',
      ativo: true,
      dataRegistro: '2024-01-22',
      criadoPor: 'Admin',
      comissao: 5.5
    },
    {
      id: 10,
      nome: 'Vendedor 09',
      email: 'vendedor09@vendas.com',
      senha: '123456',
      tipo: 'vendedor',
      ativo: true,
      dataRegistro: '2024-01-23',
      criadoPor: 'Admin',
      comissao: 7
    },
    {
      id: 11,
      nome: 'Vendedor 10',
      email: 'vendedor10@vendas.com',
      senha: '123456',
      tipo: 'vendedor',
      ativo: true,
      dataRegistro: '2024-01-24',
      criadoPor: 'Admin',
      comissao: 6
    },
    {
      id: 12,
      nome: 'Vendedor 11',
      email: 'vendedor11@vendas.com',
      senha: '123456',
      tipo: 'vendedor',
      ativo: true,
      dataRegistro: '2024-01-25',
      criadoPor: 'Admin',
      comissao: 5.5
    },
    {
      id: 13,
      nome: 'Vendedor 12',
      email: 'vendedor12@vendas.com',
      senha: '123456',
      tipo: 'vendedor',
      ativo: true,
      dataRegistro: '2024-01-26',
      criadoPor: 'Admin',
      comissao: 6.5
    },
    {
      id: 14,
      nome: 'Vendedor 13',
      email: 'vendedor13@vendas.com',
      senha: '123456',
      tipo: 'vendedor',
      ativo: true,
      dataRegistro: '2024-01-27',
      criadoPor: 'Admin',
      comissao: 7
    },
    {
      id: 15,
      nome: 'Vendedor 14',
      email: 'vendedor14@vendas.com',
      senha: '123456',
      tipo: 'vendedor',
      ativo: true,
      dataRegistro: '2024-01-28',
      criadoPor: 'Admin',
      comissao: 5
    },
    {
      id: 16,
      nome: 'Vendedor 15',
      email: 'vendedor15@vendas.com',
      senha: '123456',
      tipo: 'vendedor',
      ativo: true,
      dataRegistro: '2024-01-29',
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
      vendedorResponsavel: "Vendedor 01",
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
      vendedorResponsavel: "Vendedor 02",
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
      vendedorResponsavel: "Vendedor 03",
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
      vendedorResponsavel: "Vendedor 04",
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
      vendedorResponsavel: "Vendedor 05",
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
      valorTotal: 250.00,
      formaPagamento: "Dinheiro",
      observacoes: "Entrega realizada com sucesso",
      status: "Concluída",
      vendedorResponsavel: "Vendedor 01",
      statusPagamento: "Pago"
    },
    {
      id: 2,
      clienteId: 2,
      produtoId: 2,
      data: "2024-01-18",
      quantidade: 7,
      precoUnitario: 25.00,
      valorTotal: 175.00,
      formaPagamento: "PIX",
      observacoes: "Cliente satisfeito",
      status: "Concluída",
      vendedorResponsavel: "Vendedor 02",
      statusPagamento: "Pago"
    },
    {
      id: 3,
      clienteId: 3,
      produtoId: 1,
      data: "2024-01-20",
      quantidade: 6,
      precoUnitario: 50.00,
      valorTotal: 300.00,
      formaPagamento: "Nota Feita",
      observacoes: "Pagamento em 30 dias",
      status: "Concluída",
      vendedorResponsavel: "Vendedor 03",
      numeroNota: "NF-2024-001",
      statusPagamento: "Pendente"
    },
    {
      id: 4,
      clienteId: 4,
      produtoId: 3,
      data: "2024-01-22",
      quantidade: 15,
      precoUnitario: 15.00,
      valorTotal: 225.00,
      formaPagamento: "Boleto",
      observacoes: "Entrega agendada",
      status: "Concluída",
      vendedorResponsavel: "Vendedor 04",
      statusPagamento: "Pago"
    },
    {
      id: 5,
      clienteId: 5,
      produtoId: 4,
      data: "2024-01-25",
      quantidade: 20,
      precoUnitario: 8.50,
      valorTotal: 170.00,
      formaPagamento: "Dinheiro",
      observacoes: "Produto muito bem aceito",
      status: "Concluída",
      vendedorResponsavel: "Vendedor 05",
      statusPagamento: "Pago"
    },
    {
      id: 6,
      clienteId: 1,
      produtoId: 5,
      data: new Date().toISOString().split('T')[0],
      quantidade: 10,
      precoUnitario: 3.20,
      valorTotal: 32.00,
      formaPagamento: "PIX",
      observacoes: "Venda do dia",
      status: "Concluída",
      vendedorResponsavel: "Vendedor 01",
      statusPagamento: "Pago"
    },
    {
      id: 7,
      clienteId: 2,
      produtoId: 2,
      data: new Date().toISOString().split('T')[0],
      quantidade: 3,
      precoUnitario: 25.00,
      valorTotal: 75.00,
      formaPagamento: "Nota Feita",
      observacoes: "Pagamento em 15 dias",
      status: "Concluída",
      vendedorResponsavel: "Vendedor 02",
      numeroNota: "NF-2024-002",
      statusPagamento: "Pendente"
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

  // Função para obter notas a receber
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

  // Funções do carrinho
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
        precoUnitario: produto.preco
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

  // NOVA FUNÇÃO: Atualizar preço unitário no carrinho
  const atualizarPrecoCarrinho = (produtoId: number, novoPreco: number) => {
    if (novoPreco < 0) return // Não permitir preços negativos
    
    setCarrinho(carrinho.map(item => 
      item.produtoId === produtoId 
        ? { ...item, precoUnitario: novoPreco }
        : item
    ))
  }

  const limparCarrinho = () => {
    setCarrinho([])
  }

  const calcularTotalCarrinho = () => {
    return carrinho.reduce((total, item) => total + (item.quantidade * item.precoUnitario), 0)
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
      valorTotal: item.quantidade * item.precoUnitario,
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

  // Função de login CORRIGIDA - Bug de acesso dos vendedores
  const fazerLogin = () => {
    const usuario = usuarios.find(u => 
      u.email === dadosLogin.email && 
      u.senha === dadosLogin.senha && 
      u.tipo === tipoLogin &&
      u.ativo === true // CORREÇÃO: Verificar se está ativo
    )

    if (!usuario) {
      alert('Email, senha incorretos ou conta inativa. Verifique suas credenciais.')
      return
    }

    setUsuarioLogado(usuario)
    setTelaLogin(false)
    setDadosLogin({ email: '', senha: '' })
    setStatusBanco('conectado')
  }

  // Função para criar conta CORRIGIDA - Bug de ativação automática
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
      ativo: true, // CORREÇÃO: Agora todos ficam ativos automaticamente
      dataRegistro: new Date().toISOString().split('T')[0],
      comissao: dadosCriarConta.tipo === 'vendedor' ? 5 : undefined
    }

    setUsuarios([...usuarios, novoUsuario])
    setDadosCriarConta({ nome: '', email: '', senha: '', confirmarSenha: '', tipo: 'vendedor' })
    setMostrarCriarConta(false)
    
    alert(`Conta criada com sucesso! Você já pode fazer login.`)
  }

  // Função de logout
  const fazerLogout = () => {
    setUsuarioLogado(null)
    setTelaLogin(true)
    setAbaSelecionada('dashboard')
    setStatusBanco('desconectado')
  }

  // Função para adicionar vendedor CORRIGIDA (apenas admin)
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
      ativo: true, // CORREÇÃO: Vendedor criado pelo admin já fica ativo
      dataRegistro: new Date().toISOString().split('T')[0],
      criadoPor: usuarioLogado.nome,
      comissao: novoVendedor.comissao
    }

    setUsuarios([...usuarios, vendedor])
    setNovoVendedor({ nome: '', email: '', senha: '', comissao: 5 })
    setMostrarAdicionarVendedor(false)
    alert(`Vendedor ${vendedor.nome} adicionado com sucesso!\nEmail: ${vendedor.email}\nSenha: ${vendedor.senha}\nStatus: ATIVO - Pode fazer login imediatamente`)
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

  // Função para trocar senha do vendedor (admin) - CORRIGIDA
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

    // CORREÇÃO: Usar função de callback para garantir que o estado seja atualizado corretamente
    setUsuarios(usuariosAtuais => 
      usuariosAtuais.map(u => 
        u.id === vendedorTrocandoSenha.id 
          ? { ...u, senha: novaSenhaVendedor }
          : u
      )
    )

    // Limpar estados
    const nomeVendedor = vendedorTrocandoSenha.nome
    const novaSenha = novaSenhaVendedor
    
    setVendedorTrocandoSenha(null)
    setNovaSenhaVendedor('')
    setConfirmarNovaSenha('')
    
    alert(`Senha do vendedor ${nomeVendedor} alterada com sucesso!\nNova senha: ${novaSenha}`)
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
      { id: 'controleEstoque', label: 'Meu Estoque', icon: Package }
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
                
                <div className="text-center">
                  <span className="text-gray-500 text-sm">ou</span>
                </div>
                
                <button
                  onClick={() => alert('Funcionalidade em desenvolvimento')}
                  className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Entrar com Google
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
                Sua conta será ativada automaticamente e você poderá fazer login imediatamente.
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
        
        <nav className="mt-6">
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
                }}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                  abaSelecionada === item.id
                    ? 'bg-blue-500 text-white'
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

          {/* Clientes */}
          {abaSelecionada === 'clientes' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {usuarioLogado?.tipo === 'vendedor' ? 'Meus Clientes' : 'Clientes'}
                </h2>
                <button
                  onClick={() => setAbaSelecionada('adicionar')}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Cliente
                </button>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar clientes..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Compra</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clientesFiltrados.map((cliente) => (
                        <tr key={cliente.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{cliente.nomeEmpresa}</div>
                                <div className="text-sm text-gray-500">{cliente.documento}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{cliente.responsavelCompra}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{cliente.telefone}</div>
                            <div className="text-sm text-gray-500">{cliente.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{cliente.cidade}, {cliente.estado}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{cliente.vendedorResponsavel}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatarData(cliente.ultimaCompra)}</div>
                            <div className="text-sm text-gray-500">{formatarMoeda(cliente.valorUltimaCompra)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              {usuarioLogado?.tipo === 'admin' && (
                                <button
                                  onClick={() => iniciarEdicaoCliente(cliente)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => iniciarAlteracaoRota(cliente)}
                                className="text-green-600 hover:text-green-900"
                                title="Alterar dias de visita"
                              >
                                <Route className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Edição de Cliente */}
          {clienteEditando && dadosEdicaoCliente && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Editar Cliente</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Responsável pela Compra</label>
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
                      type="text"
                      value={dadosEdicaoCliente.telefone}
                      onChange={(e) => setDadosEdicaoCliente({...dadosEdicaoCliente, telefone: e.target.value})}
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
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                  <textarea
                    value={dadosEdicaoCliente.observacoes}
                    onChange={(e) => setDadosEdicaoCliente({...dadosEdicaoCliente, observacoes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
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

          {/* Modal de Alteração de Rota */}
          {clienteAlterandoRota && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Alterar Dias de Visita - {clienteAlterandoRota.nomeEmpresa}
                </h3>
                
                <div className="space-y-2">
                  {diasSemana.map((dia) => (
                    <label key={dia} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={novosDiasVisita.includes(dia)}
                        onChange={() => toggleDiaRota(dia)}
                        className="mr-2"
                      />
                      {dia}
                    </label>
                  ))}
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

          {/* Produtos */}
          {abaSelecionada === 'produtos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Produtos</h2>
                {usuarioLogado?.tipo === 'admin' && (
                  <button
                    onClick={() => setAbaSelecionada('adicionarProduto')}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Produto
                  </button>
                )}
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar produtos..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {produtosFiltrados.map((produto) => (
                    <div key={produto.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <Package className="w-8 h-8 text-blue-500 mr-3" />
                          <div>
                            <h3 className="font-semibold text-gray-800">{produto.nome}</h3>
                            <p className="text-sm text-gray-500">{produto.categoria}</p>
                          </div>
                        </div>
                        {usuarioLogado?.tipo === 'admin' && (
                          <button
                            onClick={() => removerProduto(produto.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{produto.descricao}</p>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-lg font-bold text-green-600">{formatarMoeda(produto.preco)}</div>
                          <div className="text-sm text-gray-500">Estoque: {produto.estoque}</div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          produto.estoque > 50 ? 'bg-green-100 text-green-800' :
                          produto.estoque > 20 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {produto.estoque > 50 ? 'Alto' : produto.estoque > 20 ? 'Médio' : 'Baixo'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Vendas */}
          {abaSelecionada === 'vendas' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {usuarioLogado?.tipo === 'vendedor' ? 'Minhas Vendas' : 'Vendas'}
                </h2>
                <button
                  onClick={() => setAbaSelecionada('registrarVenda')}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Registrar Venda
                </button>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vendasFiltradas.map((venda) => {
                        const cliente = clientes.find(c => c.id === venda.clienteId)
                        const produto = produtos.find(p => p.id === venda.produtoId)
                        return (
                          <tr key={venda.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatarData(venda.data)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {cliente?.nomeEmpresa}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {produto?.nome}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {venda.quantidade}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              {formatarMoeda(venda.valorTotal)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{venda.formaPagamento}</div>
                              {venda.numeroNota && (
                                <div className="text-xs text-gray-500">{venda.numeroNota}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {venda.vendedorResponsavel}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
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
              </div>
            </div>
          )}

          {/* Rotas */}
          {abaSelecionada === 'rotas' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {usuarioLogado?.tipo === 'vendedor' ? 'Minhas Rotas' : 'Rotas de Vendas'}
                </h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Filtrar por vendedor..."
                      value={filtroRotas}
                      onChange={(e) => setFiltroRotas(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {diaSelecionado ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setDiaSelecionado(null)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <Navigation className="w-4 h-4" />
                      Voltar para visão geral
                    </button>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Clientes para {diaSelecionado} ({clientesPorDia(diaSelecionado).length} clientes)
                    </h3>
                  </div>

                  <div className="bg-white rounded-lg shadow">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Compra</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {clientesPorDia(diaSelecionado)
                            .filter(cliente => 
                              usuarioLogado?.tipo === 'admin' || 
                              cliente.vendedorResponsavel.toLowerCase().includes(filtroRotas.toLowerCase())
                            )
                            .map((cliente) => (
                            <tr key={cliente.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{cliente.nomeEmpresa}</div>
                                    <div className="text-sm text-gray-500">{cliente.documento}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {cliente.responsavelCompra}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{cliente.endereco}</div>
                                <div className="text-sm text-gray-500">{cliente.cidade}, {cliente.estado}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {cliente.telefone}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {cliente.vendedorResponsavel}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatarData(cliente.ultimaCompra)}</div>
                                <div className="text-sm text-gray-500">{formatarMoeda(cliente.valorUltimaCompra)}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {diasSemana.map((dia) => {
                    const totalClientes = contarClientesPorDia(dia)
                    return (
                      <div
                        key={dia}
                        onClick={() => totalClientes > 0 && setDiaSelecionado(dia)}
                        className={`bg-gradient-to-br ${coresDias[dia as keyof typeof coresDias]} text-white p-6 rounded-lg shadow-lg ${
                          totalClientes > 0 ? 'cursor-pointer hover:shadow-xl transform hover:scale-105' : 'opacity-50'
                        } transition-all duration-200`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">{dia}</h3>
                          <Calendar className="w-6 h-6 opacity-80" />
                        </div>
                        <div className="text-3xl font-bold mb-2">{totalClientes}</div>
                        <div className="text-sm opacity-90">
                          {totalClientes === 1 ? 'cliente' : 'clientes'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Relatórios */}
          {abaSelecionada === 'relatorios' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Relatórios</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vendas por Forma de Pagamento */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendas por Forma de Pagamento</h3>
                  <div className="space-y-3">
                    {Object.entries(calcularTotaisPorPagamento()).map(([forma, dados]) => (
                      <div key={forma} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-800">{forma}</div>
                          <div className="text-sm text-gray-500">{dados.quantidade} vendas</div>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {formatarMoeda(dados.valor)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Produtos */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Produtos Mais Vendidos</h3>
                  <div className="space-y-3">
                    {produtos
                      .map(produto => ({
                        ...produto,
                        totalVendido: vendasFiltradas
                          .filter(v => v.produtoId === produto.id)
                          .reduce((acc, v) => acc + v.quantidade, 0)
                      }))
                      .sort((a, b) => b.totalVendido - a.totalVendido)
                      .slice(0, 5)
                      .map((produto) => (
                        <div key={produto.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-800">{produto.nome}</div>
                            <div className="text-sm text-gray-500">{formatarMoeda(produto.preco)}</div>
                          </div>
                          <div className="text-lg font-bold text-blue-600">
                            {produto.totalVendido}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Vendas por Vendedor (apenas admin) */}
                {usuarioLogado?.tipo === 'admin' && (
                  <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance dos Vendedores</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clientes</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendas (Mês)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento (Mês)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comissão</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {vendedoresAtivos.map((vendedor) => {
                            const stats = calcularEstatisticasVendedor(vendedor)
                            return (
                              <tr key={vendedor} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {vendedor}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {stats.totalClientes}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {stats.vendasMes}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                  {formatarMoeda(stats.faturamentoMes)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatarMoeda(stats.comissaoMes)} ({stats.percentualComissao}%)
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Adicionar Cliente */}
          {abaSelecionada === 'adicionar' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Adicionar Novo Cliente</h2>
                
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
                      placeholder={novoCliente.tipoDocumento === 'CNPJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={novoCliente.email}
                      onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contato@empresa.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                    <input
                      type="text"
                      value={novoCliente.telefone}
                      onChange={(e) => setNovoCliente({...novoCliente, telefone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                    <input
                      type="text"
                      value={novoCliente.endereco}
                      onChange={(e) => setNovoCliente({...novoCliente, endereco: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Rua das Flores, 123"
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
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vendedor Responsável</label>
                    <select
                      value={novoCliente.vendedorResponsavel}
                      onChange={(e) => setNovoCliente({...novoCliente, vendedorResponsavel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione um vendedor</option>
                      {usuarioLogado?.tipo === 'admin' ? (
                        vendedoresAtivos.map(vendedor => (
                          <option key={vendedor} value={vendedor}>{vendedor}</option>
                        ))
                      ) : (
                        <option value={usuarioLogado?.nome}>{usuarioLogado?.nome}</option>
                      )}
                    </select>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dias de Visita</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                    {diasSemana.map((dia) => (
                      <label key={dia} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={novoCliente.diasVisita.includes(dia)}
                          onChange={() => toggleDiaVisita(dia)}
                          className="mr-2"
                        />
                        <span className="text-sm">{dia}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
                  <div className="flex gap-4">
                    <button
                      onClick={obterLocalizacao}
                      disabled={carregandoLocalizacao}
                      className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                      <MapPin className="w-4 h-4" />
                      {carregandoLocalizacao ? 'Obtendo...' : 'Obter Localização Atual'}
                    </button>
                    {localizacaoAtual && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Localização obtida
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                  <textarea
                    value={novoCliente.observacoes}
                    onChange={(e) => setNovoCliente({...novoCliente, observacoes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Informações adicionais sobre o cliente..."
                  />
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

          {/* Adicionar Produto */}
          {abaSelecionada === 'adicionarProduto' && usuarioLogado?.tipo === 'admin' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Adicionar Novo Produto</h2>
                
                <div className="space-y-4">
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        placeholder="Ex: Pacotes, Doces"
                      />
                    </div>
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
                  
                  <div>
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
                    className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Adicionar Produto
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Registrar Venda com Carrinho - ATUALIZADO COM EDIÇÃO DE PREÇO */}
          {abaSelecionada === 'registrarVenda' && (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Formulário de Venda */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Nova Venda</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
                      <select
                        value={novaVenda.clienteId}
                        onChange={(e) => setNovaVenda({...novaVenda, clienteId: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={0}>Selecione um cliente</option>
                        {clientesFiltrados.map((cliente) => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nomeEmpresa}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data *</label>
                      <input
                        type="date"
                        value={novaVenda.data}
                        onChange={(e) => setNovaVenda({...novaVenda, data: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento *</label>
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
                    
                    {novaVenda.formaPagamento === 'Nota Feita' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Número da Nota *</label>
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

                {/* Lista de Produtos e Carrinho */}
                <div className="space-y-6">
                  {/* Produtos Disponíveis */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Produtos Disponíveis</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {produtos.map((produto) => (
                        <div key={produto.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{produto.nome}</div>
                            <div className="text-sm text-gray-500">{formatarMoeda(produto.preco)} • Estoque: {produto.estoque}</div>
                          </div>
                          <button
                            onClick={() => adicionarAoCarrinho(produto.id)}
                            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Carrinho COM EDIÇÃO DE PREÇO */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Carrinho</h3>
                      {carrinho.length > 0 && (
                        <button
                          onClick={limparCarrinho}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Limpar Carrinho
                        </button>
                      )}
                    </div>
                    
                    {carrinho.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Carrinho vazio</p>
                        <p className="text-sm">Adicione produtos para começar</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {carrinho.map((item) => {
                          const produto = produtos.find(p => p.id === item.produtoId)
                          return (
                            <div key={item.produtoId} className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{produto?.nome}</div>
                                  <div className="text-sm text-gray-500">
                                    Preço original: {formatarMoeda(produto?.preco || 0)}
                                  </div>
                                </div>
                                <button
                                  onClick={() => removerDoCarrinho(item.produtoId)}
                                  className="text-red-500 hover:text-red-700 ml-2"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              
                              {/* NOVA SEÇÃO: Edição de Preço */}
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Preço Unitário (Editável)
                                  </label>
                                  <div className="flex items-center">
                                    <span className="text-sm text-gray-500 mr-2">R$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={item.precoUnitario}
                                      onChange={(e) => atualizarPrecoCarrinho(item.produtoId, parseFloat(e.target.value) || 0)}
                                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Quantidade</label>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => removerDoCarrinho(item.produtoId)}
                                      className="bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-8 text-center font-medium">{item.quantidade}</span>
                                    <button
                                      onClick={() => adicionarAoCarrinho(item.produtoId)}
                                      className="bg-green-500 text-white p-1 rounded hover:bg-green-600 transition-colors"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Cálculo do Total do Item */}
                              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                <span className="text-sm text-gray-600">
                                  {formatarMoeda(item.precoUnitario)} × {item.quantidade}
                                </span>
                                <span className="font-bold text-green-600">
                                  {formatarMoeda(item.quantidade * item.precoUnitario)}
                                </span>
                              </div>
                              
                              {/* Indicador de Desconto/Acréscimo */}
                              {produto && item.precoUnitario !== produto.preco && (
                                <div className="mt-2 text-xs">
                                  {item.precoUnitario < produto.preco ? (
                                    <span className="text-green-600 font-medium">
                                      ↓ Desconto de {formatarMoeda(produto.preco - item.precoUnitario)} por unidade
                                    </span>
                                  ) : (
                                    <span className="text-orange-600 font-medium">
                                      ↑ Acréscimo de {formatarMoeda(item.precoUnitario - produto.preco)} por unidade
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                        
                        <div className="border-t pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-800">Total:</span>
                            <span className="text-2xl font-bold text-green-600">
                              {formatarMoeda(calcularTotalCarrinho())}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setAbaSelecionada('vendas')}
                      className="flex-1 px-6 py-3 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={registrarVendaCarrinho}
                      disabled={!novaVenda.clienteId || carrinho.length === 0}
                      className="flex-1 px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Registrar Venda
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Usuários (Admin) */}
          {abaSelecionada === 'usuarios' && usuarioLogado?.tipo === 'admin' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Gerenciar Usuários</h2>
                <button
                  onClick={() => setMostrarAdicionarVendedor(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Adicionar Vendedor
                </button>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comissão</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Registro</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {usuarios.map((usuario) => (
                        <tr key={usuario.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                usuario.tipo === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                              }`}>
                                {usuario.tipo === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{usuario.nome}</div>
                                {usuario.criadoPor && (
                                  <div className="text-xs text-gray-500">Criado por: {usuario.criadoPor}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {usuario.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              usuario.tipo === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {usuario.tipo === 'admin' ? 'Administrador' : 'Vendedor'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              usuario.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {usuario.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {usuario.tipo === 'vendedor' ? `${usuario.comissao || 5}%` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatarData(usuario.dataRegistro)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {usuario.tipo === 'vendedor' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => iniciarEdicaoVendedor(usuario)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Editar vendedor"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => iniciarTrocaSenhaVendedor(usuario)}
                                  className="text-purple-600 hover:text-purple-900"
                                  title="Trocar senha"
                                >
                                  <Key className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => alternarStatusVendedor(usuario.id)}
                                  className={`${usuario.ativo ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                                  title={usuario.ativo ? 'Desativar' : 'Ativar'}
                                >
                                  {usuario.ativo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => excluirVendedor(usuario.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Excluir vendedor"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Modal Adicionar Vendedor */}
          {mostrarAdicionarVendedor && (
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
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email (Login)</label>
                    <input
                      type="email"
                      value={novoVendedor.email}
                      onChange={(e) => setNovoVendedor({...novoVendedor, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="joao@vendas.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                    <input
                      type="password"
                      value={novoVendedor.senha}
                      onChange={(e) => setNovoVendedor({...novoVendedor, senha: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Digite a senha"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comissão (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={novoVendedor.comissao}
                      onChange={(e) => setNovoVendedor({...novoVendedor, comissao: parseFloat(e.target.value) || 5})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Editar Vendedor */}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email (Login)</label>
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
                      min="0"
                      max="100"
                      step="0.1"
                      value={dadosEdicaoVendedor.comissao}
                      onChange={(e) => setDadosEdicaoVendedor({...dadosEdicaoVendedor, comissao: parseFloat(e.target.value) || 5})}
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

          {/* Modal Trocar Senha Vendedor */}
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
                      type="password"
                      value={novaSenhaVendedor}
                      onChange={(e) => setNovaSenhaVendedor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Digite a nova senha"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
                    <input
                      type="password"
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
                    Alterar Senha
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Perfil do Vendedor */}
          {abaSelecionada === 'perfilVendedor' && usuarioLogado?.tipo === 'vendedor' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Meu Perfil</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informações do Vendedor */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações Pessoais</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nome:</span>
                      <span className="font-medium">{usuarioLogado.nome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{usuarioLogado.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Comissão:</span>
                      <span className="font-medium">{usuarioLogado.comissao || 5}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data de Registro:</span>
                      <span className="font-medium">{formatarData(usuarioLogado.dataRegistro)}</span>
                    </div>
                  </div>
                </div>

                {/* Estatísticas do Vendedor */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Minhas Estatísticas</h3>
                  {(() => {
                    const stats = calcularEstatisticasVendedor(usuarioLogado.nome)
                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total de Clientes:</span>
                          <span className="font-medium text-blue-600">{stats.totalClientes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vendas este Mês:</span>
                          <span className="font-medium text-green-600">{stats.vendasMes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Faturamento do Mês:</span>
                          <span className="font-medium text-purple-600">{formatarMoeda(stats.faturamentoMes)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Comissão do Mês:</span>
                          <span className="font-medium text-orange-600">{formatarMoeda(stats.comissaoMes)}</span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Vendas Recentes */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Minhas Vendas Recentes</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vendasFiltradas.slice(0, 5).map((venda) => {
                        const cliente = clientes.find(c => c.id === venda.clienteId)
                        const produto = produtos.find(p => p.id === venda.produtoId)
                        return (
                          <tr key={venda.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatarData(venda.data)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {cliente?.nomeEmpresa}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {produto?.nome}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              {formatarMoeda(venda.valorTotal)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {venda.formaPagamento}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Acompanhar Vendedores (Admin) */}
          {abaSelecionada === 'acompanharVendedores' && usuarioLogado?.tipo === 'admin' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Acompanhar Vendedores</h2>
                <select
                  value={vendedorSelecionado}
                  onChange={(e) => setVendedorSelecionado(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione um vendedor</option>
                  {vendedoresAtivos.map(vendedor => (
                    <option key={vendedor} value={vendedor}>{vendedor}</option>
                  ))}
                </select>
              </div>

              {vendedorSelecionado && (
                <div className="space-y-6">
                  {/* Estatísticas do Vendedor Selecionado */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {(() => {
                      const stats = calcularEstatisticasVendedor(vendedorSelecionado)
                      return (
                        <>
                          <div className="bg-blue-500 text-white p-6 rounded-lg">
                            <div className="text-3xl font-bold">{stats.totalClientes}</div>
                            <div className="text-sm opacity-90">Clientes</div>
                          </div>
                          <div className="bg-green-500 text-white p-6 rounded-lg">
                            <div className="text-3xl font-bold">{stats.vendasMes}</div>
                            <div className="text-sm opacity-90">Vendas (Mês)</div>
                          </div>
                          <div className="bg-purple-500 text-white p-6 rounded-lg">
                            <div className="text-3xl font-bold">{formatarMoeda(stats.faturamentoMes)}</div>
                            <div className="text-sm opacity-90">Faturamento (Mês)</div>
                          </div>
                          <div className="bg-orange-500 text-white p-6 rounded-lg">
                            <div className="text-3xl font-bold">{formatarMoeda(stats.comissaoMes)}</div>
                            <div className="text-sm opacity-90">Comissão (Mês)</div>
                          </div>
                        </>
                      )
                    })()}
                  </div>

                  {/* Vendas do Vendedor */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Vendas de {vendedorSelecionado}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {vendas
                            .filter(venda => venda.vendedorResponsavel === vendedorSelecionado)
                            .map((venda) => {
                              const cliente = clientes.find(c => c.id === venda.clienteId)
                              const produto = produtos.find(p => p.id === venda.produtoId)
                              return (
                                <tr key={venda.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatarData(venda.data)}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {cliente?.nomeEmpresa}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {produto?.nome}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {venda.quantidade}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                    {formatarMoeda(venda.valorTotal)}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {venda.formaPagamento}
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Estoque do Vendedor */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Estoque de {vendedorSelecionado}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Levado</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendido</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">A Devolver</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {obterEstoqueVendedorEspecifico(vendedorSelecionado).map((estoque) => {
                            const quantidadeVendida = calcularQuantidadeVendidaVendedor(vendedorSelecionado, estoque.produtoId)
                            return (
                              <tr key={estoque.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {estoque.produtoNome}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {estoque.quantidadeLevada}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                  {quantidadeVendida}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                                  {estoque.quantidadeLevada - quantidadeVendida}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatarData(estoque.data)}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fechamento do Dia (Vendedor) */}
          {abaSelecionada === 'fechamentoDia' && usuarioLogado?.tipo === 'vendedor' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Fechamento do Dia</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resumo de Vendas do Dia */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendas de Hoje</h3>
                  <div className="space-y-3">
                    {Object.entries(calcularTotaisPorPagamento()).map(([forma, dados]) => (
                      <div key={forma} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-800">{forma}</div>
                          <div className="text-sm text-gray-500">{dados.quantidade} vendas</div>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {formatarMoeda(dados.valor)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800">Total do Dia:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatarMoeda(Object.values(calcularTotaisPorPagamento()).reduce((acc, dados) => acc + dados.valor, 0))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Estoque Atual */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Meu Estoque</h3>
                  <div className="space-y-3">
                    {obterEstoqueVendedor().map((estoque) => {
                      const quantidadeVendida = calcularQuantidadeVendida(estoque.produtoId)
                      return (
                        <div key={estoque.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-800">{estoque.produtoNome}</div>
                          <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                            <div>
                              <span className="text-gray-500">Levado:</span>
                              <div className="font-medium">{estoque.quantidadeLevada}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Vendido:</span>
                              <div className="font-medium text-green-600">{quantidadeVendida}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Devolver:</span>
                              <div className="font-medium text-orange-600">{estoque.quantidadeLevada - quantidadeVendida}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Vendas Detalhadas do Dia */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendas Detalhadas de Hoje</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {obterVendasDoDia().map((venda) => {
                        const cliente = clientes.find(c => c.id === venda.clienteId)
                        const produto = produtos.find(p => p.id === venda.produtoId)
                        return (
                          <tr key={venda.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {cliente?.nomeEmpresa}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {produto?.nome}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {venda.quantidade}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              {formatarMoeda(venda.valorTotal)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {venda.formaPagamento}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Fechamento do Dia Admin */}
          {abaSelecionada === 'fechamentoDiaAdmin' && usuarioLogado?.tipo === 'admin' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Fechamento do Dia - Admin</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Data Inicial</label>
                      <input
                        type="date"
                        value={dataInicialFechamento}
                        onChange={(e) => setDataInicialFechamento(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Data Final</label>
                      <input
                        type="date"
                        value={dataFinalFechamento}
                        onChange={(e) => setDataFinalFechamento(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Vendedor</label>
                    <select
                      value={vendedorFechamento}
                      onChange={(e) => setVendedorFechamento(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione um vendedor</option>
                      {vendedoresAtivos.map(vendedor => (
                        <option key={vendedor} value={vendedor}>{vendedor}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {vendedorFechamento && (
                <div className="space-y-6">
                  {/* Resumo de Vendas do Vendedor por Período */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Vendas de {vendedorFechamento} - {formatarData(dataInicialFechamento)} a {formatarData(dataFinalFechamento)}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(calcularTotaisPorPagamentoPeriodoVendedor(vendedorFechamento, dataInicialFechamento, dataFinalFechamento)).map(([forma, dados]) => (
                        <div key={forma} className="p-4 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-800">{forma}</div>
                          <div className="text-sm text-gray-500">{dados.quantidade} vendas</div>
                          <div className="text-lg font-bold text-green-600">
                            {formatarMoeda(dados.valor)}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-800">Total do Período:</span>
                        <span className="text-2xl font-bold text-green-600">
                          {formatarMoeda(Object.values(calcularTotaisPorPagamentoPeriodoVendedor(vendedorFechamento, dataInicialFechamento, dataFinalFechamento)).reduce((acc, dados) => acc + dados.valor, 0))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Estoque do Vendedor */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Estoque - {vendedorFechamento}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Levado</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendido</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">A Devolver</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {obterEstoqueVendedorEspecifico(vendedorFechamento).map((estoque) => {
                            const quantidadeVendida = calcularQuantidadeVendidaVendedor(vendedorFechamento, estoque.produtoId)
                            return (
                              <tr key={estoque.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {estoque.produtoNome}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {estoque.quantidadeLevada}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                  {quantidadeVendida}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                                  {estoque.quantidadeLevada - quantidadeVendida}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatarData(estoque.data)}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Vendas Detalhadas por Período */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Vendas Detalhadas - {vendedorFechamento}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {obterVendasPorPeriodoVendedor(vendedorFechamento, dataInicialFechamento, dataFinalFechamento).map((venda) => {
                            const cliente = clientes.find(c => c.id === venda.clienteId)
                            const produto = produtos.find(p => p.id === venda.produtoId)
                            return (
                              <tr key={venda.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatarData(venda.data)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {cliente?.nomeEmpresa}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {produto?.nome}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {venda.quantidade}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                  {formatarMoeda(venda.valorTotal)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {venda.formaPagamento}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Controle de Estoque (Admin) */}
          {abaSelecionada === 'controleEstoque' && usuarioLogado?.tipo === 'admin' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Controle de Estoque</h2>
                <button
                  onClick={() => setMostrarControleEstoque(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Estoque
                </button>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Levado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendido</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">A Devolver</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {estoqueVendedores.map((estoque) => {
                        const quantidadeVendida = calcularQuantidadeVendidaVendedor(estoque.vendedorNome, estoque.produtoId)
                        return (
                          <tr key={estoque.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <User className="w-5 h-5 text-gray-400 mr-3" />
                                <div className="text-sm font-medium text-gray-900">{estoque.vendedorNome}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {estoque.produtoNome}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {estoque.quantidadeLevada}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                              {quantidadeVendida}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                              {estoque.quantidadeLevada - quantidadeVendida}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatarData(estoque.data)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                estoque.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {estoque.status === 'ativo' ? 'Ativo' : 'Finalizado'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Modal Adicionar Estoque */}
          {mostrarControleEstoque && (
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
                      {usuarios.filter(u => u.tipo === 'vendedor' && u.ativo).map(vendedor => (
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
                      {produtos.map(produto => (
                        <option key={produto.id} value={produto.id}>{produto.nome}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade Levada</label>
                    <input
                      type="number"
                      min="1"
                      value={novoEstoque.quantidadeLevada}
                      onChange={(e) => setNovoEstoque({...novoEstoque, quantidadeLevada: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Quantidade"
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
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Meu Estoque (Vendedor) */}
          {abaSelecionada === 'controleEstoque' && usuarioLogado?.tipo === 'vendedor' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Meu Estoque</h2>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Levado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendido</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">A Devolver</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {obterEstoqueVendedor().map((estoque) => {
                        const quantidadeVendida = calcularQuantidadeVendida(estoque.produtoId)
                        return (
                          <tr key={estoque.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Package className="w-5 h-5 text-gray-400 mr-3" />
                                <div className="text-sm font-medium text-gray-900">{estoque.produtoNome}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {estoque.quantidadeLevada}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                              {quantidadeVendida}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                              {estoque.quantidadeLevada - quantidadeVendida}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatarData(estoque.data)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                estoque.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {estoque.status === 'ativo' ? 'Ativo' : 'Finalizado'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Notas a Receber (Admin) */}
          {abaSelecionada === 'notasReceber' && usuarioLogado?.tipo === 'admin' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Notas a Receber</h2>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número da Nota</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {obterNotasAReceber().map((venda) => {
                        const cliente = clientes.find(c => c.id === venda.clienteId)
                        const produto = produtos.find(p => p.id === venda.produtoId)
                        return (
                          <tr key={venda.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatarData(venda.data)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{cliente?.nomeEmpresa}</div>
                              <div className="text-sm text-gray-500">{cliente?.responsavelCompra}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {produto?.nome}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <FileText className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="text-sm font-medium text-gray-900">{venda.numeroNota}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              {formatarMoeda(venda.valorTotal)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {venda.vendedorResponsavel}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                venda.statusPagamento === 'Pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {venda.statusPagamento === 'Pago' ? 'Pago' : 'Pendente'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {venda.statusPagamento === 'Pendente' && (
                                <button
                                  onClick={() => marcarNotaComoPaga(venda.id)}
                                  className="text-green-600 hover:text-green-900 flex items-center gap-1"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Marcar como Pago
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {obterNotasAReceber().length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma nota pendente encontrada</p>
                  </div>
                )}
              </div>

              {/* Resumo das Notas */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo das Notas a Receber</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">
                      {obterNotasAReceber().length}
                    </div>
                    <div className="text-sm text-gray-600">Notas Pendentes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {formatarMoeda(obterNotasAReceber().reduce((acc, venda) => acc + venda.valorTotal, 0))}
                    </div>
                    <div className="text-sm text-gray-600">Valor Total a Receber</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {vendas.filter(v => v.formaPagamento === 'Nota Feita' && v.statusPagamento === 'Pago').length}
                    </div>
                    <div className="text-sm text-gray-600">Notas Pagas</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Configurações (Admin) */}
          {abaSelecionada === 'configuracoes' && usuarioLogado?.tipo === 'admin' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Configurações do Sistema</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status do Sistema */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Status do Sistema</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-blue-500" />
                        <span className="text-gray-700">Banco de Dados</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          statusBanco === 'conectado' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <span className="text-sm text-gray-600">
                          {statusBanco === 'conectado' ? 'Conectado' : 'Local'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Usuários Ativos</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {usuarios.filter(u => u.ativo).length}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-purple-500" />
                        <span className="text-gray-700">Total de Clientes</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {clientes.length}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-orange-500" />
                        <span className="text-gray-700">Produtos Cadastrados</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {produtos.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Configurações Gerais */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurações Gerais</h3>
                  <div className="space-y-4">
                    <button
                      onClick={() => setMostrarConfigBanco(true)}
                      className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-blue-500" />
                        <span className="text-gray-700">Configurar Banco de Dados</span>
                      </div>
                      <Settings className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-green-500" />
                          <span className="text-gray-700">Backup Automático</span>
                        </div>
                        <span className="text-sm text-green-600 font-medium">Ativo</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Dados salvos automaticamente no localStorage
                      </p>
                    </div>
                    
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                          <span className="text-gray-700">Modo de Desenvolvimento</span>
                        </div>
                        <span className="text-sm text-yellow-600 font-medium">Ativo</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Sistema rodando em modo local para testes
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estatísticas Gerais */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas Gerais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {vendas.length}
                    </div>
                    <div className="text-sm text-gray-600">Total de Vendas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {formatarMoeda(vendas.reduce((acc, v) => acc + v.valorTotal, 0))}
                    </div>
                    <div className="text-sm text-gray-600">Faturamento Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {usuarios.filter(u => u.tipo === 'vendedor' && u.ativo).length}
                    </div>
                    <div className="text-sm text-gray-600">Vendedores Ativos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {obterNotasAReceber().length}
                    </div>
                    <div className="text-sm text-gray-600">Notas Pendentes</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Configuração do Banco */}
          {mostrarConfigBanco && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuração do Banco de Dados</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-blue-800">Status Atual</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Sistema funcionando em modo local com localStorage para persistência de dados.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-green-800">Funcionalidades Ativas</span>
                    </div>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Salvamento automático</li>
                      <li>• Backup local</li>
                      <li>• Sincronização em tempo real</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium text-yellow-800">Próximas Atualizações</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Integração com banco de dados em nuvem será implementada em versões futuras.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setMostrarConfigBanco(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}