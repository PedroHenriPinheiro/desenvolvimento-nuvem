const express = require("express");
const app = express();

app.listen(4000, function(erro){
    if(erro) {
        console.log("Error ao iniciar");
    } else {
        console.log("Bem bonzim");
    }
})

app.get("/", function(req,res) {
    res.send("Hello my dear Americo!!!!")
})

app.get("/produtos", function(req,res) {
    res.send("Um bocado de produtos")
})

app.get("/about", function(req,res) {
    res.send("teste de aplicação no vercel e aws")
})

app.get("/trem", function(req,res) {
    res.send("Piui tchatchatcha")
})

app.get("/consulta:parametro", function(req,res) {
    res.send("retorno da consulta: " + req.params.parametro)
})

app.get("/cadastro:produto", function(req,res) {
    var produto = req.params.produto
    
    if(produto) {
        res.send(`Produto ${produto} cadastrado!!`)
    } else {
        res.send("produto criado")
    }
})


app.get("/verificar/:cpf", function(req,res) {
    var cpf = req.params.cpf
    
    if(cpf) {
        res.send(`Retorno da consulta do CPF ${cpf}`)
    } else {
        res.send("CPF não foi fornecido")
    }
})

app.get("/verificar/:cpf", function(req,res) {
    var cpf = req.query["cpf"]
    
    if(cpf) {
        res.send(`Retorno da consulta do CPF ${cpf}`)
    } else {
        res.send("CPF não foi fornecido")
    }
})