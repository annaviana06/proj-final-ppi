const express = require('express');
const db = require('../utils/db'); // Conexão com o banco de dados
const router = express.Router();

// Rota para buscar todos os eventos
router.get('/', (req, res) => {
  const query = 'SELECT * FROM eventos';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar os eventos:', err);
      return res.status(500).json({ error: 'Erro no servidor ao buscar os eventos' });
    }

    // Retorna os eventos em formato JSON
    res.status(200).json(results);
  });
});

module.exports = router;
