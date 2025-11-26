//fazer os imports
const express = require('express')
const axios = require('axios')
const app = express()
//aplicar eventuais middlewares
app.use(express.json())
const palavraChave = 'importante'
const funcoes = {
  ObservacaoCriada: (observacao) => {
    if(observacao.texto.includes(palavraChave))
      observacao.status = 'importante'
    else
      observacao.status = 'comum'
    axios.post('http://localhost:10000/eventos', {
      type: 'ObservacaoClassificada',
      payload: observacao
    })
  },

  LembreteCriado: (lembrete) => {
    if(lembrete.texto.length >=50)
      lembrete.status = 'importante'
    else
      lembrete.status = 'comum'

    axios.post('http://localhost:10000/eventos',{
      type: 'LembreteClassificado',
      payload: lembrete
    })
  }
}

app.post('/eventos', (req, res) => {
  try{
    const evento = req.body
    console.log(evento)
    funcoes[evento.type](evento.payload)
  }
  catch(e){}
  res.end()
})

//colocar o mss para funcionar na porta 7000
const port = 7000
app.listen(port, () => {
  console.log(`Classificação. Porta ${port}.`)

  axios.post('http://localhost:10000/registrar',{
    tipo: 'ObservacaoCriada',
    url: `http://localhost:${port}/eventos`
   }).catch((e)=>{})
  })

 axios.post('http://localhost:10000/registrar',{
   tipo: 'LembreteCriado', 
   url: `http://localhost:${port}/eventos` 
  }).catch((e)=>{})

 axios.get('http://localhost:10000/eventos').then(({data: eventos}) => {
    for (let tipo in eventos) {
      const lista = eventos[tipo]
      for (let evento of lista) {
        try {
          funcoes[evento.type](evento.payload)
        } catch (e) {}
      }
    }
  })
