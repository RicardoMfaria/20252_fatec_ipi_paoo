const axios = require('axios')
const express = require('express')
const app = express()
app.use(express.json())

const baseConsolidada = {}

const funcoes = {

  LembreteCriado: (lembrete) => {
    baseConsolidada[lembrete.id] = lembrete
    baseConsolidada[lembrete.id]['observacoes'] = []
  },

  ObservacaoCriada: (observacao) => {
    const observacoes = baseConsolidada[observacao.lembreteId]['observacoes'] || []
    observacoes.push(observacao)
    baseConsolidada[observacao.lembreteId]['observacoes'] = observacoes
  },
  ObservacaoAtualizada: (observacao) => {
    const observacoes = baseConsolidada[observacao.lembreteId]['observacoes']
    const indice = observacoes.findIndex(o => o.id === observacao.id)
    observacoes[indice] = observacao
  },
  LembreteClassificado: (lembrete) => {
    const reg = baseConsolidada[lembrete.id]
    if (reg) reg.status = lembrete.status
  }
}


app.get('/lembretes', (req, res) => {
  res.json(baseConsolidada)  
})


app.post('/eventos', (req, res) => {
  try{
    const evento = req.body
   funcoes[evento.type](evento.payload)
  }
  catch(e){}
  res.end()
})

const port = 6000
app.listen(port, async () => { 
  console.log (`Consulta. Porta ${port}.`)
  const eventos = ['LembreteCriado', 'ObservacaoCriada', 'ObservacaoAtualizada', 'LembreteClassificado']
  eventos.forEach(async (tipo) => {
    await axios.post('http://localhost:10000/registrar', { 
        tipo, 
        url: `http://localhost:${port}/eventos` 
    }).catch(() => {})
  })

  try {
    const resp = await axios.get('http://localhost:10000/eventos')
    const listaEventos = resp.data
    
    for (let tipo in listaEventos) {
        for (let evento of listaEventos[tipo]) {
            try {
                funcoes[evento.type](evento.payload)
            } catch(e){}
        }
    }
  } catch (e) {}
})