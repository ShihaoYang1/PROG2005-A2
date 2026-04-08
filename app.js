/**
 * Inventory Management System - Part 1
 * Author: Yang Shihao (202300408097)
 * Date: 2026-04-08
 * 
 * This is a simplified version using plain JavaScript (compiled from TypeScript)
 * All code in one file for maximum compatibility
 */

// ==================== TYPES (as comments for reference) ====================
// StockStatus: "In Stock" | "Low Stock" | "Out of Stock"
// Category: "Electronics" | "Furniture" | "Clothing" | "Tools" | "Miscellaneous"

// ==================== DATA STORAGE ====================
let inventoryItems = [];  // Array to store all items

// ==================== HELPER FUNCTIONS ====================

// Calculate stock status based on quantity
function calculateStockStatus(quantity) {
    if (quantity === 0) return "Out of Stock";
    if (quantity < 10) return "Low Stock";
    return "In Stock";
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show message in message area (using innerHTML as required)
function showMessage(message, isSuccess) {
    const messageArea = document.getElementById('message-area');
    const type = isSuccess ? 'success' : 'error';
    messageArea.innerHTML = '<div class="alert ' + type + '">' + escapeHtml(message) + '</div>';
    
    // Auto-hide after 3 seconds
    setTimeout(function() {
        messageArea.innerHTML = '';
    }, 3000);
}

// Get value from input element
function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

// Get number value from input
function getNumberValue(id) {
    const val = getValue(id);
    return val === '' ? undefined : parseFloat(val);
}

// Clear form inputs
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.reset();
}

// ==================== CORE FUNCTIONS ====================

// Add new item
function handleAddItem(event) {
    // CRITICAL: Prevent form submission and page reload [^40^][^41^]
    if (event) event.preventDefault();
    
    const itemId = getValue('item-id');
    const itemName = getValue('item-name');
    const category = getValue('category');
    const quantity = parseInt(getValue('quantity')) || 0;
    const price = parseFloat(getValue('price')) || 0;
    const supplier = getValue('supplier');
    const isPopular = document.getElementById('is-popular').checked;
    const comment = getValue('comment');
    
    // Validation
    if (!itemId || !itemName || !category || !supplier) {
        showMessage("Error: Please fill in all required fields!", false);
        return false;  // Prevent form submission
    }
    
    if (quantity < 0 || price < 0) {
        showMessage("Error: Quantity and price cannot be negative!", false);
        return false;
    }
    
    // Check if ID already exists
    if (inventoryItems.some(function(item) { return item.itemId === itemId; })) {
        showMessage("Error: Item ID already exists!", false);
        return false;
    }
    
    // Create item object
    const newItem = {
        itemId: itemId,
        itemName: itemName,
        category: category,
        quantity: quantity,
        price: price,
        supplierName: supplier,
        stockStatus: calculateStockStatus(quantity),
        isPopular: isPopular,
        comment: comment || undefined
    };
    
    // Add to inventory
    inventoryItems.push(newItem);
    showMessage("Item added successfully!", true);
    
    // Clear form and refresh display
    clearForm('add-form');
    displayAllItems();
    
    return false;  // Prevent form submission
}

// Update item by name
function handleUpdateItem(event) {
    if (event) event.preventDefault();
    
    const currentName = getValue('update-current-name');
    const newName = getValue('update-new-name');
    const newQuantity = getNumberValue('update-quantity');
    const newPrice = getNumberValue('update-price');
    const newSupplier = getValue('update-supplier');
    
    if (!currentName) {
        showMessage("Error: Please enter current item name!", false);
        return false;
    }
    
    // Find item
    const index = inventoryItems.findIndex(function(item) {
        return item.itemName.toLowerCase() === currentName.toLowerCase();
    });
    
    if (index === -1) {
        showMessage("Error: Item not found!", false);
        return false;
    }
    
    // Prepare updates
    const updates = {};
    if (newName) updates.itemName = newName;
    if (newQuantity !== undefined) {
        updates.quantity = newQuantity;
        updates.stockStatus = calculateStockStatus(newQuantity);
    }
    if (newPrice !== undefined) updates.price = newPrice;
    if (newSupplier) updates.supplierName = newSupplier;
    
    // Apply updates
    Object.assign(inventoryItems[index], updates);
    showMessage("Item updated successfully!", true);
    
    clearForm('update-form');
    displayAllItems();
    
    return false;
}

