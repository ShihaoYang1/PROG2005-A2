/**
 * Inventory Management System - Core Logic
 * Author: Yang Shihao (202300408097)
 */

import { InventoryItem, StockStatus } from './types';

class InventoryManager {
    private items: InventoryItem[] = [];

    // Add item
    addItem(item: InventoryItem): boolean {
        // Check if ID already exists
        if (this.items.some(i => i.itemId === item.itemId)) {
            this.showMessage("Error: Item ID already exists!", "error");
            return false;
        }

        // Validate required fields
        if (!this.validateItem(item)) {
            return false;
        }

        this.items.push(item);
        this.showMessage("Item added successfully!", "success");
        return true;
    }

    // Validate item data
    private validateItem(item: InventoryItem): boolean {
        if (!item.itemId || !item.itemName || !item.category || 
            item.quantity === undefined || item.price === undefined || 
            !item.supplierName || !item.stockStatus) {
            this.showMessage("Error: Please fill in all required fields!", "error");
            return false;
        }
        
        if (item.quantity < 0 || item.price < 0) {
            this.showMessage("Error: Quantity and price cannot be negative!", "error");
            return false;
        }
        
        return true;
    }

    // Update item by name
    updateItemByName(name: string, updatedData: Partial<InventoryItem>): boolean {
        const index = this.items.findIndex(i => 
            i.itemName.toLowerCase() === name.toLowerCase()
        );
        
        if (index === -1) {
            this.showMessage("Error: Item not found!", "error");
            return false;
        }

        // If updating ID, check for conflicts with other items
        if (updatedData.itemId && updatedData.itemId !== this.items[index].itemId) {
            if (this.items.some(i => i.itemId === updatedData.itemId)) {
                this.showMessage("Error: New ID already exists!", "error");
                return false;
            }
        }

        this.items[index] = { ...this.items[index], ...updatedData };
        this.showMessage("Item updated successfully!", "success");
        return true;
    }

    // Delete item by name (with confirmation)
    deleteItemByName(name: string): boolean {
        const item = this.items.find(i => 
            i.itemName.toLowerCase() === name.toLowerCase()
        );
        
        if (!item) {
            this.showMessage("Error: Item not found!", "error");
            return false;
        }

        // Confirmation dialog (using innerHTML instead of alert)
        if (confirm(`Are you sure you want to delete "${item.itemName}"?`)) {
            this.items = this.items.filter(i => i.itemName.toLowerCase() !== name.toLowerCase());
            this.showMessage("Item deleted successfully!", "success");
            return true;
        }
        
        return false;
    }

    // Search items
    searchItems(keyword: string): InventoryItem[] {
        return this.items.filter(i => 
            i.itemName.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    // Get all items
    getAllItems(): InventoryItem[] {
        return [...this.items];
    }

    // Get popular items
    getPopularItems(): InventoryItem[] {
        return this.items.filter(i => i.isPopular);
    }

    // Auto-calculate stock status
    calculateStockStatus(quantity: number): StockStatus {
        if (quantity === 0) return "Out of Stock";
        if (quantity < 10) return "Low Stock";
        return "In Stock";
    }

    // Display message (replace alert)
    private showMessage(msg: string, type: "success" | "error" | "info"): void {
        const msgDiv = document.getElementById('message-area');
        if (msgDiv) {
            msgDiv.innerHTML = `<div class="alert ${type}">${msg}</div>`;
            setTimeout(() => {
                msgDiv.innerHTML = '';
            }, 3000);
        }
    }
}

export { InventoryManager };