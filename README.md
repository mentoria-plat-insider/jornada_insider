# Sua jornada no Insider

Pesquisa aplicada aos membros da Mentoria Insider (Grupo IGD): olha para o
caminho já percorrido, mapeia as travas do momento e antecipa as objeções de
renovação antes que a renovação aconteça.

São 19 telas de pergunta, uma de cada vez, com identificação por nome e e-mail
no início. Um arquivo HTML só, sem build e sem framework.

## Estrutura

| Arquivo | Para que serve |
| --- | --- |
| `index.html` | O formulário inteiro: conteúdo, estilo, validação e envio. |
| `apps-script/respostas.gs` | Recebe as respostas e grava na planilha do Google. |

## Como as respostas são coletadas

Ao concluir, o formulário envia a resposta ao Apps Script publicado como App da
Web, que grava uma linha na aba **Respostas** da planilha. O cabeçalho é criado
na primeira resposta a partir do que o formulário manda, então mudar as
perguntas não quebra a planilha.

O endereço do Apps Script fica na constante `ENDPOINT`, no início do `<script>`
do `index.html`. Para trocar de planilha: publique um novo App da Web e
substitua essa linha.

**Uma resposta por e-mail.** A checagem acontece duas vezes: no formulário,
antes de a pessoa começar, e de novo no Apps Script, antes de gravar. A segunda
é a que vale — a primeira depende do que o navegador consegue consultar. Se a
consulta falhar, o formulário deixa passar de propósito: receber uma resposta
repetida é menos grave do que barrar quem tem direito de responder.

### Publicar o Apps Script

1. Na planilha: Extensões → Apps Script, cole `apps-script/respostas.gs`.
2. Implantar → Nova implantação → App da Web.
3. Executar como: eu mesmo. Quem pode acessar: **qualquer pessoa** (não
   "qualquer pessoa da organização", senão quem responde com e-mail pessoal
   trava numa tela de login do Google).
4. Copie a URL terminada em `/exec` para a constante `ENDPOINT`.

## Como alterar as perguntas

Tudo vive no objeto `Q`, no início do `<script>`. Cada pergunta tem um tipo:

- `single` — uma opção. `other:true` acrescenta o campo "Outro".
- `multi` — várias opções. `max:3` limita a seleção e desabilita o resto.
- `scale` — escala numérica. `min` e `to` definem as pontas (0 a 10, 1 a 5).
- `open` — resposta aberta. `short:true` reduz a altura da caixa.

A ordem das telas fica em `SCREENS`, junto das telas de transição. A numeração
é calculada em tempo de execução, então inserir ou remover perguntas não deixa
buracos. Listas com 10 ou mais opções curtas viram duas colunas sozinhas.

A pergunta 18 é condicional: quem escolhe a primeira alternativa da 17 pula
direto para a 19.

## Decisões que não são óbvias

- **Nada toca o DOM fora de `iniciar()`.** Um elemento faltando vira falha
  isolada, não a morte do script — foi assim que o formulário já abriu em
  branco uma vez.
- **O botão Continuar nasce desabilitado** e só libera com resposta válida.
- **Rascunho no `localStorage`** de quem responde, apagado ao concluir. Muda de
  chave quando as perguntas mudam, para não apontar para uma tela que não
  existe mais.
- **Envio com reenvio às cegas** se a confirmação não puder ser lida: a linha
  chega à planilha mesmo sem resposta legível.

## Publicação

Site estático: qualquer host serve o `index.html` na raiz. Hoje roda na Vercel,
no projeto `jornada-insider` do time `insider-e-plat`.

Atenção à proteção de deployment da Vercel: com **Vercel Authentication**
ligada, quem recebe o link cai numa tela de login. Settings → Deployment
Protection → Disabled.

## Identidade visual

Segue o padrão dos painéis da Gestão Insider: papel `#EEECE4`, tinta `#1E2342`,
carimbos em terracota, âmbar e verde; Fraunces nos títulos, Inter na interface,
IBM Plex Mono em todo número. O logo vai embutido em base64 para o arquivo
continuar sendo um só.