// Delete item by name
function handleDeleteItem(event) {
    if (event) event.preventDefault();
    
    const name = getValue('delete-name');
    
    if (!name) {
        showMessage("Error: Please enter item name to delete!", false);
        return false;
    }
    
    // Find item first for confirmation message
    const item = inventoryItems.find(function(item) {
        return item.itemName.toLowerCase() === name.toLowerCase();
    });
    
    if (!item) {
        showMessage("Error: Item not found!", false);
        return false;
    }
    
    // Confirmation dialog
    if (!confirm('Are you sure you want to delete "' + item.itemName + '"?')) {
        return false;
    }
    
    // Delete item
    inventoryItems = inventoryItems.filter(function(item) {
        return item.itemName.toLowerCase() !== name.toLowerCase();
    });
    
    showMessage("Item deleted successfully!", true);
    clearForm('delete-form');
    displayAllItems();
    
    return false;
}

// Search items
function handleSearch(event) {
    if (event) event.preventDefault();
    
    const keyword = getValue('search-input');
    const results = inventoryItems.filter(function(item) {
        return item.itemName.toLowerCase().includes(keyword.toLowerCase());
    });
    
    displaySearchResults(results, keyword);
    return false;
}

// ==================== DISPLAY FUNCTIONS ====================

// Display all items
function displayAllItems() {
    updateActiveButton('show-all-btn', 'show-popular-btn');
    displayItems(inventoryItems, "All Inventory Items");
}

// Display popular items
function displayPopularItems() {
    updateActiveButton('show-popular-btn', 'show-all-btn');
    const popular = inventoryItems.filter(function(item) { return item.isPopular; });
    displayItems(popular, "Popular Items");
}

// Generic display function
function displayItems(items, title) {
    const container = document.getElementById('items-container');
    
    let html = '<h3>' + title + ' (' + items.length + ' items)</h3>';
    
    if (items.length === 0) {
        html += '<p class="no-items">No items in inventory. Add some items!</p>';
    } else {
        html += '<div class="items-grid">';
        items.forEach(function(item) {
            const popularBadge = item.isPopular ? '<span class="badge popular">★ POPULAR</span>' : '';
            const statusClass = item.stockStatus.toLowerCase().replace(/\s+/g, '-');
            
            html += '<div class="item-card">' +
                '<div class="card-header">' +
                    '<h4>' + escapeHtml(item.itemName) + ' ' + popularBadge + '</h4>' +
                    '<span class="badge ' + statusClass + '">' + item.stockStatus + '</span>' +
                '</div>' +
                '<div class="card-body">' +
                    '<p><strong>ID:</strong> ' + escapeHtml(item.itemId) + '</p>' +
                    '<p><strong>Category:</strong> ' + item.category + '</p>' +
                    '<p><strong>Quantity:</strong> ' + item.quantity + '</p>' +
                    '<p><strong>Price:</strong> $' + item.price.toFixed(2) + '</p>' +
                    '<p><strong>Supplier:</strong> ' + escapeHtml(item.supplierName) + '</p>' +
                    (item.comment ? '<p><strong>Comment:</strong> ' + escapeHtml(item.comment) + '</p>' : '') +
                '</div>' +
            '</div>';
        });
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// Display search results
function displaySearchResults(results, keyword) {
    const container = document.getElementById('search-results');
    
    let html = '<h4>Search Results for "' + escapeHtml(keyword) + '" (' + results.length + ' found)</h4>';
    
    if (results.length === 0) {
        html += '<p class="no-results">No items found matching your search.</p>';
    } else {
        html += '<div class="search-list">';
        results.forEach(function(item) {
            html += '<div class="search-item">' +
                '<strong>' + escapeHtml(item.itemName) + '</strong> ' +
                '(' + escapeHtml(item.itemId) + ') - ' +
                item.category + ' - ' +
                'Qty: ' + item.quantity + ' - ' +
                '$' + item.price.toFixed(2) +
            '</div>';
        });
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// Update active button state
function updateActiveButton(activeId, inactiveId) {
    const activeBtn = document.getElementById(activeId);
    const inactiveBtn = document.getElementById(inactiveId);
    if (activeBtn) activeBtn.classList.add('active');
    if (inactiveBtn) inactiveBtn.classList.remove('active');
}

// ==================== TAB SWITCHING ====================

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(function(tab) {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById('tab-' + tabName).classList.add('active');
    
    // Update button state (event.target is the clicked button)
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // If viewing tab, refresh display
    if (tabName === 'view') {
        displayAllItems();
    }
}

// ==================== INITIALIZATION ====================

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inventory System Loaded');
    displayAllItems();
});