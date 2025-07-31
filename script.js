
fetch("./products.json")
  .then(res => res.json())
  .then(products => {
    const container = document.getElementById("product-container");

    products.forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" />
        <h2>${product.name}</h2>
        <p>${product.price.toFixed(2)} TL</p>
        <button>Sepete Ekle</button>
      `;

      container.appendChild(card);
    });
  })
  .catch(err => {
    console.error("Ürün verisi yüklenemedi:", err);
  });
