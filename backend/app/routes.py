from flask import Blueprint, jsonify, request
from .database import db
from .models import Client, Product

api = Blueprint("api", __name__, url_prefix="/api")


# ── Clients CRUD ──────────────────────────────────────────────────────────────

@api.route("/clients", methods=["GET"])
def get_clients():
    clients = Client.query.all()
    return jsonify([c.to_dict() for c in clients])


@api.route("/clients/<int:client_id>", methods=["GET"])
def get_client(client_id):
    client = db.get_or_404(Client, client_id)
    return jsonify(client.to_dict())


@api.route("/clients", methods=["POST"])
def create_client():
    data = request.get_json()
    if not data or not data.get("name") or not data.get("email"):
        return jsonify({"error": "name and email are required"}), 400
    client = Client(
        name=data["name"],
        email=data["email"],
        phone=data.get("phone", ""),
    )
    db.session.add(client)
    db.session.commit()
    return jsonify(client.to_dict()), 201


@api.route("/clients/<int:client_id>", methods=["PUT"])
def update_client(client_id):
    client = db.get_or_404(Client, client_id)
    data = request.get_json()
    if "name" in data:
        client.name = data["name"]
    if "email" in data:
        client.email = data["email"]
    if "phone" in data:
        client.phone = data["phone"]
    db.session.commit()
    return jsonify(client.to_dict())


@api.route("/clients/<int:client_id>", methods=["DELETE"])
def delete_client(client_id):
    client = db.get_or_404(Client, client_id)
    db.session.delete(client)
    db.session.commit()
    return jsonify({"message": f"Client {client_id} deleted"})


# ── Products CRUD ─────────────────────────────────────────────────────────────

@api.route("/products", methods=["GET"])
def get_products():
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products])


@api.route("/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = db.get_or_404(Product, product_id)
    return jsonify(product.to_dict())


@api.route("/products", methods=["POST"])
def create_product():
    data = request.get_json()
    if not data or not data.get("name") or data.get("price") is None:
        return jsonify({"error": "name and price are required"}), 400
    product = Product(
        name=data["name"],
        price=float(data["price"]),
        stock=int(data.get("stock", 0)),
    )
    db.session.add(product)
    db.session.commit()
    return jsonify(product.to_dict()), 201


@api.route("/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    product = db.get_or_404(Product, product_id)
    data = request.get_json()
    if "name" in data:
        product.name = data["name"]
    if "price" in data:
        product.price = float(data["price"])
    if "stock" in data:
        product.stock = int(data["stock"])
    db.session.commit()
    return jsonify(product.to_dict())


@api.route("/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    product = db.get_or_404(Product, product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": f"Product {product_id} deleted"})


# ── Business Logic ────────────────────────────────────────────────────────────

@api.route("/purchase", methods=["POST"])
def purchase():
    data = request.get_json()
    if not data or not data.get("client_id") or not data.get("product_id"):
        return jsonify({"error": "client_id and product_id are required"}), 400

    client = db.session.get(Client, data["client_id"])
    if not client:
        return jsonify({"error": f"Client {data['client_id']} not found"}), 404

    product = db.session.get(Product, data["product_id"])
    if not product:
        return jsonify({"error": f"Product {data['product_id']} not found"}), 404

    return jsonify({
        "message": f"Client {client.name} has purchased {product.name}",
        "client":  client.to_dict(),
        "product": product.to_dict(),
    })


# ── Report ────────────────────────────────────────────────────────────────────

@api.route("/report", methods=["GET"])
def report():
    clients = Client.query.all()
    return jsonify({
        "total":   len(clients),
        "clients": [c.to_dict() for c in clients],
    })
