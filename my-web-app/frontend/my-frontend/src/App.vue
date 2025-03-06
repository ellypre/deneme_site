<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center p-6">
    <div class="w-full max-w-5xl bg-white shadow-md rounded-lg p-6">
      <h1 class="text-3xl font-bold text-center mb-6 text-gray-800">Cihazlar Arası Komut Karşılaştırma</h1>
      
      <!-- Arama ve Filtreleme Alanı -->
      <div class="flex justify-between items-center mb-4">
        <input v-model="searchQuery" placeholder="Komut ara..." class="w-1/2 p-3 border rounded-lg shadow-sm" />
        <select v-model="selectedVendor" class="p-3 border rounded-lg shadow-sm">
          <option value="">Tüm Cihazlar</option>
          <option v-for="vendor in vendors" :key="vendor" :value="vendor">{{ vendor }}</option>
        </select>
      </div>

      <!-- Komut Listesi Tablosu -->
      <table class="w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-200">
            <th class="p-3 border">Komut Adı</th>
            <th class="p-3 border">Açıklama</th>
            <th class="p-3 border">Cihaz</th>
            <th class="p-3 border">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="command in filteredCommands" :key="command._id" class="bg-white border-b">
            <td class="p-3 border">{{ command.name }}</td>
            <td class="p-3 border">{{ command.description }}</td>
            <td class="p-3 border">{{ command.vendors.map(v => v.vendor).join(", ") }}</td>
            <td class="p-3 border flex space-x-2">
              <button @click="editCommand(command)" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Düzenle</button>
              <button @click="deleteCommand(command._id)" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Sil</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Yeni Komut Ekle / Düzenleme Formu -->
      <div class="mt-6 p-6 border rounded-lg bg-white shadow-md">
        <h2 class="text-2xl font-bold mb-3 text-gray-800">{{ isEditing ? "Komut Düzenle" : "Yeni Komut Ekle" }}</h2>
        <input v-model="newCommand.name" placeholder="Komut Adı" class="w-full p-3 border rounded-lg mb-3 shadow-sm" />
        <textarea v-model="newCommand.description" placeholder="Açıklama" class="w-full p-3 border rounded-lg mb-3 shadow-sm"></textarea>
        <input v-model="newCommand.vendorsString" placeholder="Cihaz Adı (Virgülle Ayır)" class="w-full p-3 border rounded-lg mb-3 shadow-sm" />
        <div class="flex space-x-2">
          <button @click="saveCommand" class="px-5 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
            {{ isEditing ? "Güncelle" : "Ekle" }}
          </button>
          <button v-if="isEditing" @click="resetForm" class="px-5 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition">İptal</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      commands: [],
      searchQuery: "",
      selectedVendor: "",
      newCommand: { name: "", description: "", vendorsString: "" },
      isEditing: false,
      editingId: null
    };
  },
  computed: {
    vendors() {
      return [...new Set(this.commands.flatMap(cmd => cmd.vendors.map(v => v.vendor)))];
    },
    filteredCommands() {
      return this.commands.filter(command => 
        command.name.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
        (this.selectedVendor === "" || command.vendors.some(v => v.vendor === this.selectedVendor))
      );
    }
  },
  methods: {
    async fetchCommands() {
      try {
        const response = await axios.get("http://localhost:5000/commands");
        this.commands = response.data;
      } catch (error) {
        console.error("API Hatası:", error);
      }
    },
    async saveCommand() {
      if (!this.newCommand.name || !this.newCommand.description) {
        alert("Lütfen tüm alanları doldurun.");
        return;
      }
      this.newCommand.vendors = this.newCommand.vendorsString.split(",").map(v => ({ vendor: v.trim() }));
      try {
        if (this.isEditing) {
          await axios.put(`http://localhost:5000/commands/${this.editingId}`, this.newCommand);
        } else {
          const response = await axios.post("http://localhost:5000/commands", this.newCommand);
          this.commands.push(response.data.command);
        }
        this.resetForm();
        this.fetchCommands();
      } catch (error) {
        console.error("Komut kaydetme hatası:", error);
      }
    },
    async deleteCommand(commandId) {
      if (!confirm("Bu komutu silmek istediğinizden emin misiniz?")) return;
      try {
        await axios.delete(`http://localhost:5000/commands/${commandId}`);
        this.commands = this.commands.filter(cmd => cmd._id !== commandId);
      } catch (error) {
        console.error("Komut silme hatası:", error);
      }
    },
    editCommand(command) {
      this.newCommand = { 
        name: command.name, 
        description: command.description, 
        vendorsString: command.vendors.map(v => v.vendor).join(", ") 
      };
      this.isEditing = true;
      this.editingId = command._id;
    },
    resetForm() {
      this.newCommand = { name: "", description: "", vendorsString: "" };
      this.isEditing = false;
      this.editingId = null;
    }
  },
  mounted() {
    this.fetchCommands();
  }
};
</script>

<style>
body {
  font-family: 'Arial', sans-serif;
  background-color: #f4f4f4;
}
</style>