import os
from flask_sqlalchemy import SQLAlchemy

# Single SQLAlchemy instance — models route to their DB via __bind_key__
db = SQLAlchemy()


def init_db(app):
    pg_user = os.environ.get("POSTGRES_USER", "postgres")
    pg_pass = os.environ.get("POSTGRES_PASSWORD", "postgres")
    pg_host = os.environ.get("POSTGRES_HOST", "db_clients")
    pg_db = os.environ.get("POSTGRES_DB", "clients_db")

    mysql_user = os.environ.get("MYSQL_USER", "mysql")
    mysql_pass = os.environ.get("MYSQL_PASSWORD", "mysql")
    mysql_host = os.environ.get("MYSQL_HOST", "db_products")
    mysql_db = os.environ.get("MYSQL_DB", "products_db")

    # "clients" is the default binding; "products" is an extra bind
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"postgresql+psycopg2://{pg_user}:{pg_pass}@{pg_host}/{pg_db}"
    )
    app.config["SQLALCHEMY_BINDS"] = {
        "products": f"mysql+pymysql://{mysql_user}:{mysql_pass}@{mysql_host}/{mysql_db}",
    }
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
