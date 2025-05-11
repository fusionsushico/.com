// Fusion Sushi Co. - app.js (Updated for Salad)

let cart = {};
let allProducts = [];

fetch('menu.json')
  .then(res => res.json())
  .then(data => {
    allProducts = data;

    const savedCart = localStorage.getItem('fusionCart');
    if (savedCart) {
      cart = JSON.parse(savedCart);
    }

    displayProducts('Sushi');  // default view
    updateCart();              // ✅ ensures cart and quantities are shown after refresh
    setupButtons();
  });

function displayProducts(filterCategory) {
  const productList = document.getElementById('product-list');
  productList.innerHTML = '';

  let filtered;
  if (filterCategory === 'Sushi') {
    // Show everything that's NOT Ramen or Salads
    filtered = allProducts.filter(item => item.category !== 'Ramen Bowls' && item.category !== 'Salads');
  } else if (filterCategory === 'Ramen') {
    filtered = allProducts.filter(item => item.category === 'Ramen Bowls');
  } else if (filterCategory === 'Salads') {
    filtered = allProducts.filter(item => item.category === 'Salads');
  }

  filtered.forEach(product => {
    const card = document.createElement('div');
    card.className = 'flex justify-between items-start bg-white p-4 rounded shadow';
    card.innerHTML = `
      <div class="flex-1 pr-4">
        <h3 class="text-lg font-bold">${product.name}</h3>
        <p class="text-sm text-gray-600">${product.description}</p>
        <p class="text-sm font-semibold mt-1">₹${product.price} • 🔥 ${product.calories} kcal</p>
      </div>
      <div class="w-24 flex flex-col items-center">
        <img src="images/${product.image}" alt="${product.name}" class="w-full h-24 object-cover rounded cursor-pointer" onclick="openPreview('${product.name}')" />
        <div class="flex items-center gap-2 mt-2">
          <button onclick="changeQty('${product.name}', -1)">➖</button>
          <span>${cart[product.name]?.qty || 0}</span>
          <button onclick="changeQty('${product.name}', 1)">➕</button>
        </div>
      </div>
    `;
    productList.appendChild(card);
  });
}

function changeQty(name, delta) {
  const item = allProducts.find(p => p.name === name);
  if (!item) return;

  if (!cart[name]) cart[name] = { ...item, qty: 0 };
  cart[name].qty += delta;

  if (cart[name].qty <= 0) delete cart[name];

  updateCart();
  localStorage.setItem('fusionCart', JSON.stringify(cart));

  // 🔄 ✅ Detect active tab and reload correct category
  let activeTab = 'Sushi';  // default fallback
  if (document.getElementById('showSalad').classList.contains('active')) {
    activeTab = 'Salads';
  } else if (document.getElementById('showRamen').classList.contains('active')) {
    activeTab = 'Ramen';
  }
  displayProducts(activeTab);
}

function updateCart() {
  const itemsDiv = document.getElementById('cart-items');
  const totalSpan = document.getElementById('cart-total');
  const cartBar = document.getElementById('view-cart-bar');
  const cartText = document.getElementById('cart-bar-text');
  const desktopCount = document.getElementById('cart-count-desktop');
  const itemCountText = document.getElementById('cart-count-text');
  const fab = document.getElementById('menu-fab');

  let total = 0;
  let count = 0;
  itemsDiv.innerHTML = '';

  for (let key in cart) {
    const item = cart[key];
    total += item.qty * item.price;
    count += item.qty;
    const div = document.createElement('div');
    div.className = 'border-b py-2 text-sm';
    div.innerHTML = `<strong>${item.name}</strong> x ${item.qty} = ₹${item.qty * item.price} <button onclick="changeQty('${item.name}', -1)">❌</button>`;
    itemsDiv.appendChild(div);
  }

  totalSpan.textContent = total;
  cartText.textContent = `${count} item${count !== 1 ? 's' : ''} added`;
  desktopCount.textContent = count;
  itemCountText.textContent = count;
  cartBar.classList.toggle('active', count > 0);
  fab.style.bottom = count > 0 ? '80px' : '20px';
}

