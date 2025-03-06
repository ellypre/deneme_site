<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Komut Listesi</h1>
    <input v-model="searchQuery" placeholder="Komut ara..." class="p-2 border rounded w-full mb-4" />

    <ul>
      <li v-for="command in filteredCommands" :key="command._id" class="p-4 border-b">
        <strong>{{ command.name }}</strong> - {{ command.description }}
      </li>
    </ul>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      commands: [],
      searchQuery: "",
    };
  },
  computed: {
    filteredCommands() {
      return this.commands.filter(command => command.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
    }
  },
  mounted() {
    axios.get("http://localhost:5000/commands")
      .then(response => {
        this.commands = response.data;
      })
      .catch(error => console.error(error));
  }
};
</script>
