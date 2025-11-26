const express = require('express')
const axios = require('axios')

const app = express()
app.use(express.json())

const eventos = {}

const assinantes = {}

app.post('/registrar', (req, res) => {
  const { url, tipo } = req.body
  if (!assinantes[tipo]) { assinantes[tipo] = [] }
  if (!assinantes[tipo].includes(url)) { assinantes[tipo].push(url) }
  console.log(`[Barramento] Registrado: ${url} quer ouvir ${tipo}`)
  res.status(200).send({ msg: 'ok' })
})

app.post('/eventos', (req, res) => {
  const evento = req.body
  const { type } = evento
  console.log(`[Barramento] Recebido: ${type}`)

  if (!eventos[type]) { eventos[type] = [] }
  eventos[type].push(evento)

  const interessados = assinantes[type] || []
  interessados.forEach(async (url) => {
    try {
      await axios.post(url, evento)
    } catch (e) {
       
    }
  })
  
  res.end()
})

app.get('/eventos', (req, res) => {
  res.send(eventos)
})

const port = 10000
app.listen(port, () => {
  console.log(`Barramento. Porta ${port}.`)
})