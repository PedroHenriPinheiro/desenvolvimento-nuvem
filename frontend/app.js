
const API_URL = "http://15.228.7.86:3000/products";

// Elementos da página
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
const updateProductDescription = document.querySelector('#update-description');
const updateCancel = document.querySelector('#update-cancel');

const searchProductForm = document.querySelector('#search-product-form');
const searchProductId = document.querySelector('#search-id');
const searchResult = document.querySelector('#search-result');

const refreshButton = document.querySelector('#refresh-products');

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});


// Exibir notificações
function showToast(message, type = 'success') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} shadow-lg`;

  const span = document.createElement('span');
  span.textContent = message;

  alert.appendChild(span);
  toastContainer.appendChild(alert);

  setTimeout(() => alert.remove(), 3500);
}


// Requisição HTTP
async function request(url, options = {}) {
  const response = await fetch(url, options);

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null
        ? data.error || data.message
        : null;

    throw new Error(message || `Erro ${response.status}: ${response.statusText}`);
  }

  return data;
}


// Operações da API
const api = {
  list: () => request(API_URL),

  getById: id => request(`${API_URL}/${id}`),

  create: (name, description, price) =>
    request(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, price })
    }),

  update: (id, name, description, price) =>
    request(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, price })
    }),

  remove: id =>
    request(`${API_URL}/${id}`, {
      method: 'DELETE'
    })
};


// Criar elemento de texto com segurança
function createTextElement(tag, className, content) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = content;
  return element;
}


// Renderizar um produto na listagem
function renderProduct(product) {
  const li = document.createElement('li');
  li.className = 'product-item';

  const info = document.createElement('div');
  info.className = 'product-info';

  const name = createTextElement(
    'h3',
    'font-semibold text-lg',
    product.name
  );

  const description = createTextElement(
    'p',
    'text-sm text-base-content/60 product-description',
    product.description || 'Sem descrição informada.'
  );

  const details = document.createElement('div');
  details.className = 'flex flex-wrap items-center gap-2 mt-2';

  const id = createTextElement(
    'span',
    'badge badge-ghost',
    `ID: ${product.id}`
  );

  const price = createTextElement(
    'span',
    'badge badge-primary badge-outline',
    currency.format(Number(product.price))
  );

  details.append(id, price);
  info.append(name, description, details);

  // Botões de ação
  const actions = document.createElement('div');
  actions.className = 'product-actions';

  const updateButton = document.createElement('button');
  updateButton.className = 'btn btn-sm btn-outline btn-info';
  updateButton.textContent = 'Editar';

  updateButton.addEventListener('click', () => {
    updateProductId.value = product.id;
    updateProductName.value = product.name;
    updateProductPrice.value = product.price;
    updateProductDescription.value = product.description || '';

    updateModal.showModal();
  });

  const deleteButton = document.createElement('button');
  deleteButton.className = 'btn btn-sm btn-outline btn-error';
  deleteButton.textContent = 'Excluir';

  deleteButton.addEventListener('click', async () => {
    if (!confirm(`Deseja realmente excluir "${product.name}"?`)) {
      return;
    }

    try {
      await api.remove(product.id);

      showToast('Produto excluído com sucesso!');
      await fetchProducts();

      if (searchProductId.value == product.id) {
        searchResult.classList.add('hidden');
        searchResult.innerHTML = '';
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  actions.append(updateButton, deleteButton);
  li.append(info, actions);

  return li;
}


// Buscar e listar produtos
async function fetchProducts() {
  loading.classList.remove('hidden');
  loading.classList.add('flex');
  emptyState.classList.add('hidden');

  try {
    const products = await api.list();

    productList.innerHTML = '';

    products.forEach(product => {
      productList.appendChild(renderProduct(product));
    });

    productsCount.textContent = products.length;

    emptyState.classList.toggle('hidden', products.length > 0);

  } catch (error) {
    showToast(`Não foi possível carregar os produtos: ${error.message}`, 'error');
  } finally {
    loading.classList.add('hidden');
    loading.classList.remove('flex');
  }
}


// Consultar produto individual pelo ID
searchProductForm.addEventListener('submit', async event => {
  event.preventDefault();

  const id = Number(searchProductId.value);

  if (!Number.isInteger(id) || id <= 0) {
    showToast('Informe um ID válido.', 'error');
    return;
  }

  searchResult.classList.remove('hidden');
  searchResult.innerHTML = `
    <div class="flex justify-center py-4">
      <span class="loading loading-spinner loading-md text-primary"></span>
    </div>
  `;

  try {
    const result = await api.getById(id);

    // O backend atual retorna um array. Também aceitamos um objeto.
    const product = Array.isArray(result) ? result[0] : result;

    searchResult.innerHTML = '';

    if (!product) {
      searchResult.appendChild(
        createTextElement(
          'p',
          'text-center text-warning py-4',
          `Nenhum produto encontrado com o ID ${id}.`
        )
      );
      return;
    }

    const card = document.createElement('div');
    card.className = 'card bg-base-200 border border-base-300';

    const body = document.createElement('div');
    body.className = 'card-body';

    body.appendChild(
      createTextElement('h3', 'card-title', product.name)
    );

    body.appendChild(
      createTextElement(
        'p',
        'text-sm text-base-content/70',
        product.description || 'Sem descrição informada.'
      )
    );

    const details = document.createElement('div');
    details.className = 'flex flex-wrap gap-2 mt-2';

    details.appendChild(
      createTextElement('span', 'badge badge-ghost', `ID: ${product.id}`)
    );

    details.appendChild(
      createTextElement(
        'span',
        'badge badge-primary badge-outline',
        currency.format(Number(product.price))
      )
    );

    body.appendChild(details);
    card.appendChild(body);
    searchResult.appendChild(card);

  } catch (error) {
    searchResult.innerHTML = '';

    searchResult.appendChild(
      createTextElement(
        'p',
        'text-center text-error py-4',
        error.message
      )
    );
  }
});


// Cadastrar produto
addProductForm.addEventListener('submit', async event => {
  event.preventDefault();

  const name = addProductForm.elements['name'].value.trim();
  const description = addProductForm.elements['description'].value.trim();
  const price = Number(addProductForm.elements['price'].value);

  if (!name || !Number.isFinite(price) || price < 0) {
    showToast('Preencha corretamente o nome e o preço.', 'error');
    return;
  }

  try {
    await api.create(name, description || null, price);

    addProductForm.reset();

    showToast('Produto cadastrado com sucesso!');
    await fetchProducts();

  } catch (error) {
    showToast(error.message, 'error');
  }
});


// Atualizar produto
updateProductForm.addEventListener('submit', async event => {
  event.preventDefault();

  const id = updateProductId.value;
  const name = updateProductName.value.trim();
  const description = updateProductDescription.value.trim();
  const price = Number(updateProductPrice.value);

  if (!name || !Number.isFinite(price) || price < 0) {
    showToast('Preencha corretamente o nome e o preço.', 'error');
    return;
  }

  try {
    await api.update(id, name, description || null, price);

    updateModal.close();

    showToast('Produto atualizado com sucesso!');
    await fetchProducts();

    // Atualiza também a consulta individual, caso esteja exibindo esse produto.
    if (searchProductId.value == id) {
      searchProductForm.requestSubmit();
    }

  } catch (error) {
    showToast(error.message, 'error');
  }
});


// Fechar modal de edição
updateCancel.addEventListener('click', () => {
  updateModal.close();
});


// Atualizar listagem manualmente
refreshButton.addEventListener('click', fetchProducts);


// Alternar tema
themeToggle.addEventListener('change', () => {
  document.documentElement.setAttribute(
    'data-theme',
    themeToggle.checked ? 'dark' : 'light'
  );
});


// Carregamento inicial
fetchProducts();
