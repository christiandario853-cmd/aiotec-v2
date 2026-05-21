// AioTec - Configuración MySQL (sin cambios de conexión)
const mysql = require('mysql2');
const pool = mysql.createPool({
  host    : process.env.DB_HOST     || 'localhost',
  user    : process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '360789010',
  database: process.env.DB_NAME     || 'aiotec_db',
  waitForConnections: true,
  connectionLimit   : 10,
  queueLimit        : 0,
});
pool.getConnection((err, conn) => {
  if (err) { console.error('❌ Error MySQL:', err.message); }
  else     { console.log('✅ Conectado a MySQL'); conn.release(); }
});
module.exports = pool.promise();
