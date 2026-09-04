/**
 * Recebe as respostas do formulário "Sua jornada no Insider" e grava na planilha.
 *
 * Como publicar:
 *   1. Abra a planilha que vai receber as respostas.
 *   2. Extensões → Apps Script. Apague o conteúdo e cole este arquivo.
 *   3. Implantar → Nova implantação → tipo "App da Web".
 *        Executar como: eu mesmo
 *        Quem pode acessar: qualquer pessoa
 *   4. Copie a URL gerada (termina em /exec) e mande para o Claude.
 *
 * A aba é criada sozinha na primeira resposta, e o cabeçalho vem do próprio
 * formulário — se as perguntas mudarem, o cabeçalho acompanha.
 */

var ABA = 'Respostas';

function planilha_() {
  var arquivo = SpreadsheetApp.getActiveSpreadsheet();
  var aba = arquivo.getSheetByName(ABA);
  if (!aba) aba = arquivo.insertSheet(ABA);
  return aba;
}

function emailsJaRegistrados_(aba) {
  if (aba.getLastRow() < 2) return {};
  // A coluna do e-mail é localizada pelo cabeçalho, não por posição fixa.
  var cabecalho = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0];
  var col = cabecalho.indexOf('E-mail') + 1;
  if (col === 0) return {};
  var valores = aba.getRange(2, col, aba.getLastRow() - 1, 1).getValues();
  var mapa = {};
  valores.forEach(function (linha) {
    var e = String(linha[0] || '').trim().toLowerCase();
    if (e) mapa[e] = true;
  });
  return mapa;
}

function responder_(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Consulta usada pelo formulário antes de a pessoa começar a responder. */
function doGet(e) {
  var email = String((e.parameter && e.parameter.email) || '').trim().toLowerCase();
  if (!email) return responder_({ ok: true, existe: false });
  var existe = !!emailsJaRegistrados_(planilha_())[email];
  return responder_({ ok: true, existe: existe });
}

/** Grava uma resposta. O formulário envia { colunas: [...], valores: [...] }. */
function doPost(e) {
  var trava = LockService.getScriptLock();
  // Sem a trava, dois envios simultâneos podem escrever na mesma linha.
  trava.waitLock(30000);
  try {
    var dados = JSON.parse(e.postData.contents);
    var colunas = dados.colunas || [];
    var valores = dados.valores || [];
    var aba = planilha_();

    if (aba.getLastRow() === 0) {
      aba.appendRow(colunas);
      aba.getRange(1, 1, 1, colunas.length).setFontWeight('bold');
      aba.setFrozenRows(1);
    }

    var email = String(dados.email || '').trim().toLowerCase();
    if (email && emailsJaRegistrados_(aba)[email]) {
      return responder_({ ok: false, motivo: 'duplicado' });
    }

    aba.appendRow(valores);
    return responder_({ ok: true, linha: aba.getLastRow() });
  } catch (erro) {
    return responder_({ ok: false, motivo: String(erro) });
  } finally {
    trava.releaseLock();
  }
}
