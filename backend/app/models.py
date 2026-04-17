from .database import db
from datetime import datetime


class Client(db.Model):
    __bind_key__ = None
    __tablename__ = "clients"

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(100), nullable=False)
    email      = db.Column(db.String(150), unique=True, nullable=False)
    phone      = db.Column(db.String(20))
    address    = db.Column(db.String(200))
    city       = db.Column(db.String(100))
    country    = db.Column(db.String(100), default="México")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":         self.id,
            "name":       self.name,
            "email":      self.email,
            "phone":      self.phone,
            "address":    self.address or "",
            "city":       self.city or "",
            "country":    self.country or "",
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Product(db.Model):
    __bind_key__ = "products"
    __tablename__ = "products"

    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(300))
    category    = db.Column(db.String(80))
    price       = db.Column(db.Float, nullable=False)
    stock       = db.Column(db.Integer, default=0)
    sku         = db.Column(db.String(50))

    def to_dict(self):
        return {
            "id":          self.id,
            "name":        self.name,
            "description": self.description or "",
            "category":    self.category or "",
            "price":       self.price,
            "stock":       self.stock,
            "sku":         self.sku or "",
        }


class Purchase(db.Model):
    __bind_key__ = None
    __tablename__ = "purchases"

    id           = db.Column(db.Integer, primary_key=True)
    client_id    = db.Column(db.Integer, db.ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    product_id   = db.Column(db.Integer, nullable=False)
    product_name = db.Column(db.String(100))
    quantity     = db.Column(db.Integer, default=1)
    unit_price   = db.Column(db.Float, nullable=False)
    total_price  = db.Column(db.Float, nullable=False)
    purchased_at = db.Column(db.DateTime, default=datetime.utcnow)

    client = db.relationship("Client", backref=db.backref("purchases", lazy=True, cascade="all,delete"))

    def to_dict(self):
        return {
            "id":           self.id,
            "client_id":    self.client_id,
            "product_id":   self.product_id,
            "product_name": self.product_name,
            "quantity":     self.quantity,
            "unit_price":   self.unit_price,
            "total_price":  self.total_price,
            "purchased_at": self.purchased_at.isoformat() if self.purchased_at else None,
        }
