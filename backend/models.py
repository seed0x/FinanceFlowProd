from datetime import datetime
from db import db

class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(320), unique=True, nullable=False)
    email = db.Column(db.String(255))
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    transactions = db.relationship("Transaction", back_populates="user", cascade="all, delete-orphan")

class Transaction(db.Model):
    __tablename__ = "transaction"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    description = db.Column(db.String(255))
    category = db.Column(db.String(64), nullable=False)     # e.g., 'Food'
    amount = db.Column(db.Numeric(12, 2), nullable=False)   # +income / -expense
    merchant = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="transactions")
