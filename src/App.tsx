import { useState } from 'react';
import { 
  ArrowRight, 
  Settings, 
  HelpCircle, 
  Check, 
  ExternalLink,
  ChevronRight,
  Globe,
  Zap,
  Info,
  FileText,
  Printer
} from 'lucide-react';

interface RuleTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  whenToUse: string;
  expressionLabel: string;
  expressionValue: string;
  targetUrlLabel: string;
  targetUrlValue: string;
  statusCode: string;
  steps: string[];
}

export default function App() {
  const [selectedRule, setSelectedRule] = useState<string>('www-to-root');
  const [userDomain, setUserDomain] = useState<string>('breakfasinbedlx.com');
  const [activeDnsTopic, setActiveDnsTopic] = useState<string | null>('link-tutorial');

  const cleanDomainName = (domain: string) => {
    let clean = domain.trim();
    // remove protocol (http:// or https://)
    clean = clean.replace(/^(https?:\/\/)?(www\.)?/, '');
    // remove trailing slashes or subfolders
    clean = clean.split('/')[0];
    return clean;
  };

  const isValidDomain = (domain: string) => {
    const cleaned = cleanDomainName(domain);
    if (!cleaned) return false;
    // Standard domain regex excluding subfolders
    const domainRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return domainRegex.test(cleaned);
  };

  const isDomainValid = userDomain.trim() === '' || isValidDomain(userDomain);
  const domainToUse = isValidDomain(userDomain) ? cleanDomainName(userDomain) : '';

  const ruleTemplates: RuleTemplate[] = [
    {
      id: 'www-to-root',
      title: 'Redirecionamento da WWW para a raiz',
      category: 'Regras de redirecionamento (Redirect Rules)',
      description: 'Sempre redireciona as solicitações do subdomínio www para o domínio raiz (apex / naked domain), mantendo o caminho da página e parâmetros.',
      whenToUse: 'Use quando você deseja consolidar toda a autoridade de SEO no seu domínio principal (ex: www.seusite.com -> seusite.com).',
      expressionLabel: 'Expressão de Entrada (Expression)',
      expressionValue: 'http.request.host eq "www.exemplo.com"',
      targetUrlLabel: 'URL de Destino Dinâmica (Dynamic Target URL)',
      targetUrlValue: 'concat("https://exemplo.com", http.request.uri.path)',
      statusCode: '301 (Redirecionamento Permanente)',
      steps: [
        'Aceda ao painel do Cloudflare e selecione o seu domínio.',
        'No menu lateral esquerdo, vá a Regras (Rules) > Regras de redirecionamento (Redirect Rules).',
        'Clique em "Criar regra" (Create rule).',
        'Dê um nome à regra (ex: "WWW to Root").',
        'Em "Se as solicitações recebidas corresponderem..." selecione "Expressão personalizada" e defina: Campo = Hostname, Operador = igual a, Valor = www.seudominio.com.',
        'Em "Então...", selecione Tipo = Dinâmico (Dynamic), e insira a fórmula de concatenação.',
        'Marque "Preservar string de consulta" (Preserve query string) para não perder parâmetros (como UTMs).',
        'Selecione o Código de status = 301 e clique em Implantar (Deploy).'
      ]
    },
    {
      id: 'root-to-www',
      title: 'Redirecionamento da raiz para a WWW',
      category: 'Regras de redirecionamento (Redirect Rules)',
      description: 'Sempre redireciona as solicitações do domínio raiz (nu) para o subdomínio www, mantendo o caminho da página e parâmetros.',
      whenToUse: 'Use se a sua marca ou infraestrutura técnica preferir ter o prefixo "www" em todos os URLs públicos.',
      expressionLabel: 'Expressão de Entrada (Expression)',
      expressionValue: 'http.request.host eq "exemplo.com"',
      targetUrlLabel: 'URL de Destino Dinâmica (Dynamic Target URL)',
      targetUrlValue: 'concat("https://www.exemplo.com", http.request.uri.path)',
      statusCode: '301 (Redirecionamento Permanente)',
      steps: [
        'No painel Cloudflare, selecione Regras (Rules) > Regras de redirecionamento (Redirect Rules).',
        'Clique em "Criar regra" (Create rule).',
        'Dê um nome à regra (ex: "Root to WWW").',
        'Defina a correspondência: Campo = Hostname, Operador = igual a, Valor = seudominio.com.',
        'Selecione Tipo = Dinâmico (Dynamic).',
        'Insira a fórmula de concatenação com "www" no destino.',
        'Selecione Código de status = 301 e decida se quer Preservar string de consulta.',
        'Clique em Implantar (Deploy).'
      ]
    },
    {
      id: 'http-to-https',
      title: 'Redirecionamento de HTTP para HTTPS',
      category: 'Segurança / Encriptação',
      description: 'Garante que todas as conexões inseguras (HTTP) sejam automaticamente atualizadas para conexões seguras sob HTTPS.',
      whenToUse: 'Use em todos os sites modernos para garantir que os dados dos utilizadores estão encriptados e para melhorar a posição nos motores de busca.',
      expressionLabel: 'Opção Recomendada (Cloudflare Toggle)',
      expressionValue: 'Sempre usar HTTPS (Always Use HTTPS)',
      targetUrlLabel: 'Método alternativo via Regra',
      targetUrlValue: 'ssl = "off" -> Redirecionar para https://[host][path]',
      statusCode: '301 (Redirecionamento Permanente)',
      steps: [
        'No painel do Cloudflare, navegue até SSL/TLS > Certificados de Borda (Edge Certificates).',
        'Role a página para baixo até encontrar a opção "Sempre usar HTTPS" (Always Use HTTPS).',
        'Ative o botão para a posição LIGADO (ON).',
        'Isto aplica-se globalmente a todo o tráfego do domínio e é mais rápido do que criar uma regra manual.'
      ]
    },
    {
      id: 'diff-domain',
      title: 'Redirecionar para um domínio diferente',
      category: 'Migração de Domínio',
      description: 'Redireciona todo o tráfego que chega a um domínio antigo para um domínio completamente novo, preservando caminhos e parâmetros.',
      whenToUse: 'Use quando mudou o nome da sua empresa/site e quer enviar as visitas sem partir links existentes (ex: antigo.com/sobre -> novo.com/sobre).',
      expressionLabel: 'Expressão de Entrada (Expression)',
      expressionValue: 'http.request.host eq "dominio-antigo.com"',
      targetUrlLabel: 'URL de Destino Dinâmica (Dynamic Target URL)',
      targetUrlValue: 'concat("https://dominio-novo.com", http.request.uri.path)',
      statusCode: '301 (Permanent) ou 302 (Temporary)',
      steps: [
        'No painel do Cloudflare do domínio antigo, vá a Regras > Regras de redirecionamento.',
        'Clique em "Criar regra".',
        'Configure para coincidir com todas as entradas ou apenas o host antigo.',
        'Use o Tipo dinâmico para garantir que o utilizador vai para a mesma subpágina no novo domínio.',
        'Clique em Implantar.'
      ]
    }
  ];

  const currentRule = ruleTemplates.find(r => r.id === selectedRule) || ruleTemplates[0];

  // Helper mock generation to simulate user inputs
  const getSimulatedExpression = (templateId: string, domain: string) => {
    if (!domain) {
      return '[Aguardando domínio válido...]';
    }
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').trim() || 'exemplo.com';
    switch(templateId) {
      case 'www-to-root':
        return `http.request.host eq "www.${cleanDomain}"`;
      case 'root-to-www':
        return `http.request.host eq "${cleanDomain}"`;
      case 'diff-domain':
        return `http.request.host eq "${cleanDomain}"`;
      default:
        return 'Sempre ativo / Global';
    }
  };

  const getSimulatedTarget = (templateId: string, domain: string) => {
    if (!domain) {
      return '[Aguardando domínio válido...]';
    }
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').trim() || 'exemplo.com';
    switch(templateId) {
      case 'www-to-root':
        return `concat("https://${cleanDomain}", http.request.uri.path)`;
      case 'root-to-www':
        return `concat("https://www.${cleanDomain}", http.request.uri.path)`;
      case 'diff-domain':
        return `concat("https://novo-dominio.com", http.request.uri.path)`;
      default:
        return 'Automático por Cloudflare';
    }
  };

  const exportAsTXT = () => {
    const domain = domainToUse || 'exemplo.com';
    const content = `==================================================
GUIA DE CONFIGURAÇÃO DE REGRA DO CLOUDFLARE
==================================================
Regra: ${currentRule.title}
Categoria: ${currentRule.category}
Descrição: ${currentRule.description}
Quando usar: ${currentRule.whenToUse}

--------------------------------------------------
VALORES CONFIGURADOS (Domínio: ${domain})
--------------------------------------------------
${currentRule.expressionLabel}:
👉 ${getSimulatedExpression(currentRule.id, domain)}

${currentRule.targetUrlLabel}:
👉 ${getSimulatedTarget(currentRule.id, domain)}

Código de Status Recomendado:
👉 ${currentRule.statusCode}

--------------------------------------------------
PASSO A PASSO PARA CONFIGURAR NO CLOUDFLARE:
--------------------------------------------------
${currentRule.steps.map((step, idx) => `${idx + 1}. ${step.replace('exemplo.com', domain)}`).join('\n\n')}

--------------------------------------------------
Gerado automaticamente pelo Guia de Redirecionamento Cloudflare.
© 2026 Cloudflare Rules & Redirects Helper
==================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `guia-cloudflare-${currentRule.id}-${domain}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="main-container">
      {/* Top Banner / Header */}
      <header className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6 shadow-sm print:hidden" id="header-bar">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-white p-2.5 rounded-xl shadow-md shadow-amber-500/20" id="logo-badge">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight" id="app-title">
                Cloudflare Rules & Redirects Guide
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Configurador Prático de Regras de Página e Redirecionamento 
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Pronto para configurar
          </div>
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 print:block print:p-0 print:m-0" id="main-content">
        
        {/* Left Side: Domain input and Menu selection */}
        <section className="lg:col-span-4 flex flex-col gap-6 print:hidden" id="left-column">
          
          {/* Domain Sandbox InputCard */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4" id="sandbox-card">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-slate-900">1. Simule com o seu Domínio</h2>
            </div>
            <p className="text-xs text-slate-500">
              Introduza o domínio do seu restaurante ou site para ver exatamente que regras deve copiar para o Cloudflare.
            </p>
            <div>
              <label htmlFor="domain-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Domínio Apex (Naked Domain)
              </label>
              <div className="relative rounded-lg shadow-sm">
                <input
                  type="text"
                  id="domain-input"
                  className={`block w-full rounded-lg pl-3 pr-10 py-2.5 text-sm transition-all text-slate-900 font-medium border ${
                    !isDomainValid 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/50 text-red-900' 
                      : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500 bg-slate-50 focus:bg-white'
                  }`}
                  placeholder="exemplo.com"
                  value={userDomain}
                  onChange={(e) => setUserDomain(e.target.value)}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <Globe className={`h-4 w-4 ${!isDomainValid ? 'text-red-400' : 'text-slate-400'}`} />
                </div>
              </div>
              {!isDomainValid && (
                <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1 animate-pulse">
                  <span>⚠️ Domínio inválido (Ex: breakinbedlx.com)</span>
                </p>
              )}
              {isDomainValid && userDomain.trim() !== '' && (
                <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
                  <span>✓ Formato de domínio válido</span>
                </p>
              )}
            </div>
          </div>

          {/* Quick Rules Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-3" id="selector-card">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-slate-900">2. Escolha o Modelo</h2>
            </div>
            {ruleTemplates.map((template) => (
              <button
                key={template.id}
                id={`btn-${template.id}`}
                onClick={() => setSelectedRule(template.id)}
                className={`w-full flex items-center justify-between text-left p-3.5 rounded-xl border transition-all duration-200 ${
                  selectedRule === template.id
                    ? 'bg-amber-50 border-amber-500 shadow-md shadow-amber-500/5 text-amber-900'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col pr-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5 group-hover:text-amber-500">
                    {template.id === 'http-to-https' ? 'Segurança' : 'Redirecionamento'}
                  </span>
                  <span className="text-sm font-semibold">{template.title}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform shrink-0 ${selectedRule === template.id ? 'translate-x-1 text-amber-600' : 'text-slate-400'}`} />
              </button>
            ))}
          </div>

          {/* Cloudflare Overview Note */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 p-6 shadow-sm" id="info-overlay">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1.5">
                <h3 className="font-semibold text-amber-900 text-sm">Onde está isso no painel?</h3>
                <p className="text-xs text-amber-800 leading-relaxed font-normal">
                  As <strong>Regras de Redirecionamento (Redirect Rules)</strong> substituem as antigas "Page Rules". Elas estão no menu lateral esquerdo do Cloudflare sob a aba <strong>Rules</strong> (ou Regras). Estão disponíveis no plano gratuito (até 10 regras).
                </p>
              </div>
            </div>
          </div>

          {/* DNS Help & Troubleshooting Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4" id="dns-guide-card">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-slate-900">💡 O que é DNS e Como Resolver Erros?</h2>
            </div>
            <p className="text-xs text-slate-500">
              Guia rápido e personalizado para a <strong>Ana</strong> colocar o <code className="bg-amber-50 text-amber-800 font-semibold px-1 py-0.5 rounded text-[10px]">breakfasinbedlx.com</code> a funcionar.
            </p>
            
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed flex flex-col gap-1.5" id="ana-quick-fix-alert">
              <span className="font-bold flex items-center gap-1">⚠️ Algo não carrega ou dá erro?</span>
              <p>
                Se o seu domínio <strong>breakfasinbedlx.com</strong> estiver a redirecionar infinitamente ou apresentar erro de segurança, isso costuma ser um conflito de encriptação SSL entre o Cloudflare e a Vercel. A solução é simples! Veja o ponto 4 abaixo.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {/* Opção 1: O que é DNS */}
              <div className="border border-slate-150 rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveDnsTopic(activeDnsTopic === 'what-is-dns' ? null : 'what-is-dns')}
                  className="w-full flex items-center justify-between text-left p-3 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <span>1. O que é o DNS?</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeDnsTopic === 'what-is-dns' ? 'rotate-90' : ''}`} />
                </button>
                {activeDnsTopic === 'what-is-dns' && (
                  <div className="p-3 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    O <strong>DNS</strong> (Domain Name System) funciona como a "lista de contactos" da Internet. Ele traduz nomes legíveis (como <code className="text-amber-600 font-semibold bg-amber-50 px-1 rounded">breakfasinbedlx.com</code>) em endereços numéricos IP (ex: <code className="text-slate-600 bg-slate-100 px-1 rounded">76.76.21.21</code>) onde os servidores residem. Sem o DNS do Cloudflare, as pessoas não conseguiriam aceder ao seu site!
                  </div>
                )}
              </div>

              {/* Opção 2: Erro de Domínio Inválido (.vercel.app) */}
              <div className="border border-slate-150 rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveDnsTopic(activeDnsTopic === 'invalid-domain' ? null : 'invalid-domain')}
                  className="w-full flex items-center justify-between text-left p-3 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <span>2. Erro de domínio ".vercel.app"</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeDnsTopic === 'invalid-domain' ? 'rotate-90' : ''}`} />
                </button>
                {activeDnsTopic === 'invalid-domain' && (
                  <div className="p-3 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 flex flex-col gap-2">
                    <p>
                      No Cloudflare, recebeu o erro <strong>"Invalid Domain"</strong> porque tentou inserir <code className="text-red-600 bg-red-50 px-1 rounded">breakinbedlx.vercel.app</code> diretamente no fluxo de adicionar sites. 
                    </p>
                    <p>
                      O Cloudflare exige que possua um <strong>domínio próprio (Apex Domain)</strong> como <code className="text-emerald-600 font-semibold bg-emerald-50 px-1 rounded">breakfasinbedlx.com</code>. Não pode registar subdomínios da Vercel (<code className="text-slate-600 bg-slate-50 px-1 rounded">*.vercel.app</code>) na sua conta do Cloudflare porque o domínio <code className="text-slate-500">vercel.app</code> pertence corporativamente à própria Vercel.
                    </p>
                  </div>
                )}
              </div>

              {/* Opção 3: Como Ligar Vercel + Cloudflare */}
              <div className="border border-slate-150 rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveDnsTopic(activeDnsTopic === 'link-tutorial' ? null : 'link-tutorial')}
                  className="w-full flex items-center justify-between text-left p-3 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <span>3. Ligar Vercel ao Cloudflare</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeDnsTopic === 'link-tutorial' ? 'rotate-90' : ''}`} />
                </button>
                {activeDnsTopic === 'link-tutorial' && (
                  <div className="p-3 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 flex flex-col gap-2">
                    <p className="font-semibold text-slate-800">Siga estes passos:</p>
                    <ol className="list-decimal pl-4 flex flex-col gap-1.5 text-slate-600">
                      <li><strong>Obtenha um domínio:</strong> Registre um domínio próprio (ex: <code className="text-slate-800 font-semibold bg-slate-100 px-1 rounded">breakfasinbedlx.com</code>) num registador (como GoDaddy, Namecheap ou Dominios.pt).</li>
                      <li><strong>Adicione ao Cloudflare:</strong> No painel do Cloudflare, adicione o seu domínio <code className="text-amber-600 font-semibold">breakfasinbedlx.com</code> (já o fez com sucesso! 🎉).</li>
                      <li><strong>Aponte os Nameservers:</strong> No registador do seu domínio, coloque os Nameservers fornecidos pelo Cloudflare. Se a Cloudflare diz "Full" ou "Active", este passo já está correto!</li>
                      <li><strong>Insira os registos DNS:</strong> Na aba DNS do Cloudflare, ligue o site ao Vercel adicionando estes dois registos:
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 mt-1.5 font-mono text-[10px] text-slate-800 space-y-1">
                          <div><strong>Tipo A:</strong> Nome = <code className="bg-slate-200 px-0.5 rounded">@</code> | Valor = <code className="bg-slate-200 px-0.5 rounded">76.76.21.21</code> | Proxy = <code className="bg-amber-100 text-amber-800 px-0.5 rounded font-bold">Proxied (Nuvem Laranja)</code></div>
                          <div><strong>Tipo CNAME:</strong> Nome = <code className="bg-slate-200 px-0.5 rounded">www</code> | Valor = <code className="bg-slate-200 px-0.5 rounded">cname.vercel-dns.com</code> | Proxy = <code className="bg-amber-100 text-amber-800 px-0.5 rounded font-bold">Proxied (Nuvem Laranja)</code></div>
                        </div>
                      </li>
                      <li><strong>Configurar no Vercel:</strong> Abra o projeto no Vercel, aceda a <strong>Settings &gt; Domains</strong> e introduza o seu domínio <code className="text-slate-800 font-bold">breakfasinbedlx.com</code>.</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Opção 4: Corrigir o Redirecionamento Infinito do SSL */}
              <div className="border border-slate-150 rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveDnsTopic(activeDnsTopic === 'ssl-loop' ? null : 'ssl-loop')}
                  className="w-full flex items-center justify-between text-left p-3 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <span className="text-red-700 flex items-center gap-1">✨ 4. Corrigir Loop "ERR_TOO_MANY_REDIRECTS"</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeDnsTopic === 'ssl-loop' ? 'rotate-90' : ''}`} />
                </button>
                {activeDnsTopic === 'ssl-loop' && (
                  <div className="p-3 bg-red-50/20 text-xs text-slate-600 leading-relaxed border-t border-slate-100 flex flex-col gap-2">
                    <p>
                      <strong>Por que ocorre?</strong> Por padrão, o Cloudflare define o SSL como <strong>"Flexible"</strong> (Flexível). Isto significa que o Cloudflare comunica com a Vercel através de HTTP não-encriptado. Mas a Vercel exige de forma estrita ligações HTTPS seguras, logo redireciona o Cloudflare de volta ao HTTPS seguro, fazendo com que o navegador fique confuso num ciclo infinito de redirecionamentos!
                    </p>
                    <p className="font-semibold text-slate-800">Como resolver isto em 30 segundos:</p>
                    <ol className="list-decimal pl-4 flex flex-col gap-1.5 text-slate-600">
                      <li>Abra a aba do seu domínio <code className="text-slate-800 font-semibold bg-slate-100 px-1 rounded">breakfasinbedlx.com</code> no Cloudflare.</li>
                      <li>No menu lateral esquerdo, clique em <strong>SSL/TLS</strong>.</li>
                      <li>Mude o modo de encriptação SSL/TLS de <span className="line-through text-red-500">Flexible</span> para <strong>Full (Strict)</strong> ou pelo menos <strong>Full</strong>.</li>
                      <li>Aguarde 1 minuto e limpe a cache do seu navegador. O site agora carregará perfeitamente e em total de segurança! 🔒</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>

        </section>

        {/* Right Side: Step-by-Step interactive Guide and Rule Expression copy template */}
        <section className="lg:col-span-8 flex flex-col gap-6 print:w-full print:block" id="right-column">
          
          {/* Main Visualizer */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="viz-container">
            
            {/* Header of Visualizer */}
            <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col gap-2">
              <div className="inline-flex py-1 px-2.5 bg-slate-800 rounded-md border border-slate-700 self-start text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                {currentRule.category}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {currentRule.title}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                {currentRule.description}
              </p>
            </div>

            {/* Simulated Live Sandbox Widget */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 print:hidden" id="live-sandbox">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-3">
                Simulador de Fluxo (Em Tempo Real)
              </span>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                
                {/* Source request */}
                <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 shadow-none flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-semibold text-slate-400 uppercase">Se o utilizador digitar:</span>
                    <span className="text-xs font-mono font-bold text-slate-600 mt-1 truncate">
                      {selectedRule === 'www-to-root' ? `https://www.${domainToUse || 'exemplo.com'}/carta` : `https://${domainToUse || 'exemplo.com'}/carta`}
                    </span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-400 font-mono rounded">GET</span>
                </div>

                {/* Arrow animation spacer */}
                <div className="flex justify-center items-center shrink-0">
                  <div className="p-1 rounded-full bg-amber-500 text-white shadow-sm ring-4 ring-amber-100">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Destination request */}
                <div className="flex-1 bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 shadow-none flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-semibold text-emerald-600 uppercase">Será redirecionado para:</span>
                    <span className="text-xs font-mono font-bold text-emerald-800 mt-1 truncate">
                      {selectedRule === 'www-to-root' 
                        ? `https://${domainToUse || 'exemplo.com'}/carta` 
                        : selectedRule === 'root-to-www' 
                        ? `https://www.${domainToUse || 'exemplo.com'}/carta`
                        : selectedRule === 'diff-domain'
                        ? 'https://novo-dominio.com/carta'
                        : `https://${domainToUse || 'exemplo.com'}/carta`
                      }
                    </span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 border border-emerald-200 text-emerald-700 font-mono rounded">301</span>
                </div>

              </div>
            </div>

            {/* Cloudflare Rule Fields Configuration */}
            <div className="p-6 sm:p-8 flex flex-col gap-6" id="fields-specification">
              <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-500" />
                Valores para colar no Cloudflare
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Expression block */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {currentRule.expressionLabel}
                  </label>
                  <div className="p-4 bg-slate-950 text-amber-400 font-mono text-xs rounded-xl relative overflow-x-auto min-h-[44px] flex items-center border border-slate-800">
                    <code>{getSimulatedExpression(currentRule.id, domainToUse)}</code>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    O gatilho que diz ao Cloudflare quando deve aplicar esta ação.
                  </p>
                </div>

                {/* Target URL block */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {currentRule.targetUrlLabel}
                  </label>
                  <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl relative overflow-x-auto min-h-[44px] flex items-center border border-slate-800">
                    <code>{getSimulatedTarget(currentRule.id, domainToUse)}</code>
                  </div>
                  <p className="text-[11px] text-slate-400">{`Utiliza a fórmula concat() para juntar dinamicamente o caminho (uri.path).`}</p>
                </div>

              </div>

              {/* Status Code Info Row */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-500 font-medium">Código de Status Recomendado:</span>
                <span className="font-bold text-slate-800 bg-white border border-slate-300 px-2.5 py-1 rounded">
                  {currentRule.statusCode}
                </span>
              </div>

            </div>

          </div>

          {/* Step by Step Configuration */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col gap-6" id="instructions-container">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 print:pb-0" id="instructions-header">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                <span className="flex items-center justify-center bg-amber-500/10 text-amber-600 rounded-lg p-2 shrink-0 print:hidden">
                  <HelpCircle className="w-5 h-5" />
                </span>
                Como aplicar este modelo passo a passo no Cloudflare
              </h3>
              
              <div className="flex items-center gap-2 print:hidden" id="export-actions">
                <button
                  onClick={exportAsTXT}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors active:bg-slate-100"
                  title="Descarregar como Ficheiro de Texto (.txt)"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Exportar TXT</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 border border-amber-600 rounded-lg shadow-sm transition-colors active:bg-amber-700"
                  title="Imprimir ou Guardar em PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / PDF</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {currentRule.steps.map((step, idx) => (
                <div key={idx} className="flex gap-4 items-start group">
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 transition-all duration-150">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed pt-0.5">
                    {step.replace('exemplo.com', domainToUse || 'exemplo.com')}
                  </p>
                </div>
              ))}
            </div>

            {/* External Support Link */}
            <div className="border-t border-slate-100 pt-6 mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <p className="text-xs text-slate-400 font-medium">
                  Documentação Oficial do Cloudflare Single Redirects
                </p>
              </div>
              <a 
                href="https://developers.cloudflare.com/rules/url-forwarding/single-redirects/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1.5 text-xs text-amber-600 font-bold hover:text-amber-700 hover:underline"
              >
                Ver Documentação <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400 font-medium" id="footer-bar">
        <p>© 2026 Guia de Redirecionamento Cloudflare. Construído para auxiliar nas suas integrações de domínios.</p>
      </footer>
    </div>
  );
}
