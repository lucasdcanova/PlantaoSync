# Design Language — Sistema de Gerenciamento de Plantão Médico
> Versão 1.0 | Para uso por agentes de IA na geração de interfaces

---

## 1. Filosofia de Design

O sistema deve transmitir **clareza clínica, confiança e eficiência operacional**. A linguagem visual é limpa, minimalista e humana — inspirada em interfaces de produtividade pessoal modernas, adaptada ao contexto médico-hospitalar. Cada elemento deve reduzir a carga cognitiva do médico plantonista.

**Princípios-guia:**
- **Clareza primeiro:** informação crítica sempre visível e hierarquizada
- **Leveza estrutural:** use espaço em branco como elemento de design, não como vazio
- **Confiança silenciosa:** componentes limpos com bordas suaves passam sensação de sistema confiável
- **Urgência codificada por cor:** o sistema comunica prioridade através de pontos, barras e ícones coloridos — nunca por texto gritante
- **Mobile-first, desktop-fluido:** as telas devem funcionar naturalmente em tablets de leito e desktops da equipe administrativa

---

## 2. Paleta de Cores

### Cores Base
| Nome | Hex | Uso |
|---|---|---|
| `white` | `#FFFFFF` | Fundo de cards, superfícies principais |
| `background` | `#F2F4F6` | Fundo da aplicação (cinza muito suave, quase branco) |
| `surface-elevated` | `#FFFFFF` | Cards com sombra suave |
| `border-light` | `#E8ECEF` | Divisores, bordas de cards |
| `text-primary` | `#1A1D23` | Títulos, nomes, textos críticos |
| `text-secondary` | `#6B7280` | Subtítulos, metadados, horários |
| `text-muted` | `#9CA3AF` | Labels secundários, placeholders |

### Acento Principal
| Nome | Hex | Uso |
|---|---|---|
| `teal-primary` | `#4ECDC4` | Cor de destaque principal, barra lateral de eventos ativos, seleção |
| `teal-light` | `#E8F8F7` | Background de badges ativos, hover states |
| `teal-dark` | `#2BB5AB` | Hover do acento principal |

### Cores Semânticas (Status de Plantão)
| Nome | Hex | Uso |
|---|---|---|
| `status-urgent` | `#EF4444` | Plantão crítico, cirurgia de emergência, alerta de cobertura vazia |
| `status-warning` | `#F59E0B` | Plantão com troca pendente, confirmação aguardada |
| `status-success` | `#10B981` | Plantão confirmado, médico disponível |
| `status-info` | `#3B82F6` | Plantão regular em andamento |
| `status-cancelled` | `#6B7280` | Plantão cancelado, afastamento |
| `status-purple` | `#8B5CF6` | Cirurgia eletiva, procedimento programado |

### Gradiente de Cabeçalho (opcional)
```
background: linear-gradient(135deg, #4ECDC4 0%, #6EE7E7 100%);
```

---

## 3. Tipografia

### Família de Fontes
```
Primary: "Inter", sans-serif
Fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```
> **Nota para IA:** Use Inter como fonte padrão. É a fonte que melhor replica a sensação das imagens de referência — limpa, sem serifa, moderna e altamente legível.

### Escala Tipográfica
| Token | Tamanho | Peso | Line-height | Uso |
|---|---|---|---|---|
| `display` | 28px | 700 (Bold) | 1.2 | "Olá, Dr. Lucas" — saudação principal |
| `title-lg` | 22px | 700 | 1.3 | Títulos de seção, nome do mês |
| `title-md` | 18px | 600 (Semibold) | 1.4 | Nome do plantão, título de card |
| `title-sm` | 15px | 600 | 1.4 | Subtítulos de lista, labels de grupo |
| `body-md` | 14px | 400 (Regular) | 1.5 | Conteúdo padrão, descrições |
| `body-sm` | 13px | 400 | 1.5 | Metadados secundários |
| `caption` | 12px | 400 | 1.4 | Horários, IDs de plantão, datas |
| `label` | 11px | 500 (Medium) | 1.3 | Badges de status, tags |

