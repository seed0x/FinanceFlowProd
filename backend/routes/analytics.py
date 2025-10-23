from flask import Blueprint, request, jsonify, session
from datetime import datetime

analytics_bp = Blueprint("analytics", __name__)