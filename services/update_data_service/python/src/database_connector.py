import pandas as pd
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

class DatabaseConnector:

    connection_string = None
    engine = None

    @classmethod
    def initialize (cls):
        if cls.connection_string is None or cls.engine is None:
            load_dotenv()
            cls.connection_string = cls._build_connection_string()
            cls.engine = create_engine(cls.connection_string)

    @staticmethod
    def _build_connection_string():
        postgres_user = os.getenv('postgres_user')
        postgres_password = os.getenv('postgres_password')
        postgres_host = os.getenv('postgres_host')
        postgres_database = os.getenv('postgres_database')
        postgres_port = os.getenv('postgres_port')
        return f'postgresql+psycopg2://{postgres_user}:{postgres_password}@{postgres_host}:{postgres_port}/{postgres_database}'

    @classmethod
    def envia_df_para_banco(df, table, write):
    cls.initialize()
    try:
        if write == 'r':
            df.to_sql(table, con=engine, if_exists='replace', index=False)
        else:
            df.to_sql(table, con=engine, if_exists='append', index=False)
    except Exception as e:
        print(f"Erro ao enviar dados para o banco: {e}")