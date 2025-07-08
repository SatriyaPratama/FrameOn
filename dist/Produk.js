let models = [], filtered = [], currentPage = 1;
let arInitialized = false;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let lastPurchased = null;

const searchBox = document.getElementById('searchBox'),
  searchButton = document.getElementById('searchButton'),
  itemsPerPage = document.getElementById('itemsPerPage'),
  gallery = document.getElementById('glassesGallery'),
  pagination = document.getElementById('pagination'),
  modal = document.getElementById('arModal'),
  loadingOverlay = document.getElementById('JeelizVTOWidgetLoading'),
  voucherInput = document.getElementById('voucherCode');

fetch('models.json')
  .then(res => res.json())
  .then(data => {
    models = data;
    filtered = models;
    itemsPerPage?.addEventListener('change', () => { currentPage = 1; renderGallery(); });
    searchButton?.addEventListener('click', () => {
      const kw = searchBox.value.trim().toLowerCase();
      filtered = models.filter(m => m.label.toLowerCase().includes(kw));
      currentPage = 1; renderGallery();
    });
    renderGallery();
  })
  .catch(err => console.error('Error loading models.json:', err));

function formatPrice(p) {
  return 'Rp' + Math.round(p).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function removeFromCart(sku) {
  const singleMode = window.location.search.includes('single=true');
  let data = singleMode
    ? JSON.parse(localStorage.getItem('checkout_single')) || []
    : JSON.parse(localStorage.getItem('cart')) || [];

  data = data.filter(item => item.sku !== sku);
  
  if (singleMode) {
    localStorage.setItem('checkout_single', JSON.stringify(data));
  } else {
    localStorage.setItem('cart', JSON.stringify(data));
    cart = data;
  }
  saveCart()
  renderCartPage();
}

function changeQty(sku, delta) {
  const singleMode = window.location.search.includes('single=true');
  let data = singleMode
    ? JSON.parse(localStorage.getItem('checkout_single')) || []
    : JSON.parse(localStorage.getItem('cart')) || [];

  const index = data.findIndex((item) => item.sku === sku);
  if (index !== -1) {
    data[index].qty += delta;
    if (data[index].qty <= 0) {
      data.splice(index, 1);
    }
    
    if (singleMode) {
      localStorage.setItem('checkout_single', JSON.stringify(data));
    } else {
      localStorage.setItem('cart', JSON.stringify(data));
      cart = data;
    }
    saveCart()
    renderCartPage();
  }
}

function addToCart(product) {
  const existing = cart.find(item => item.name === product.label);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      sku: product.sku,
      name: product.label,
      price: product.price || 999999,
      qty: 1,
    });
  }
  saveCart();
  const modal = document.getElementById("cartModal");
  if (modal) modal.classList.add("active");
}

