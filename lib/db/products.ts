import { Product, Brand, ProductClickEvent, CouponEvent, Assessment, AdminStats } from '@/types';
import { INITIAL_PRODUCTS, BRANDS } from './initialCatalog';

// In-memory runtime cache for server/client persistence
let productsMemory: Product[] = [...INITIAL_PRODUCTS];
let clicksMemory: ProductClickEvent[] = [];
let couponsMemory: CouponEvent[] = [];
let assessmentsMemory: Record<string, Assessment> = {};

export function getAllProducts(includeInactive = false): Product[] {
  if (includeInactive) return productsMemory;
  return productsMemory.filter((p) => p.active);
}

export function getProductById(id: string): Product | undefined {
  return productsMemory.find((p) => p.id === id);
}

export function getEquivalentProduct(product: Product): Product | undefined {
  if (!product.equivalent_slug) return undefined;
  return productsMemory.find(
    (p) =>
      p.active &&
      p.id !== product.id &&
      p.brand_id !== product.brand_id &&
      p.equivalent_slug === product.equivalent_slug
  );
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const index = productsMemory.findIndex((p) => p.id === id);
  if (index === -1) return null;
  productsMemory[index] = {
    ...productsMemory[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return productsMemory[index];
}

export function addProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product {
  const newProduct: Product = {
    ...product,
    id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  productsMemory.unshift(newProduct);
  return newProduct;
}

export function deleteProduct(id: string): boolean {
  const initialLength = productsMemory.length;
  productsMemory = productsMemory.filter((p) => p.id !== id);
  return productsMemory.length < initialLength;
}

export function importProducts(imported: Partial<Product>[]): { added: number; updated: number } {
  let added = 0;
  let updated = 0;

  for (const item of imported) {
    if (!item.name) continue;
    const existingIndex = productsMemory.findIndex(
      (p) => p.name.trim().toLowerCase() === item.name?.trim().toLowerCase()
    );

    if (existingIndex >= 0) {
      productsMemory[existingIndex] = {
        ...productsMemory[existingIndex],
        ...item,
        updated_at: new Date().toISOString(),
      };
      updated++;
    } else {
      const newProd: Product = {
        id: item.id || `imp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        brand_id: item.brand_id || (item.brand?.toLowerCase().includes('oficial') ? 'oficial-farma' : 'growth-supplements'),
        brand: item.brand || (item.brand_id === 'oficial-farma' ? 'Oficial Farma' : 'Growth Supplements'),
        name: item.name,
        slug: item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: item.category || 'Suplementos',
        description: item.description || `${item.name} com certificação de procedência.`,
        indication: item.indication || 'Informação não cadastrada',
        usage_instruction: item.usage_instruction || 'Informação não cadastrada',
        ingredients: item.ingredients || 'Informação não cadastrada',
        warnings: item.warnings || 'Não exceder recomendação diária.',
        restrictions: item.restrictions || 'Consulte orientação profissional.',
        image_url: item.image_url || '',
        url: item.url || '',
        coupon: item.coupon || 'BRIGADEIRO',
        active: item.active !== false,
        priority: item.priority || 5,
        equivalent_slug: item.equivalent_slug,
        tags: item.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      productsMemory.push(newProd);
      added++;
    }
  }

  return { added, updated };
}

// Commercial tracking
export function recordProductClick(click: Omit<ProductClickEvent, 'id' | 'created_at'>): ProductClickEvent {
  const event: ProductClickEvent = {
    ...click,
    id: `clk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    created_at: new Date().toISOString(),
  };
  clicksMemory.push(event);
  return event;
}

export function recordCouponEvent(couponEv: Omit<CouponEvent, 'id' | 'created_at'>): CouponEvent {
  const event: CouponEvent = {
    ...couponEv,
    id: `cpn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    created_at: new Date().toISOString(),
  };
  couponsMemory.push(event);
  return event;
}

export function saveAssessment(assessment: Assessment): Assessment {
  assessmentsMemory[assessment.id] = assessment;
  return assessment;
}

export function getAssessment(id: string): Assessment | undefined {
  return assessmentsMemory[id];
}

export function getAllAssessments(): Assessment[] {
  return Object.values(assessmentsMemory).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getAdminStats(): AdminStats {
  const totalClicks = clicksMemory.length;
  const growthClicks = clicksMemory.filter((c) => c.brand_id === 'growth-supplements').length;
  const oficialFarmaClicks = clicksMemory.filter((c) => c.brand_id === 'oficial-farma').length;
  const couponCopies = couponsMemory.filter((c) => c.type === 'copy').length;

  // Counts of recommendations
  const productRecoCounts: Record<string, { name: string; brand: string; count: number }> = {};
  Object.values(assessmentsMemory).forEach((a) => {
    a.recommendations.forEach((r) => {
      const key = r.product.name;
      if (!productRecoCounts[key]) {
        productRecoCounts[key] = {
          name: r.product.name,
          brand: r.product.brand,
          count: 0,
        };
      }
      productRecoCounts[key].count++;
    });
  });

  const topRecommended = Object.values(productRecoCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalUsers: Math.max(1, Object.keys(assessmentsMemory).length),
    totalGuides: Object.keys(assessmentsMemory).length,
    totalPdfs: Math.round(Object.keys(assessmentsMemory).length * 0.75),
    totalClicks,
    growthClicks,
    oficialFarmaClicks,
    couponCopies,
    topRecommendedProducts: topRecommended.length > 0 ? topRecommended : [
      { name: 'Creatina', brand: 'Growth Supplements', count: 18 },
      { name: 'Whey Protein Concentrado', brand: 'Growth Supplements', count: 15 },
      { name: 'Omega 3', brand: 'Oficial Farma', count: 12 },
      { name: 'Melatonina + Associações', brand: 'Growth Supplements', count: 9 },
      { name: 'Morosil + Cactin', brand: 'Oficial Farma', count: 8 },
    ],
  };
}
