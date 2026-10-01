import { UserProfile, SafetyEvaluation, RecommendedProduct, Product } from '@/types';
import { getAllProducts, getEquivalentProduct } from '@/lib/db/products';
import { filterProductSafety } from '@/lib/safety/screening';

interface GoalRule {
  id: string;
  title: string;
  category: string;
  trigger: (p: UserProfile) => boolean;
  scoreWeight: (p: UserProfile) => number;
  productNames: string[];
  defaultReason: string;
}

const GOAL_RULES: GoalRule[] = [
  // 1. Sono & Recuperação Noturna
  {
    id: 'sono',
    title: 'RECUPERAÇÃO & QUALIDADE DO SONO',
    category: 'sono',
    trigger: (p) => (p.scores.sleep !== null && p.scores.sleep <= 5) || p.goal.includes('sono'),
    scoreWeight: (p) => (p.scores.sleep !== null ? 10 - p.scores.sleep : 6),
    productNames: ['Melatonina + Associações', 'Sossegarte Black', 'Glicina', 'Taurina'],
    defaultReason:
      'Sua pontuação de sono indicou necessidade de suporte na indução e manutenção do repouso reparador, essencial para a síntese proteica e equilíbrio hormonal.',
  },

  // 2. Energia & Disposição
  {
    id: 'energia',
    title: 'ENERGIA CELULAR & VITALIDADE',
    category: 'energia',
    trigger: (p) => (p.scores.energy !== null && p.scores.energy <= 5) || p.goal.includes('energia') || p.goal.includes('disposicao'),
    scoreWeight: (p) => (p.scores.energy !== null ? 10 - p.scores.energy : 6),
    productNames: ['CoenzimaQ10', 'Coenzima Q10 100mg', 'Composto energético', 'Complexo B'],
    defaultReason:
      'Identificamos que seu nível de energia durante o dia pode ser otimizado através de cofatores mitocondriais que auxiliam na conversão de nutrientes em ATP celular.',
  },

  // 3. Estresse & Ansiedade
  {
    id: 'estresse',
    title: 'CONTROLE DO ESTRESSE & EQUILÍBRIO',
    category: 'estresse',
    trigger: (p) => (p.scores.stress !== null && p.scores.stress >= 6) || p.goal.includes('estresse'),
    scoreWeight: (p) => (p.scores.stress !== null ? p.scores.stress : 6),
    productNames: ['KSM', 'Relora', 'Composto Calmante'],
    defaultReason:
      'Níveis elevados de estresse impactam o cortisol e a recuperação física. Adaptógenos comprovados auxiliam no equilíbrio emocional e no controle da compulsão.',
  },

  // 4. Ganho de Massa / Hipertrofia
  {
    id: 'hipertrofia',
    title: 'FORÇA & SÍNTESE PROTEICA',
    category: 'hipertrofia',
    trigger: (p) => p.goal.includes('hipertrofia') || p.goal.includes('massa'),
    scoreWeight: () => 8,
    productNames: [
      'Creatina',
      'Whey Protein concentrado',
      'Whey Protein Zero Lactose',
      'Soy Protein',
      'Arginina',
      'L-Arginina',
      'Hipercalórico Big Mass',
    ],
    defaultReason:
      'Para potencializar a hipertrofia e a regeneração miofibrilar pós-treino, selecionamos fontes de aporte proteico de alto valor biológico e suporte à ressíntese de fosfocreatina.',
  },

  // 5. Emagrecimento & Queima / Controle
  {
    id: 'emagrecimento',
    title: 'METABOLISMO & CONTROLE DE APETITE',
    category: 'emagrecimento',
    trigger: (p) => p.goal.includes('emagrecimento') || p.goal.includes('perda_de_peso'),
    scoreWeight: () => 8,
    productNames: [
      'Morosil 500mg + Cactin 500mg',
      'Picolinato de Cromo',
      'Psyllium 500mg',
      'Psylium',
      'Chá Verde',
      'Cha verde',
      'FomeControlBlack',
      'Termogênico Abelinha',
    ],
    defaultReason:
      'Selecionado para apoiar o gerenciamento de peso, auxiliando no controle de compulsão alimentar por carboidratos e suporte antioxidante e metabólico.',
  },

  // 6. Libido & Vitalidade Hormonal
  {
    id: 'libido',
    title: 'VITALIDADE & EQUILÍBRIO HORMONAL',
    category: 'libido',
    trigger: (p) => (p.scores.libido !== null && p.scores.libido <= 5) || p.goal.includes('libido'),
    scoreWeight: (p) => (p.scores.libido !== null ? 10 - p.scores.libido : 7),
    productNames: ['Maca peruana', 'Testo Black', 'TestoBlack Femme', 'Tribulus terrestris', 'Feno-grego'],
    defaultReason:
      'Fitoterápicos tradicionais com estudos em vigor físico, suporte à libido e otimização natural da sensação de vitalidade e bem-estar.',
  },

  // 7. Saúde Intestinal & Digestão
  {
    id: 'digestao',
    title: 'INTEGRIDADE DIGESTIVA & MICROBIOTA',
    category: 'digestao',
    trigger: (p) => (p.scores.digestion !== null && p.scores.digestion <= 5) || p.goal.includes('digestao'),
    scoreWeight: (p) => (p.scores.digestion !== null ? 10 - p.scores.digestion : 7),
    productNames: [
      'Glutamina',
      'Enzimas digestivas',
      'Complexo Probiótico',
      'Corebiome Plus',
      'Espinheira Santa',
    ],
    defaultReason:
      'Uma barreira intestinal íntegra é fundamental para a absorção máxima de nutrientes e para a produção periférica de neurotransmissores como serotonina.',
  },

  // 8. Foco & Concentração
  {
    id: 'foco',
    title: 'COGNISÇÃO & PERFORMANCE MENTAL',
    category: 'foco',
    trigger: (p) => (p.scores.focus !== null && p.scores.focus <= 5) || p.goal.includes('foco'),
    scoreWeight: (p) => (p.scores.focus !== null ? 10 - p.scores.focus : 6),
    productNames: ['Teanina + Cafeína + Rhodiola Rosea', 'KSM'],
    defaultReason:
      'Complexo nootrópico e adaptogênico desenvolvido para sustentação de foco, clareza mental e estado de fluxo sem gerar picos de nervosismo.',
  },

  // 9. Articulações e Lesões
  {
    id: 'articular',
    title: 'PROTEÇÃO ARTICULAR & MOBILIDADE',
    category: 'articular',
    trigger: (p) => p.goal.includes('articulacoes') || p.goal.includes('dores_articulares'),
    scoreWeight: () => 7,
    productNames: [
      'Glucosamina + Condroitina + CT2 + Ácido Hialurônico',
      'Colágeno Tipo II',
    ],
    defaultReason:
      'Essencial para praticantes de treinos intensos que necessitam de preservação da cartilagem hialina e modulação do desgaste articular.',
  },

  // 10. Vegano / Vegetariano
  {
    id: 'vegano',
    title: 'SUPORTE NUTRICIONAL ESPECÍFICO (PLANT-BASED)',
    category: 'vegano',
    trigger: (p) => p.dietary_pattern === 'vegano' || p.dietary_pattern === 'vegetariano',
    scoreWeight: () => 8,
    productNames: ['Metilcobalamina + Metilfolato', 'Soy Protein', 'Complexo B'],
    defaultReason:
      'Indivíduos em alimentação baseada em vegetais têm indicação direta de acompanhamento dos níveis de Cobalamina ativa (B12) e aporte proteico completo.',
  },

  // 11. Saúde Geral & Base Imunológica
  {
    id: 'saude_geral',
    title: 'FUNDAÇÃO DE SAÚDE & LONGEVIDADE',
    category: 'saude_geral',
    trigger: () => true,
    scoreWeight: () => 4,
    productNames: [
      'Omega 3',
      'Óleo de Peixe Ultra',
      'Multivitamínico Ultra',
      'Vitamina D3 Ultra',
      'NAC',
      'N Acetil Cisteína',
    ],
    defaultReason:
      'Nutrientes essenciais fundamentais que garantem o funcionamento celular basal, redução de processos oxidativos e suporte ao sistema cardiovascular.',
  },
];

