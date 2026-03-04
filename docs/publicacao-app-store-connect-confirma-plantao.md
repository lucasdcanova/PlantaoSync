# Runbook de Publicacao iOS na App Store (App Store Connect)

## Objetivo

Este documento orienta um agente de IA a executar a publicacao do app iOS **CONFIRMA PLANTAO** no **App Store Connect**, com base no codigo atual deste repositório.

O agente deve seguir este runbook como procedimento operacional, sem inventar dados. Se algum campo exigir informacao que nao existe no projeto, o agente deve pausar e solicitar ao responsavel humano.

## Escopo deste runbook

- Criacao/ajuste do registro do app no App Store Connect
- Preenchimento de metadados da versao
- App Privacy, Age Rating e informacoes de review
- Vinculo de build e submissao para App Review
- Publicacao apos aprovacao

Tambem inclui um bloco previo de **preparo do build iOS** (fora do App Store Connect), porque o projeto mobile usa Expo e ainda nao possui configuracao EAS finalizada.

## Resumo da analise do projeto (baseado no codigo)

### Identidade do app (mobile)

- Nome: `CONFIRMA PLANTAO`
- Slug Expo: `confirma-plantao`
- Versao atual: `1.0.0`
- Bundle ID iOS: `com.confirmaplantao.app`
- iPhone only: `supportsTablet = false` (sem iPad)
- Stack: Expo + React Native + Expo Router

### Funcionalidades visiveis no app (build atual)

- Login
- Cadastro por convite
- Recuperacao de acesso (tela basica)
- Lista de plantoes disponiveis
- Calendario mensal de plantoes em aberto
- Detalhe do plantao + confirmacao
- Historico de plantoes (proximos/historico)
- Trocas de plantao (solicitar/aceitar/recusar)
- Perfil profissional

### Observacoes importantes do build atual (impacta review)

- O app mobile atual opera como **shell nativo com WebView**, carregando o PWA em producao (`https://plantaosync.onrender.com`).
- O projeto ja esta vinculado ao EAS (`owner: lucasdcanova`, `projectId: 6ed8b666-5d6d-4b43-a78b-727ebc59b935`).
- O arquivo `apps/mobile/eas.json` ja existe com perfil `production` em `distribution: store`.
- O `Info.plist` contem `ITSAppUsesNonExemptEncryption = false`.

## Bloqueios/pendencias antes da submissao (criticos)

O agente de IA deve verificar estes pontos antes de clicar em `Submit for Review`:

1. **Build iOS disponivel no App Store Connect**
- Sem build, nao e possivel submeter.
- O repo possui `eas.json` pronto; usar `pnpm --filter=mobile build:ios:review` para build + auto submit.

2. **Versionamento alinhado no App Store Connect**
- O build usa `CFBundleShortVersionString = 1.0.0`.
- A versao em App Store Connect deve estar no mesmo numero para permitir selecao do build na revisao.

3. **Screenshots de App Store nao existem no repositorio**
- O agente precisara de screenshots prontos (ou capturados em simulador) para upload.

4. **Dados de suporte/review podem estar incompletos**
- Email, telefone e nome de contato de App Review geralmente nao estao no codigo.

5. **Risco de rejeicao por app demo/prototipo**
- O build atual expõe dados demo/local e nao integra backend real no mobile.
- Se a intencao for publicacao publica, recomenda-se remover rotulos demo e alinhar o discurso da listagem com o comportamento real do app.

## Fontes oficiais Apple (usar como referencia durante a execucao)

- Add a new app: https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app
- Submit an app: https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app
- Screenshot specifications: https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications/
- Upload app previews and screenshots: https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots
- Manage app privacy: https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy
- App privacy reference: https://developer.apple.com/help/app-store-connect/reference/app-information/app-privacy/
- Set an app age rating: https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/
- Encryption documentation: https://developer.apple.com/help/app-store-connect/manage-app-information/determine-and-upload-app-encryption-documentation/

