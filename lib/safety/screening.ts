import { UserProfile, SafetyEvaluation, Product } from '@/types';

export const MANDATORY_LEGAL_DISCLAIMER =
  'Este guia possui caráter informativo e educacional e foi elaborado a partir das informações fornecidas pelo usuário e do catálogo cadastrado na plataforma. Ele não substitui avaliação, diagnóstico, prescrição ou acompanhamento de médico, nutricionista ou outro profissional habilitado.';

export function evaluateSafety(profile: UserProfile): SafetyEvaluation {
  const warnings: string[] = [];
  const blockedCategories: string[] = [];
  let requiresMedicalDisclaimer = true;
  let limitRecommendations = false;

  // 1. Gravidez e Amamentação
  if (profile.pregnant_or_breastfeeding) {
    limitRecommendations = true;
    warnings.push(
      'Gestantes e lactantes necessitam de prescrição médica e nutricional estrita antes de iniciar qualquer suplementação alimentar.'
    );
    // Bloqueia termogênicos, pré-treinos, fitoterápicos hormonais e doses altas
    blockedCategories.push('termogenicos', 'pre_treino', 'estimulantes', 'fitoterapicos');
  }

  // 2. Uso contínuo de medicamentos
  if (profile.medications && profile.medications.length > 0) {
    const medsLower = profile.medications.map((m) => m.toLowerCase()).join(' ');
    
    // Anticoagulantes (varfarina, aspirina, clopidogrel, xarelto)
    if (/anticoagul|varfarin|aspirin|xarelto|eliquis|clopidogrel/.test(medsLower)) {
      warnings.push(
        'Você indicou uso de medicamentos anticoagulantes. Suplementos como altas doses de Ômega 3, Vitamina K e Ginkgo podem apresentar interação farmacológica.'
      );
      blockedCategories.push('vitamina_k', 'doses_altas_omega3');
      limitRecommendations = true;
    }

    // Antidepressivos / ansiolíticos / sedativos (ISRS, clonazepam, fluoxetina, sertralina)
    if (/antidepress|sertralin|fluoxetin|escitalopram|clonazepam|rivotril|alprazolam|zolpidem/.test(medsLower)) {
      warnings.push(
        'Uso de medicamentos com ação sobre o sistema nervoso central exige atenção ao associar compostos indutores de sono ou adaptógenos (como KSM-66, Relora ou Melatonina).'
      );
    }

    // Anti-hipertensivos
    if (/pressao|hipertens|losartan|enalapril|atenolol|anlodipin/.test(medsLower)) {
      warnings.push(
        'Atenção ao consumo de estimulantes e pré-treinos de alta concentração de cafeína devido ao controle da pressão arterial.'
      );
      blockedCategories.push('termogenicos_fortes', 'pre_treino_hardcore');
    }

    // Estatinas (atorvastatina, rosuvastatina, sinvastatina)
    if (/estatina|sinvastatina|atorvastatina|rosuvastatina/.test(medsLower)) {
      warnings.push(
        'Usuários de estatinas podem se beneficiar da Coenzima Q10 sob acompanhamento clínico.'
      );
    }
  }

  // 3. Condições de Saúde Crônicas
  if (profile.health_conditions && profile.health_conditions.length > 0) {
    const conditionsLower = profile.health_conditions.map((c) => c.toLowerCase()).join(' ');

    if (/renal|rim|insuficiencia renal|calculo renal/.test(conditionsLower)) {
      limitRecommendations = true;
      warnings.push(
        'Condições renais exigem controle rigoroso da ingestão proteica e de creatina com seu nefrologista.'
      );
      blockedCategories.push('altas_proteinas', 'creatina_sem_aval');
    }

    if (/cardiac|coracao|arritmia|infarto/.test(conditionsLower)) {
      limitRecommendations = true;
      warnings.push(
        'Estimulantes como cafeína anidra, pré-treinos intensos e termogênicos devem ser evitados em condições cardiovasculares.'
      );
      blockedCategories.push('termogenicos', 'pre_treino', 'estimulantes');
    }

    if (/diabetes|insulina/.test(conditionsLower)) {
      warnings.push(
        'Compostos que auxiliam na sensibilidade à insulina (como Berberina, Picolinato de Cromo e Mioinositol) requerem monitoramento glicêmico.'
      );
    }
  }

  // 4. Alergias conhecidas
  if (profile.allergies && profile.allergies.length > 0) {
    const allergiesLower = profile.allergies.map((a) => a.toLowerCase()).join(' ');
    if (/leite|lactose|caseina|soro/.test(allergiesLower)) {
      warnings.push(
        'Alergia a proteínas do leite identificada: evite derivados lácteos tradicionais. Priorize proteínas vegetais isoladas (como Soy Protein).'
      );
      blockedCategories.push('whey_tradicional');
    }
    if (/peixe|frutos do mar|crustaceo/.test(allergiesLower)) {
      warnings.push(
        'Alergia a peixes/crustáceos identificada: evite óleo de peixe convencional e verifique a procedência das cápsulas.'
      );
      blockedCategories.push('oleo_peixe');
    }
    if (/soja/.test(allergiesLower)) {
      blockedCategories.push('soja');
    }
  }

  // 5. Intolerância à lactose
  if (profile.lactose_intolerance === true) {
    warnings.push(
      'Intolerância à lactose indicada: o catálogo oferece alternativas como Whey Zero Lactose, Soy Protein ou suporte de Lactase.'
    );
  }

  const isSafe = !limitRecommendations || warnings.length <= 2;
  const disclaimer = limitRecommendations
    ? 'Algumas informações do seu perfil precisam de avaliação profissional antes de uma recomendação de suplementação.'
    : MANDATORY_LEGAL_DISCLAIMER;

  return {
    isSafe,
    requiresMedicalDisclaimer,
    limitRecommendations,
    warnings,
    disclaimer,
    blockedCategories,
  };
}

