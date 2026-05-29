import { parseResponse } from "@/lib/http/parse-response";
import type { OrderListQuery } from "@/lib/query-keys";
import type {
  AssignOrderWorkersPayload,
  ConfirmOrderActualConsumptionPayload,
  CreateOrderPayload,
  OrderDto,
  SetOrderMaterialLinesPayload,
  UpdateOrderPayload,
} from "@/types/order";
import type { OrderStatus } from "@/types/order-status";
import type { OrderStockMovementDto } from "@/types/stock";

function ordersUrl(query?: OrderListQuery) {
  const params = new URLSearchParams();
  if (query?.status) params.set("status", query.status);
  if (query?.furnitureType) params.set("furnitureType", query.furnitureType);
  if (query?.clientId) params.set("clientId", query.clientId);
  if (query?.hasShortages) params.set("hasShortages", "true");
  if (query?.unassigned) params.set("unassigned", "true");
  const qs = params.toString();
  return qs ? `/api/orders?${qs}` : "/api/orders";
}

export async function getOrders(query?: OrderListQuery): Promise<OrderDto[]> {
  const response = await fetch(ordersUrl(query), {
    method: "GET",
    cache: "no-store",
  });
  return parseResponse<OrderDto[]>(response);
}

export async function getOrderById(id: string): Promise<OrderDto> {
  const response = await fetch(`/api/orders/${id}`, {
    method: "GET",
    cache: "no-store",
  });
  return parseResponse<OrderDto>(response);
}

export async function getOrderMovements(
  orderId: string,
): Promise<OrderStockMovementDto[]> {
  const response = await fetch(`/api/orders/${orderId}/movements`, {
    method: "GET",
    cache: "no-store",
  });
  return parseResponse<OrderStockMovementDto[]>(response);
}

export async function createOrder(input: CreateOrderPayload): Promise<OrderDto> {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<OrderDto>(response);
}

export async function updateOrder(
  id: string,
  input: UpdateOrderPayload,
): Promise<OrderDto> {
  const response = await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<OrderDto>(response);
}

export async function setOrderMaterialLines(
  id: string,
  input: SetOrderMaterialLinesPayload,
): Promise<OrderDto> {
  const response = await fetch(`/api/orders/${id}/materials`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<OrderDto>(response);
}

export async function transitionOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<OrderDto> {
  const response = await fetch(`/api/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return parseResponse<OrderDto>(response);
}

export async function confirmOrderActualConsumption(
  id: string,
  input: ConfirmOrderActualConsumptionPayload,
): Promise<OrderDto> {
  const response = await fetch(`/api/orders/${id}/consume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<OrderDto>(response);
}

export async function assignOrderWorkers(
  id: string,
  input: AssignOrderWorkersPayload,
): Promise<OrderDto> {
  const response = await fetch(`/api/orders/${id}/assign`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<OrderDto>(response);
}
