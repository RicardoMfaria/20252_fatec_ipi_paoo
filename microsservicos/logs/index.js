import express from 'express'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

const app = express()
app.use(express.json())

const logs = []

app.get('/logs', (req, res) => {
  res.json(logs)
})

app.post('/eventos', (req, res) => {
  const evento = req.body
  
  const log = {
    id: uuidv4(),
    data: new Date(),
    tipo_evento: evento.type,
    dados: evento.payload
  }
  
  logs.push(log)
  console.log(`[Logs] Evento registrado: ${evento.type}`)
  res.status(200).send({ msg: 'ok' })
})

const port = 8000
app.listen(port, async () => {
  console.log(`Logs. Porta ${port}.`)

  const eventos = [
    'LembreteCriado', 
    'ObservacaoCriada', 
    'ObservacaoClassificada', 
    'LembreteClassificado', 
    'ObservacaoAtualizada'
  ]
  
  for (let tipo of eventos) {
    try {
      await axios.post('http://localhost:10000/registrar', {
        type: tipo,
        url: `http://localhost:${port}/eventos`
      })
    } catch (e) { }
  }
  console.log("Registrado no barramento.")
})