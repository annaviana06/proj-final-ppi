const mysql = require('mysql');

// Configuração do banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Adicione sua senha do MySQL aqui
  database: 'eventos(1)'
});

// Conectando ao banco de dados
db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    process.exit(1); // Finaliza o processo em caso de erro
  } else {
    console.log('Conectado ao banco de dados!');
  }
});

module.exports = db;
