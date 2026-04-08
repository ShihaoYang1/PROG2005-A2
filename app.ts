/**
 * Application Entry Point - Fully Interactive
 * Author: Yang Shihao (202300408097)
 */

import { InventoryManager } from './inventory.js';
import { InventoryItem, StockStatus } from './types.js';

// Initialize inventory manager
const inventory = new InventoryManager();

// DOM Elements cache
const elements = {
    // Forms
    addForm: document.getElementById('add-form') as HTMLFormElement,
    updateForm: document.getElementById('update-form') as HTMLFormElement,
    deleteForm: document.getElementById('delete-form') as HTMLFormElement,
    searchForm: document.getElementById('search-form') as HTMLFormElement,
    
    // Inputs - Add
    itemId: document.getElementById('item-id') as HTMLInputElement,
    itemName: document.getElementById('item-name') as HTMLInputElement,
    category: document.getElementById('category') as HTMLSelectElement,
    quantity: document.getElementById('quantity') as HTMLInputElement,
    price: document.getElementById('price') as HTMLInputElement,
    supplier: document.getElementById('supplier') as HTMLInputElement,
    isPopular: document.getElementById('is-popular') as HTMLInputElement,
    comment: document.getElementById('comment') as HTMLTextAreaElement,
    
    // Inputs - Update
    updateCurrentName: document.getElementById('update-current-name') as HTMLInputElement,
    updateNewName: document.getElementById('update-new-name') as HTMLInputElement,
    updateQuantity: document.getElementById('update-quantity') as HTMLInputElement,
    updatePrice: document.getElementById('update-price') as HTMLInputElement,
    updateSupplier: document.getElementById('update-supplier') as HTMLInputElement,
    
    // Inputs - Delete
    deleteName: document.getElementById('delete-name') as HTMLInputElement,
    
    // Inputs - Search
    searchInput: document.getElementById('search-input') as HTMLInputElement,
    
    // Display areas
    messageArea: document.getElementById('message-area') as HTMLDivElement,
    itemsContainer: document.getElementById('items-container') as HTMLDivElement,
    searchResults: document.getElementById('search-results') as HTMLDivElement,
    
    // Buttons
    showAllBtn: document.getElementById('show-all-btn') as HTMLButtonElement,
    showPopularBtn: document.getElementById('show-popular-btn') as HTMLButtonElement
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inventory System Loaded');
    setupEventListeners();
    displayAllItems();
});

// Setup all event listeners
function setupEventListeners(): void {
    // Add item form - MOST IMPORTANT: preventDefault() prevents page reload [^41^][^46^]
    elements.addForm?.addEventListener('submit', (e: Event) => {
        e.preventDefault(); // Prevents page refresh!
        handleAddItem();
    });

    // Update item form
    elements.updateForm?.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        handleUpdateItem();
    });

    // Delete item form
    elements.deleteForm?.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        handleDeleteItem();
    });

    // Search form
    elements.searchForm?.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        handleSearch();
    });

    // Filter buttons
    elements.showAllBtn?.addEventListener('click', displayAllItems);
    elements.showPopularBtn?.addEventListener('click', displayPopularItems);
}

// Handle add item
function handleAddItem(): void {
    const quantity = parseInt(elements.quantity.value) || 0;
    const price = parseFloat(elements.price.value) || 0;
    
    const item: InventoryItem = {
        itemId: elements.itemId.value.trim(),
        itemName: elements.itemName.value.trim(),
        category: elements.category.value as any,
        quantity: quantity,
        price: price,
        supplierName: elements.supplier.value.trim(),
        stockStatus: inventory.calculateStockStatus(quantity),
        isPopular: elements.isPopular.checked,
        comment: elements.comment.value.trim() || undefined
    };

    const result = inventory.addItem(item);
    showMessage(result.message, result.success);
    
    if (result.success) {
        elements.addForm.reset();
        displayAllItems();
    }
}

