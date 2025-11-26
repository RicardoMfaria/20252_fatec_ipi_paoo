const express = require('express')
const axios = require('axios')

const app = express()
app.use(express.json())

let totalLembretes = 0
let totalObservacoes = 0
let lembretesImportantes = 0
let lembretesComuns = 0

const funcoes = {
  LembreteCriado: () => {
    totalLembretes++
  },
  ObservacaoCriada: () => {
    totalObservacoes++
  },
  LembreteClassificado: (payload) => {
    if (payload.status === 'importante') {
      lembretesImportantes++
    } else {
      lembretesComuns++
    }
  }
}

app.get('/estatistica', (req, res) => {
  res.json({
    total_lembretes: totalLembretes,
    total_observacoes: totalObservacoes,
    lembretes_importantes: lembretesImportantes,
    lembretes_comuns: lembretesComuns
  })
})

app.post('/eventos', (req, res) => {
  try {
    const evento = req.body
    if (funcoes[evento.type]) {
      funcoes[evento.type](evento.payload)
      console.log(`[Estatística] Processado evento: ${evento.type}`)
    }
  } catch (e) {}
  res.end()
})

const port = 9000
app.listen(port, async () => {
  console.log(`Estatística. Porta ${port}.`)

  const interesses = ['LembreteCriado', 'ObservacaoCriada', 'LembreteClassificado']
  
  for (let tipo of interesses) {
    try {
      await axios.post('http://localhost:10000/registrar', {
        tipo: tipo,
        url: `http://localhost:${port}/eventos`
      })
    } catch (e) {}
  }
  
  try {
    const resp = await axios.get('http://localhost:10000/eventos')
    const eventos = resp.data
    for (let tipo in eventos) {
        for (let evento of eventos[tipo]) {
            if (funcoes[evento.type]) {
                funcoes[evento.type](evento.payload)
            }
        }
    }
    console.log("Estatísticas sincronizadas.")
  } catch (e) {}
})