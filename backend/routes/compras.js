// =====================================================
// AioTec - Rutas Compras (con IVA y nuevos nombres)
// POST /api/compras
// GET  /api/compras/:usuarioId
// =====================================================
const express = require('express');
const router  = express.Router();
const db      = require('../config/database');

const IVA_PORCENTAJE = 0.15; // 15% IVA Ecuador

router.post('/', async (req, res) => {
  const { usuario_id, productos, total } = req.body;
  if (!usuario_id || !productos?.length)
    return res.status(400).json({ error: 'Datos de compra incompletos.' });
  try {
    const subtotal    = productos.reduce((s, i) => s + i.precio * i.qty, 0);
    const iva         = parseFloat((subtotal * IVA_PORCENTAJE).toFixed(2));
    const total_compra = parseFloat((subtotal + iva).toFixed(2));

    const [compra] = await db.query(
      'INSERT INTO compras (codigo_usuario, subtotal, iva, total_compra) VALUES (?,?,?,?)',
      [usuario_id, subtotal, iva, total_compra]
    );
    const codigo_compra = compra.insertId;

    for (const item of productos) {
      const subtotalItem = parseFloat((item.precio * item.qty).toFixed(2));
      await db.query(
        'INSERT INTO detalle_compra (codigo_compra, codigo_producto, cantidad, precio_unitario, subtotal) VALUES (?,?,?,?,?)',
        [codigo_compra, item.id || item.codigo_producto, item.qty, item.precio, subtotalItem]
      );
    }

    res.status(201).json({
      mensaje      : 'Compra registrada correctamente.',
      codigo_compra,
      subtotal,
      iva,
      total_compra,
    });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Error al registrar la compra.' }); }
});

router.get('/:usuarioId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.codigo_compra, c.subtotal, c.iva, c.total_compra, c.fecha_compra,
              GROUP_CONCAT(p.nombre_producto SEPARATOR ', ') AS productos
       FROM compras c
       LEFT JOIN detalle_compra dc ON dc.codigo_compra = c.codigo_compra
       LEFT JOIN productos p       ON p.codigo_producto = dc.codigo_producto
       WHERE c.codigo_usuario = ?
       GROUP BY c.codigo_compra
       ORDER BY c.fecha_compra DESC`,
      [req.params.usuarioId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Error interno.' }); }
});

module.exports = router;
