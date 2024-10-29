import pandas as pd
import asyncio
import json
from fetcher import Fetcher
from ticker_data_processor import TickerDataProcessor

class MainController:
    def __init__(self):
        self.fetcher = Fetcher()
        self.processor = TickerDataProcessor()
        self.tickers = pd.read_csv('tickers-b3.csv')["Ticker"].tolist()

    async def process_ticker(self, ticker):
        main_result = await self.fetcher.get_data(ticker)
        data = json.loads(main_result)
        print(f'Dados Recebidos para {ticker}.')
        self.processor.process_ticker_data(data["dados_do_ticker"])
        self.processor.process_stock_price(data["dados_do_ticker"]["vticker"], data["dados_preco_da_acao"])
        self.processor.process_financial_data(data["dados_do_ticker"]["vticker"], data["dados_financeiros"])
        self.processor.process_indicators_data(data["dados_do_ticker"], data["dados_indicadores"])
        self.processor.process_dividends_data(data["dados_do_ticker"]["vticker"], data["dados_dividendos"])
        self.processor.process_dividend_yield_data(data["dados_do_ticker"]["vticker"], data["dados_dividend_yeld"])

    async def run(self):
        tasks = [self.process_ticker(ticker) for ticker in self.tickers]
        await asyncio.gather(*tasks)
        print('Tarefa Terminou.')

    def user_interface(self):
        while True:
            user_input = input('Deseja Sair? (S) ou (H) para informações. Digite C para continuar.')
            if user_input.upper() == 'S':
                break
            elif user_input.upper() == 'H':
                print('Em construção...')
            elif user_input.upper() == 'C':
                continue

if __name__ == '__main__':
    main_controller = MainController()
    asyncio.run(main_controller.run())
    main_controller.user_interface()
