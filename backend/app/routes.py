from flask import Blueprint, jsonify, request
from .database import db
from .models import Client, Product, Purchase

api = Blueprint("api", __name__, url_prefix="/api")


# ── Clients CRUD ──────────────────────────────────────────────────────────────

@api.route("/clients", methods=["GET"])
def get_clients():
    clients = Client.query.order_by(Client.id).all()
    return jsonify([c.to_dict() for c in clients])


@api.route("/clients/<int:client_id>", methods=["GET"])
def get_client(client_id):
    client = db.get_or_404(Client, client_id)
    return jsonify(client.to_dict())


@api.route("/clients", methods=["POST"])
def create_client():
    data = request.get_json()
    if not data or not data.get("name") or not data.get("email"):
        return jsonify({"error": "Nombre y correo son requeridos"}), 400
    client = Client(
        name=data["name"],
        email=data["email"],
        phone=data.get("phone", ""),
        address=data.get("address", ""),
        city=data.get("city", ""),
        country=data.get("country", "México"),
    )
    db.session.add(client)
    db.session.commit()
    return jsonify(client.to_dict()), 201


@api.route("/clients/<int:client_id>", methods=["PUT"])
def update_client(client_id):
    client = db.get_or_404(Client, client_id)
    data = request.get_json()
    for field in ("name", "email", "phone", "address", "city", "country"):
        if field in data:
            setattr(client, field, data[field])
    db.session.commit()
    return jsonify(client.to_dict())


@api.route("/clients/<int:client_id>", methods=["DELETE"])
def delete_client(client_id):
    client = db.get_or_404(Client, client_id)
    db.session.delete(client)
    db.session.commit()
    return jsonify({"message": f"Cliente {client_id} eliminado"})


# ── Products CRUD ─────────────────────────────────────────────────────────────

@api.route("/products", methods=["GET"])
def get_products():
    products = Product.query.order_by(Product.id).all()
    return jsonify([p.to_dict() for p in products])


@api.route("/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = db.get_or_404(Product, product_id)
    return jsonify(product.to_dict())


@api.route("/products", methods=["POST"])
def create_product():
    data = request.get_json()
    if not data or not data.get("name") or data.get("price") is None:
        return jsonify({"error": "Nombre y precio son requeridos"}), 400
    product = Product(
        name=data["name"],
        description=data.get("description", ""),
        category=data.get("category", ""),
        price=float(data["price"]),
        stock=int(data.get("stock", 0)),
        sku=data.get("sku", ""),
    )
    db.session.add(product)
    db.session.commit()
    return jsonify(product.to_dict()), 201


@api.route("/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    product = db.get_or_404(Product, product_id)
    data = request.get_json()
    if "name" in data:        product.name = data["name"]
    if "description" in data: product.description = data["description"]
    if "category" in data:    product.category = data["category"]
    if "price" in data:       product.price = float(data["price"])
    if "stock" in data:       product.stock = int(data["stock"])
    if "sku" in data:         product.sku = data["sku"]
    db.session.commit()
    return jsonify(product.to_dict())


@api.route("/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    product = db.get_or_404(Product, product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": f"Producto {product_id} eliminado"})


# ── Purchases ─────────────────────────────────────────────────────────────────

@api.route("/purchase", methods=["POST"])
def purchase():
    data = request.get_json()
    if not data or not data.get("client_id") or not data.get("product_id"):
        return jsonify({"error": "client_id y product_id son requeridos"}), 400

    client = db.session.get(Client, data["client_id"])
    if not client:
        return jsonify({"error": f"Cliente {data['client_id']} no encontrado"}), 404

    product = db.session.get(Product, data["product_id"])
    if not product:
        return jsonify({"error": f"Producto {data['product_id']} no encontrado"}), 404

    quantity = int(data.get("quantity", 1))
    if quantity < 1:
        return jsonify({"error": "La cantidad debe ser mayor a 0"}), 400
    if product.stock < quantity:
        return jsonify({"error": f"Stock insuficiente. Disponible: {product.stock}"}), 400

    # Descontar stock
    product.stock -= quantity
    db.session.flush()

    purchase = Purchase(
        client_id=client.id,
        product_id=product.id,
        product_name=product.name,
        quantity=quantity,
        unit_price=product.price,
        total_price=round(product.price * quantity, 2),
    )
    db.session.add(purchase)
    db.session.commit()

    return jsonify({
        "message": f"{client.name} compró {quantity}x {product.name}",
        "purchase": purchase.to_dict(),
        "client":  client.to_dict(),
        "product": product.to_dict(),
    })


@api.route("/clients/<int:client_id>/purchases", methods=["GET"])
def get_client_purchases(client_id):
    client = db.get_or_404(Client, client_id)
    purchases = Purchase.query.filter_by(client_id=client_id).order_by(Purchase.purchased_at.desc()).all()
    return jsonify({
        "client": client.to_dict(),
        "purchases": [p.to_dict() for p in purchases],
        "total_spent": round(sum(p.total_price for p in purchases), 2),
    })


# ── Report ────────────────────────────────────────────────────────────────────

@api.route("/report", methods=["GET"])
def report():
    clients = Client.query.order_by(Client.id).all()
    all_purchases = Purchase.query.all()
    total_revenue = round(sum(p.total_price for p in all_purchases), 2)
    return jsonify({
        "total_clients":  len(clients),
        "total_purchases": len(all_purchases),
        "total_revenue":  total_revenue,
        "clients": [c.to_dict() for c in clients],
    })
