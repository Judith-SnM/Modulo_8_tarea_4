import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import { results as agentCredentials } from './data/agentes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const agent = agentCredentials.find(agent => agent.email === email && agent.password === password);
    if (!agent) {
        return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
    const token = jwt.sign({ email: agent.email }, 'secreto', { expiresIn: '2m' });
    res.json({ token });
});

app.get('/dashboard', (req, res) => {
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    if (!token) {
        return res.redirect('/');
    }
    try {
        const decoded = jwt.verify(token, 'secreto');
        res.send(`<h1>Bienvenido, ${decoded.email}</h1>`);
    } catch (error) {
        res.status(401).send('Token inválido o expirado');
    }
});

app.get('/restricted', (req, res) => {
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }
    try {
        const decoded = jwt.verify(token, 'secreto');
        res.send(`<h1>Bienvenido a la página restringida, ${decoded.email}</h1>`);
    } catch (error) {
        res.status(401).json({ message: 'Token inválido o expirado' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
