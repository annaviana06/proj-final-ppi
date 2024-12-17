const express = require('express');
const db = require('../utils/db'); // Conexão com o banco de dados
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto'); // Para gerar o código de verificação


const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: 'rickson280806@gmail.com', // Substitua pelo seu e-mail
        pass: 'vjhgqamsrspgnklj' // Substitua pela sua senha do e-mail
    }
});

// Função para gerar o código de verificação (6 caracteres)
function gerarCodigo() {
    return crypto.randomBytes(3).toString('hex'); // 6 caracteres
}

router.post('/cadastrar', (req, res) => {
    const { username, password, cpf, email } = req.body;

    // Verifica se algum dado obrigatório está faltando
    if (!username || !password || !cpf || !email) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios!' });
    }

    // Verifica se o usuário ou email já existem no banco
    const checkUserQuery = 'SELECT * FROM tb_usuarios WHERE username = ? OR email = ?';
    db.query(checkUserQuery, [username, email], (err, results) => {
        if (err) {
            console.error('Erro ao verificar usuário:', err);
            return res.status(500).json({ message: 'Erro ao verificar usuário.' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Usuário ou email já cadastrado!' });
        }
        
        // Gera o código de verificação
        const verificationCode = gerarCodigo();

        // Insere o novo usuário no banco de dados, agora incluindo o código de verificação
        const insertUserQuery = 'INSERT INTO tb_usuarios (username, password, cpf, email, codigo, is_autenticado) VALUES (?, ?, ?, ?, ?, 0)';
        db.query(insertUserQuery, [username, password, cpf, email, verificationCode], (err, results) => {
            if (err) {
                console.error('Erro ao cadastrar usuário:', err);
                return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
            }

            // Envia o código de verificação para o e-mail do usuário
            const mailOptions = {
                from: 'rickson280806@gmail.com',
                to: email,
                subject: 'Confirmação de Registro',
                html: `
                    <h1>Bem-vindo(a), ${username}!</h1>
                    <p>Obrigado por se registrar. Aqui está seu código de verificação:</p>
                    <h2>${verificationCode}</h2>
                    <p>Use este código para validar sua conta no sistema.</p>
                `
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error('Erro ao enviar e-mail:', err);
                    return res.status(500).json({ message: 'Erro ao enviar código de verificação.' });
                }
                console.log('E-mail enviado:', info.response);
                
                // Resposta de sucesso com o ID do novo usuário
                res.status(201).json({ message: 'Usuário cadastrado com sucesso!', id: results.insertId });
            });
        });
    });
});

router.post('/validar-codigo', (req, res) => {
    const { email, codigo } = req.body;

    // Verifica se os campos email e código foram enviados
    if (!email || !codigo) {
        return res.status(400).json({ message: 'E-mail e código são obrigatórios!' });
    }

    // Verifica se o código fornecido é válido para o e-mail informado
    const checkCodeQuery = 'SELECT * FROM tb_usuarios WHERE email = ? AND codigo = ?';
    db.query(checkCodeQuery, [email, codigo], (err, results) => {
        if (err) {
            console.error('Erro ao validar código:', err);
            return res.status(500).json({ message: 'Erro ao validar código.' });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Código de verificação inválido ou e-mail incorreto.' });
        }

        // Se o código for válido, atualiza o campo is_autenticado para 1
        const updateQuery = 'UPDATE tb_usuarios SET is_autenticado = 1 WHERE email = ?';
        db.query(updateQuery, [email], (err, results) => {
            if (err) {
                console.error('Erro ao atualizar status de verificação do e-mail:', err);
                return res.status(500).json({ message: 'Erro ao atualizar status de verificação do e-mail.' });
            }

            res.status(200).json({ message: 'E-mail verificado com sucesso!' });
        });
    });
});

module.exports = router;
