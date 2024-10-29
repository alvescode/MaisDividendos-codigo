import express from "express";
import { AcaoService } from "./AcaoService.js";
import "dotenv/config";

export class AppServer{
    
    constructor(){
        this.server = express()
        this.server.use(express.json())
        this.acaoService = new AcaoService()
        this.configureRoutes()
    }

    configureRoutes(){
        this.server.get("/data", async (req, res) => {
            const { acao } = req.query;
            try {
              const dadosAcao = await this.acaoService.buscaDadosDoTicker(acao);
              const precoAcao = await this.acaoService.buscaPrecoDaAcao(dadosAcao.id);
              res.json({ dadosAcao, precoAcao });
            } catch (error) {
              console.error("Erro na requisição:", error.message);
              res.status(500).json({ error: "Erro ao buscar dados da ação." });
            }
          });
          this.server.get("/health", (req, res) => {
            res.status(200).send("OK");
          });
        }
      
        start(port) {
          this.server.listen(port, () => {
            console.log(`Server running on port ${port}`);
          });
        }
}