function setupButtons() {
  document.getElementById('showSushi').onclick = () => {
    displayProducts('Sushi');
    setActiveTab('showSushi');
  };
  document.getElementById('showRamen').onclick = () => {
    displayProducts('Ramen');
    setActiveTab('showRamen');
  };
  // ✅ NEW Salad Button Logic
  document.getElementById('showSalad').onclick = () => {
    displayProducts('Salads');
    setActiveTab('showSalad');
  };
  document.getElementById('view-cart-btn').onclick = () => {
    document.getElementById('cart-panel').classList.add('active');
  };
  document.getElementById('desktop-cart-btn').onclick = () => {
    document.getElementById('cart-panel').classList.add('active');
  };
  document.getElementById('close-cart').onclick = () => {
    document.getElementById('cart-panel').classList.remove('active');
  };
  document.getElementById('clear-cart').onclick = () => {
    cart = {};
    localStorage.removeItem('fusionCart');
    updateCart();
    // 🔄 ✅ Detect active tab and reload correct category after clearing cart
    let activeTab = 'Sushi';
    if (document.getElementById('showSalad').classList.contains('active')) {
      activeTab = 'Salads';
    } else if (document.getElementById('showRamen').classList.contains('active')) {
      activeTab = 'Ramen';
    }
    displayProducts(activeTab);
  };
  document.getElementById('menu-fab').onclick = () => {
    document.getElementById('menu-section').scrollIntoView({ behavior: 'smooth' });
  };

  // WhatsApp order button functionality
document.getElementById('whatsapp-order').onclick = () => {
    const name = document.getElementById('name-and-phone-number').value;
    const address = document.getElementById('table-number-or-address').value;

    if (!name || !address) {
        alert("Please provide both name and address to place an order.");
        return;
    }

    let message = 'Order from Fusion Sushi Co.\n';
    let total = 0;

    for (let key in cart) {
        const item = cart[key];
        message += `\n${item.qty}x ${item.name} – ₹${item.qty * item.price}`;
        total += item.qty * item.price;
    }

    message += `\n\nTotal: ₹${total}`;
    message += `\n\nName: ${name}\nAddress: ${address}`;

    const encoded = encodeURIComponent(message);
    document.getElementById('whatsapp-order').href = `https://wa.me/919867378209?text=${encoded}`;

    // ✅ Clear cart after WhatsApp click (small delay for safe redirect)
    setTimeout(() => {
        cart = {};
        localStorage.removeItem('fusionCart');
        updateCart();

        // Optional: Clear input fields
        document.getElementById('name-and-phone-number').value = '';
        document.getElementById('table-number-or-address').value = '';
    }, 500); // 0.5 second delay to allow WhatsApp to open before clearing
};
}

function setActiveTab(id) {
  document.getElementById('showSushi').classList.remove('active');
  document.getElementById('showRamen').classList.remove('active');
  document.getElementById('showSalad').classList.remove('active');
  document.getElementById(id).classList.add('active');
}

function openPreview(name) {
  const item = allProducts.find(p => p.name === name);
  if (!item) return;
  document.getElementById('modal-image').src = `images/${item.image}`;
  document.getElementById('modal-name').textContent = item.name;
  document.getElementById('modal-description').textContent = item.description;
  document.getElementById('modal-price').textContent = `₹${item.price}`;
  document.getElementById('modal-calories').textContent = `🔥 ${item.calories} kcal`;
  document.getElementById('preview-modal').classList.remove('hidden');
  document.getElementById('modal-add-to-cart').onclick = () => {
    changeQty(name, 1);
    document.getElementById('preview-modal').classList.add('hidden');
  };
  document.getElementById('close-modal').onclick = () => {
    document.getElementById('preview-modal').classList.add('hidden');
  };
  document.getElementById('back-to-menu').onclick = (e) => {
    e.preventDefault();
    document.getElementById('preview-modal').classList.add('hidden');
    document.getElementById('menu-section').scrollIntoView({ behavior: 'smooth' });
  };
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('✅ Service Worker registered:', reg.scope))
      .catch(err => console.error('❌ SW registration failed:', err));
  });
}
