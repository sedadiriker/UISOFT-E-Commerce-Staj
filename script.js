const cartCount = document.getElementById("cart-count");
const cartItemsDiv = document.getElementById("cart-items");
const cartSidebar = document.getElementById("cart-sidebar");
const cartOverlay = document.getElementById("cart-overlay");
const totalPrice = document.getElementById("cart-total");
const productContainer = document.getElementById("product-container");

let cart = [];
let allProducts = [];

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = total;
}

function renderCart() {
  cartItemsDiv.innerHTML = "";

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = `
      <div class="empty-cart">
        <p>Sepetiniz boş</p>
        <span>🛍️</span>
      </div>`;
    totalPrice.textContent = "0.00";
    return;
  }

  let total = 0;

  cart.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("cart-item");
    itemDiv.innerHTML = `
      <img src="${item.img}" alt="${item.name}" />
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <div class="cart-item-controls">
          <button class="quantity-btn azalt" data-id="${item.id}">-</button>
          <span class="quantity-display">${item.quantity}</span>
          <button class="quantity-btn arttir" data-id="${item.id}">+</button>
          <span class="cart-item-price">${(item.price * item.quantity).toFixed(2)} TL</span>
          <button class="remove-item" data-id="${item.id}">✕</button>
        </div>
      </div>
    `;
    cartItemsDiv.appendChild(itemDiv);
    total += item.price * item.quantity;
  });

  totalPrice.textContent = total.toFixed(2);
}

cartItemsDiv.addEventListener("click", (e) => {
  const id = e.target.getAttribute("data-id");
  if (!id) return;

  const item = cart.find((p) => p.id === id);
  if (!item) return;

  if (e.target.classList.contains("remove-item")) {
    if (confirm("Ürünü sepetten silmek istiyor musunuz?")) {
      cart = cart.filter((p) => p.id !== id);
    }
  } else if (e.target.classList.contains("arttir")) {
    item.quantity++;
  } else if (e.target.classList.contains("azalt")) {
    if (item.quantity === 1) {
      if (confirm("Ürün sepetten kaldırılsın mı?")) {
        cart = cart.filter((p) => p.id !== id);
      }
    } else {
      item.quantity--;
    }
  }

  updateCartCount();
  renderCart();
  localStorage.setItem("cart", JSON.stringify(cart));
});

function sepetiYukle() {
  const saved = localStorage.getItem("cart");
  if (saved) {
    cart = JSON.parse(saved);
  }
}

function toggleCart() {
  cartSidebar.classList.toggle("active");
  cartOverlay.classList.toggle("active");
}

function clearCart() {
  if (confirm("Sepeti temizlemek istediğinize emin misiniz?")) {
    cart = [];
    updateCartCount();
    renderCart();
    localStorage.removeItem("cart");
  }
}

function renderProducts(products) {
  allProducts = products; // arama vs için kaydet
  if (!productContainer) return;

  productContainer.innerHTML = "";

  products.forEach((product) => {
    const div = document.createElement("div");
    div.className = "product-card";
    div.setAttribute("data-id", product.id);
    div.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>${product.price.toFixed(2)} TL</p>
      <button>Sepete Ekle</button>
    `;
    productContainer.appendChild(div);
  });

  document.querySelectorAll(".product-card button").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".product-card");
      const id = card.getAttribute("data-id");
      const name = card.querySelector("h3").textContent;
      const price = parseFloat(card.querySelector("p").textContent.replace("TL", "").trim());
      const img = card.querySelector("img").src;

      const existingItem = cart.find((item) => item.id === id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        cart.push({ id, name, price, quantity: 1, img });
      }

      updateCartCount();
      renderCart();
      localStorage.setItem("cart", JSON.stringify(cart));
      showAddNotification();
    });
  });
}

function showAddNotification() {
  let notification = document.createElement("div");
  notification.className = "add-notification";
  notification.textContent = "Ürün sepete eklendi!";
  Object.assign(notification.style, {
    background: "rgba(255, 255, 255, 0.1)",
    position: "fixed",
    top: "20px",
    right: "20px",
    backdropFilter: 'blur(75px)',
    color: "black",
    padding: "1rem",
    borderRadius: "8px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
    zIndex: 10000,
  });
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 2000);
}

document.addEventListener("DOMContentLoaded", () => {
  sepetiYukle();
  updateCartCount();
  renderCart();

  fetch("./products.json")
    .then((res) => res.json())
    .then((products) => {
      renderProducts(products);
    })
    .catch((err) => {
      console.error("Ürün verisi yüklenemedi:", err);
    });
});
