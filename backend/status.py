import os
from flask import Blueprint, jsonify
status_bp = Blueprint("status", __name__)

@status_bp.get("/status")
def status():
    if os.getenv("ENABLE_STATUS_ROUTE","false").lower() != "true":
        return jsonify({"error":"Not found"}), 404
    origins = [o.strip() for o in os.getenv("CORS_ALLOWED_ORIGINS","").split(",") if o.strip()]
    return jsonify({
        "app_version": os.getenv("APP_VERSION","dev"),
        "allowed_origins": origins,
        "cookie_flags": {
            "samesite": os.getenv("COOKIE_SAMESITE","Lax"),
            "secure": os.getenv("COOKIE_SECURE","false").lower()=="true",
        },
        "frontend_url": os.getenv("FRONTEND_URL",""),
        "backend_url": os.getenv("BACKEND_URL",""),
    }), 200
