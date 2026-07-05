import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from config import settings
from utils.response import error_response


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "images"), exist_ok=True)
    yield


app = FastAPI(title="社区便民资讯平台", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "社区便民资讯平台运行正常"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    result = error_response(code=500, message=str(exc))
    return JSONResponse(status_code=500, content=result.model_dump())


from routers.auth import router as auth_router
from routers.category import router as category_router
from routers.news import router as news_router
from routers.feedback import router as feedback_router
from routers.phone import router as phone_router
from routers.event import router as event_router
from routers.business import router as business_router
from routers.transit import router as transit_router
from routers.upload import router as upload_router

app.include_router(auth_router)
app.include_router(category_router)
app.include_router(news_router)
app.include_router(feedback_router)
app.include_router(phone_router)
app.include_router(event_router)
app.include_router(business_router)
app.include_router(transit_router)
app.include_router(upload_router)
