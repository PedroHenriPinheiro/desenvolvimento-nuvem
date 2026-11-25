const API_URL = "http://56.125.31.106:3000/products";

const productList = document.querySelector('#products');
const productsCount = document.querySelector('#products-count');
const loading = document.querySelector('#loading');
const emptyState = document.querySelector('#empty-state');
const toastContainer = document.querySelector('#toast-container');
const themeToggle = document.querySelector('#theme-toggle');

const addProductForm = document.querySelector('#add-product-form');
const updateModal = document.querySelector('#update-modal');
const updateProductForm = document.querySelector('#update-product-form');
const updateProductId = document.querySelector('#update-id');
const updateProductName = document.querySelector('#update-name');
const updateProductPrice = document.querySelector('#update-price');
const updateCancel = document.querySelector('#update-cancel');

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });


function showToast(message, type = 'success') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} shadow-lg`;
  const span = document.createElement('span');
  span.textContent = message;
  alert.appendChild(span);
  toastContainer.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
}

async function request(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Erro ${response.status}: ${response.statusText}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}


const api = {
  list: () => request(API_URL),
  create: (name, price) =>
    request(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price })
    }),
  update: (id, name, price) =>
    request(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price })
    }),
  remove: id => request(`${API_URL}/${id}`, { method: 'DELETE' })
};


function renderProduct(product) {
  const li = document.createElement('li');
  li.className = 'flex flex-row items-center justify-between gap-2 rounded-box bg-base-200 p-3';

  const info = document.createElement('div');
  info.className = 'flex flex-col';

  const name = document.createElement('span');
  name.className = 'font-semibold';
  name.textContent = product.name;

  const price = document.createElement('span');
  price.className = 'badge badge-primary badge-outline mt-1';
  price.textContent = currency.format(product.price);

  info.append(name, price);

  const actions = document.createElement('div');
  actions.className = 'flex gap-2';

  const updateButton = document.createElement('button');
  updateButton.className = 'btn btn-sm btn-outline btn-info';
  updateButton.textContent = 'Editar';
  updateButton.addEventListener('click', () => {
    updateProductId.value = product.id;
    updateProductName.value = product.name;
    updateProductPrice.value = product.price;
    updateModal.showModal();
  });

  const deleteButton = document.createElement('button');
  deleteButton.className = 'btn btn-sm btn-outline btn-error';
  deleteButton.textContent = 'Excluir';
  deleteButton.addEventListener('click', async () => {
    if (!confirm(`Excluir "${product.name}"?`)) return;
    try {
      await api.remove(product.id);
      showToast('Produto excluído');
      await fetchProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  actions.append(updateButton, deleteButton);
  li.append(info, actions);
  return li;
}

async function fetchProducts() {
  loading.classList.remove('hidden');
  emptyState.classList.add('hidden');
  try {
    const products = await api.list();
    productList.innerHTML = '';
    products.forEach(product => productList.appendChild(renderProduct(product)));
    productsCount.textContent = products.length;
    emptyState.classList.toggle('hidden', products.length > 0);
  } catch (err) {
    showToast('Não foi possível carregar os produtos', 'error');
  } finally {
    loading.classList.add('hidden');
  }
}


addProductForm.addEventListener('submit', async event => {
  event.preventDefault();
  const name = addProductForm.elements['name'].value.trim();
  const price = parseFloat(addProductForm.elements['price'].value);
  try {
    await api.create(name, price);
    addProductForm.reset();
    showToast('Produto adicionado');
    await fetchProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

updateProductForm.addEventListener('submit', async event => {
  event.preventDefault();
  try {
    await api.update(
      updateProductId.value,
      updateProductName.value.trim(),
      parseFloat(updateProductPrice.value)
    );
    updateModal.close();
    showToast('Produto atualizado');
    await fetchProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

updateCancel.addEventListener('click', () => updateModal.close());

themeToggle.addEventListener('change', () => {
  document.documentElement.setAttribute('data-theme', themeToggle.checked ? 'dark' : 'light');
});

fetchProducts();