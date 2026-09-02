import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import scan, price

load_dotenv()

app = FastAPI(
    title="Vesta AI Microservice",
    description="AI-powered inventory scanning and price optimization for surplus food",
    version="1.0.0"
)

# Read CORS allowed origins from env — set CORS_ALLOWED_ORIGINS in Railway dashboard
# e.g. "https://vesta-ai.vercel.app,https://vesta-backend.railway.app"
_cors_raw = os.getenv(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:8080,http://localhost:3000"
)
cors_origins = [o.strip() for o in _cors_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan.router)
app.include_router(price.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "Vesta AI Microservice", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    # Railway injects PORT — fall back to 8000 locally
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

