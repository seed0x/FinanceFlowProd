from datetime import datetime
from db import db

class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(320), unique=True, nullable=False)
    email = db.Column(db.String(255), nullable=False, default='')
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    plaid_access_token = db.Column(db.String(512))  # Plaid access token
    transactions = db.relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    accounts = db.relationship("Account", back_populates="user", cascade="all, delete-orphan")
    
    
class Transaction(db.Model):
    __tablename__ = "transaction"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey("account.id"))
    date = db.Column(db.Date, nullable=False)
    description = db.Column(db.String(255))
    category = db.Column(db.String(64), nullable=False)     # Food
    amount = db.Column(db.Numeric(12, 2), nullable=False)   # +income / -expense
    merchant = db.Column(db.String(128))
    plaid_tx_id = db.Column(db.String(128), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship("User", back_populates="transactions")
    account = db.relationship("Account", back_populates="transactions")

class Account(db.Model):
    __tablename__ = "account"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    plaid_account_id = db.Column(db.String(128), unique=True, nullable=True)  # None if manual account
    name = db.Column(db.String(255), nullable=False)  # Chase Checking, Cash Wallet
    mask = db.Column(db.String(10))  # 1234 for last 4 digits (Plaid only)
    type = db.Column(db.String(64))  # depository, credit, cash
    subtype = db.Column(db.String(64))  # checking, savings
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship("User", back_populates="accounts")
    transactions = db.relationship("Transaction", back_populates="account", cascade="all, delete-orphan")

class Budgets(db.Model):
    __tablename__ = "budgets"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    category = db.Column(db.String(64), nullable=False)    
    amount = db.Column(db.Numeric(12, 2), nullable=False)  
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
