import type { OrderStatus } from "@/types/order-status";
import { OrderStatus as S } from "@/types/order-status";
import type { UserRole } from "@/types/user-role";
import { UserRole as R } from "@/types/user-role";

/** Transición explícita: de → a */
export type OrderTransition = {
  from: OrderStatus;
  to: OrderStatus;
  /** Roles que pueden ejecutarla (ownership del cliente se valida en la API) */
  roles: UserRole[];
};

export const ORDER_TRANSITIONS: OrderTransition[] = [
  { from: S.DRAFT, to: S.PENDING, roles: [R.CLIENT, R.WORKER, R.ADMIN] },
  { from: S.PENDING, to: S.APPROVED, roles: [R.WORKER, R.ADMIN] },
  { from: S.APPROVED, to: S.IN_PRODUCTION, roles: [R.WORKER, R.ADMIN] },
  { from: S.IN_PRODUCTION, to: S.READY, roles: [R.WORKER, R.ADMIN] },
  { from: S.READY, to: S.DELIVERED, roles: [R.WORKER, R.ADMIN] },
  { from: S.DRAFT, to: S.CANCELLED, roles: [R.CLIENT, R.WORKER, R.ADMIN] },
  { from: S.PENDING, to: S.CANCELLED, roles: [R.CLIENT, R.WORKER, R.ADMIN] },
  { from: S.APPROVED, to: S.CANCELLED, roles: [R.WORKER, R.ADMIN] },
  { from: S.IN_PRODUCTION, to: S.CANCELLED, roles: [R.WORKER, R.ADMIN] },
  /** Reactivación tras cancelación errónea (solo ADMIN). */
  { from: S.CANCELLED, to: S.PENDING, roles: [R.ADMIN] },
  { from: S.CANCELLED, to: S.APPROVED, roles: [R.ADMIN] },
  { from: S.CANCELLED, to: S.IN_PRODUCTION, roles: [R.ADMIN] },
  { from: S.CANCELLED, to: S.READY, roles: [R.ADMIN] },
  { from: S.CANCELLED, to: S.DRAFT, roles: [R.ADMIN] },
];

const transitionKey = (from: OrderStatus, to: OrderStatus) => `${from}->${to}`;

const TRANSITION_MAP = new Map(
  ORDER_TRANSITIONS.map((t) => [transitionKey(t.from, t.to), t]),
);

export function findOrderTransition(
  from: OrderStatus,
  to: OrderStatus,
): OrderTransition | undefined {
  return TRANSITION_MAP.get(transitionKey(from, to));
}

export function canTransitionOrder(
  from: OrderStatus,
  to: OrderStatus,
  role: UserRole,
): boolean {
  const rule = findOrderTransition(from, to);
  return rule?.roles.includes(role) ?? false;
}

/** Destinos permitidos desde un estado para un rol concreto. */
export function getOrderTransitionTargets(
  from: OrderStatus,
  role: UserRole,
): OrderStatus[] {
  return ORDER_TRANSITIONS.filter(
    (transition) => transition.from === from && transition.roles.includes(role),
  ).map((transition) => transition.to);
}

/** Estados desde los que se puede cancelar */
export function orderStatusesCancellableFrom(): OrderStatus[] {
  return [
    ...new Set(
      ORDER_TRANSITIONS.filter((t) => t.to === S.CANCELLED).map((t) => t.from),
    ),
  ];
}