function buyNow(product) {
  const data = {
    sku: product.sku,
    name: product.label,
    price: product.price || 999999,
    qty: 1,
  };
  lastPurchased = data;
  showCheckoutSingle(data);
}
function renderGallery() {
  if (!gallery) return;
  gallery.innerHTML = '';
  pagination.innerHTML = '';
  const per = +itemsPerPage.value;
  const total = Math.max(1, Math.ceil(filtered.length / per));
  if (!filtered.length) {
    gallery.innerHTML = '<p class="no-results">Produk tidak ditemukan.</p>';
    return;
  }
  currentPage = Math.min(Math.max(1, currentPage), total);
  const start = (currentPage - 1) * per;
  filtered.slice(start, start + per).forEach(m => {
    const card = document.createElement('div');
    card.className = 'glasses-card';
    const img = document.createElement('img');
    img.src = `Model/${m.sku}.avif`;
    img.alt = m.label;
    const extensions = ['jpg','jpeg', 'png', 'webp'];
    let extIndex = 0;
    img.onerror = function () {
      if (extIndex < extensions.length) {
        this.src = `Model/${m.sku}.${extensions[extIndex++]}`;
      } else {
        this.onerror = null;
        this.src = 'images/erorloading.jpg';
      }
    };
    const info = document.createElement('div');
    info.className = 'info';
    info.innerHTML = `<h3>${m.label}</h3><p>${m.price ? formatPrice(m.price) : ''}</p>`;
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'card-buttons';

    const tryButton = document.createElement('button');
    tryButton.className = 'try-btn';
    tryButton.textContent = 'Coba';
    tryButton.onclick = (e) => {
      e.stopPropagation();
      showARPopup(m.sku);
    };

    const addButton = document.createElement('button');
    addButton.className = 'add-btn';
    addButton.textContent = '+';
    addButton.onclick = (e) => {
      e.stopPropagation();
      addToCart(m);
    };

    const buyButton = document.createElement('button');
    buyButton.className = 'buy-btn';
    buyButton.textContent = 'Beli';
    buyButton.onclick = (e) => {
      e.stopPropagation();
      buyNow(m);
    };

    buttonContainer.appendChild(tryButton);
    buttonContainer.appendChild(addButton);
    buttonContainer.appendChild(buyButton);
    card.append(img, info, buttonContainer);
    gallery.appendChild(card);
  });

  pagination.appendChild(createBtn('Prev', () => { currentPage--; renderGallery(); }, currentPage === 1));
  for (let i = 1; i <= total; i++) {
    if (i <= 2 || i > total - 2 || Math.abs(i - currentPage) <= 1) {
      pagination.appendChild(createBtn(i, () => { currentPage = i; renderGallery(); }, i === currentPage));
    } else if (i === 3 && currentPage > 4) {
      pagination.appendChild(createEllipsis());
    } else if (i === total - 2 && currentPage < total - 3) {
      pagination.appendChild(createEllipsis());
    }
  }
  pagination.appendChild(createBtn('Next', () => { currentPage++; renderGallery(); }, currentPage === total));
}

function createBtn(text, onClick, disabled) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.disabled = disabled;
  btn.onclick = onClick;
  btn.className = 'page-btn' + (text === currentPage ? ' active' : '') + (disabled ? ' disabled' : '');
  return btn;
}

function createEllipsis() {
  const span = document.createElement('span');
  span.textContent = '...';
  span.className = 'ellipsis';
  return span;
}

function renderCartPage() {
  const cartItemsDiv = document.getElementById('cartItems');
  if (!cartItemsDiv) return;

  const singleMode = window.location.search.includes('single=true');
  let data = singleMode
    ? JSON.parse(localStorage.getItem('checkout_single')) || []
    : JSON.parse(localStorage.getItem('cart')) || [];

  cartItemsDiv.innerHTML = '';
  let subtotal = 0;

  if (data.length === 0) {
    cartItemsDiv.innerHTML = '<div class="empty-cart"><p>Keranjang kosong. <a href="produk.html">Lihat Produk</a></p></div>';
  } else {
    data.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';

      const img = document.createElement('img');
      img.src = `Model/${item.sku}.avif`;
      const extensions = ['jpg', 'png', 'webp'];
      let extIndex = 0;
      img.onerror = function () {
        if (extIndex < extensions.length) {
          this.src = `Model/${item.sku}.${extensions[extIndex++]}`;
        } else {
          this.onerror = null;
          this.src = 'images/erorloading.jpg';
        }
      };

      const info = document.createElement('div');
      info.className = 'cart-item-info';
      info.innerHTML = `
        <h4>${item.name}</h4>
        <p>${formatPrice(item.price)}</p>
        <p>Qty: 
          <span class="qty-controls">
            <button class="qty-btn minus" onclick="changeQty('${item.sku}', -1)">-</button> 
            <span style="margin: 0 0.5rem; font-weight: 600;">${item.qty}</span>
            <button class="qty-btn plus" onclick="changeQty('${item.sku}', 1)">+</button>
          </span>
        </p>
        ${!singleMode ? `<button class="remove-btn" onclick="removeFromCart('${item.sku}')">Hapus</button>` : ''}
      `;

      div.appendChild(img);
      div.appendChild(info);
      cartItemsDiv.appendChild(div);

      subtotal += item.price * item.qty;
    });
  }

  const voucher = document.getElementById('voucherCode')?.value?.trim().toUpperCase();
  let discount = voucher === 'DISKON10' ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');
  const discountEl = document.getElementById('cartDiscount');

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (totalEl) totalEl.textContent = formatPrice(total);
  if (discountEl) discountEl.textContent = discount > 0 ? `- ${formatPrice(discount)}` : '-';
}