export function generateRecommendations(
  profile: UserProfile,
  safety: SafetyEvaluation
): RecommendedProduct[] {
  const allProducts = getAllProducts();
  const safeProducts = allProducts.filter((p) => filterProductSafety(p, safety, profile));

  // Determine active rules triggered by user profile
  const triggeredRules = GOAL_RULES.filter((rule) => rule.trigger(profile)).sort(
    (a, b) => b.scoreWeight(profile) - a.scoreWeight(profile)
  );

  const selectedRecommendations: RecommendedProduct[] = [];
  const selectedProductNames = new Set<string>();
  const selectedEquivalents = new Set<string>();

  // Helper to find candidate product in database
  const findCandidate = (candidateNames: string[]): Product | null => {
    // Exact or loose name match among safe products
    for (const targetName of candidateNames) {
      const match = safeProducts.find((p) => {
        if (selectedProductNames.has(p.name)) return false;
        if (p.equivalent_slug && selectedEquivalents.has(p.equivalent_slug)) return false;

        // Custom lactose filter
        if (profile.lactose_intolerance === true) {
          if (p.name.toLowerCase() === 'whey protein concentrado') return false;
          if (targetName === 'Whey Protein concentrado') return false;
        }

        // Custom vegan filter
        if (profile.dietary_pattern === 'vegano') {
          if (p.name.toLowerCase().includes('whey')) return false;
        }

        return p.name.trim().toLowerCase() === targetName.trim().toLowerCase();
      });

      if (match) return match;
    }
    return null;
  };

  // Iterate over triggered rules and pick top candidates
  for (const rule of triggeredRules) {
    if (selectedRecommendations.length >= 5) break;

    const matchedProduct = findCandidate(rule.productNames);
    if (matchedProduct) {
      selectedProductNames.add(matchedProduct.name);
      if (matchedProduct.equivalent_slug) {
        selectedEquivalents.add(matchedProduct.equivalent_slug);
      }

      const equivalent = getEquivalentProduct(matchedProduct);

      const priorityNumber = selectedRecommendations.length + 1;
      selectedRecommendations.push({
        product: matchedProduct,
        priority: priorityNumber,
        priorityTitle: `#${priorityNumber} ${rule.title}`,
        reason: rule.defaultReason,
        matchedGoalOrNeed: rule.category,
        equivalentProduct: equivalent,
      });
    }
  }

  // Ensure between 3 and 5 products
  if (selectedRecommendations.length < 3) {
    // Fill with high-priority foundational products (Creatina, Omega 3, Multivitamínico)
    const fallbackNames = ['Creatina', 'Omega 3', 'Óleo de Peixe Ultra', 'Multivitamínico Ultra', 'Complexo B'];
    for (const name of fallbackNames) {
      if (selectedRecommendations.length >= 4) break;
      const fallbackProd = findCandidate([name]);
      if (fallbackProd) {
        selectedProductNames.add(fallbackProd.name);
        const equivalent = getEquivalentProduct(fallbackProd);
        const priorityNumber = selectedRecommendations.length + 1;
        selectedRecommendations.push({
          product: fallbackProd,
          priority: priorityNumber,
          priorityTitle: `#${priorityNumber} SUPORTE NUTRICIONAL DE BASE`,
          reason: 'Suplemento de eficácia padrão-ouro selecionado como pilar nutricional para estabilidade fisiológica.',
          matchedGoalOrNeed: 'base',
          equivalentProduct: equivalent,
        });
      }
    }
  }

  // Limit strictly to 3 - 5 products (per requirement)
  return selectedRecommendations.slice(0, 5);
}
