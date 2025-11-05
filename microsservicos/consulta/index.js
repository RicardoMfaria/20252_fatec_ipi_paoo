const express = require('express')
const app = express()
app.use(express.json())

/*
{
  1: {
    id: 1,
    texto: "oi",
    observacoes: [{id: 1000, texto: abc, lembreteId: 1}]
  },
  2: {
    id: 2,
    texto: "oi2",
  }
}

[]
*/
const baseConsolidada = {}

const funcoes = {
  //a função deve receber um lembrete e cadastrá-lo na base consolidada
  LembreteCriado: (lembrete) => {
    baseConsolidada[lembrete.id] = lembrete
  },
  // id, texto, lembreteId
  ObservacaoCriada: (observacao) => {
    const observacoes = baseConsolidada[observacao.lembreteId]['observacoes'] || []
    observacoes.push(observacao)
    baseConsolidada[observacao.lembreteId]['observacoes'] = observacoes
  },
  ObservacaoAtualizada: (observacao) => {
    const observacoes = baseConsolidada[observacao.lembreteId]['observacoes']
    const indice = observacoes.findIndex(o => o.id === observacao.id)
    observacoes[indice] = observacao
  }
}

//disponibiliza a base consolidada
app.get('/lembretes', (req, res) => {
  //devolver a base consolidada como um json
  res.json(baseConsolidada)  
})

//recebe eventos, viabilizando a atualização da base
app.post('/eventos', (req, res) => {
  try{
    //pegar o evento do corpo da requisição e fazer esse ponteiro apontar para ele
    const evento = req.body
    console.log(evento)
    //desestruturar o evento, criando variaveis type e payload
    // const type = evento.type
    // const payload = evento.payload
    const { type, payload } = evento
    //acessar o mapa de funções na posição type e chamar a função resultante entregando a ela, como parametro, o payload
    funcoes[type](payload)
  }
  catch(e){}
})

const port = 6000
app.listen(port, () => { console.log (`Consulta. Porta ${port}.`)})