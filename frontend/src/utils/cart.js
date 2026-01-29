const CART_KEY = 'shopsphere_cart_v1';

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getCart() {
  const raw = localStorage.getItem(CART_KEY);
  const parsed = safeParse(raw);
  if (!Array.isArray(parsed)) return [];

  // Normalize shape: [{ productId, quantity, unitPrice?, campaignId?, campaignTitle? }]
  return parsed
    .map((i) => ({
      productId: Number(i?.productId),
      quantity: Number(i?.quantity),
      unitPrice: i?.unitPrice != null ? Number(i.unitPrice) : null,
      campaignId: i?.campaignId != null ? Number(i.campaignId) : null,
      campaignTitle: i?.campaignTitle || null,
    }))
    .filter((i) => {
      const okPid = Number.isFinite(i.productId) && i.productId > 0;
      const okQty = Number.isFinite(i.quantity) && i.quantity > 0;
      const okPrice = i.unitPrice == null || (Number.isFinite(i.unitPrice) && i.unitPrice >= 0);
      const okCamp = i.campaignId == null || (Number.isFinite(i.campaignId) && i.campaignId > 0);
      return okPid && okQty && okPrice && okCamp;
    });
}

export function setCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cart:updated'));
}

export function clearCart() {
  setCart([]);
}

export function addToCart(productId, quantity = 1, options = {}) {
  const pid = Number(productId);
  const qty = Math.max(1, Number(quantity) || 1);
  const unitPrice = options.unitPrice != null ? Number(options.unitPrice) : null;
  const campaignId = options.campaignId != null ? Number(options.campaignId) : null;
  const campaignTitle = options.campaignTitle || null;
  const cart = getCart();
  const existing = cart.find((i) => i.productId === pid);

  if (existing) {
    existing.quantity += qty;
    // Preserve any discounted unitPrice if already in cart; otherwise set if provided
    if (existing.unitPrice == null && unitPrice != null) existing.unitPrice = unitPrice;
    if (existing.campaignId == null && campaignId != null) existing.campaignId = campaignId;
    if (existing.campaignTitle == null && campaignTitle != null) existing.campaignTitle = campaignTitle;
    setCart([...cart]);
    return;
  }

  setCart([
    ...cart,
    {
      productId: pid,
      quantity: qty,
      unitPrice,
      campaignId,
      campaignTitle,
    },
  ]);
}

export function updateCartItem(productId, quantity) {
  const pid = Number(productId);
  const qty = Math.max(1, Number(quantity) || 1);
  const cart = getCart().map((i) => (i.productId === pid ? { ...i, quantity: qty } : i));
  setCart(cart);
}

export function removeFromCart(productId) {
  const pid = Number(productId);
  const cart = getCart().filter((i) => i.productId !== pid);
  setCart(cart);
}

export function getCartCount() {
  return getCart().reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
}

export function getCartItemCount(productId) {
  const cart = getCart();
  const item = cart.find(i => i.productId === Number(productId));
  return item ? Number(item.quantity) : 0;
}

