const cartCount = document.getElementById("cart-count");
const cartItemsDiv = document.getElementById("cart-items");
const cartSidebar = document.getElementById("cart-sidebar");
const cartOverlay = document.getElementById("cart-overlay");
const totalPrice = document.getElementById("cart-total");
const productList = document.getElementById("product-container"); 
const searchInput = document.getElementById("search-input"); 

let cart = [];
let allProducts = []; 

// Sepete Ürün Ekleme Fonksiyonu
function addToCart(product) {
  const existingItem = cart.find((item) => item.id === product.id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    // products.json'dan gelen ürün nesnesini olduğu gibi saklayalım, quantity ekleyelim
    cart.push({ ...product, quantity: 1 });
  }

  updateCartCount();
  renderCart();
  localStorage.setItem("cart", JSON.stringify(cart));
  showAddNotification();
  toggleCart();
}

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
      <img src="${item.image}" alt="${item.name}" /> 
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
  const id = parseInt(e.target.getAttribute("data-id"));
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
    if (confirm("Sepeti tamamen boşaltmak istediğinizden emin misiniz?")) {
        cart = [];
        updateCartCount();
        renderCart();
        localStorage.removeItem("cart"); 
        toggleCart(); 
        alert("Sepetiniz temizlendi!");
    }
}


function renderProducts(productsToRender) {
  if (!productList) {
    console.error("HTML'de 'product-container' ID'sine sahip element bulunamadı.");
    return;
  }

  productList.innerHTML = ""; 

  productsToRender.forEach((product) => {
    const div = document.createElement("div");
    div.className = "product-card";
    div.setAttribute("data-id", product.id); 
    div.innerHTML = `
      <img src="${product.image}" alt="${product.name}" /> <h3>${product.name}</h3>
      <p>${product.price.toFixed(2)} TL</p> <button class="add-to-cart-btn" data-id="${product.id}">Sepete Ekle</button>
    `;
    productList.appendChild(div);
  });


  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = parseInt(e.target.getAttribute("data-id"));
      const productToAdd = allProducts.find(p => p.id === id); 
      if (productToAdd) {
        addToCart(productToAdd);
      }
    });
  });
}

function showAddNotification() {
  let notification = document.createElement("div");
  notification.className = "add-notification";
  notification.textContent = "Ürün sepete eklendi!";
  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    background: "#2ecc71",
    color: "white",
    padding: "1rem",
    borderRadius: "8px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
    zIndex: 10000
  });
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 2000);
}

if (searchInput) {
  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();
    const filtered = allProducts.filter(product =>
      product.name.toLowerCase().includes(keyword)
    );
    renderProducts(filtered);
  });
}

fetch("products.json")
  .then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP hatası! Durum: ${res.status}`);
    }
    return res.json();
  })
  .then((products) => {
    allProducts = products; 
    renderProducts(allProducts); 
  })
  .catch((err) => {
    console.error("Ürün verisi yüklenemedi:", err);
  });

document.addEventListener("DOMContentLoaded", () => {
  sepetiYukle(); 
  updateCartCount();
  renderCart(); 
});