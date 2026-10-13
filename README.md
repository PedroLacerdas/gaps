# Relatório de Turno ITM

App web do relatório de produção e operação da concentração magnética, feito a partir da planilha
`Relatório de turno digitado-2025.xlsx`. Mantém as fórmulas da planilha (com os ajustes listados no fim), as listas suspensas, as validações de dados
e os cadastros da aba Instruções.

## Usar

Abra o `index.html` no navegador. Ele funciona sozinho, sem instalar nada.

- **Relatório**: a folha da aba MODELO. Células amarelas são de digitação; as demais são calculadas.
  A barra no rodapé mostra a fórmula da célula clicada.
- **Relatórios salvos**: um relatório por data e turno. Abrir ou excluir.
- **Produção**: produção diária e do mês contra o programa (concentrado, alimentação de ROM e de reprocesso),
  com o programa do ano dividido pelos meses (veja abaixo).
- **Boxplot**: boxplot, GAP e meta de qualquer campo numérico do relatório e das paradas da planta,
  calculados com os relatórios salvos (veja abaixo).
- **Instruções e cadastros**: as tabelas da aba Instruções, agora editáveis (operadores, organograma por turno,
  descrições e códigos de evento, equipamentos por usina e demais listas).
- **Fórmulas**: todas as fórmulas, com o resultado atual.
- **Baixar em Excel**: devolve a planilha original preenchida, com estilos, listas e fórmulas.
- **Baixar PDF**: o relatório em A4 deitado (dados, condições com as barras da TC-11, prévias, organograma e,
  na segunda página, paradas e ocorrências). Na lista de relatórios salvos, o botão PDF refaz o arquivo de qualquer turno.
- **Enviar relatório**: salva o turno como Enviado, gera o PDF e monta o e-mail para a lista fixa de destinatários
  (veja E-mail do relatório).

Sem Firebase configurado, os relatórios salvos ficam só no navegador de quem preencheu.

## Ligar ao Firebase

