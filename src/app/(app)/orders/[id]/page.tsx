import { OrderDetail } from "@/components/orders/order-detail";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  return (
    <main className="page-shell max-w-4xl items-start">
      <OrderDetail id={id} />
    </main>
  );
}
