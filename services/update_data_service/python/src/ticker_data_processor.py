import pandas as pd
from database_connector import DatabaseConnector

class TickerDataProcessor:
    def __init__(self):
        self.db = DatabaseConnector()

    def process_ticker_data(self, data):
        df = pd.DataFrame([data])
        print(f"Processing Ticker Data: {df}")
        self.db.send_df_to_db(df, 'virtual', 'r')

    def process_stock_price(self, vticker, data):
        df = pd.DataFrame([data])
        df["ticker"] = vticker
        print(f"Processing Stock Price: {df}")
        self.db.send_df_to_db(df, 'prices', 'a')

    def process_financial_data(self, vticker, data):
        headers = data[0]
        headers[1] = 'Últ. 12M'
        self._update_headers(headers)
        df = pd.DataFrame(data[1:], columns=headers)
        df["ticker"] = vticker
        df.drop(columns=['2019'], errors='ignore', inplace=True)
        self.db.send_df_to_db(df, 'dados_financeiros', 'r')

    def process_indicators_data(self, ticker_data, indicators):
        for key, values in indicators.items():
            for year in values:
                year["value"] = self._convert_to_float(year["value"])
            df = pd.DataFrame(values)
            df['ticker'] = ticker_data['vticker']
            df['company_id'] = ticker_data.get('vcompanyId')
            df['ticker_id'] = ticker_data.get('vid')
            self.db.send_df_to_db(df, 'indicadores', 'r')

    def process_dividends_data(self, vticker, data):
        df = pd.DataFrame(data)
        df["Ticker"] = vticker
        self.db.send_df_to_db(df, 'dividendos', 'r')

    def process_dividend_yield_data(self, vticker, data):
        df = pd.DataFrame(data)
        df["Ticker"] = vticker
        self.db.send_df_to_db(df, 'dividend_y', 'r')

    def _update_headers(self, headers):
        sufixv, sufixh = 1, 1
        for index, header in enumerate(headers):
            if header == 'AV %':
                headers[index] = f'AV_{sufixv} %'
                sufixv += 1
            elif header == 'AH %':
                headers[index] = f'AH_{sufixh} %'
                sufixh += 1

    def _convert_to_float(self, value):
        if value is None or value == '-':
            return 0.0
        if isinstance(value, str) and ',' in value:
            return float(value.replace(",", "."))
        return float(value)
