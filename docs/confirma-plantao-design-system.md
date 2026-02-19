# CONFIRMA PLANTÃO — Design System e Guidelines

Documento oficial de linguagem visual e interface para Web e Mobile do CONFIRMA PLANTÃO.

## 1. Marca

- Nome oficial: `CONFIRMA PLANTÃO`
- Uso do logo:
- Compacto (header/sidebar/navbar): `logo-mark.png`
- Destaque (hero/auth/landing): `logo-full.png`
- Ícones e favicon: `logo-mark-square.png` + tamanhos derivados

## 2. Tokens de Design

### 2.1 Cores

- Fundo base: `#F2F4F6`
- Superfície: `#FFFFFF`
- Borda: `#E8ECEF`
- Texto primário: `#1A1D23`
- Texto secundário: `#6B7280`
- Primária (teal): `#4ECDC4`
- Primária hover: `#2BB5AB`

Status semânticos:

- Urgente: `#EF4444`
- Alerta: `#F59E0B`
- Sucesso: `#10B981`
- Informação: `#3B82F6`
- Cancelado: `#6B7280`
- Procedimento: `#8B5CF6`

### 2.2 Tipografia

- Família base: `Inter`
- Headings: peso 700–800
- Body: peso 400–500
- Escala: 12 / 14 / 16 / 20 / 24 / 30 / 36+

### 2.3 Raio, sombra e espaçamento

- Radius: 8 / 12 / 16 / 20 px
- Sombra card: `0 2px 8px rgba(0,0,0,.06)`
- Sombra hover: `0 8px 24px rgba(0,0,0,.10)`
- Espaçamento base: 4px (múltiplos: 8, 12, 16, 24, 32)

### 2.4 Motion

- Fast: `150ms`
- Base: `200ms`
- Slow: `300–350ms`
- Easing padrão: `cubic-bezier(0.4, 0, 0.2, 1)`

## 3. Biblioteca de Componentes

Componentes base padronizados:

- `Button`: variantes `default`, `outline`, `secondary`, `ghost`, `link`
- `Input`: foco com ring semântico e contraste AA
- `Badge`: mapeado por status semântico
- `Skeleton`: shimmer leve e consistente
- `Card` utilitário: `card-base`, `card-hover`
- `Status`: `status-pill`, `status-dot`, `timeline-bar`

Diretrizes:

- Não usar classes de cor hardcoded fora do token system
- Interação obrigatória para hover/focus/disabled/loading
- Contraste mínimo de texto: WCAG AA

## 4. Padrões de Layout

### 4.1 Marketing

- Header sticky com navegação enxuta
- Hero com gradiente leve e CTA principal
- Seções por blocos: visão, fluxo, prova operacional, FAQ
- Footer com links legais e marca

### 4.2 Sistema interno (gestor)

- Sidebar fixa (desktop) com estado ativo e hierarquia clara
- Header com ações globais (tema/notificação)
- Conteúdo em container max-width para legibilidade

### 4.3 Sistema interno (médico)

- Navegação dedicada (`/doctor`)
- Áreas obrigatórias:
- Plantões disponíveis
- Histórico de plantões
- Trocas (aceitar/recusar)
- Setores disponíveis
- Fluxo de convite para cadastro no hospital

### 4.4 Responsividade

- Desktop primeiro
- Tablet com colunas reduzidas
- Mobile com navegação simplificada e foco em ação primária

## 5. Guidelines de Animação e Microinteração

- Botões: feedback visual + escala sutil no press
- Cards: elevação e leve translateY no hover
- Navegação: transições suaves sem saltos bruscos
- Loading: skeletons e indicadores claros
- Erro/sucesso: feedback imediato via toast/alerta contextual

## 6. SEO e Metadata

- Marca unificada em title e metadata: `CONFIRMA PLANTÃO`
- Descrições orientadas a intenção (hospitais e clínicas)
- Open Graph e Twitter Cards ativos
- `robots.ts` e `sitemap.ts` configurados
- Manifest PWA com ícones válidos e tema da marca

## 7. Governança de Qualidade

Checklist obrigatório para novas telas:

1. Usa tokens de cor, raio e sombra oficiais
2. Possui estados: hover/focus/active/disabled/loading/empty/error
3. Possui hierarquia tipográfica consistente
4. Mantém contraste AA
5. Funciona em desktop/tablet/mobile
6. Não introduz estilos fora do design system sem justificativa
