"""PlusEconomy FastAPI app."""
from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="PlusEconomy API")
app.state.db = db

api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"app": "PlusEconomy", "status": "ok"}


# Routers
from routes.auth_routes import router as auth_router
from routes.transactions import router as tx_router
from routes.cards import router as cards_router
from routes.limits import router as limits_router
from routes.goals import router as goals_router
from routes.dashboard import router as dashboard_router
from routes.ai_routes import router as ai_router
from routes.billing import router as billing_router
from routes.investment import router as investment_router

api_router.include_router(auth_router)
api_router.include_router(tx_router)
api_router.include_router(cards_router)
api_router.include_router(limits_router)
api_router.include_router(goals_router)
api_router.include_router(dashboard_router)
api_router.include_router(ai_router)
api_router.include_router(billing_router)
api_router.include_router(investment_router)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