### Padrões de Texto
```css
/* Saudação principal */
.greeting { font-size: 28px; font-weight: 400; }
.greeting strong { font-weight: 700; }
/* → "Olá, Dr. Lucas," */

/* Subtítulo descritivo */
.subtitle { font-size: 14px; font-weight: 400; color: #6B7280; }
/* → "você tem 2 plantões confirmados e 1 troca pendente" */

/* ID de referência */
.ref-id { font-size: 12px; font-weight: 500; color: #9CA3AF; letter-spacing: 0.02em; }
/* → "#PLT920024" */
```

---

## 4. Espaçamento e Grid

### Escala de Espaçamento (base 4px)
| Token | Valor | Uso típico |
|---|---|---|
| `space-1` | 4px | Gaps internos mínimos |
| `space-2` | 8px | Padding interno de badges, ícones |
| `space-3` | 12px | Gap entre elementos de lista |
| `space-4` | 16px | Padding de cards compactos |
| `space-5` | 20px | Padding interno padrão de cards |
| `space-6` | 24px | Margem entre seções |
| `space-8` | 32px | Espaço entre blocos principais |
| `space-10` | 40px | Padding de telas, margens laterais |

### Grid de Layout
- **Mobile:** 1 coluna, padding lateral `16px`
- **Tablet (768px+):** 2 colunas, gap `20px`, padding `24px`
- **Desktop (1280px+):** Sidebar fixa `260px` + área principal fluida

---

## 5. Componentes

### 5.1 Card Base
```
background: #FFFFFF
border-radius: 16px
padding: 20px
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 0 1px rgba(0, 0, 0, 0.04)
border: 1px solid #F0F2F4  ← muito sutil, quase invisível
```

#### Variante Card Compacto (para listas)
```
border-radius: 12px
padding: 14px 16px
```

#### Variante Card de Alerta
```
border-left: 3px solid [cor-semântica]
border-radius: 0 12px 12px 0
```

---

### 5.2 Mini-Cards de Resumo (topo da tela)
Exibidos em pares ou trios horizontais. Baseados nos cards "13/02 5:00PM" da referência.

```
Estrutura:
┌─────────────────────────────┐
│  13/01  22:00               │  ← caption, text-muted
│  Plantão UTI Adulto         │  ← title-sm, text-primary
│  #PLT800047                 │  ← caption, text-muted
│                             │
│  [Badge de Status]       ●  │  ← dot colorido à direita
└─────────────────────────────┘

width: ~160px (scrollável horizontalmente em mobile)
height: auto
border-radius: 14px
padding: 14px
background: #FFFFFF
shadow: card base
```

**Dot de status** (canto inferior direito):
```
width: 8px; height: 8px; border-radius: 50%;
background: [status-color]
```

---

### 5.3 Calendário Mensal
Componente idêntico ao da referência, adaptado para escala de plantões.

```
Layout:
- Header: "Janeiro  ‹ ›  [ícone sync]  [ícone +]"
- Grid 7 colunas: S M T Q Q S S
- Cada célula: 36x36px, border-radius: 50% (círculo)

Estados dos dias:
┌─────────────────────────────────────────┐
│ Hoje           → borda azul teal (#4ECDC4), sem fill │
│ Com plantão    → ponto colorido abaixo do número     │
│ Selecionado    → fill #4ECDC4, texto branco          │
│ Plantão urgente→ ponto vermelho #EF4444              │
│ Dia passado    → text-muted #9CA3AF                  │
└─────────────────────────────────────────┘

Indicadores de plantão abaixo do número:
● vermelho = plantão de emergência / cobertura crítica
● verde = plantão confirmado
● amarelo = troca pendente
● cinza = plantão cancelado
```

---

### 5.4 Lista de Eventos do Dia
Abaixo do calendário, ao selecionar um dia. Baseado na estrutura "WEDNESDAY 13" da referência.

