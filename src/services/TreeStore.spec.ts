import { describe, it, expect, beforeEach } from 'vitest';
import { TreeStore } from './TreeStore';
import type { TreeItem } from '@/types/TreeItem';

describe('TreeStore', () => {
  let items: TreeItem[];
  let store: TreeStore;

  beforeEach(() => {
    items = [
      { id: 1, parent: null, label: 'Айтем 1' },
      { id: '91064cee', parent: 1, label: 'Айтем 2' },
      { id: 3, parent: 1, label: 'Айтем 3' },
      { id: 4, parent: '91064cee', label: 'Айтем 4' },
      { id: 5, parent: '91064cee', label: 'Айтем 5' },
      { id: 6, parent: '91064cee', label: 'Айтем 6' },
      { id: 7, parent: 4, label: 'Айтем 7' },
      { id: 8, parent: 4, label: 'Айтем 8' }
    ];
    store = new TreeStore(items);
  });

  describe('getAll', () => {
    it('должен возвращать все элементы', () => {
      expect(store.getAll()).toEqual(items);
      expect(store.getAll().length).toBe(8);
    });
  });

  describe('getItem', () => {
    it('должен возвращать элемент по id', () => {
      const item = store.getItem(1);
      expect(item).toEqual({ id: 1, parent: null, label: 'Айтем 1' });
    });

    it('должен работать со строковым id', () => {
      const item = store.getItem('91064cee');
      expect(item).toEqual({ id: '91064cee', parent: 1, label: 'Айтем 2' });
    });

    it('должен возвращать undefined для несуществующего id', () => {
      expect(store.getItem(999)).toBeUndefined();
    });
  });

  describe('getChildren', () => {
    it('должен возвращать прямых детей элемента', () => {
      const children = store.getChildren(1);
      expect(children.length).toBe(2);
      expect(children.map(c => c.id)).toEqual(['91064cee', 3]);
    });

    it('должен возвращать пустой массив если нет детей', () => {
      const children = store.getChildren(3);
      expect(children).toEqual([]);
    });

    it('должен работать со строковым id', () => {
      const children = store.getChildren('91064cee');
      expect(children.length).toBe(3);
      expect(children.map(c => c.id)).toEqual([4, 5, 6]);
    });
  });

  describe('getAllChildren', () => {
    it('должен возвращать всех потомков', () => {
      const allChildren = store.getAllChildren(1);
      expect(allChildren.length).toBe(7);
    });

    it('должен включать вложенных детей', () => {
      const allChildren = store.getAllChildren('91064cee');
      expect(allChildren.length).toBe(5);
      expect(allChildren.map(c => c.id)).toEqual([4, 5, 6, 7, 8]);
    });

    it('должен возвращать пустой массив для листового элемента', () => {
      const allChildren = store.getAllChildren(3);
      expect(allChildren).toEqual([]);
    });
  });

  describe('getAllParents', () => {
    it('должен возвращать цепочку родителей от элемента к корню', () => {
      const parents = store.getAllParents(7);
      expect(parents.length).toBe(4);
      expect(parents.map(p => p.id)).toEqual([7, 4, '91064cee', 1]);
    });

    it('должен возвращать только сам элемент для корневого узла', () => {
      const parents = store.getAllParents(1);
      expect(parents.length).toBe(1);
      expect(parents[0].id).toBe(1);
    });

    it('должен сохранять правильный порядок', () => {
      const parents = store.getAllParents(8);
      expect(parents.map(p => p.id)).toEqual([8, 4, '91064cee', 1]);
    });
  });

  describe('addItem', () => {
    it('должен добавлять новый элемент', () => {
      const newItem: TreeItem = { id: 9, parent: 3, label: 'Айтем 9' };
      store.addItem(newItem);
      
      expect(store.getAll().length).toBe(9);
      expect(store.getItem(9)).toEqual(newItem);
      expect(store.getChildren(3).length).toBe(1);
    });
  });

  describe('removeItem', () => {
    it('должен удалять элемент', () => {
      store.removeItem(3);
      
      expect(store.getAll().length).toBe(7);
      expect(store.getItem(3)).toBeUndefined();
    });

    it('должен удалять элемент со всеми потомками', () => {
      store.removeItem('91064cee');
      
      expect(store.getAll().length).toBe(2); // Остались только 1 и 3
      expect(store.getItem('91064cee')).toBeUndefined();
      expect(store.getItem(4)).toBeUndefined();
      expect(store.getItem(7)).toBeUndefined();
    });
  });

  describe('updateItem', () => {
    it('должен обновлять элемент', () => {
      const updatedItem: TreeItem = { id: 3, parent: 1, label: 'Новый айтем 3' };
      store.updateItem(updatedItem);
      
      expect(store.getItem(3)?.label).toBe('Новый айтем 3');
    });

    it('должен обновлять parent элемента', () => {
      const updatedItem: TreeItem = { id: 3, parent: '91064cee', label: 'Айтем 3' };
      store.updateItem(updatedItem);
      
      expect(store.getChildren(1).length).toBe(1);
      expect(store.getChildren('91064cee').length).toBe(4);
    });
  });
});
