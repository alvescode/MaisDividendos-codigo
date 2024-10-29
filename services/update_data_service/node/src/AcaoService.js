import { load } from "cheerio";
import fs from "fs";
import fetch from "node-fetch"; 

export class AcaoService {
  constructor() {
    this.baseUrl = "https://investidor10.com.br";
    this.logFilePath = "./logError.txt";
  }

  writeContentWithNewLines(content) {
    const contentWithNewLines = `\n${content}\n`;
    fs.appendFile(this.logFilePath, contentWithNewLines, (err) => {
      if (err) {
        console.error("Erro ao escrever no arquivo:", err);
      }
    });
  }

  async buscaDadosDoTicker(tickerParam) {
    console.log(tickerParam);
    const url = `${this.baseUrl}/acoes/${tickerParam}`;
    console.log(url);
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Falha na requisição. Status: ${response.status}`);
      }

      const html = await response.text();
      const $ = load(html);
      const node = 30;
      const script = $("script")[node];

      if (!script || !script.children || !script.children[0]) {
        throw new Error(`Script node ${node} não encontrado ou sem conteúdo.`);
      }

      const rawData = script.children[0].data
        .slice(31)
        .replace(/'/g, '"')
        .replace(";", "");
      const info = JSON.parse(rawData);

      const companyShareholdingDatatable = $("#table-company-base-shareholding");
      const companyId = companyShareholdingDatatable.attr("data-company-id");
      const { ticker, type, id } = info[0];
      return { ticker, type, id, companyId };
    } catch (e) {
      const errorLog = {
        error: e.name,
        ticker: tickerParam,
        message: "Erro na Etapa 1",
        errorMessage: e.message,
      };
      this.writeContentWithNewLines(JSON.stringify(errorLog));
      throw e;
    }
  }

  async buscaPrecoDaAcao(id) {
    try {
      const response = await fetch(`${this.baseUrl}/api/cotacao/ticker/${id}`);
      if (!response.ok) {
        throw new Error(
          `Erro HTTP: ${response.status} - ${response.statusText}`
        );
      }
      return await response.json();
    } catch (e) {
      const errorLog = {
        error: e.name,
        id,
        message: "Erro ao buscar preço da ação",
        errorMessage: e.message,
      };
      this.writeContentWithNewLines(JSON.stringify(errorLog));
      throw e;
    }
  }
}
