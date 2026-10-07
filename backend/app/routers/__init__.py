from fastapi import APIRouter

from app.routers import events, health, reports, resources

api_router = APIRouter(prefix="/api")
api_router.include_router(health.router)
api_router.include_router(events.router)
api_router.include_router(reports.router)
api_router.include_router(resources.router)