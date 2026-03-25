from .database import db


class Client(db.Model):
    __bind_key__ = None          # uses the default PostgreSQL URI
    __tablename__ = "clients"

    id    = db.Column(db.Integer, primary_key=True)
    name  = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    phone = db.Column(db.String(20))

    def to_dict(self):
        return {
            "id":    self.id,
            "name":  self.name,
            "email": self.email,
            "phone": self.phone,
        }


class Product(db.Model):
    __bind_key__ = "products"    # uses the MySQL bind
    __tablename__ = "products"

    id    = db.Column(db.Integer, primary_key=True)
    name  = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id":    self.id,
            "name":  self.name,
            "price": self.price,
            "stock": self.stock,
        }