```
┌──────────────────────────────────────────┐
│  QUARTA-FEIRA 13                         │  ← label uppercase, text-muted, 11px
├──────────────────────────────────────────┤
│  22:00  ●  Plantão UTI Adulto            │  ← horário caption + dot + title-sm bold
│  07:00     Hospital São Lucas            │  ← body-sm, text-secondary, indentado
│                                          │
│  07:00  ○  Troca de Plantão Pendente    │
│  13:00     Dr. Antônio → Dr. Marcos     │
└──────────────────────────────────────────┘

Padding esquerdo dos dots: alinhados na mesma coluna (16px do início)
Gap entre linhas de evento: 16px
```

---

### 5.5 Timeline Diária (coluna direita)
Baseado no painel direito da referência com as barras coloridas verticais.

```
Estrutura de cada slot de evento na timeline:
┌─────────────────────────────────────────┐
│  11:30                                  │  ← horário, caption, text-muted
│  ┃ #PLT920024                           │  ← barra vertical colorida à esquerda
│  ┃ Plantão UTI Neonatal                 │  ← title-md bold
│  ┃ 👤 Dr. Rafael Borges                 │  ← body-sm, ícone de pessoa
│  ┃ 📍 Ala B – 3º Andar                  │  ← body-sm, ícone de localização
└─────────────────────────────────────────┘

Barra vertical:
  width: 3px
  height: 100% do card
  border-radius: 2px
  color: status semântico do plantão
  margin-right: 12px

Slots de tempo vazio:
  ○ (círculo vazio) — indica horário disponível/sem cobertura
  color: #D1D5DB
```

---

### 5.6 Barra de Seleção de Datas (horizontal)
Abaixo dos mini-cards. Barra de datas scrollável.

```
Estilo:
- Background da barra: nenhum (transparente)
- Cada item: número + abreviação do dia
- Item selecionado: pill com background #4ECDC4, texto branco, border-radius 20px
- Item não selecionado: apenas número, text-secondary

Exemplo: [Janeiro]  [10]  11  12  13  14  15  →
                     ↑
              selecionado (pill teal)
```

---

### 5.7 Badges de Status
```
Base:
  font-size: 11px
  font-weight: 500
  padding: 3px 10px
  border-radius: 20px (pill)

Variantes:
  Confirmado    → bg: #D1FAE5, text: #065F46
  Urgente       → bg: #FEE2E2, text: #991B1B
  Pendente      → bg: #FEF3C7, text: #92400E
  Cancelado     → bg: #F3F4F6, text: #374151
  Em andamento  → bg: #DBEAFE, text: #1E40AF
  Cirurgia      → bg: #EDE9FE, text: #5B21B6
```

---

### 5.8 Ícones
Use ícones de linha fina (stroke weight: 1.5px). Sugestão de biblioteca: **Lucide Icons** ou **Heroicons Outline**.

| Contexto | Ícone sugerido |
|---|---|
| Médico / usuário | `user-circle` |
| Localização | `map-pin` |
| Horário | `clock` |
| Plantão / calendário | `calendar` |
| Troca de plantão | `repeat` |
| Alerta / urgência | `alert-circle` |
| Procedimento / cirurgia | `scissors` ou `activity` |
| Notificação | `bell` |
| Chat / comunicação | `message-square` |
| Dashboard | `layout-grid` |
| Relatório | `file-text` |
| Configurações | `settings` |

Tamanho padrão: **20px** (ícones de navegação), **16px** (ícones inline em listas)

---

### 5.9 Navegação Inferior (Mobile)
Idêntica ao padrão da referência — 5 ícones centralizados.

```
Posição: fixed bottom, full width
Height: 64px + safe-area-inset-bottom
Background: #FFFFFF
Border-top: 1px solid #F0F2F4
Box-shadow: 0 -2px 8px rgba(0,0,0,0.04)

Ícones (esquerda → direita):
  [ grid / dashboard ]  [ lista / escalas ]  [ calendário ]  [ sino / alertas ]  [ chat ]

Ícone ativo:
  color: #4ECDC4
  Opcional: underline dot de 4px abaixo

Ícone inativo:
  color: #9CA3AF
```

---

