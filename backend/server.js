require('dotenv').config();

const express = require('express');
const supabaseClient = require('@supabase/supabase-js');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

// ---------- Variáveis de ambiente ----------
const { SUPABASE_URL, SUPABASE_KEY } = process.env;
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Defina SUPABASE_URL e SUPABASE_KEY no arquivo .env');
    process.exit(1);
}

const supabase = supabaseClient.createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------- App ----------
const app = express();

app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200,
}));

app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ---------- Rotas ----------
app.get('/products', async (req, res) => {
    const { data, error } = await supabase.from('products').select();
    if (error) return res.status(500).json(error);
    res.json(data);
});

app.get('/products/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('products')
        .select()
        .eq('id', req.params.id);
    if (error) return res.status(500).json(error);
    res.json(data);
});

app.post('/products', async (req, res) => {
    const { error } = await supabase
        .from('products')
        .insert({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
        });
    if (error) return res.status(500).json(error);
    res.status(201).json({ message: 'created!!' });
});

app.put('/products/:id', async (req, res) => {
    const { error } = await supabase
        .from('products')
        .update({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
        })
        .eq('id', req.params.id);
    if (error) return res.status(500).json(error);
    res.json({ message: 'updated!!' });
});

app.delete('/products/:id', async (req, res) => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', req.params.id);
    if (error) return res.status(500).json(error);
    res.json({ message: 'deleted!!' });
});

app.get('/', (req, res) => {
    res.send('Hello I am working my friend Supabase <3');
});

app.get('/*splat', (req, res) => {
    res.send('Hello again I am working my friend to the moon and behind <3');
});

app.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
});