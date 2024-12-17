const express = require('express');
const db = require('../utils/db'); // Importa a conexão com o banco de dados
const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const cmd = 'SELECT * FROM tb_usuarios WHERE email = ? AND password = ?';
  db.query(cmd, [email, password], (err, results) => {
    if (err) {
      console.error('Erro na consulta ao banco:', err);
      return res.status(500).json({ error: 'Erro no servidor' });
    }

    if (results.length > 0) {
      const user = results[0]; // Armazena o primeiro resultado, que é o usuário encontrado
      return res.status(200).json({
        message: 'Login realizado com sucesso!',
        user: {
          id: user.id_usuario, // Corrigido para o campo correto
          username: user.username,
          cpf: user.cpf,
          email: user.email
        }
      });
    } else {
      return res.status(401).json({ error: 'Usuário ou senha inválidos!' });
    }
  });
});

module.exports = router;
