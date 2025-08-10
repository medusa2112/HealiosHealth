// Product availability derivation and ordering logic
export type ProductAvailability =
  | 'IN_STOCK'
  | 'OUT_OF_STOCK'
  | 'PREORDER_OPEN'
  | 'PREORDER_CLOSED_MAX_REACHED';

export function deriveAvailability(p: {
  stockQuantity: number;
  allowPreorder: boolean;
  preorderCap?: number | null;
  preorderCount: number;
}): ProductAvailability {
  if (p.stockQuantity > 0) return 'IN_STOCK';
  if (!p.allowPreorder) return 'OUT_OF_STOCK';
  if (p.preorderCap != null && p.preorderCount >= p.preorderCap)
    return 'PREORDER_CLOSED_MAX_REACHED';
  return 'PREORDER_OPEN';
}

export const isOrderable = (a: ProductAvailability) =>
  a === 'IN_STOCK' || a === 'PREORDER_OPEN';

export const availabilityRank = (a: ProductAvailability) =>
  a === 'IN_STOCK' ? 0 : a === 'PREORDER_OPEN' ? 1 : 2; // CLOSED/OUT go last

export const getAvailabilityLabel = (a: ProductAvailability): string => {
  switch (a) {
    case 'IN_STOCK':
      return 'In stock';
    case 'PREORDER_OPEN':
      return 'Pre-order open';
    case 'PREORDER_CLOSED_MAX_REACHED':
      return 'Pre-order closed (max reached)';
    case 'OUT_OF_STOCK':
      return 'Out of stock';
  }
};

export const getButtonLabel = (a: ProductAvailability): string => {
  switch (a) {
    case 'IN_STOCK':
      return 'Add to cart';
    case 'PREORDER_OPEN':
      return 'Pre-order now';
    case 'PREORDER_CLOSED_MAX_REACHED':
      return 'Pre-order closed';
    case 'OUT_OF_STOCK':
      return 'Out of stock';
  }
};