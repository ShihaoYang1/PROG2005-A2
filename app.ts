/**
 * Application Entry Point
 * Author: Yang Shihao (202300408097)
 */

import { InventoryManager } from './inventory';
import { InventoryItem } from './types';

// Initialize inventory manager
const inventory = new InventoryManager();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    displayAllItems();
});

function initializeEventListeners(): void {
    // Add form submission
    const addForm = document.getElementById('add-form');
    if (addForm) {
        addForm.addEventListener('submit', handleAddItem);
    }

    // Search button
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    // Update button
    const updateBtn = document.getElementById('update-btn');
    if (updateBtn) {
        updateBtn.addEventListener('click', handleUpdate);
    }

    // Delete button
    const deleteBtn = document.getElementById('delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDelete);
    }

    // Show popular items button
    const popularBtn = document.getElementById('popular-btn');
    if (popularBtn) {
        popularBtn.addEventListener('click', displayPopularItems);
    }

    // Show all button
    const allBtn = document.getElementById('all-btn');
    if (allBtn) {
        allBtn.addEventListener('click', displayAllItems);
    }
}

function handleAddItem(e: Event): void {
    e.preventDefault();
    
    const item: InventoryItem = {
        itemId: getValue('item-id'),
        itemName: getValue('item-name'),
        category: getValue('category') as any,
        quantity: parseInt(getValue('quantity')) || 0,
        price: parseFloat(getValue('price')) || 0,
        supplierName: getValue('supplier'),
        stockStatus: "In Stock", // Will be updated based on quantity
        isPopular: (document.getElementById('is-popular') as HTMLInputElement)?.checked || false,
        comment: getValue('comment') || undefined
    };

    // Auto-calculate stock status
    if (item.quantity === 0) item.stockStatus = "Out of Stock";
    else if (item.quantity < 10) item.stockStatus = "Low Stock";

    if (inventory.addItem(item)) {
        clearForm();
        displayAllItems();
    }
}

function handleSearch(): void {
    const keyword = getValue('search-input');
    const results = inventory.searchItems(keyword);
    displayItems(results, `Search Results: "${keyword}"`);
}

function handleUpdate(): void {
    const name = getValue('update-name');
    if (!name) {
        alert('Please enter the item name to update');
        return;
    }

    const updates: Partial<InventoryItem> = {};
    
    const newName = getValue('update-new-name');
    if (newName) updates.itemName = newName;
    
    const newQty = getValue('update-quantity');
    if (newQty) {
        updates.quantity = parseInt(newQty);
        // Auto-update stock status
        if (updates.quantity === 0) updates.stockStatus = "Out of Stock";
        else if (updates.quantity < 10) updates.stockStatus = "Low Stock";
        else updates.stockStatus = "In Stock";
    }
    
    const newPrice = getValue('update-price');
    if (newPrice) updates.price = parseFloat(newPrice);
    
    const newSupplier = getValue('update-supplier');
    if (newSupplier) updates.supplierName = newSupplier;

    if (inventory.updateItemByName(name, updates)) {
        clearUpdateForm();
        displayAllItems();
    }
}

function handleDelete(): void {
    const name = getValue('delete-name');
    if (!name) {
        alert('Please enter the item name to delete');
        return;
    }
    
    if (inventory.deleteItemByName(name)) {
        displayAllItems();
    }
}

function displayAllItems(): void {
    const items = inventory.getAllItems();
    displayItems(items, "All Inventory Items");
}

function displayPopularItems(): void {
    const items = inventory.getPopularItems();
    displayItems(items, "Popular Items");
}

function displayItems(items: InventoryItem[], title: string): void {
    const container = document.getElementById('items-container');
    if (!container) return;

    let html = `<h3>${title} (${items.length} items)</h3>`;
    
    if (items.length === 0) {
        html += '<p class="no-items">No items available</p>';
    } else {
        html += '<div class="items-grid">';
        items.forEach(item => {
            const popularBadge = item.isPopular ? '<span class="badge popular">POPULAR</span>' : '';
            const statusClass = item.stockStatus.toLowerCase().replace(' ', '-');
            
            html += `
                <div class="item-card">
                    <div class="card-header">
                        <h4>${item.itemName} ${popularBadge}</h4>
                        <span class="badge ${statusClass}">${item.stockStatus}</span>
                    </div>
                    <div class="card-body">
                        <p><strong>ID:</strong> ${item.itemId}</p>
                        <p><strong>Category:</strong> ${item.category}</p>
                        <p><strong>Quantity:</strong> ${item.quantity}</p>
                        <p><strong>Price:</strong> $${item.price.toFixed(2)}</p>
                        <p><strong>Supplier:</strong> ${item.supplierName}</p>
                        ${item.comment ? `<p><strong>Comment:</strong> ${item.comment}</p>` : ''}
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// Helper functions
function getValue(id: string): string {
    const el = document.getElementById(id) as HTMLInputElement;
    return el ? el.value.trim() : '';
}

function clearForm(): void {
    const form = document.getElementById('add-form') as HTMLFormElement;
    if (form) form.reset();
}

function clearUpdateForm(): void {
    ['update-name', 'update-new-name', 'update-quantity', 'update-price', 'update-supplier'].forEach(id => {
        const el = document.getElementById(id) as HTMLInputElement;
        if (el) el.value = '';
    });
}