// AioTec v3 - Servidor principal
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/productos',    require('./routes/productos'));
app.use('/api/compras',      require('./routes/compras'));
app.use('/api/estadisticas', require('./routes/estadisticas'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 AioTec v3 corriendo en http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/pages/dashboard.html\n`);
});
