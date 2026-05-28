export type Category = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  price: string; // Decimal serializado por la API
  stock: number;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
};

export type Material = {
  id: string;
  name: string;
  sku: string | null;
  unit: "M" | "M2" | "UD" | "L" | "KG";
  unitCost: string; // Decimal serializado por la API
  stock: string; // Stock fisico serializado
  minStock: string; // Decimal serializado por la API
  location: string | null;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
};

export type StockSnapshot = {
  physical: string;
  reserved: string;
  available: string;
};