## Regras operacionais para o agente de IA

1. Nao alterar bundle ID nem criar app duplicado se o app ja existir.
2. Nao responder formularios legais (privacy/encryption) com suposicoes nao suportadas pelo codigo.
3. Se encontrar divergencia entre o build enviado e este runbook, priorizar o build real e registrar a divergencia.
4. Registrar tudo que foi preenchido (copiar valores finais em log ao final da sessao).
5. Se faltar dado humano (contato, CNPJ/empresa, termos legais internos), pausar e solicitar.

## Dados do projeto para preencher no App Store Connect (pre-preenchidos)

### App record (novo app)

- Platform: `iOS`
- App Name: `CONFIRMA PLANTAO`
- Primary Language (recomendado): `Portuguese (Brazil)`
- Bundle ID: `com.confirmaplantao.app`
- SKU (sugestao): `confirma-plantao-ios`

### URLs (recomendadas, baseadas no projeto web)

- Privacy Policy URL: `https://plantaosync.onrender.com/privacy`
- Terms (referencia interna): `https://plantaosync.onrender.com/terms`
- LGPD (User Privacy Choices URL opcional recomendado): `https://plantaosync.onrender.com/lgpd`
- Support URL (se nao houver URL melhor): `https://plantaosync.onrender.com`
- Marketing URL (opcional): `https://plantaosync.onrender.com`

## Texto recomendado para listagem (pt-BR)

O agente pode usar os textos abaixo como base inicial. Se existir copy oficial da marca, substituir.

### Nome

`CONFIRMA PLANTAO`

### Subtitulo (<= 30 chars)

`Escalas e plantões médicos`

### Texto promocional (opcional)

`Organize plantões, confirme coberturas e acompanhe trocas em uma experiência rápida para equipes médicas.`

### Descricao

`CONFIRMA PLANTAO ajuda profissionais de saude e equipes hospitalares a acompanhar oportunidades de plantao, confirmar coberturas e visualizar a rotina de escalas com mais clareza.

Principais recursos:
- Visualizacao de plantões disponiveis por setor
- Calendario mensal com plantões em aberto
- Confirmacao de plantao com poucos toques
- Historico de plantões (proximos e concluídos)
- Solicitação e resposta de trocas de plantão
- Perfil profissional com dados de vinculo hospitalar

O app foi desenhado para fluxos operacionais de escalas medicas, com foco em agilidade no dia a dia assistencial.`

### Keywords (<= 100 chars, separadas por virgula)

`plantao,escala medica,hospital,medico,saude,troca de plantao,agenda,turno`

### Whats New (versao 1.0.0)

`Lançamento inicial do CONFIRMA PLANTAO com login, visualização de plantões, calendário, histórico, trocas e perfil profissional.`

## Credenciais e fluxo de teste para App Review (build atual)

### Credenciais demo

- Email: `medico@demo.com`
- Senha: `Senha@123`

### Fluxo de teste sugerido para o reviewer

1. Abrir o app e fazer login com as credenciais demo.
2. Na tela inicial, abrir um plantão disponivel.
3. Confirmar o plantão no modal de detalhe.
4. Ir para `Calendário` para visualizar plantões por setor.
5. Ir para `Histórico` para ver proximos e concluidos.
6. Ir para `Trocas` para visualizar/solicitar trocas.
7. Ir para `Perfil` para dados profissionais e convites demo.

### Notas de review (recomendadas)

Usar texto semelhante:

`Este build iOS demonstra o fluxo operacional do CONFIRMA PLANTAO para gestão de plantões médicos (login, visualização de plantões, confirmação, histórico e trocas). Para facilitar a análise, o build inclui um modo de demonstração local com dados de exemplo e credenciais de teste:
Email: medico@demo.com
Senha: Senha@123

O app não fornece diagnóstico, tratamento ou orientação clínica ao paciente; ele é voltado à gestão operacional de escalas/plantões para profissionais e organizações de saúde.`

