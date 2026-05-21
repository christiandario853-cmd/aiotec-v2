// =====================================================
// AioTec - Rutas Productos (nuevos nombres de columnas)
// GET  /api/productos
// GET  /api/productos/:id
// POST /api/productos
// =====================================================
const express = require('express');
const router  = express.Router();
const db      = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const { categoria, buscar } = req.query;
    let sql  = `SELECT p.*, c.nombre_categoria AS categoria
                FROM productos p
                LEFT JOIN categorias c ON c.codigo_categoria = p.codigo_categoria
                WHERE 1=1`;
    const args = [];
    if (categoria) { sql += ' AND c.nombre_categoria = ?'; args.push(categoria); }
    if (buscar)    { sql += ' AND (p.nombre_producto LIKE ? OR p.descripcion LIKE ?)'; args.push(`%${buscar}%`, `%${buscar}%`); }
    sql += ' ORDER BY p.codigo_producto DESC';
    const [rows] = await db.query(sql, args);
    // Normalizar campos para el frontend existente
    const productos = rows.map(p => ({
      ...p,
      id    : p.codigo_producto,
      nombre: p.nombre_producto,
    }));
    res.json(productos);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Error al obtener productos.' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, c.nombre_categoria AS categoria FROM productos p
       LEFT JOIN categorias c ON c.codigo_categoria = p.codigo_categoria
       WHERE p.codigo_producto = ?`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado.' });
    const p = rows[0];
    res.json({ ...p, id: p.codigo_producto, nombre: p.nombre_producto });
  } catch (e) { res.status(500).json({ error: 'Error interno.' }); }
});

router.post('/', async (req, res) => {
  const { nombre, descripcion, precio, categoria, emoji, stock } = req.body;
  if (!nombre || !precio) return res.status(400).json({ error: 'Nombre y precio obligatorios.' });
  try {
    let codigoCat = null;
    if (categoria) {
      const [cat] = await db.query('SELECT codigo_categoria FROM categorias WHERE nombre_categoria = ?', [categoria]);
      codigoCat = cat.length ? cat[0].codigo_categoria : null;
    }
    const [r] = await db.query(
      'INSERT INTO productos (nombre_producto, descripcion, precio, stock, emoji, codigo_categoria) VALUES (?,?,?,?,?,?)',
      [nombre, descripcion||'', precio, stock||0, emoji||'📦', codigoCat]
    );
    res.status(201).json({ mensaje: 'Producto creado.', id: r.insertId });
  } catch (e) { res.status(500).json({ error: 'Error interno.' }); }
});

module.exports = router;
