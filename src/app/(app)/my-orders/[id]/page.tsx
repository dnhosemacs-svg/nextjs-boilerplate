import { OrderDetail } from "@/components/orders/order-detail";

type MyOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MyOrderDetailPage({
  params,
}: MyOrderDetailPageProps) {
  const { id } = await params;

  return (
    <main className="page-shell max-w-4xl items-start">
      <OrderDetail id={id} />
    </main>
  );
}
