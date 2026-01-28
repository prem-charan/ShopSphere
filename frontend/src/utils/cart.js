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

  // Normalize shape: [{ productId: number, quantity: number }]
  return parsed
    .map((i) => ({
      productId: Number(i?.productId),
      quantity: Number(i?.quantity),
    }))
    .filter((i) => Number.isFinite(i.productId) && i.productId > 0 && Number.isFinite(i.quantity) && i.quantity > 0);
}

export function setCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cart:updated'));
}

export function clearCart() {
  setCart([]);
}

export function addToCart(productId, quantity = 1) {
  const pid = Number(productId);
  const qty = Math.max(1, Number(quantity) || 1);
  const cart = getCart();
  const existing = cart.find((i) => i.productId === pid);

  if (existing) {
    existing.quantity += qty;
    setCart([...cart]);
    return;
  }

  setCart([...cart, { productId: pid, quantity: qty }]);
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

