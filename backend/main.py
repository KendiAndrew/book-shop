import sys
import os

# ensure backend dir is on path
sys.path.insert(0, os.path.dirname(__file__))

# load .env file
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import get_pool, close_pool

from routes.auth import router as auth_router
from routes.books import router as books_router
from routes.authors import router as authors_router
from routes.genres import router as genres_router
from routes.orders import router as orders_router
from routes.clients import router as clients_router
from routes.branches import router as branches_router
from routes.deliveries import router as deliveries_router
from routes.promotions import router as promotions_router
from routes.analytics import router as analytics_router
from routes.publishers import router as publishers_router
from routes.languages import router as languages_router
from routes.suppliers import router as suppliers_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await get_pool()
    yield
    await close_pool()


app = FastAPI(title="BookShop API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(books_router)
app.include_router(authors_router)
app.include_router(genres_router)
app.include_router(orders_router)
app.include_router(clients_router)
app.include_router(branches_router)
app.include_router(deliveries_router)
app.include_router(promotions_router)
app.include_router(analytics_router)
app.include_router(publishers_router)
app.include_router(languages_router)
app.include_router(suppliers_router)


app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "static")), name="static")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