// Handle update item
function handleUpdateItem(): void {
    const currentName = elements.updateCurrentName.value.trim();
    if (!currentName) {
        showMessage("Error: Please enter current item name!", false);
        return;
    }

    const updates: Partial<InventoryItem> = {};
    
    if (elements.updateNewName.value.trim()) {
        updates.itemName = elements.updateNewName.value.trim();
    }
    
    const newQty = elements.updateQuantity.value;
    if (newQty !== '') {
        updates.quantity = parseInt(newQty);
        updates.stockStatus = inventory.calculateStockStatus(updates.quantity);
    }
    
    const newPrice = elements.updatePrice.value;
    if (newPrice !== '') {
        updates.price = parseFloat(newPrice);
    }
    
    if (elements.updateSupplier.value.trim()) {
        updates.supplierName = elements.updateSupplier.value.trim();
    }

    const result = inventory.updateItemByName(currentName, updates);
    showMessage(result.message, result.success);
    
    if (result.success) {
        elements.updateForm.reset();
        displayAllItems();
    }
}

// Handle delete item
function handleDeleteItem(): void {
    const name = elements.deleteName.value.trim();
    if (!name) {
        showMessage("Error: Please enter item name to delete!", false);
        return;
    }

    // Confirmation prompt
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
        return;
    }

    const result = inventory.deleteItemByName(name);
    showMessage(result.message, result.success);
    
    if (result.success) {
        elements.deleteForm.reset();
        displayAllItems();
    }
}

// Handle search
function handleSearch(): void {
    const keyword = elements.searchInput.value.trim();
    const results = inventory.searchItems(keyword);
    displaySearchResults(results, keyword);
}

// Display all items
function displayAllItems(): void {
    const items = inventory.getAllItems();
    displayItems(items, "All Inventory Items");
    updateActiveButton('all');
}

// Display popular items
function displayPopularItems(): void {
    const items = inventory.getPopularItems();
    displayItems(items, "Popular Items");
    updateActiveButton('popular');
}

// Display items in container
function displayItems(items: InventoryItem[], title: string): void {
    if (!elements.itemsContainer) return;

    let html = `<h3>${title} (${items.length} items)</h3>`;
    
    if (items.length === 0) {
        html += '<p class="no-items">No items in inventory. Add some items!</p>';
    } else {
        html += '<div class="items-grid">';
        items.forEach(item => {
            const popularBadge = item.isPopular ? '<span class="badge popular">★ POPULAR</span>' : '';
            const statusClass = item.stockStatus.toLowerCase().replace(/\s+/g, '-');
            
            html += `
                <div class="item-card">
                    <div class="card-header">
                        <h4>${escapeHtml(item.itemName)} ${popularBadge}</h4>
                        <span class="badge ${statusClass}">${item.stockStatus}</span>
                    </div>
                    <div class="card-body">
                        <p><strong>ID:</strong> ${escapeHtml(item.itemId)}</p>
                        <p><strong>Category:</strong> ${item.category}</p>
                        <p><strong>Quantity:</strong> ${item.quantity}</p>
                        <p><strong>Price:</strong> $${item.price.toFixed(2)}</p>
                        <p><strong>Supplier:</strong> ${escapeHtml(item.supplierName)}</p>
                        ${item.comment ? `<p><strong>Comment:</strong> ${escapeHtml(item.comment)}</p>` : ''}
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    elements.itemsContainer.innerHTML = html;
}

// Display search results
function displaySearchResults(results: InventoryItem[], keyword: string): void {
    if (!elements.searchResults) return;

    let html = `<h4>Search Results for "${escapeHtml(keyword)}" (${results.length} found)</h4>`;
    
    if (results.length === 0) {
        html += '<p class="no-results">No items found matching your search.</p>';
    } else {
        html += '<div class="search-list">';
        results.forEach(item => {
            html += `
                <div class="search-item">
                    <strong>${escapeHtml(item.itemName)}</strong> 
                    (${escapeHtml(item.itemId)}) - 
                    ${item.category} - 
                    Qty: ${item.quantity} - 
                    $${item.price.toFixed(2)}
                </div>
            `;
        });
        html += '</div>';
    }
    
    elements.searchResults.innerHTML = html;
}

// Show message (using innerHTML instead of alert - as per requirements)
function showMessage(message: string, isSuccess: boolean): void {
    if (!elements.messageArea) return;
    
    const type = isSuccess ? 'success' : 'error';
    elements.messageArea.innerHTML = `<div class="alert ${type}">${escapeHtml(message)}</div>`;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        elements.messageArea.innerHTML = '';
    }, 3000);
}

// Update active button state
function updateActiveButton(view: 'all' | 'popular'): void {
    elements.showAllBtn?.classList.toggle('active', view === 'all');
    elements.showPopularBtn?.classList.toggle('active', view === 'popular');
}

// Escape HTML to prevent XSS
function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}