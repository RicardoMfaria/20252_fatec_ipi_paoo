const axios = require('axios')
const express = require('express')
const { v4: uuidv4 } = require('uuid')
const app = express()
app.use(express.json())

const observacoesPorLembrete = {}
const funcoes = {
  ObservacaoClassificada: (observacao) => {
    //eu faço esse: atualizar a base local
    const observacoes = observacoesPorLembrete[observacao.lembreteId]
    const obsParaAtualizar = observacoes.find(o => o.id === observacao.id)
    obsParaAtualizar.status = observacao.status
    //emitir um evento de tipo ObservacaoAtualizada e cujo payload seja a propria observacao
    axios.post('http://localhost:10000/eventos', {
      type: 'ObservacaoAtualizada',
      payload: observacao
    })
  }
}
//POST /lembretes/1/observacoes (req, res) => {}
app.post('/lembretes/:id/observacoes', (req, res) => {
  const idObs = uuidv4()
  const { texto } = req.body
  const { id: lembreteId } = req.params
  const observacao = { id: idObs, texto, lembreteId, status: 'aguardando' }
  const observacoesDoLembrete = observacoesPorLembrete[lembreteId] || []
  observacoesDoLembrete.push(observacao)
  observacoesPorLembrete[lembreteId] = observacoesDoLembrete
  axios.post('http://localhost:10000/eventos', {
    type: 'ObservacaoCriada',
    payload: observacao
  })
  res.status(201).json(observacoesDoLembrete)
})

//GET /lembretes/:id/observacoes (req, res) => {}
app.get('/lembretes/:id/observacoes', (req, res) => {
  //devolver a lista de observações do lembrete cujo id faz parte do path
  //ou uma lista vazia se ainda não existir
  res.status(200).json(observacoesPorLembrete[req.params.id] || [])
})

app.post('/eventos', (req, res) => {
  try{
    const evento = req.body
    console.log(evento)
    funcoes[evento.type](evento.payload)
  }
  catch(e){
  }
  res.end()
})

const port = 5000
app.listen(port, () => console.log(`Observações. Porta ${port}.`))
axios.post('http://localhost:10000/registrar', {
        tipo: 'ObservacaoClassificada',
        url: `http://localhost:${port}/eventos`
    }).catch((e) => {})