1. No [console do Firebase](https://console.firebase.google.com), abra o projeto e crie um **App da Web**
   (Configurações do projeto > Seus apps).
2. Copie a configuração do SDK para o arquivo `firebase-config.js`.
3. Em **Firestore Database**, crie o banco e publique as regras do arquivo `firestore.rules`.
4. Em **Authentication > Método de login**, ative **E-mail/senha** e cadastre os usuários em **Users**.
5. No Firestore, crie a coleção `usuarios` com um documento para cada técnico e supervisor. O id do documento é o
   e-mail da pessoa em minúsculas e o campo `papel` vale `tecnico` ou `supervisor`. Quem não tiver documento entra
   como operador.

### Quem pode editar

| Ação | Operador | Técnico e supervisor |
| --- | --- | --- |
| Preencher, salvar e enviar relatórios | sim | sim |
| Ver relatórios salvos, boxplot e cadastros | sim | sim |
| Excluir relatórios | não | sim |
| Alterar cadastros (operadores, códigos, organograma...) | não | sim |
| Ajustes do boxplot e importação do histórico | não | sim |
| Plano de produção, calendário de dias e lista de e-mails | não | sim |

As regras do `firestore.rules` aplicam a mesma tabela no servidor. O primeiro documento de `usuarios` precisa ser
criado pelo console do Firebase; depois disso um técnico ou supervisor já consegue gravar os demais.

Na versão publicada no Claude não há papéis por e-mail: quem recebe acesso de **Editor** equivale a técnico ou
supervisor, e quem recebe acesso de **Contribuidor** equivale a operador.

Os relatórios ficam na coleção `relatorios`, um documento por data e turno (por exemplo `2026-10-07_X`):

| Campo | Conteúdo |
| --- | --- |
| `data`, `turno`, `letra`, `operador` | identificação do turno |
| `vals` | valor de cada célula digitada, pelo endereço da planilha (`C9`, `AE12`, ...) |
| `status` | `rascunho` ou `enviado` |
| `resumo` | `rom`, `cmag` e `rec` do turno, para a lista de relatórios |
| `salvoEm`, `por` | data da gravação e id do usuário |

Horas são guardadas como fração do dia, como no Excel (07:00 = 0,2917). A data é texto `AAAA-MM-DD`.

Outras coleções, todas cobertas pelo arquivo `firestore.rules`:

- `config/boxplot`: ajustes da aba Boxplot (% de recuperação, outliers, método e sentido de cada variável).
- `config/producao`: plano de produção de cada ano (premissas, plano e real digitado de cada mês, calendário de dias de produção).
- `config/cadastros`: só as listas que foram alteradas em Instruções e cadastros; as demais valem como na planilha.
- `historico/AAAA-MM`: histórico por turno importado da planilha de dados, um documento por mês.
- `usuarios/<e-mail>`: papel de cada pessoa (`tecnico`, `supervisor`); veja Quem pode editar.

### Sem login

Em `firebase-config.js`, troque para `window.FIREBASE_EXIGIR_LOGIN = false` e, no `firestore.rules`, faça as
funções `logado()` e `editor()` devolverem `true`:

```
function logado() { return true; }
function editor() { return true; }
```

Assim qualquer pessoa com o endereço do app lê e altera tudo, sem distinção de papel. Use só para teste.

## Publicar

- **Firebase Hosting**: `firebase deploy` (o `firebase.json` já publica só o `index.html` e o `firebase-config.js`).
- **GitHub Pages**: Settings > Pages > branch `main`, pasta `/`. Em repositório privado, o Pages exige plano pago.

A configuração do Firebase não é segredo, mas a página traz nomes da equipe e a planilha da empresa:
mantenha o repositório privado.

## Alterar o app

```
src/page.html    estrutura da página
src/style.css    aparência
src/engine.js    motor de fórmulas (avalia o texto das fórmulas do Excel)
src/model.js     quais células são de digitação, listas e validações
src/ui.js        telas, salvar, Firebase, exportar para Excel
src/boxplot.js   cálculos e gráficos do boxplot (vindos do app Gestão da Lacuna de Resultados)
src/lacuna.js    aba Boxplot: tira as séries dos relatórios salvos e do histórico importado
src/cadastros.js cadastros editáveis da aba Instruções e cadastros
src/plano.js     aba Produção: Plano de Produção mês a mês (plano × real) e importação da planilha do plano
src/producao.js  aba Produção: produção diária, por hora e do mês contra o programa
src/paradas.js   aba Paradas e a página de paradas do PDF
src/pdf.js       PDF do relatório, gerado na própria página, sem biblioteca externa
src/data.json    valores e fórmulas lidos da planilha
src/extract.py   gera o data.json a partir da planilha
src/build.py     monta o index.html
```

Depois de editar algo em `src/`:

```
python3 src/build.py
```

Se a planilha mudar, substitua o arquivo em `planilha/` e rode antes
`python3 src/extract.py planilha/Relatorio_de_turno_digitado-2025.xlsx` (precisa de `openpyxl`).

## Conferência das fórmulas

```
node testes/conferir_formulas.js && python3 testes/conferir_no_libreoffice.py
```

Preenche 9 cenários, aplica na planilha as fórmulas que o app mudou, recalcula no LibreOffice e compara as 137
fórmulas célula a célula (1.233 comparações, nenhuma diferença na última execução).

## Aba Produção

### Plano de Produção (mês a mês, plano × real)

No alto da aba, a parte da Concentração ITM da planilha **Plano de Produção e Movimentação**, no mesmo formato: cada
mês com as colunas Plano e Real, períodos (chuvoso, transição, seco) e total do ano. Linhas e contas da planilha:

- Rendimento operacional: dias horizonte, dias programados, horas operadas, disponibilidade (DF), utilização (UF),
  rendimento operacional = DF × UF e horas trabalhadas = horas operadas × rendimento operacional.
- Alimentação ITM: alimentação total = horas trabalhadas × t/h; ROM + finos = alimentação total − reprocesso.
- Produção ITM: cada produto (NPO, HMT, SF, CM) em t/h = alimentação t/h × recuperação mássica, e em t/mês = t/h ×
  horas trabalhadas; granulados e total de produtos.
- Rejeitos: o restante da recuperação mássica.
- Premissas: recuperação mássica de cada produto, limite de alimentação da licença e revisão do plano.

*Importar plano (.xlsx)* lê a planilha do plano (parte "Concentração ITM": dias programados, horas operadas por dia,
DF, UF, alimentação t/h e reprocesso de cada mês, as premissas e as colunas REAL). *Editar* deixa digitar qualquer
um desses valores. Só técnicos e supervisores importam e editam.

O **real** vem dos relatórios de turno salvos: dias = horas dos turnos lançados ÷ 24; DF e UF pelas paradas com
código; alimentação = TC-07 + TC-07B; ROM + finos = TC-07; reprocesso = TC-07B; NPO, HMT, SF e CM = TC-08, TC-09,
TC-10 e TC-11. Um valor real digitado ou importado (sublinhado na tabela) vale no lugar do que vem dos relatórios.
▲ e ▼ comparam real e plano nos meses já fechados.

### Acompanhamento do dia

Soma os relatórios de turno salvos e compara com o programa do mês, que vem do plano: Concentrado = CM, Alimentação
ROM = ROM + finos, Alimentação Reprocesso = reprocesso.

- Programa do dia = programa do mês ÷ dias de produção do calendário do mês.
- Programa do turno = programa do dia × duração do turno ÷ 24: Z de 23:40 às 07:00 (7h20), X de 07:00 às 15:20 (8h20)
  e Y de 15:20 às 23:40 (8h20), somando 24h00.
- Programa da hora = programa do dia ÷ 24. Cada turno tem as horas cheias e uma hora picada de 20 min no fim
  (06:40–07:00, 15:00–15:20 e 23:20–23:40), com programa proporcional: programa da hora × 20 ÷ 60. Somando as horas
  do turno, dá o programa do turno.
- Ritmo do dia = acumulado do dia ÷ horas dos turnos já lançados × 24.
- Acumulado do mês: soma até o dia anterior à data escolhida.
- Dif. p/ programa = acumulado − programa do dia × dias decorridos.
- Ritmo do mês = acumulado ÷ dias decorridos × dias de produção.

**Dias de produção**: um calendário por mês. De partida, todos os dias menos os domingos; técnicos e supervisores
clicam nos dias para marcar domingos e feriados trabalhados ou desmarcar dias sem produção.

**Produção por hora**: cada hora dos turnos lançados no dia, com o concentrado em barras contra o programa da hora.
A coluna Concentrado da aba Relatório (e o PDF) usa a mesma regra: barra verde quando a hora atinge o programa,
vermelha abaixo, e um traço marcando o programa.

## Aba Paradas

Principais paradas da planta, no espírito das abas Ocorrências e Perda de Produção do Painel de Produção. Os dados
vêm do **Relatório de paradas da planta** de cada relatório de turno salvo (início, término, descrição do evento,
usina e equipamento), filtrados por período, turno e usina:

- Indicadores: horas paradas, horas de operação e de manutenção, perda de produção, DF e UF.
- Ocorrências: tempo parado por descrição do evento, do maior para o menor, com o % acumulado (Pareto); em negrito,
  as que somam até 80% do tempo.
- Por equipamento: tempo parado por equipamento, separado por tipo.
- Horas paradas por dia e a tabela de ocorrências por dia.

O tipo vem do código da descrição do evento: HAO e HIO = operação, HMC e HMP = manutenção, os demais = outras.
Perda de produção = concentrado ÷ horas trabalhadas × horas paradas de cada tipo.

O **PDF do relatório de turno** termina com uma página destes gráficos para o mês do relatório, do dia 1 até a data
dele (com o próprio relatório incluído).

## E-mail do relatório

A lista fixa de destinatários fica em **Instruções e cadastros > E-mails que recebem o relatório**. Depois de
*Enviar relatório* (ou pelo botão E-mail da lista de relatórios salvos), o app mostra o e-mail pronto: destinatários,
assunto e mensagem com o resumo do turno. *Abrir no Outlook* abre o programa de e-mail padrão do computador com tudo
preenchido; o PDF baixado é anexado à mão, porque uma página web não consegue anexar arquivos nem enviar e-mails
sozinha. Os botões Copiar servem para o Outlook na web.

Envio automático, sem passar pelo Outlook de quem envia, precisa de um serviço no servidor (por exemplo a extensão
Trigger Email do Firebase, no plano Blaze, com uma conta de envio). Ainda não está montado.

## Aba Boxplot

Os dados vêm dos relatórios salvos, filtrados por período e turno:

- **Dados e condições operacionais**: um valor por hora lançada (Rom, C.Mag, Rec.M, densidade, rotação...).
- **Totais**: um valor por relatório (totais do turno, Rec.M do turno, média das prévias).
- **Paradas da planta**: término menos início de cada linha, em minutos, agrupadas pela descrição do evento.

Para cada variável: boxplot, média, quartis, outliers (1,5 × IQR), GAP até o 1º quartil (ou 3º, se maior é melhor)
e a meta com o % de recuperação escolhido. Os quartis usam o cálculo do gráfico de caixa do Excel (mediana exclusiva).

### Histórico por turno

Em **Histórico importado**, o botão *Importar planilha de dados (.xlsx)* lê uma planilha com as colunas Data, Turno,
HP, Interferências (P.P e P.M), Alimentação e Produção (NPO, HEM, SF, CONC). Cada mês importado substitui o que
já existia daquele mês. As variáveis aparecem no grupo *Histórico por turno*: DF, UF, EG, interferências (em
minutos), t/h, rendimento e toneladas por turno.

- HD = HP − P.M, HT = HD − P.P, DF = HD ÷ HP, UF = HT ÷ HD e EG = DF × UF, como na planilha.
- As toneladas de cada turno são lidas de dentro das fórmulas de Alimentação e Produção (`=2703/...`). O t/h é a
  tonelada dividida pelas horas trabalhadas (HT); na planilha original a fórmula divide pela coluna da data.
- Turnos 1, 2 e 3 da planilha correspondem a Z, X e Y (o turno 1 tem 7,33 h, a duração do turno Z).

DF e UF saem dos próprios relatórios: HC é a soma da duração dos turnos; paradas com código HMC ou HMP contam como
manutenção (HM); HAO e HIO, como paradas operacionais (HPO); HI, como horas inativas. Paradas não lançadas no
relatório não entram na conta.

## Cadastros editáveis

Em **Instruções e cadastros**, cada lista tem um botão *Editar* para incluir, corrigir ou remover itens. A mudança
vale na hora nas listas do relatório e fica gravada no banco. *Voltar ao que está na planilha* desfaz as alterações
de uma lista. A tabela de turnos é fixa, porque as fórmulas das horas dependem dela.

O **Organograma por turno** tem uma linha por pessoa, com grupo (Equipe do turno, Carregadeiras ou Caminhões),
cargo e o nome em cada turno. Dá para incluir e remover linhas em qualquer grupo; o Organograma ITM do relatório
mostra essas linhas conforme o turno escolhido. Cada linha ocupa uma vaga da planilha (cargo na coluna AC e a
fórmula com os nomes na coluna AD): 8 vagas na equipe, 3 nas carregadeiras e 7 nos caminhões. Linhas além dessas
vagas aparecem no app, mas não cabem no Excel baixado.

O Excel baixado leva os valores escolhidos e o organograma atualizado, mas a aba Instruções do arquivo continua
com as listas originais da planilha.

## Diferenças em relação à planilha

- **Alimentação total**: o app tem uma coluna a mais, **TC-07B**, ao lado da TC-07, e a coluna calculada
  **Alimentação total** (TC-07 + TC-07B). Rej. Filtro, Rec.M e % Rec. mássica usam a alimentação total no lugar do
  Rom da TC-07. No Excel exportado, a TC-07B fica na coluna AA e a alimentação total na coluna AB, com as fórmulas
  já atualizadas.
- **Massa alim. <2mm** (C23 a C31): na planilha é digitada; no app é calculada como alimentação total menos
  TC-08, TC-09 e TC-10. % Rec. mássica <2MM divide o C.Mag por esse resultado e % Rec. mássica ROM divide pela
  alimentação total.
- **H23 a H31** (% Rec. mássica <2MM): na planilha dividem por E23 a E31, que ficam dentro da célula mesclada
  C:F e estão sempre vazias, o que dá `#DIV/0!`. No app e no Excel exportado dividem por C23 a C31.
- **Enviar**: a planilha chama a macro `Enviar_Relatorio_Diario`, que não está no arquivo `.xlsx`.
  No app, Enviar grava o relatório com a situação "Enviado".
- **Organograma**: vem do cadastro Organograma por turno; não há mais campos de digitação no relatório.
- **Concentrado** (I23 a P31): na planilha são células de digitação sem título; no app a coluna mostra em barras
  a produção da TC-11 (C.Mag) de cada hora, verde no programa da hora ou acima e vermelha abaixo.
