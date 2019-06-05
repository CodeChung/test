require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
//helmet gets rid of X-Powered-By in network headers
const helmet = require('helmet');
const POKEDEX = require('./pokedex.json')

const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));
app.use(cors());
app.use(helmet.hidePoweredBy());

app.use(function validateBearerToken(req, res, next) {
    const authToken = req.get('Authorization');
    const apiToken = process.env.API_TOKEN;
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request'})
    }
    // move to the next middleware
    next()
})

app.use((error, req, res, next) => {
    let response;

    if (process.env.NODE_ENV === 'production') {
        response = { error: { message: 'server error' }}
    } else { 
        response = { error }
    }
    res.status(500).json(response)
})

const validTypes= [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`]

function handleGetTypes(req, res) {
    res.json(validTypes)
}

app.get('/types', handleGetTypes)

function handleGetPokemon(req, res) {
    const pokedex = POKEDEX.pokemon;
    const { name, type } = req.query;
    let pokemon;
    debugger;
    if (name) {
        pokemon = pokedex.filter(pokemon => pokemon.name.toLowerCase().includes(name.trim().toLowerCase()))
    }
    if (type) {
        pokemon = pokemon ? pokemon.filter(pokemon => pokemon.type.includes(type)) : pokedex.filter(pokemon => pokemon.type.includes(type))
    }
    res.json(pokemon)
}

app.get('/pokemon', handleGetPokemon)

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
})