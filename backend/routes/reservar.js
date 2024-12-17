const express = require('express');
const db = require('../utils/db'); // Importa a conexão com o banco de dados
const router = express.Router();

router.post('/', (req, res) => {
  const { id_evento, cpf_usuario, num_reservas } = req.body;

  // Insere a reserva diretamente na tabela eventos_usuario
  const cmdInsereReserva = 'INSERT INTO eventos_usuario (id_evento, cpf_usuario, num_reservas) VALUES (?, ?, ?)';
  db.query(cmdInsereReserva, [id_evento, cpf_usuario, num_reservas], (err) => {
    if (err) {
      console.error('Erro ao inserir reserva:', err);
      return res.status(500).json({ error: 'Erro ao fazer reserva' });
    }

    return res.status(200).json({ message: 'Reserva realizada com sucesso!' });
  });
});


router.post('/soma', (req, res) => {
  const { cpf_usuario } = req.body;  // Pega o CPF do usuário do corpo da requisição
  
    // Consulta SQL para somar os num_reservas para o cpf_usuario, agrupado por id_evento
    const query = `
        SELECT 
            e.id_evento, 
            e.nome, 
            SUM(eu.num_reservas) AS total_reservas
        FROM 
            eventos_usuario eu
        INNER JOIN 
            eventos e ON e.id_evento = eu.id_evento
        WHERE 
            eu.cpf_usuario = ?
        GROUP BY 
            e.id_evento, e.nome;
    `;
  
    db.query(query, [cpf_usuario], (err, results) => {
      if (err) {
        console.error('Erro ao consultar o banco:', err);
        return res.status(500).json({ error: 'Erro no servidor ao calcular a soma das reservas' });
      }
  
      // Verifica se encontrou resultados
      if (results.length > 0) {
        return res.status(200).json(results);  // Retorna um array com reservas por evento
      } else {
        return res.status(404).json({ error: 'Nenhuma reserva encontrada para este CPF' });
      }
    });
  });


  router.delete('/deletar', (req, res) => {
    const { cpf_usuario, id_evento } = req.body;

    console.log('Deletando reservas para cpf_usuario:', cpf_usuario, 'id_evento:', id_evento);
  
    // Deleta todas as reservas do CPF para o evento
    db.query('DELETE FROM eventos_usuario WHERE cpf_usuario = ? AND id_evento = ?', [cpf_usuario, id_evento], (err, result) => {
      if (err) {
        console.error('Erro ao deletar reservas:', err);
        return res.status(500).send('Erro ao deletar reservas');
      }
  
      console.log('Reservas deletadas com sucesso:', result);
      res.status(200).send('Reservas deletadas com sucesso');
    });
  });

  


module.exports = router;
