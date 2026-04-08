/**
 * Inventory Management System - Core Logic
 * Author: Yang Shihao (202300408097)
 */

import { InventoryItem, StockStatus } from './types.js';

export class InventoryManager {
    private items: InventoryItem[] = [];

    // Add item with validation
    addItem(item: InventoryItem): { success: boolean; message: string } {
        // Check if ID already exists
        if (this.items.some(i => i.itemId === item.itemId)) {
            return { success: false, message: "Error: Item ID already exists!" };
        }

        // Validate required fields
        if (!item.itemId || !item.itemName || !item.category || 
            item.quantity === undefined || item.price === undefined || 
            !item.supplierName) {
            return { success: false, message: "Error: Please fill in all required fields!" };
        }

        if (item.quantity < 0 || item.price < 0) {
            return { success: false, message: "Error: Quantity and price cannot be negative!" };
        }

        this.items.push(item);
        return { success: true, message: "Item added successfully!" };
    }

    // Get all items
    getAllItems(): InventoryItem[] {
        return [...this.items];
    }

    // Get popular items
    getPopularItems(): InventoryItem[] {
        return this.items.filter(i => i.isPopular);
    }

    // Update item by name
    updateItemByName(name: string, updates: Partial<InventoryItem>): { success: boolean; message: string } {
        const index = this.items.findIndex(i => 
            i.itemName.toLowerCase() === name.toLowerCase()
        );
        
        if (index === -1) {
            return { success: false, message: "Error: Item not found!" };
        }

        // Check for ID conflict if updating ID
        if (updates.itemId && updates.itemId !== this.items[index].itemId) {
            if (this.items.some(i => i.itemId === updates.itemId)) {
                return { success: false, message: "Error: New ID already exists!" };
            }
        }

        this.items[index] = { ...this.items[index], ...updates };
        return { success: true, message: "Item updated successfully!" };
    }

    // Delete item by name
    deleteItemByName(name: string): { success: boolean; message: string } {
        const initialLength = this.items.length;
        this.items = this.items.filter(i => 
            i.itemName.toLowerCase() !== name.toLowerCase()
        );
        
        if (this.items.length === initialLength) {
            return { success: false, message: "Error: Item not found!" };
        }
        
        return { success: true, message: "Item deleted successfully!" };
    }

    // Search items
    searchItems(keyword: string): InventoryItem[] {
        return this.items.filter(i => 
            i.itemName.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    // Calculate stock status based on quantity
    calculateStockStatus(quantity: number): StockStatus {
        if (quantity === 0) return "Out of Stock";
        if (quantity < 10) return "Low Stock";
        return "In Stock";
    }
}