### 5.10 Sidebar de Navegação (Desktop)
```
Width: 260px
Background: #FFFFFF
Border-right: 1px solid #E8ECEF
Padding: 24px 16px

Seções:
  - Avatar + nome do médico no topo
  - Itens de menu com ícone + label
  - Item ativo: background #E8F8F7, texto #4ECDC4, border-left 3px solid #4ECDC4
  - Seção "Meu Hospital" com nome e badge de função
```

---

## 6. Telas Principais

### Tela 1: Dashboard (Visão Geral)
```
┌─────────────────────────────────────────────────────┐
│  Sidebar                │  Área Principal            │
│                         │                            │
│  [ Avatar ]             │  "Olá, Dr. Lucas,"         │
│  Dr. Lucas Canova       │  "você tem 2 plantões hoje │
│  Cirurgião              │   e 1 troca pendente"      │
│                         │                            │
│  [Dashboard]            │  [Mini-Cards horizontais]  │
│  [Escalas]              │  ← scrollável              │
│  [Calendário]           │                            │
│  [Equipe]               │  [Barra de datas]          │
│  [Relatórios]           │                            │
│  [Configurações]        │  [Timeline do dia]         │
└─────────────────────────────────────────────────────┘
```

### Tela 2: Calendário de Plantões
```
Coluna esquerda (40%):
  - Header do mês com navegação
  - Grid do calendário com dots de status
  - Lista de eventos do dia selecionado

Coluna direita (60%):
  - Header "Olá, Dr. [Nome]" com resumo
  - Mini-cards de destaques do mês
  - Barra de datas
  - Timeline detalhada do dia
```

### Tela 3: Gerenciamento de Escala
```
Tabela/Grid de médicos × turnos × dias
Com filtros por:
  - Especialidade
  - Setor (UTI, Pronto-socorro, Enfermaria...)
  - Período
  - Status

Cada célula da grade:
  - Avatar minúsculo do médico
  - Status com cor semântica
  - Clicável para editar
```

### Tela 4: Perfil do Plantonista
```
Header com avatar, nome, CRM, especialidade
Cards de estatísticas:
  - Plantões no mês
  - Horas trabalhadas
  - Avaliação da equipe

Lista de próximos plantões
Histórico recente
```

---

## 7. Microinterações e Animações

```
Transições padrão:
  duration: 200ms
  easing: cubic-bezier(0.4, 0, 0.2, 1)  ← Material ease-in-out

Cards ao hover (desktop):
  transform: translateY(-2px)
  box-shadow: 0 8px 24px rgba(0,0,0,0.10)

Badge de status:
  Entrada: fade-in + scale(0.8 → 1.0), 150ms

Seleção de dia no calendário:
  Background fill com scale radial, 200ms

Timeline item entrada:
  slide-in da esquerda, 200ms stagger por item (30ms delay entre itens)

Dot de urgência pulsante (plantão crítico sem cobertura):
  animation: pulse 2s infinite
  → scale(1) → scale(1.4) → scale(1), com opacity

Modal/Drawer:
  Slide-up em mobile, fade + scale em desktop
  Backdrop: rgba(0,0,0,0.3) com blur(4px)
```

---

## 8. Estados de Interface

### Estado Vazio
```
Ilustração SVG suave (linha fina, cor teal-light)
Texto: título 16px semibold + descrição 14px text-muted
Botão CTA primário
```

### Estado de Carregamento
```
Skeleton screens com shimmer animation
Mesmas dimensões dos componentes reais
Cores: #F0F2F4 → #E4E7EA (shimmer)
NÃO usar spinners globais — prefer skeleton por componente
```

### Estado de Erro
```
Banner sutil no topo do card afetado
Border-left: 3px solid #EF4444
Ícone alert-circle + mensagem curta
```

### Estado de Sucesso (após ação)
```
Toast notification: canto inferior direito
Background: #1A1D23 (dark)
Texto branco, ícone check verde
Auto-dismiss: 3 segundos
Border-radius: 12px
```

---

## 9. Nomenclatura de IDs e Referências

