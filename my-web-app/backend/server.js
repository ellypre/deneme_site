require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Bağlantısı
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Bağlandı"))
    .catch(err => console.log("❌ MongoDB Bağlantı Hatası:", err));

// ✅ Ana Sayfa Endpoint'i
app.get("/", (req, res) => {
    res.send("Merhaba! Backend çalışıyor.");
});

// ✅ Komut Şema Tanımlama
const CommandSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    notes: String,
    vendors: Array
}, { timestamps: true });

const Command = mongoose.model("Command", CommandSchema);

// ✅ Tüm Komutları Getir
app.get("/commands", async (req, res) => {
    try {
        const commands = await Command.find();
        res.json(commands);
    } catch (err) {
        res.status(500).json({ error: "Verileri çekerken hata oluştu", details: err.message });
    }
});

// ✅ Yeni Komut Ekle
app.post("/commands", async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || !description) {
            return res.status(400).json({ error: "Lütfen tüm alanları doldurun." });
        }

        const newCommand = new Command(req.body);
        await newCommand.save();
        res.status(201).json({ message: "Komut başarıyla eklendi", command: newCommand });
    } catch (err) {
        res.status(500).json({ error: "Komut eklenirken hata oluştu", details: err.message });
    }
});

// ✅ Komut Güncelleme
app.put("/commands/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Geçersiz komut ID" });
        }

        const updatedCommand = await Command.findByIdAndUpdate(
            new mongoose.Types.ObjectId(req.params.id),  // 🔹 ObjectId olarak dönüştürdük
            { $set: req.body },  
            { new: true, runValidators: true }
        );

        if (!updatedCommand) {
            return res.status(404).json({ error: "Güncellenecek komut bulunamadı." });
        }

        res.json({ message: "Komut başarıyla güncellendi", updatedCommand });
    } catch (err) {
        res.status(500).json({ error: "Komut güncellenirken hata oluştu", details: err.message });
    }
});

// ✅ Komut Silme
app.delete("/commands/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Geçersiz komut ID" });
        }

        const deletedCommand = await Command.findByIdAndDelete(new mongoose.Types.ObjectId(req.params.id));
        if (!deletedCommand) {
            return res.status(404).json({ error: "Silinecek komut bulunamadı." });
        }

        res.json({ message: "Komut başarıyla silindi" });
    } catch (err) {
        res.status(500).json({ error: "Komut silinirken hata oluştu", details: err.message });
    }
});

// ✅ Server Başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server ${PORT} portunda çalışıyor...`));
