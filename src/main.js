import { createApp } from 'vue';
import App from './App.vue';
import { ModuleRegistry, AllEnterpriseModule } from 'ag-grid-enterprise';

// Регистрируем все Enterprise модули
ModuleRegistry.registerModules([AllEnterpriseModule]);

createApp(App).mount('#app');
