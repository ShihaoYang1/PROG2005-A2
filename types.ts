/**
 * Author: Yang Shihao (202300408097)
 * Part 1: TypeScript Inventory System
 * Date: 2026-04-08
 */

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";
export type Category = "Electronics" | "Furniture" | "Clothing" | "Tools" | "Miscellaneous";

export interface InventoryItem {
    itemId: string;
    itemName: string;
    category: Category;
    quantity: number;
    price: number;
    supplierName: string;
    stockStatus: StockStatus;
    isPopular: boolean;
    comment?: string;
}