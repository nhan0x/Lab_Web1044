/* ===== CỬA SỔ CHI TIẾT SẢN PHẨM =====
   Việc: mở cửa sổ xem chi tiết (ảnh, giá, mô tả, chọn size, nút Thêm vào giỏ).
   Dùng: products (products.js); Utils (utils.js); cart (cart.js).
   Giao diện: id="product-modal", id="modal-body" trong index.html. */

class ProductModal {
    constructor(allProducts) {
        this.products = allProducts;
    }

    open(id) {
        const p = this.products.find(x => x.id === id);
        if (!p) return;
        const originalPrice = Utils.getOriginalPrice(p);
        const sizes = ["S", "M", "L", "XL"].map((s, i) =>
            `<div class="size-pill${i === 0 ? " active" : ""}" onclick="productModal.selectSize(this)">${s}</div>`).join("");

        Utils.$("modal-body").innerHTML = `
            <div class="modal-grid">
                <div class="modal-img-col">
                    <img src="${p.image}" alt="${p.name}">
                </div>
                <div class="modal-details-col">
                    <h2>${p.name}</h2>
                    <div class="modal-price">
                        ${Utils.formatPrice(p.price)}
                        ${originalPrice ? `<span class="old-price">${Utils.formatPrice(originalPrice)}</span>` : ""}
                    </div>
                    <p class="modal-desc">${p.description || ""}</p>
                    <div>
                        <span class="size-label">Size</span>
                        <div class="size-pills">${sizes}</div>
                    </div>
                    <button class="modal-add-btn" onclick="cart.add(${p.id}); productModal.close();">Thêm vào giỏ</button>
                </div>
            </div>`;
        Utils.$("product-modal").classList.add("active");
    }

    selectSize(el) {
        document.querySelectorAll(".size-pill").forEach(s => s.classList.toggle("active", s === el));
    }

    close() { Utils.$("product-modal").classList.remove("active"); }

    closeOnOverlay(e) { if (e.target.id === "product-modal") this.close(); }
}

const productModal = new ProductModal(products);