export function filterProductSafety(product: Product, safety: SafetyEvaluation, profile: UserProfile): boolean {
  const prodNameLower = product.name.toLowerCase();
  const prodIndLower = product.indication.toLowerCase();

  // If pregnant/breastfeeding, block stimulants, pre-workouts, and complex herbals
  if (profile.pregnant_or_breastfeeding) {
    if (
      prodNameLower.includes('pre treino') ||
      prodNameLower.includes('termogenico') ||
      prodNameLower.includes('abelinha') ||
      prodNameLower.includes('cafeina') ||
      prodNameLower.includes('relora') ||
      prodNameLower.includes('ksm') ||
      prodNameLower.includes('testo')
    ) {
      return false;
    }
  }

  // Allergen checks
  if (safety.blockedCategories.includes('whey_tradicional')) {
    if (prodNameLower.includes('whey protein concentrado') || prodNameLower.includes('gourmet')) {
      return false;
    }
  }

  if (safety.blockedCategories.includes('oleo_peixe')) {
    if (prodNameLower.includes('oleo de peixe') || prodNameLower.includes('omega 3')) {
      return false;
    }
  }

  if (safety.blockedCategories.includes('soja')) {
    if (prodNameLower.includes('soy')) {
      return false;
    }
  }

  // Lactose filter
  if (profile.lactose_intolerance === true) {
    if (prodNameLower === 'whey protein concentrado' || prodNameLower === 'whey protein gourmet') {
      return false;
    }
  }

  // Vegan / Vegetarian filter
  if (profile.dietary_pattern === 'vegano') {
    if (
      prodNameLower.includes('whey') ||
      prodNameLower.includes('colageno') ||
      prodNameLower.includes('oleo de peixe') ||
      prodNameLower.includes('lactase')
    ) {
      return false;
    }
  }

  return true;
}
