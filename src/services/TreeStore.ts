import type { TreeItem } from '@/types/TreeItem';

export class TreeStore {
  private items: TreeItem[];
  private itemsMap: Map<number | string, TreeItem>;
  private childrenMap: Map<number | string | null, (number | string)[]>;

  constructor(items: TreeItem[]) {
    this.items = items;
    this.itemsMap = new Map();
    this.childrenMap = new Map();
    
    // Один проход для индексации - O(n)
    items.forEach(item => {
      this.itemsMap.set(item.id, item);
      
      if (!this.childrenMap.has(item.parent)) {
        this.childrenMap.set(item.parent, []);
      }
      this.childrenMap.get(item.parent)!.push(item.id);
    });
  }

  // O(1)
  getAll(): TreeItem[] {
    return this.items;
  }

  // O(1)
  getItem(id: number | string): TreeItem | undefined {
    return this.itemsMap.get(id);
  }

  // O(1) - прямые дети
  getChildren(id: number | string): TreeItem[] {
    const childrenIds = this.childrenMap.get(id) || [];
    return childrenIds.map(childId => this.itemsMap.get(childId)!);
  }

  // O(k) где k - количество всех потомков
  getAllChildren(id: number | string): TreeItem[] {
    const result: TreeItem[] = [];
    const queue: (number | string)[] = [id];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = this.childrenMap.get(currentId) || [];
      
      children.forEach(childId => {
        const child = this.itemsMap.get(childId);
        if (child) {
          result.push(child);
          queue.push(childId);
        }
      });
    }
    
    return result;
  }

  // O(h) где h - высота дерева (глубина элемента)
  getAllParents(id: number | string): TreeItem[] {
    const result: TreeItem[] = [];
    let currentItem = this.itemsMap.get(id);
    
    while (currentItem) {
      result.push(currentItem);
      if (currentItem.parent === null) break;
      currentItem = this.itemsMap.get(currentItem.parent);
    }
    
    return result;
  }

  // O(1)
  addItem(item: TreeItem): void {
    this.items.push(item);
    this.itemsMap.set(item.id, item);
    
    if (!this.childrenMap.has(item.parent)) {
      this.childrenMap.set(item.parent, []);
    }
    this.childrenMap.get(item.parent)!.push(item.id);
  }

  // O(k) где k - количество удаляемых элементов
  removeItem(id: number | string): void {
    const item = this.itemsMap.get(id);
    if (!item) return;
    
    // Получаем все элементы для удаления (сам элемент + все дочерние)
    const toRemove = [item, ...this.getAllChildren(id)];
    
    toRemove.forEach(itemToRemove => {
      // Удаляем из основного массива
      const index = this.items.findIndex(i => i.id === itemToRemove.id);
      if (index !== -1) {
        this.items.splice(index, 1);
      }
      
      // Удаляем из Map
      this.itemsMap.delete(itemToRemove.id);
      
      // Удаляем из childrenMap родителя
      if (itemToRemove.parent !== null) {
        const siblings = this.childrenMap.get(itemToRemove.parent);
        if (siblings) {
          const siblingIndex = siblings.indexOf(itemToRemove.id);
          if (siblingIndex !== -1) {
            siblings.splice(siblingIndex, 1);
          }
        }
      }
      
      // Удаляем собственные дочерние связи
      this.childrenMap.delete(itemToRemove.id);
    });
  }

  // O(1)
  updateItem(item: TreeItem): void {
    const existingItem = this.itemsMap.get(item.id);
    if (!existingItem) return;
    
    // Если parent изменился, обновляем childrenMap
    if (existingItem.parent !== item.parent) {
      // Удаляем из старого родителя
      if (existingItem.parent !== null) {
        const oldSiblings = this.childrenMap.get(existingItem.parent);
        if (oldSiblings) {
          const index = oldSiblings.indexOf(item.id);
          if (index !== -1) {
            oldSiblings.splice(index, 1);
          }
        }
      }
      
      // Добавляем к новому родителю
      if (!this.childrenMap.has(item.parent)) {
        this.childrenMap.set(item.parent, []);
      }
      this.childrenMap.get(item.parent)!.push(item.id);
    }
    
    // Обновляем в массиве
    const index = this.items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      this.items[index] = item;
    }
    
    // Обновляем в Map
    this.itemsMap.set(item.id, item);
  }
}
