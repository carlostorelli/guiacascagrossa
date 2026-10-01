export async function trackProductClick(params: {
  product_id: string;
  brand_id: string;
  assessment_id?: string;
  destination_url: string;
}): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      // Beacon or fetch to ensure recording before leaving page
      const payload = JSON.stringify(params);
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/track/click', payload);
      } else {
        fetch('/api/track/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    }
  } catch {
    // quiet fail
  }
}

export async function trackCouponCopy(sourcePage: string): Promise<void> {
  try {
    fetch('/api/track/coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'copy',
        coupon: 'BRIGADEIRO',
        source_page: sourcePage,
      }),
    }).catch(() => {});
  } catch {
    // quiet fail
  }
}

export async function trackCouponView(sourcePage: string): Promise<void> {
  try {
    fetch('/api/track/coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'view',
        coupon: 'BRIGADEIRO',
        source_page: sourcePage,
      }),
    }).catch(() => {});
  } catch {
    // quiet fail
  }
}
