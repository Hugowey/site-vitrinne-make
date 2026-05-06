let cart = JSON.parse(localStorage.getItem('vitrinne_cart')) || [];
let currentModalQty = 1;
let selectedProduct = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
    renderHighlights();
    updateCartUI();
    
    new Swiper(".highlightsSwiper", {
        slidesPerView: 1.2,
        spaceBetween: 20,
        pagination: { el: ".swiper-pagination", clickable: true },
        navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
        breakpoints: { 768: { slidesPerView: 3 } }
    });
});

// Renderizar Produtos
function renderProducts(items) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = items.map(p => `
        <div class="product-card cursor-pointer" onclick="openModal(${p.id})">
            <div class="h-80 overflow-hidden">
                <img src="${p.img}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
            </div>
            <div class="p-6">
                <span class="text-[10px] text-[#FF4FA3] font-bold uppercase tracking-widest bg-pink-50 px-2 py-1 rounded-md">${p.category}</span>
                <h4 class="mt-3 text-xl font-['Playfair_Display'] font-bold">${p.name}</h4>
                <p class="text-[#FF4FA3] font-bold mt-4 text-lg">R$ ${p.price.toFixed(2)}</p>
            </div>
        </div>
    `).join('');
}

// Renderizar Destaques (Carrossel)
function renderHighlights() {
    const wrapper = document.getElementById('highlights-wrapper');
    const highlights = products.slice(0, 4);
    wrapper.innerHTML = highlights.map(p => `
        <div class="swiper-slide cursor-pointer" onclick="openModal(${p.id})">
            <div class="highlight-card" style="background: url('${p.img}') center/cover">
                <div class="highlight-overlay flex flex-col justify-end p-8 text-white">
                    <span class="text-[10px] uppercase font-bold tracking-widest mb-2 opacity-80">${p.category}</span>
                    <h4 class="text-2xl font-['Playfair_Display'] italic">${p.name}</h4>
                    <p class="font-bold text-pink-300">R$ ${p.price.toFixed(2)}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Filtros
function filterProducts(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    const filtered = category === 'Todos' ? products : products.filter(p => p.category === category);
    renderProducts(filtered);
}

// Modal de Produto
function openModal(id) {
    selectedProduct = products.find(p => p.id === id);
    currentModalQty = 1;
    document.getElementById('modal-img').src = selectedProduct.img;
    document.getElementById('modal-title').innerText = selectedProduct.name;
    document.getElementById('modal-cat').innerText = selectedProduct.category;
    document.getElementById('modal-desc').innerText = selectedProduct.desc;
    document.getElementById('modal-price').innerText = `R$ ${selectedProduct.price.toFixed(2)}`;
    document.getElementById('modal-qty').innerText = currentModalQty;
    
    document.getElementById('product-modal').classList.remove('hidden');
    document.getElementById('add-to-cart-btn').onclick = () => addToCart(selectedProduct, currentModalQty);
}

function closeModal() {
    document.getElementById('product-modal').classList.add('hidden');
}

function updateModalQty(val) {
    currentModalQty = Math.max(1, currentModalQty + val);
    document.getElementById('modal-qty').innerText = currentModalQty;
}

// Carrinho
function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    drawer.classList.toggle('hidden');
    setTimeout(() => drawer.classList.toggle('open'), 10);
}

function addToCart(product, qty) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ ...product, qty });
    }
    saveAndUpdate();
    closeModal();
    toggleCart();
}

function updateCartQty(id, val) {
    const item = cart.find(i => i.id === id);
    item.qty = Math.max(1, item.qty + val);
    saveAndUpdate();
}

function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    saveAndUpdate();
}

function saveAndUpdate() {
    localStorage.setItem('vitrinne_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const itemsContainer = document.getElementById('cart-items');
    const countLabel = document.getElementById('cart-count');
    const totalLabel = document.getElementById('cart-total');
    const subtotalLabel = document.getElementById('cart-subtotal');
    
    countLabel.innerText = cart.reduce((acc, i) => acc + i.qty, 0);
    
    if (cart.length === 0) {
        itemsContainer.innerHTML = `<p class="text-center text-gray-400 mt-20 font-light italic">Seu carrinho está vazio.</p>`;
    } else {
        itemsContainer.innerHTML = cart.map(i => `
            <div class="flex gap-4 mb-6 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm relative">
                <img src="${i.img}" class="w-20 h-20 object-cover rounded-xl">
                <div class="flex-1">
                    <h6 class="font-bold text-sm">${i.name}</h6>
                    <p class="text-[#FF4FA3] text-sm font-bold mt-1">R$ ${i.price.toFixed(2)}</p>
                    <div class="flex items-center gap-3 mt-2 bg-gray-50 w-fit px-2 py-1 rounded-lg">
                        <button onclick="updateCartQty(${i.id}, -1)" class="text-gray-400">-</button>
                        <span class="text-xs font-bold">${i.qty}</span>
                        <button onclick="updateCartQty(${i.id}, 1)" class="text-gray-400">+</button>
                    </div>
                </div>
                <button onclick="removeItem(${i.id})" class="absolute top-2 right-2 text-red-400"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
        `).join('');
        lucide.createIcons();
    }
    
    const total = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    totalLabel.innerText = `R$ ${total.toFixed(2)}`;
    subtotalLabel.innerText = `R$ ${total.toFixed(2)}`;
}

// Finalizar pedido via WhatsApp
function checkout() {
    if (cart.length === 0) return alert("Seu carrinho está vazio!");
    
    let msg = `🛍️ *Novo Pedido - Vitrinne Make*\n\n`;
    cart.forEach(i => {
        msg += `• ${i.name} (x${i.qty}) - R$ ${(i.price * i.qty).toFixed(2)}\n`;
    });
    const total = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    msg += `\n💰 *Total: R$ ${total.toFixed(2)}*`;
    
    const url = `https://wa.me/5535988438440?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}