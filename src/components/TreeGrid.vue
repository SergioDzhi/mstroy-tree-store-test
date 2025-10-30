<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import type { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { TreeStore } from '@/services/TreeStore';
import type { TreeItem } from '@/types/TreeItem';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const items: TreeItem[] = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cee', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cee', label: 'Айтем 4' },
  { id: 5, parent: '91064cee', label: 'Айтем 5' },
  { id: 6, parent: '91064cee', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' }
];

const store = new TreeStore(items);
const rowData = ref<any[]>([]);
const gridApi = ref<GridApi | null>(null);

const prepareDataForGrid = () => {
  const data = store.getAll().map((item) => {
    const children = store.getChildren(item.id);
    const hasChildren = children.length > 0;
    
    const parents = store.getAllParents(item.id);
    const hierarchy = parents.reverse().map(p => p.label);
    
    return {
      id: item.id,
      parent: item.parent,
      label: item.label,
      category: hasChildren ? 'Группа' : 'Элемент',
      hasChildren: hasChildren,
      orgHierarchy: hierarchy
    };
  });
  

  rowData.value = data;
};

// Колонки таблицы
const columnDefs = ref<ColDef[]>([
  {
    headerName: '№ п/п',
    valueGetter: 'node.rowIndex + 1',
    width: 100,
    cellStyle: { textAlign: 'center' },
    pinned: 'left' // Закрепляем слева
  },
  {
    headerName: 'наименование',
    field: 'label',
    flex: 1
  }
]);

const defaultColDef = ref<ColDef>({
  sortable: false,
  filter: false,
  resizable: true
});

const autoGroupColumnDef = ref<ColDef>({
  headerName: 'категория',
  field: 'category',
  minWidth: 250,
  pinned: null, // Между № п/п и наименованием
  cellRendererParams: {
    suppressCount: true,
    innerRenderer: (params: any) => {
      return params.data ? params.data.category : '';
    }
  }
});

const getDataPath = (data: any) => {
  return data.orgHierarchy;
};

const onGridReady = (params: GridReadyEvent) => {
  gridApi.value = params.api;
  prepareDataForGrid();
  
  setTimeout(() => {
    params.api.expandAll();
  }, 100);
};

const newItem = ref({ id: '', parent: '', label: '' });
const updateItemData = ref({ id: '', parent: '', label: '' });
const removeId = ref('');

const handleAddItem = () => {
  if (!newItem.value.id || !newItem.value.label) {
    alert('Заполните ID и Label');
    return;
  }
  
  const item: TreeItem = {
    id: newItem.value.id,
    parent: newItem.value.parent || null,
    label: newItem.value.label
  };
  
  store.addItem(item);
  prepareDataForGrid();
  newItem.value = { id: '', parent: '', label: '' };
  
  setTimeout(() => {
    gridApi.value?.expandAll();
  }, 100);
};

const handleUpdateItem = () => {
  if (!updateItemData.value.id || !updateItemData.value.label) {
    alert('Заполните ID и Label');
    return;
  }
  
  const item: TreeItem = {
    id: updateItemData.value.id,
    parent: updateItemData.value.parent || null,
    label: updateItemData.value.label
  };
  
  store.updateItem(item);
  prepareDataForGrid();
  updateItemData.value = { id: '', parent: '', label: '' };
  
  setTimeout(() => {
    gridApi.value?.expandAll();
  }, 100);
};

const handleRemoveItem = () => {
  if (!removeId.value) {
    alert('Укажите ID для удаления');
    return;
  }
  
  store.removeItem(removeId.value);
  prepareDataForGrid();
  removeId.value = '';
  
  setTimeout(() => {
    gridApi.value?.expandAll();
  }, 100);
};

onMounted(() => {
  prepareDataForGrid();
});
</script>

<template>
  <div class="tree-grid-container">
    <div class="header">
      <h2>Пример отображения в полностью развернутом виде:</h2>
      <div class="mode-toggle">
        <span class="mode-label">Режим: просмотр</span>
      </div>
    </div>
    
    <div class="grid-wrapper">
     <ag-grid-vue
  style="width: 100%; height: 500px;"
  class="ag-theme-alpine"
  :columnDefs="columnDefs"
  :rowData="rowData"
  :defaultColDef="defaultColDef"
  :treeData="true"
  :animateRows="true"
  :groupDefaultExpanded="-1"
  :getDataPath="getDataPath"
  :autoGroupColumnDef="autoGroupColumnDef"
  :suppressMakeColumnVisibleAfterUnGroup="true"
  @grid-ready="onGridReady"
/>
    </div>
    
    <div class="controls-panel">
      <div class="control-group">
        <h3>Добавить элемент</h3>
        <div class="input-row">
          <input v-model="newItem.id" placeholder="ID" />
          <input v-model="newItem.parent" placeholder="Parent ID" />
        </div>
        <input v-model="newItem.label" placeholder="Название" />
        <button class="add-btn" @click="handleAddItem">Добавить</button>
      </div>
      
      <div class="control-group">
        <h3>Обновить элемент</h3>
        <div class="input-row">
          <input v-model="updateItemData.id" placeholder="ID" />
          <input v-model="updateItemData.parent" placeholder="Parent ID" />
        </div>
        <input v-model="updateItemData.label" placeholder="Название" />
        <button class="update-btn" @click="handleUpdateItem">Обновить</button>
      </div>
      
      <div class="control-group">
        <h3>Удалить элемент</h3>
        <input v-model="removeId" placeholder="ID элемента" class="full-width" />
        <button class="delete-btn" @click="handleRemoveItem">Удалить</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tree-grid-container {
  padding: 20px;
  max-width: 100%;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
}

.header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 400;
  color: #333;
}

.mode-toggle {
  display: flex;
  align-items: center;
}

.mode-label {
  font-size: 14px;
  color: #0066cc;
  cursor: pointer;
}

.grid-wrapper {
  background: #e8e8e8;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 30px;
}

.controls-panel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 0 20px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.control-group h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.control-group input {
  padding: 12px 14px;
  border: 1px solid #d5d5d5;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  background: #f9f9f9;
}

.control-group input:focus {
  outline: none;
  border-color: #4CAF50;
  background: white;
}

.control-group input.full-width {
  width: 100%;
}

.control-group button {
  padding: 14px;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  margin-top: 4px;
}

.add-btn {
  background-color: #4CAF50;
}

.add-btn:hover {
  background-color: #45a049;
}

.update-btn {
  background-color: #26a69a;
}

.update-btn:hover {
  background-color: #2bbbad;
}

.delete-btn {
  background-color: #ef5350;
}

.delete-btn:hover {
  background-color: #e53935;
}

:deep(.ag-theme-alpine) {
  --ag-borders: solid 1px #ddd;
  --ag-row-border-color: #e8e8e8;
  --ag-header-background-color: #fafafa;
  --ag-odd-row-background-color: #f9f9f9;
}

:deep(.ag-header) {
  border-bottom: 2px solid #ddd;
}

:deep(.ag-header-cell) {
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  color: #555;
}

:deep(.ag-cell) {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
}

:deep(.ag-row:hover) {
  background-color: #f0f8ff !important;
}

@media (max-width: 1200px) {
  .controls-panel {
    grid-template-columns: 1fr;
  }
}
</style>