## App Privacy (resposta recomendada para o build atual)

### Analise do codigo mobile atual

- Dados de login/cadastro demo sao armazenados localmente em `AsyncStorage`
- Nao foram encontradas chamadas de API no app mobile atual
- Nao ha SDK de analytics/ads/tracking no app mobile atual
- Nao ha ATT (App Tracking Transparency)
- Nao ha coleta de camera/fotos/localizacao/microfone/contatos

### Resposta sugerida no App Store Connect (build demo atual)

Se o build submetido for o **mesmo comportamento do codigo atual** (demo local, sem envio de dados para servidor):

- App Privacy > Data Collection: **No, we do not collect data**

### Importante (obrigatorio validar)

Se o build enviado para review tiver backend ativo, push real, analytics, logs remotos, ou qualquer envio de dados pessoais para servidor, **NAO** use a resposta acima. Nesse caso, o agente deve pausar e pedir confirmacao do mapa real de dados coletados.

### URLs de privacidade

- Privacy Policy URL: `https://plantaosync.onrender.com/privacy` (obrigatorio)
- User Privacy Choices URL: `https://plantaosync.onrender.com/lgpd` (opcional recomendado)

## Age Rating (classificacao etaria)

### Recomendacao inicial

- Preencher o questionario com base no build atual
- Tendencia esperada: **4+** (sem violencia, sexo, apostas, alcool, drogas, etc.)

### Cuidados ao responder

- O app e operacional (gestao de plantões), nao um app de orientacao medica ao paciente
- Nao marcar recursos que nao existem (chat, publicidade, apostas, etc.)
- Se o questionario tratar conteudo medico/wellness, avaliar com cautela; no build atual nao ha conteudo clinico para pacientes

## Criptografia / Export Compliance (App Encryption)

### Recomendacao operacional

Para apps comuns sem criptografia proprietaria (uso padrao de TLS/HTTPS/sistema), geralmente o app se enquadra em fluxo de isencao/exempt encryption. Porem as perguntas variam e podem depender do build.

O agente deve:

1. Responder com base no build real enviado.
2. Se aparecer pergunta sobre criptografia nao padrao/proprietaria, responder **Nao** (a menos que o time confirme o contrario).
3. Se houver duvida juridica/compliance, pausar e solicitar validacao humana.

### Observacao tecnica

Opcionalmente, o time pode configurar o Info.plist (ou equivalente Expo) para indicar isencao e reduzir perguntas repetidas no upload, mas isso nao esta configurado neste repositorio hoje.

## Screenshots (App Store) - plano recomendado

### Requisito atual (Apple)

Segundo notas da Apple, desde **11 de setembro de 2024**, basta ao menos **1 screenshot de iPhone 6.5" ou 6.9"** para submissao (se o app for iPhone). Ainda assim, e recomendado subir 5 a 8 screenshots para conversao.

### Como capturar (recomendado)

- Simulador iPhone 15 Pro Max / 16 Pro Max (gera telas compatíveis 6.9" / 6.5")
- Idioma do app: pt-BR
- Usar o fluxo demo com dados preenchidos
- Evitar status bar inconsistente entre screenshots (horario/bateria diferentes demais)

### Sequencia sugerida de screenshots (iPhone)

1. Login (`Entrar`) com branding
2. Home / plantões disponiveis (cards e insights)
3. Calendario mensal com filtros por setor
4. Detalhe do plantao com valor e CTA de confirmar
5. Historico de plantões (status)
6. Trocas de plantão (solicitação + recebidas)
7. Perfil profissional

### Especificacoes (consultar sempre a referencia Apple)

- Formatos aceitos: `.png`, `.jpg`, `.jpeg`
- Quantidade: 1 a 10 por tamanho
- Referencia oficial: `Screenshot specifications` (link na secao de fontes)

