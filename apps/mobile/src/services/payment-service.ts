/**
 * payment-service — Pro tier 99K/tháng payment orchestration.
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  iOS IAP DECISION DEFERRED — READ BEFORE MODIFYING                      ║
 * ║                                                                          ║
 * ║  Apple Developer account provisioning is NOT yet complete.              ║
 * ║  StoreKit / react-native-iap integration is SCAFFOLDED but not wired.  ║
 * ║                                                                          ║
 * ║  Feature flag: EXPO_PUBLIC_USE_STORE_KIT_IAP                            ║
 * ║    "true"  → StoreKitIapPath (placeholder stub — see below)             ║
 * ║    "false" | unset → SePay VietQR + Stripe web checkout (DEFAULT)       ║
 * ║                                                                          ║
 * ║  To activate StoreKit path when Apple Developer is ready:               ║
 * ║    1. Install: pnpm add react-native-iap expo-store-review              ║
 * ║    2. Add com.apple.developer.in-app-payments entitlement in Xcode      ║
 * ║    3. Replace STORE_KIT_PRODUCT_ID stub with actual App Store product ID ║
 * ║    4. Replace initiatePurchaseStoreKit() stub with real IAP flow        ║
 * ║    5. Set EXPO_PUBLIC_USE_STORE_KIT_IAP=true in app.config.js           ║
 * ║                                                                          ║
 * ║  Both paths return the same PaymentResult shape — callers are agnostic. ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * SePay VietQR flow (default):
 *   1. POST /api/payments/pro/init → { paymentId, qrDataUri, amount, bankInfo }
 *   2. Poll GET /api/payments/pro/:paymentId/status until confirmed | timeout
 *   3. On confirmed → query-invalidate pro-tier-status
 *
 * Stripe web checkout flow (web-based, same path as SePay):
 *   POST /api/payments/pro/stripe-checkout → { checkoutUrl }
 *   Open in-app browser → Stripe redirects back → webhook confirms
 */
import { apiClient } from './api-client';

// ── Feature flag ─────────────────────────────────────────────────────────

const USE_STORE_KIT_IAP =
  process.env.EXPO_PUBLIC_USE_STORE_KIT_IAP === 'true';

// ── Types ─────────────────────────────────────────────────────────────────

export type PaymentMethod = 'sepay-vietqr' | 'stripe-web' | 'storekit-iap';

export interface PaymentResult {
  paymentId: string;
  method: PaymentMethod;
  status: 'pending' | 'confirmed' | 'failed';
  /** QR data URI — only present for sepay-vietqr method */
  qrDataUri?: string;
  /** Stripe hosted checkout URL — only present for stripe-web method */
  checkoutUrl?: string;
  /** Human-readable amount e.g. "99.000 ₫" */
  amountLabel: string;
}

export interface SepayInitResponse {
  paymentId: string;
  qrDataUri: string;
  amount: number;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    transferContent: string;
  };
}

export interface PaymentStatusResponse {
  paymentId: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface StripeCheckoutResponse {
  checkoutUrl: string;
  paymentId: string;
}

const PRO_PLAN_AMOUNT_LABEL = '99.000 ₫';

// ── SePay VietQR path (DEFAULT) ───────────────────────────────────────────

async function initiatePurchaseSePay(): Promise<PaymentResult> {
  const data = await apiClient.post<SepayInitResponse>('/api/payments/pro/init', {
    plan: 'pro-monthly-99k',
  });

  return {
    paymentId: data.paymentId,
    method: 'sepay-vietqr',
    status: 'pending',
    qrDataUri: data.qrDataUri,
    amountLabel: PRO_PLAN_AMOUNT_LABEL,
  };
}

async function initiatePurchaseStripeWeb(): Promise<PaymentResult> {
  const data = await apiClient.post<StripeCheckoutResponse>(
    '/api/payments/pro/stripe-checkout',
    { plan: 'pro-monthly-99k', successPath: '/pro/success', cancelPath: '/pro/cancel' },
  );

  return {
    paymentId: data.paymentId,
    method: 'stripe-web',
    status: 'pending',
    checkoutUrl: data.checkoutUrl,
    amountLabel: PRO_PLAN_AMOUNT_LABEL,
  };
}

// ── StoreKit IAP path (STUB — Apple Developer not yet provisioned) ─────────

/**
 * STUB: Replace entire body when:
 *   - Apple Developer account has in-app purchase capability
 *   - Product ID registered in App Store Connect
 *   - react-native-iap installed and linked
 *
 * Required packages (not yet installed):
 *   pnpm add react-native-iap
 *   pnpm add expo-store-review (optional — for post-purchase review prompt)
 *
 * Product ID placeholder — must match App Store Connect product:
 */
const STORE_KIT_PRODUCT_ID = 'com.immortality.app.pro_monthly_99k'; // TODO: confirm with App Store Connect

async function initiatePurchaseStoreKit(): Promise<PaymentResult> {
  // ── STUB START ──────────────────────────────────────────────────────────
  // When react-native-iap is installed, replace this block with:
  //
  //   import * as RNIap from 'react-native-iap';
  //   await RNIap.initConnection();
  //   const products = await RNIap.getProducts({ skus: [STORE_KIT_PRODUCT_ID] });
  //   const purchase = await RNIap.requestPurchase({ sku: STORE_KIT_PRODUCT_ID });
  //   await RNIap.finishTransaction({ purchase, isConsumable: false });
  //   // Verify receipt on server:
  //   const result = await apiClient.post('/api/payments/pro/storekit-verify', {
  //     receiptData: purchase.transactionReceipt,
  //   });
  //   return { paymentId: result.paymentId, method: 'storekit-iap', status: 'confirmed', amountLabel: PRO_PLAN_AMOUNT_LABEL };
  //
  // ── STUB END ────────────────────────────────────────────────────────────

  throw new Error(
    'StoreKit IAP not yet configured. ' +
    'Set EXPO_PUBLIC_USE_STORE_KIT_IAP=false to use SePay/Stripe, ' +
    `or provision Apple Developer account with product ID: ${STORE_KIT_PRODUCT_ID}`,
  );
}

// ── Poll payment status ───────────────────────────────────────────────────

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_ATTEMPTS = 40; // 2 minutes max

export async function pollPaymentStatus(
  paymentId: string,
  onStatusChange?: (status: PaymentStatusResponse['status']) => void,
): Promise<PaymentStatusResponse> {
  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    await new Promise<void>((r) => setTimeout(r, POLL_INTERVAL_MS));

    const result = await apiClient.get<PaymentStatusResponse>(
      `/api/payments/pro/${paymentId}/status`,
    );

    onStatusChange?.(result.status);

    if (result.status === 'confirmed' || result.status === 'failed') {
      return result;
    }
  }

  return { paymentId, status: 'failed' };
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * initiateProPurchase — entry point for all payment paths.
 *
 * Reads EXPO_PUBLIC_USE_STORE_KIT_IAP feature flag at call time.
 * method param allows caller to choose SePay vs Stripe when not using IAP.
 */
export async function initiateProPurchase(
  method: 'sepay-vietqr' | 'stripe-web' = 'sepay-vietqr',
): Promise<PaymentResult> {
  if (USE_STORE_KIT_IAP) {
    return initiatePurchaseStoreKit();
  }

  if (method === 'stripe-web') {
    return initiatePurchaseStripeWeb();
  }

  return initiatePurchaseSePay();
}
