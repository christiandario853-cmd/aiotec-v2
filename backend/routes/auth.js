// =====================================================
// AioTec - Rutas Auth (usa nuevos nombres de columnas)
// POST /api/auth/registro
// POST /api/auth/login
// =====================================================
const express = require('express');
const bcrypt  = require('bcryptjs');
const router  = express.Router();
const db      = require('../config/database');

router.post('/registro', async (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password)
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Contraseña mínimo 6 caracteres.' });
  try {
    const [existe] = await db.query('SELECT codigo_usuario FROM usuarios WHERE correo = ?', [email]);
    if (existe.length) return res.status(409).json({ error: 'El correo ya está registrado.' });
    const hash = await bcrypt.hash(password, 10);
    const [r]  = await db.query(
      'INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?,?,?)',
      [nombre, email, hash]
    );
    res.status(201).json({ mensaje: 'Usuario registrado.', usuario: { id: r.insertId, nombre, email } });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Error interno.' }); }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña obligatorios.' });
  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Credenciales incorrectas.' });
    const ok = await bcrypt.compare(password, rows[0].contrasena);
    if (!ok)  return res.status(401).json({ error: 'Credenciales incorrectas.' });
    const { contrasena, ...u } = rows[0];
    // Normalizar para el frontend: exponer como id y email
    res.json({ mensaje: 'Login exitoso.', usuario: { ...u, id: u.codigo_usuario, email: u.correo } });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Error interno.' }); }
});

module.exports = router;