## Preparo do build iOS (fora do App Store Connect)

Esta secao e necessaria se ainda nao houver build iOS no App Store Connect.

### Checklist tecnico minimo

1. Confirmar conta Apple Developer ativa
2. Confirmar Bundle ID `com.confirmaplantao.app` criado no portal Apple Developer (Certificates, IDs & Profiles), se necessario
3. Corrigir `apps/mobile/app.json`:
- `expo.extra.eas.projectId` com valor real (nao placeholder)
4. Criar `eas.json` (o repo nao possui)
5. Logar no EAS CLI e configurar projeto
6. Gerar build iOS
7. Enviar build para App Store Connect (`eas submit` ou upload manual)

### Comandos tipicos (referencia)

Executar a partir da raiz do repo:

```bash
pnpm install
cd apps/mobile
npx eas-cli login
npx eas-cli init
npx eas-cli build --platform ios
npx eas-cli submit --platform ios
```

### Observacoes

- O agente que atua apenas no navegador (App Store Connect) pode depender de um humano/outro agente para gerar e enviar o build.
- Sem build processado no App Store Connect, a versao ficara sem opcao no campo `Build`.

## Passo a passo no App Store Connect (execucao do agente)

## Fase 1 - Acesso e verificacoes iniciais

1. Entrar em `https://appstoreconnect.apple.com/`
2. Verificar se a conta possui papel: `Account Holder`, `Admin` ou `App Manager`
3. Verificar se contratos/agreements pendentes foram aceitos (se houver, pausar e pedir autorizacao humana)

## Fase 2 - Criar ou localizar o app

1. Ir em `Apps`
2. Procurar por `CONFIRMA PLANTAO`
3. Se ja existir app com bundle `com.confirmaplantao.app`, abrir esse app (nao criar duplicado)
4. Se nao existir:
- Clicar `+` > `New App`
- Platform: `iOS`
- Name: `CONFIRMA PLANTAO`
- Primary Language: `Portuguese (Brazil)`
- Bundle ID: selecionar `com.confirmaplantao.app`
- SKU: `confirma-plantao-ios` (ou SKU fornecido pelo time)
- User Access: `Full Access` (se nao houver instrução diferente)
- Clicar `Create`

## Fase 3 - App Information (geral)

No menu lateral, abrir `App Information` e preencher/revisar:

1. Category:
- Primary: `Medical` (recomendado)
- Secondary: `Business` (ou `Productivity`, se o time preferir)

2. Content Rights:
- Para o build demo atual, normalmente `No` (sem catalogo de conteudo de terceiros)
- Se o time informar uso de conteudo/licencas de terceiros, ajustar e confirmar direitos

3. Age Rating:
- Abrir questionario
- Responder com base no build atual (esperado 4+)
- Salvar

4. Privacy Policy URL:
- `https://plantaosync.onrender.com/privacy`

5. User Privacy Choices URL (se campo estiver disponivel):
- `https://plantaosync.onrender.com/lgpd`

6. Guardar/salvar alteracoes

## Fase 4 - Pricing and Availability

1. Abrir `Pricing and Availability`
2. Preco:
- `Free` (recomendado para build atual, salvo instrução diferente)
3. Availability:
- Todos os territorios (ou lista definida pelo time)
4. Salvar

## Fase 5 - Criar/editar a versao iOS (1.0.0)

1. Selecionar a versao iOS no menu lateral (ex.: `iOS App 1.0.0`)
2. Se a versao nao existir, criar nova versao com numero `1.0.0` (deve casar com o build)
3. Preencher `Version Information` (pt-BR):
- Subtitle: `Escalas e plantões médicos`
- Promotional Text: usar texto sugerido
- Description: usar texto sugerido
- Keywords: usar keywords sugeridas
- Support URL: `https://plantaosync.onrender.com`
- Marketing URL (opcional): `https://plantaosync.onrender.com`