function showCheckoutSingle(product) {
  const checkoutModal = document.getElementById('checkoutModal');
  const itemName = document.getElementById('checkoutItemName');
  const itemPrice = document.getElementById('checkoutItemPrice');
  const itemImage = document.getElementById('checkoutItemImage');
  const proceedBtn = document.querySelector('.checkout-button');

  itemImage.src = `Model/${product.sku}.avif`;
  const extensions = ['jpg', 'png', 'webp'];
  let extIndex = 0;
  itemImage.onerror = function () {
    if (extIndex < extensions.length) {
      itemImage.src = `Model/${product.sku}.${extensions[extIndex++]}`;
    } else {
      itemImage.onerror = null;
      itemImage.src = 'images/erorloading.jpg';
    }
  };

  itemName.textContent = product.name;
  itemPrice.textContent = formatPrice(product.price);

  const tax = product.price * 0.11;
  const total = product.price + tax;

  document.getElementById('checkoutSubtotal').textContent = formatPrice(product.price);
  document.getElementById('checkoutTax').textContent = formatPrice(tax);
  document.getElementById('checkoutTotal').textContent = formatPrice(total);

  checkoutModal.classList.add('active');

  proceedBtn.onclick = () => {
    localStorage.setItem('checkout_single', JSON.stringify([product]));
    window.location.href = 'keranjang.html?single=true';
  };
}

function closeCheckout() {
  document.getElementById('checkoutModal')?.classList.remove('active');
}

function handleImageFallback(img, originalPath) {
  const base = originalPath.slice(0, originalPath.lastIndexOf('.'));
  const extensions = ['jpg', 'png', 'webp'];
  let index = 0;
  img.onerror = function () {
    if (index < extensions.length) {
      img.src = base + '.' + extensions[index++];
    } else {
      img.onerror = null;
      img.src = 'images/erorloading.jpg';
    }
  };
}

function initAR(sku) {
  JEELIZVTOWIDGET.start({
    sku: sku,
    isShadow: get_isShadow(),
    searchImageMask: 'images/logo.png',
    searchImageColor: 0xa9a9a9,
    callbackReady: () => {
      loadingOverlay.style.display = 'none';
    },
    onError: err => {
      console.error('AR error:', err);
      loadingOverlay.style.display = 'none';
      alert('Gagal memuat AR: ' + err);
    }
  });
}

function showARPopup(sku) {
  modal.classList.add('active');
  loadingOverlay.style.display = 'flex';
  if (!arInitialized) {
    arInitialized = true;
    initAR(sku);
  } else {
    JEELIZVTOWIDGET.load(sku);
    loadingOverlay.style.display = 'none';
  }
}

function closeARPopup() {
  modal.classList.remove('active');
  loadingOverlay.style.display = 'none';
}

function get_isShadow() {
  return !new URLSearchParams(window.location.search).get('isHideShadow');
}

window.addEventListener('click', function (e) {
  if (e.target.id === 'checkoutModal') {
    closeCheckout();
  }
});

window.addEventListener('DOMContentLoaded', () => {
  renderCartPage();
  const applyVoucherBtn = document.getElementById('applyVoucher');
  if (applyVoucherBtn) {
    applyVoucherBtn.addEventListener('click', renderCartPage);
  }
});
