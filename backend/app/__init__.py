import time
import logging
from flask import Flask
from sqlalchemy.exc import OperationalError
from .database import init_db, db
from .routes import api

logger = logging.getLogger(__name__)

MAX_DB_RETRIES = 10
DB_RETRY_DELAY_SECONDS = 3


def create_app():
    app = Flask(__name__)
    init_db(app)

    with app.app_context():
        for attempt in range(1, MAX_DB_RETRIES + 1):
            try:
                db.create_all()
                break
            except OperationalError as exc:
                if attempt == MAX_DB_RETRIES:
                    raise
                logger.warning(
                    "Database not ready (attempt %d/%d): %s. Retrying in %ds…",
                    attempt, MAX_DB_RETRIES, exc, DB_RETRY_DELAY_SECONDS,
                )
                time.sleep(DB_RETRY_DELAY_SECONDS)

    app.register_blueprint(api)
    return app