4. `App Review Information`:
- Contact First Name / Last Name: solicitar ao time se nao informado
- Contact Phone: solicitar ao time
- Contact Email: solicitar ao time
- Demo account required: `Yes`
- Username: `medico@demo.com`
- Password: `Senha@123`
- Sign-in information / notes: usar notas de review sugeridas

5. `Version Release`:
- Recomendado: `Manually release this version`

6. `Copyright`:
- Preencher com a razao social ou marca definida pelo time (ex.: `2026 CONFIRMA PLANTAO`)

7. `What's New in This Version`:
- Usar texto sugerido de lancamento inicial

## Fase 6 - Upload de screenshots

1. Ir para `Previews and Screenshots`
2. Selecionar iPhone
3. Fazer upload dos screenshots preparados
4. Garantir ao menos 1 screenshot de tamanho aceito (6.5" ou 6.9")
5. Ordenar na sequencia narrativa recomendada
6. Salvar

## Fase 7 - App Privacy

1. Abrir `App Privacy` (ou fluxo equivalente no sidebar)
2. Confirmar `Privacy Policy URL`
3. Responder perguntas de coleta de dados

Para o build demo atual (sem backend/coleta remota no mobile), usar:

- `No, we do not collect data`

Se o build real tiver coleta remota, interromper e refazer respostas com base no mapa de dados.

## Fase 8 - Vincular build

1. Voltar para a versao iOS (`1.0.0`)
2. Ir ate a secao `Build`
3. Selecionar o build processado correspondente
4. Aguardar processamento, se ainda estiver em `Processing`

### Se aparecer questionario de criptografia

- Responder com base no build real
- Sem criptografia proprietaria/custom: seguir fluxo de isencao (exempt/standard encryption)
- Em caso de duvida: pausar e pedir validacao humana

## Fase 9 - Add for Review e Submit for Review

1. Clicar `Add for Review`
2. Verificar se nao restou campo obrigatorio pendente
3. Clicar `Submit for Review`
4. Registrar:
- Data/hora da submissao
- Numero da versao
- Build selecionado
- Respostas de App Privacy
- Resultado (Ready for Review / In Review)

## Fase 10 - Acompanhamento e publicacao

1. Monitorar mensagens do App Review
2. Se houver `Rejected`:
- Copiar texto integral da rejeicao
- Mapear causa para acao tecnica
- Nao responder sem contexto do time se envolver tema legal/compliance
3. Se `Approved` e release manual:
- Clicar para liberar versao (`Release This Version`)
4. Registrar data/hora de publicacao

## Checklist final (o agente deve confirmar antes de encerrar)

- App correto (`CONFIRMA PLANTAO`) e bundle correto (`com.confirmaplantao.app`)
- Versao e build corretos vinculados
- Screenshots enviados
- Descricao/subtitulo/keywords preenchidos
- Privacy Policy URL preenchida
- App Privacy respondido de forma compativel com o build
- Age Rating concluido
- Credenciais de review preenchidas
- Submission enviada (ou bloqueio registrado)

## Anexo - Dados sensiveis/permissoes identificados no codigo (referencia interna)

- `NSFaceIDUsageDescription` configurado no iOS (`app.json`)
- `UIBackgroundModes: remote-notification` configurado no iOS (`app.json`)
- Plugins Expo configurados: `expo-notifications`, `expo-local-authentication`
- Persistencia local com `AsyncStorage` para auth e dados demo
- Credenciais demo hardcoded para review: `medico@demo.com` / `Senha@123`

## Se o agente encontrar divergencia

Exemplos de divergencia:

- App Store Connect mostra outro bundle ID
- Build enviado nao corresponde ao app atual
- Metadados ja preenchidos em outro idioma
- App Privacy ja configurado com coleta de dados

Procedimento:

1. Nao sobrescrever dados criticos sem confirmar
2. Registrar a divergencia
3. Solicitar decisao do responsavel humano
