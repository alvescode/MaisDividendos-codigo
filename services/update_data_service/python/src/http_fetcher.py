import os 
import httpx
import asyncio

class HttpFetcher:
    def __init__(self):
        self.node_port = os.getenv("node_port")
    
    async def fetch(self, url, timeout=500):
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=timeout)
            return response.text
    
    async def get_data(self,stock):
        url = f"http://node-service:{self.node_port}/data?acao={stock}"
        result = await self.fetch(url)
        return result