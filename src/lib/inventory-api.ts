import type { Category, Material, Product, StockSnapshot } from "@/types/inventory";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validators/category";
import type {
  CreateMaterialInput,
  MaterialListQuery,
  UpdateMaterialInput,
} from "@/lib/validators/material";
import type {
  CreateProductInput,
  ProductListQuery,
  UpdateProductInput,
  UpdateProductStockInput,
} from "@/lib/validators/product";
import { parseResponse } from "@/lib/http/parse-response";

function materialsUrl(query?: MaterialListQuery) {
  const params = new URLSearchParams();
  if (query?.search) params.set("search", query.search);
  if (query?.categoryId) params.set("categoryId", query.categoryId);
  if (query?.sortBy) params.set("sortBy", query.sortBy);
  if (query?.sortOrder) params.set("sortOrder", query.sortOrder);
  const qs = params.toString();
  return qs ? `/api/materials?${qs}` : "/api/materials";
}

function productsUrl(query?: ProductListQuery) {
  const params = new URLSearchParams();
  if (query?.search) params.set("search", query.search);
  if (query?.categoryId) params.set("categoryId", query.categoryId);
  if (query?.sortBy) params.set("sortBy", query.sortBy);
  if (query?.sortOrder) params.set("sortOrder", query.sortOrder);
  const qs = params.toString();
  return qs ? `/api/products?${qs}` : "/api/products";
}

export async function getProducts(query?: ProductListQuery): Promise<Product[]> {
  const response = await fetch(productsUrl(query), {
    method: "GET",
    cache: "no-store",
  });
  return parseResponse<Product[]>(response);
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const response = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<Product>(response);
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
): Promise<Product> {
  const response = await fetch(`/api/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<Product>(response);
}

export async function deleteProduct(id: string): Promise<Product> {
  const response = await fetch(`/api/products/${id}`, {
    method: "DELETE",
  });
  return parseResponse<Product>(response);
}

export async function updateProductStock(
  id: string,
  input: UpdateProductStockInput,
): Promise<Product> {
  const response = await fetch(`/api/products/${id}/stock`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<Product>(response);
}

export async function getMaterials(query?: MaterialListQuery): Promise<Material[]> {
  const response = await fetch(materialsUrl(query), {
    method: "GET",
    cache: "no-store",
  });
  return parseResponse<Material[]>(response);
}

export async function createMaterial(input: CreateMaterialInput): Promise<Material> {
  const response = await fetch("/api/materials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<Material>(response);
}

export async function updateMaterial(
  id: string,
  input: UpdateMaterialInput,
): Promise<Material> {
  const response = await fetch(`/api/materials/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<Material>(response);
}

export async function deleteMaterial(id: string): Promise<Material> {
  const response = await fetch(`/api/materials/${id}`, {
    method: "DELETE",
  });
  return parseResponse<Material>(response);
}

export async function getMaterialStock(id: string): Promise<StockSnapshot> {
  const response = await fetch(`/api/materials/${id}/stock`, {
    method: "GET",
    cache: "no-store",
  });
  return parseResponse<StockSnapshot>(response);
}

export type StockMovementItem = {
  id: string;
  type: "IN" | "OUT" | "ADJUST" | "RESERVE" | "RELEASE";
  quantity: string;
  reason: string | null;
  materialId: string;
  orderId: string | null;
  userId: string | null;
  createdAt: string;
};

export async function getMaterialMovements(id: string): Promise<StockMovementItem[]> {
  const response = await fetch(`/api/materials/${id}/movements`, {
    method: "GET",
    cache: "no-store",
  });
  return parseResponse<StockMovementItem[]>(response);
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch("/api/categories", {
    method: "GET",
    cache: "no-store",
  });
  return parseResponse<Category[]>(response);
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<Category>(response);
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<Category> {
  const response = await fetch(`/api/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<Category>(response);
}

export async function deleteCategory(id: string): Promise<Category> {
  const response = await fetch(`/api/categories/${id}`, {
    method: "DELETE",
  });
  return parseResponse<Category>(response);
}
