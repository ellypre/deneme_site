const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Frontend ile backend arasındaki CORS problemini çözmek için
app.use(express.json()); // JSON verilerini işleyebilmek için

// Basit bir endpoint
app.get('/api', (req, res) => {
  res.json({ message: 'Merhaba, Vue.js ile Node.js API bağlantısı başarılı!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server http://localhost:${PORT} üzerinde çalışıyor.`);
});
