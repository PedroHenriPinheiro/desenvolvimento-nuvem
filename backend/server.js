require('dotenv').config();

const express = require('express');
const supabaseClient = require('@supabase/supabase-js');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY

const supabase = supabaseClient.createClient(SUPABASE_URL, SUPABASE_KEY);


app.get('/products', async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true });

  
  if (error) {
    console.error('Erro GET /products:', JSON.stringify(error));
    return res.status(500).json({ error: error.message });
  }

  console.log('GET /products -> total:', data.length);
  return res.status(200).json(data);
});

// Consultar 1 produto pelo ID
app.get('/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id);

  if (error) {
    console.error('Erro GET /products/:id:', JSON.stringify(error));
    return res.status(500).json({ error: error.message });
  }

  console.log('GET /products/:id ->', JSON.stringify(data));
  return res.status(200).json(data);
});

// Cadastrar produto
app.post('/products', async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const price = Number(req.body.price);

  
  const description =
    req.body.description === undefined || req.body.description === null
      ? null
      : String(req.body.description).trim();

  if (!name || Number.isNaN(price)) {
    return res.status(400).json({ error: 'Nome e preço válido são obrigatórios' });
  }

  const { data, error } = await supabase
    .from('products')
    .insert([{ name, description, price }])
    .select();

  if (error) {
    console.error('Erro POST /products:', JSON.stringify(error));
    return res.status(400).json({ error: error.message });
  }

  console.log('POST /products -> criado:', JSON.stringify(data));
  return res.status(201).json({ message: 'created!!', data });
});


app.put('/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const price = Number(req.body.price);

  if (!name || Number.isNaN(price)) {
    return res.status(400).json({ error: 'Nome e preço válido são obrigatórios' });
  }

 
  const payload = { name, price };
  if (req.body.description !== undefined) {
    payload.description =
      req.body.description === null ? null : String(req.body.description).trim();
  }

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Erro PUT /products/:id:', JSON.stringify(error));
    return res.status(400).json({ error: error.message });
  }

  console.log('PUT /products/:id -> atualizado:', JSON.stringify(data));
  return res.status(200).json({ message: 'updated!!', data });
});


app.delete('/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const { data, error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error('Erro DELETE /products/:id:', JSON.stringify(error));
    return res.status(400).json({ error: error.message });
  }

  console.log('DELETE /products/:id -> deletado:', JSON.stringify(data));
  return res.status(200).json({ message: 'deleted!!', data });
});


app.get('/', (req, res) => {
  res.send('Hello I am working my friend Supabase <3');
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`> Ready on http://localhost:${PORT}`);
});