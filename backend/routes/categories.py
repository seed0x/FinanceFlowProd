from flask import Blueprint, request, jsonify, session
from models import db, Category

categories_bp = Blueprint("categories", __name__)

def require_user():
    if "user" not in session or "user_id" not in session:
        return {"error":"Not logged in"}, 401

@categories_bp.post("/categories")
def create_category():
    r = require_user()
    if r: return r
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    if not name:
        return {"error":"Bad Request","details":{"name":"Required"}}, 400
    c = Category(user_id=session["user_id"], name=name)
    db.session.add(c)
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return {"error":"Category exists"}, 409
    return jsonify({"id": c.id, "name": c.name}), 201

@categories_bp.get("/categories")
def list_categories():
    r = require_user()
    if r: return r
    rows = Category.query.filter_by(user_id=session["user_id"]).order_by(Category.name).all()
    return jsonify([{"id": c.id, "name": c.name} for c in rows]), 200

@categories_bp.patch("/categories/<int:cid>")
def rename_category(cid):
    r = require_user(); 
    if r: return r
    c = Category.query.filter_by(id=cid, user_id=session["user_id"]).first()
    if not c: return {"error":"Not found"}, 404
    name = (request.get_json() or {}).get("name","").strip()
    if not name: return {"error":"Bad Request","details":{"name":"Required"}}, 400
    c.name = name
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return {"error":"Category exists"}, 409
    return {"ok":True}, 200

@categories_bp.delete("/categories/<int:cid>")
def delete_category(cid):
    r = require_user(); 
    if r: return r
    c = Category.query.filter_by(id=cid, user_id=session["user_id"]).first()
    if not c: return {"error":"Not found"}, 404
    db.session.delete(c)
    db.session.commit()
    return {"ok":True}, 200
