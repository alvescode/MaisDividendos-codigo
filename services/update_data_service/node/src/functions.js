import { load } from "cheerio";
import { error } from "console";
import fs from "fs";
import { url } from "inspector";

const baseUrl = "https://investidor10.com.br/";

const period = "yearly";
const anos_anteriores = "4";
const periodo_dividendos = 3650;

function writeContentWithNewLines(content, filePath) {
  const contentWithNewLines = `\n${content}\n`;

  fs.appendFile(filePath, contentWithNewLines, (err) => {
    if (err) {
      console.error("Erro ao escrever no arquivo:", err);
    } else {
      // console.log("Conteúdo escrito com sucesso!");
    }
  });
}

async function busca_dados_brapi(vticker) {
  const baseURL = "https://brapi.dev/api";

  const data = await fetch(
    `${baseURL}/quote/${vticker}?token=2zC8uokBMZCcThw3CBtzVC`
  );

  const dataJSON = await data.json();
  const { results } = dataJSON;
  const response = {
    symbol: results[0]["symbol"],
    regularMarketChangePercent: results[0]["regularMarketChangePercent"],
    regularMarketPrice: results[0]["regularMarketPrice"],
    logourl: results[0]["logourl"],
  };

  console.log(`print da repsonse de busca dados brapi: `, response);

  return response;
}

async function busca_dados_do_ticker(ticker_param) {
  console.log(ticker_param);
  let info;
  const url = `${baseUrl}/acoes/${ticker_param}`;
  console.log(url);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Falha na requisição. Status: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);

    const nodesToTry = [30, 29, 31];
    let scriptData = null;

    for (const node of nodesToTry) {
      const script = $("script")[node];
      if (script && script.children && script.children[0]) {
        scriptData = script.children[0].data;
        break;
      }
    }

    if (!scriptData) {
      throw {
        message: `Nenhum dos nós ${nodesToTry.join(
          ", "
        )} foi encontrado ou está vazio.`,
      };
    }

    console.log(scriptData);

    const rawData = scriptData.slice(31).replace(/'/g, '"').replace(";", "");
    info = await JSON.parse(rawData);

    const companyShareholdingDatatable = $("#table-company-base-shareholding");
    const companyId = companyShareholdingDatatable.attr("data-company-id");
    const { ticker, type, id } = info[0];

    const dados_do_ticker = {
      vticker: ticker,
      vtype: type,
      vid: id,
      vcompanyId: companyId,
    };

    return dados_do_ticker;
  } catch (e) {
    const erro = {
      error: e.name,
      ticker: ticker_param,
      message: "Erro na Etapa 1",
      errorMessage: e.message,
    };

    writeContentWithNewLines(JSON.stringify(erro), "./logError.txt");
    throw e;
  }
}

async function busca_preco_da_acao(id) {
  try {
    const preco_da_acao = await fetch(`${baseUrl}/api/cotacao/ticker/${id}`);
    if (!preco_da_acao.ok) {
      throw new Error(
        `Erro HTTP: ${preco_da_acao.status} - ${preco_da_acao.statusText}`
      );
    }
    const preço_da_ação_response = await preco_da_acao.json();

    return preço_da_ação_response;
  } catch (e) {
    const content = {
      error: e.name,
      ticker: id,
      message: "Erro na Etapa 2",
      errorMessage: e.message,
    };
    writeContentWithNewLines(JSON.stringify(content), "logError.txt");
    throw content;
  }
}

async function busca_dados_financeiros(companyId) {
  try {
    const response = await fetch(
      `${baseUrl}/api/balancos/balancoresultados/chart/${companyId}/${anos_anteriores}/${period}`
    );
    const dados_financeiros = await response.json();
    return dados_financeiros;
  } catch (e) {
    writeContentWithNewLines(JSON.stringify(e), "logError.txt");
    return {
      error: e.name,
      ticker: companyId,
      errorMessage: e.message,
      message: "Erro na etapa 3.",
    };
  }
}

async function busca_dados_indicadores(id) {
  try {
    const url = `${baseUrl}api/historico-indicadores/${id}/10`;
    const response = await fetch(url);
    const dados_de_indicadores = await response.json();
    return dados_de_indicadores;
  } catch (e) {
    writeContentWithNewLines(JSON.stringify(e), "logError.txt");
    return {
      error: e.name,
      ticker: id,
      errorMessage: e.message,
      message: "Erro na etapa 4.",
    };
  }
}

async function busca_dados_dividendos(ticker) {
  try {
    const url5 = `${baseUrl}api/dividendos/chart/${ticker}/${periodo_dividendos}/ano/`;
    const dados_dividendos = await fetch(url5);
    const dados_dividendos_json = await dados_dividendos.json();
    return dados_dividendos_json;
  } catch (e) {
    writeContentWithNewLines(JSON.stringify(e), "logError.txt");

    return {
      error: e.name,
      ticker: ticker,
      errorMessage: e.message,
      message: "Erro na etapa 5.",
    };
  }
}

async function busca_dados_dividend_yeld(ticker) {
  try {
    const url6 = `${baseUrl}api/dividend-yield/chart/${ticker}/${periodo_dividendos}/ano/`;
    const dados_dividend_yeld = await fetch(url6);
    const dados_dividend_yeld_json = await dados_dividend_yeld.json();
    return dados_dividend_yeld_json;
  } catch (e) {
    writeContentWithNewLines(JSON.stringify(e), "logError.txt");

    return {
      error: e.name,
      ticker: ticker,
      errorMessage: e.message,
      message: "Erro na etapa 6.",
    };
  }
}

export async function main(ticker_param) {
  try {
    const dados_do_ticker = await busca_dados_do_ticker(ticker_param);
    const { vid, vcompanyId, vticker } = dados_do_ticker;
    const [
      dados_preco_da_acao,
      dados_financeiros,
      dados_indicadores,
      dados_dividendos,
      dados_dividend_yeld,
      dados_brapi,
    ] = await Promise.all([
      busca_preco_da_acao(vid),
      busca_dados_financeiros(vcompanyId),
      busca_dados_indicadores(vid),
      busca_dados_dividendos(vticker),
      busca_dados_dividend_yeld(vticker),
      busca_dados_brapi(vticker),
    ]);

    const response = {
      dados_do_ticker,
      dados_preco_da_acao,
      dados_financeiros,
      dados_indicadores,
      dados_dividendos,
      dados_dividend_yeld,
      dados_brapi,
    };
    return response;
  } catch (err) {
    console.log("Erro: ", err.message);
  }
}
