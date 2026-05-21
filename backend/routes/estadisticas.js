// =====================================================
// AioTec - Ruta Estadísticas Admin
// GET /api/estadisticas
// =====================================================
const express = require('express');
const router  = express.Router();
const db      = require('../config/database');

router.get('/', async (req, res) => {
  try {
    // Total de ingresos y número de compras
    const [[resumen]] = await db.query(`
      SELECT
        COUNT(codigo_compra)     AS total_compras,
        COALESCE(SUM(subtotal),0)     AS total_subtotal,
        COALESCE(SUM(iva),0)          AS total_iva,
        COALESCE(SUM(total_compra),0) AS total_ingresos
      FROM compras
    `);

    // Total de productos vendidos (unidades)
    const [[unidades]] = await db.query(`
      SELECT COALESCE(SUM(cantidad),0) AS unidades_vendidas FROM detalle_compra
    `);

    // Ingresos HOY
    const [[hoy]] = await db.query(`
      SELECT COALESCE(SUM(total_compra),0) AS ingresos_hoy
      FROM compras WHERE DATE(fecha_compra) = CURDATE()
    `);

    // Ingresos esta SEMANA
    const [[semana]] = await db.query(`
      SELECT COALESCE(SUM(total_compra),0) AS ingresos_semana
      FROM compras WHERE YEARWEEK(fecha_compra, 1) = YEARWEEK(CURDATE(), 1)
    `);

    // Ingresos este MES
    const [[mes]] = await db.query(`
      SELECT COALESCE(SUM(total_compra),0) AS ingresos_mes
      FROM compras
      WHERE MONTH(fecha_compra) = MONTH(CURDATE())
        AND YEAR(fecha_compra)  = YEAR(CURDATE())
    `);

    // Producto más vendido
    const [topProducto] = await db.query(`
      SELECT p.nombre_producto, p.emoji,
             SUM(dc.cantidad) AS total_vendido
      FROM detalle_compra dc
      JOIN productos p ON p.codigo_producto = dc.codigo_producto
      GROUP BY dc.codigo_producto
      ORDER BY total_vendido DESC
      LIMIT 1
    `);

    // Total de usuarios registrados
    const [[usuarios]] = await db.query(`SELECT COUNT(*) AS total_usuarios FROM usuarios`);

    // Ventas de los últimos 7 días (para gráfico)
    const [ventasDiarias] = await db.query(`
      SELECT
        DATE_FORMAT(fecha_compra, '%d/%m') AS dia,
        COALESCE(SUM(total_compra),0)      AS total
      FROM compras
      WHERE fecha_compra >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(fecha_compra)
      ORDER BY DATE(fecha_compra) ASC
    `);

    res.json({
      resumen: {
        total_compras    : resumen.total_compras,
        total_subtotal   : parseFloat(resumen.total_subtotal),
        total_iva        : parseFloat(resumen.total_iva),
        total_ingresos   : parseFloat(resumen.total_ingresos),
        unidades_vendidas: unidades.unidades_vendidas,
        total_usuarios   : usuarios.total_usuarios,
      },
      periodos: {
        ingresos_hoy    : parseFloat(hoy.ingresos_hoy),
        ingresos_semana : parseFloat(semana.ingresos_semana),
        ingresos_mes    : parseFloat(mes.ingresos_mes),
      },
      top_producto  : topProducto[0] || null,
      ventas_diarias: ventasDiarias,
    });
  } catch (e) {
    console.error('Error estadísticas:', e);
    res.status(500).json({ error: 'Error al obtener estadísticas.' });
  }
});

module.exports = router;
