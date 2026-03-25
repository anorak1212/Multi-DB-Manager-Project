from flask import Flask
from .database import init_db, db
from .routes import api


def create_app():
    app = Flask(__name__)
    init_db(app)

    with app.app_context():
        db.create_all()

    app.register_blueprint(api)
    return app
