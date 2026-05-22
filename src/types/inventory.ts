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
