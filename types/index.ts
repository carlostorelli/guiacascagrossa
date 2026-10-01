export interface Product {
  id: string;
  brand_id: 'growth-supplements' | 'oficial-farma' | string;
  brand: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  indication: string;
  usage_instruction: string;
  ingredients?: string;
  warnings?: string;
  restrictions?: string;
  image_url?: string;
  url: string;
  coupon: string;
  active: boolean;
  priority: number;
  equivalent_slug?: string | null;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  website: string;
  active: boolean;
  coupon: string;
}

export interface UserProfile {
  name?: string;
  age: number | null;
  sex: 'masculino' | 'feminino' | 'outro' | null;
  goal: string[];
  training: {
    type: string | null;
    frequency: number | null;
  };
  scores: {
    sleep: number | null;
    energy: number | null;
    stress: number | null;
    focus: number | null;
    libido: number | null;
    digestion: number | null;
  };
  diet: 'ruim' | 'razoavel' | 'boa' | 'muito_boa' | null;
  lactose_intolerance: boolean | 'nao_sei' | null;
  dietary_pattern: 'onivoro' | 'vegetariano' | 'vegano' | null;
  medications: string[];
  health_conditions: string[];
  allergies: string[];
  pregnant_or_breastfeeding: boolean;
  additional_health_info?: string;
}

export interface SafetyEvaluation {
  isSafe: boolean;
  requiresMedicalDisclaimer: boolean;
  limitRecommendations: boolean;
  warnings: string[];
  disclaimer: string;
  blockedCategories: string[];
}

export interface RecommendedProduct {
  product: Product;
  priority: number;
  priorityTitle: string;
  reason: string;
  matchedGoalOrNeed: string;
  equivalentProduct?: Product;
}

export interface Assessment {
  id: string;
  user_id?: string;
  user_name: string;
  raw_text: string;
  structured_profile: UserProfile;
  safety_evaluation: SafetyEvaluation;
  recommendations: RecommendedProduct[];
  created_at: string;
}

export interface ProductClickEvent {
  id: string;
  user_id?: string;
  product_id: string;
  brand_id: string;
  assessment_id?: string;
  destination_url: string;
  created_at: string;
}

export interface CouponEvent {
  id: string;
  type: 'view' | 'copy';
  coupon: string;
  source_page: string;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  totalGuides: number;
  totalPdfs: number;
  totalClicks: number;
  growthClicks: number;
  oficialFarmaClicks: number;
  couponCopies: number;
  topRecommendedProducts: {
    name: string;
    brand: string;
    count: number;
  }[];
}
