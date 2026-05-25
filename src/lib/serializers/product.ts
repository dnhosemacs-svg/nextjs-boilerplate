type ProductWithDecimalPrice = {
  price: { toString(): string };
};

export function serializeProduct<T extends ProductWithDecimalPrice>(
  product: T,
): Omit<T, "price"> & { price: string } {
  return { ...product, price: product.price.toString() };
}