Padrão visual para identificadores de plantão (baseado em #EC800047 da referência):

```
Formato: #PLT[SETOR][SEQUENCIAL]
Exemplos:
  #PLT920024  → Plantão ID 920024
  #CIR800047  → Cirurgia ID 800047
  #TRC330012  → Troca ID 330012

Estilo visual:
  font-size: 12px
  font-weight: 500
  color: #9CA3AF
  letter-spacing: 0.03em
  Exibido acima do nome principal do evento
```

---

## 10. Responsividade — Breakpoints

```
xs:  < 480px   → Mobile pequeno
sm:  480–767px → Mobile padrão
md:  768–1023px → Tablet
lg:  1024–1279px → Desktop pequeno
xl:  ≥ 1280px  → Desktop padrão

Comportamentos chave:
  - Sidebar colapsa para drawer em < 1024px
  - Layout de 2 colunas (calendário + timeline) colapsa para tabs em < 768px
  - Mini-cards tornam-se scroll horizontal em < 768px
  - Tabela de escala torna-se lista em < 768px
```

---

## 11. Tokens CSS (Design Tokens)

```css
:root {
  /* Cores */
  --color-bg: #F2F4F6;
  --color-surface: #FFFFFF;
  --color-border: #E8ECEF;
  --color-text-primary: #1A1D23;
  --color-text-secondary: #6B7280;
  --color-text-muted: #9CA3AF;
  --color-teal: #4ECDC4;
  --color-teal-light: #E8F8F7;
  --color-teal-dark: #2BB5AB;
  --color-urgent: #EF4444;
  --color-warning: #F59E0B;
  --color-success: #10B981;
  --color-info: #3B82F6;
  --color-cancelled: #6B7280;
  --color-procedure: #8B5CF6;

  /* Tipografia */
  --font-family: 'Inter', -apple-system, sans-serif;
  --font-display: 700 28px/1.2 var(--font-family);
  --font-title-lg: 700 22px/1.3 var(--font-family);
  --font-title-md: 600 18px/1.4 var(--font-family);
  --font-title-sm: 600 15px/1.4 var(--font-family);
  --font-body-md: 400 14px/1.5 var(--font-family);
  --font-body-sm: 400 13px/1.5 var(--font-family);
  --font-caption: 400 12px/1.4 var(--font-family);
  --font-label: 500 11px/1.3 var(--font-family);

  /* Espaçamento */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;

  /* Bordas */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* Sombras */
  --shadow-card: 0 2px 8px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04);
  --shadow-card-hover: 0 8px 24px rgba(0,0,0,0.10);
  --shadow-modal: 0 20px 60px rgba(0,0,0,0.15);
  --shadow-nav-bottom: 0 -2px 8px rgba(0,0,0,0.04);

  /* Animações */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 12. Guia Rápido para o Agente de IA

Ao gerar qualquer tela ou componente deste sistema, siga este checklist:

1. **Fundo da app:** sempre `#F2F4F6`, nunca branco puro
2. **Cards:** sempre brancos com `border-radius: 16px` e `box-shadow` suave
3. **Texto principal:** `#1A1D23` — nunca `#000000`
4. **Cor de acento:** `#4ECDC4` para seleções, estados ativos, barras de timeline
5. **Status de urgência:** ponto/barra `#EF4444` — nunca ícone piscante ou texto em caps
6. **Fonte:** Inter, sem fallback genérico se possível
7. **Ícones:** sempre outline/linha fina, 20px navegação / 16px inline
8. **Animações:** sempre 200ms, easing padrão — nunca abruptas
9. **IDs de referência:** sempre exibidos em `caption` acima do nome do evento
10. **Hierarquia visual:** hora → ID de referência → nome do plantão → médico → local
11. **Dots de status:** 8px, círculo sólido, sempre alinhados à direita ou abaixo do número de data
12. **Barras de timeline:** 3px de largura, altura total do evento, `border-radius: 2px`
13. **Navegação mobile:** 5 ícones, sempre fixed bottom, ativo em teal
14. **Skeleton ao carregar:** mesma geometria do componente, shimmer suave
15. **Toast de sucesso:** dark background `#1A1D23`, canto inferior direito, auto-dismiss 3s

---

*Design Language System — Gerenciamento de Plantão Médico v1.0*
*Baseado em referência de UI de agenda pessoal. Adaptado para contexto hospitalar.*
