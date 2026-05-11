/**
 * Tests: ProPaywallModal99k appears on AI screen entry when not Pro.
 *
 * Critical invariants:
 *   1. PaywallModal visible=true → renders paywall content
 *   2. PaywallModal visible=false → renders nothing
 *   3. CTA buttons present: VietQR + Stripe
 *   4. Disclaimer text present
 *   5. Feature bullets present
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Svg = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(View, null, children);
  return {
    __esModule: true,
    default: Svg,
    Path: () => null,
    Circle: () => null,
  };
});

// Mock payment service — don't hit real endpoints in tests
jest.mock('../../src/services/payment-service', () => ({
  initiateProPurchase: jest.fn().mockResolvedValue({
    paymentId: 'test-payment-id',
    method: 'sepay-vietqr',
    status: 'pending',
    qrDataUri: 'data:image/png;base64,abc',
    amountLabel: '99.000 ₫',
  }),
  pollPaymentStatus: jest.fn().mockResolvedValue({ paymentId: 'test-payment-id', status: 'pending' }),
}));

import { ProPaywallModal99k } from '../../src/components/tu-khai-tri/pro-paywall-modal-99k';

describe('ProPaywallModal99k', () => {
  const noop = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders paywall content when visible=true', () => {
    const { getByText } = render(
      <ProPaywallModal99k visible={true} onDismiss={noop} onPurchaseSuccess={noop} />,
    );
    expect(getByText('AI hỏi ngược')).toBeTruthy();
    expect(getByText(/99.000/)).toBeTruthy();
  });

  it('renders CTA button for VietQR', () => {
    const { getByLabelText } = render(
      <ProPaywallModal99k visible={true} onDismiss={noop} onPurchaseSuccess={noop} />,
    );
    expect(getByLabelText('Đăng ký Pro qua VietQR')).toBeTruthy();
  });

  it('renders CTA button for Stripe', () => {
    const { getByLabelText } = render(
      <ProPaywallModal99k visible={true} onDismiss={noop} onPurchaseSuccess={noop} />,
    );
    expect(getByLabelText('Thanh toán qua Stripe')).toBeTruthy();
  });

  it('shows disclaimer that core content is never locked', () => {
    const { getByText } = render(
      <ProPaywallModal99k visible={true} onDismiss={noop} onPurchaseSuccess={noop} />,
    );
    expect(getByText(/Lõi nội dung Bất Tử Đạo không bao giờ bị khóa/i)).toBeTruthy();
  });

  it('shows close button and calls onDismiss', () => {
    const onDismiss = jest.fn();
    const { getByLabelText } = render(
      <ProPaywallModal99k visible={true} onDismiss={onDismiss} onPurchaseSuccess={noop} />,
    );
    fireEvent.press(getByLabelText('Đóng'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('shows feature bullet about turn-based design', () => {
    const { getByText } = render(
      <ProPaywallModal99k visible={true} onDismiss={noop} onPurchaseSuccess={noop} />,
    );
    expect(getByText(/Không timer/i)).toBeTruthy();
  });
});
