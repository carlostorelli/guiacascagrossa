import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Assessment } from '@/types';

export async function generateGuidePdf(assessment: Assessment): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  const bgDark = [8, 10, 11] as const; // #080A0B
  const cardDark = [17, 20, 22] as const; // #111416
  const borderDark = [41, 47, 51] as const; // #292F33
  const textWhite = [245, 247, 248] as const; // #F5F7F8
  const textMuted = [146, 154, 159] as const; // #929A9F
  const neonGreen = [182, 255, 59] as const; // #B6FF3B

  function fillBackground() {
    doc.setFillColor(bgDark[0], bgDark[1], bgDark[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  }

  function addFooter(pageNumber: number, totalPages: number) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(
      `GUIA CASCA GROSSA | Marcelo Brigadeiro  |  CUPOM: BRIGADEIRO  |  Página ${pageNumber} de ${totalPages}`,
      margin,
      pageHeight - 10
    );

    // Subtle neon footer line
    doc.setDrawColor(borderDark[0], borderDark[1], borderDark[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
  }

  // ==================== PÁGINA 1: CAPA ====================
  fillBackground();

  // Top Neon Bar Accent
  doc.setFillColor(neonGreen[0], neonGreen[1], neonGreen[2]);
  doc.rect(margin, 20, 32, 3, 'F');

  // Title
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
  doc.text('GUIA PERSONALIZADO', margin, 35);
  doc.setTextColor(neonGreen[0], neonGreen[1], neonGreen[2]);
  doc.text('DE SUPLEMENTAÇÃO', margin, 46);

  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Análise inteligente baseada em evidências e catálogo oficial verificado', margin, 54);

  // Decorative Card in Center
  doc.setFillColor(cardDark[0], cardDark[1], cardDark[2]);
  doc.setDrawColor(borderDark[0], borderDark[1], borderDark[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, 70, contentWidth, 120, 4, 4, 'FD');

  // Badge
  doc.setFillColor(24, 28, 31);
  doc.roundedRect(margin + 10, 80, 50, 8, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(neonGreen[0], neonGreen[1], neonGreen[2]);
  doc.text('ATLETA / USUÁRIO', margin + 14, 85.5);

  // User Name
  doc.setFontSize(22);
  doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
  doc.text(assessment.user_name || 'Atleta', margin + 10, 100);

  // Data
  const dateFormatted = new Date(assessment.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.setFontSize(10);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Data da Avaliação: ${dateFormatted}`, margin + 10, 108);

  // Goal highlight
  const goalsStr = assessment.structured_profile.goal.join(' • ').toUpperCase() || 'PERFORMANCE E SAÚDE';
  doc.setFontSize(11);
  doc.setTextColor(neonGreen[0], neonGreen[1], neonGreen[2]);
  doc.text(`Objetivo Principal: ${goalsStr}`, margin + 10, 122);

  // Training summary
  const freq = assessment.structured_profile.training.frequency;
  const tType = assessment.structured_profile.training.type || 'Treino Regular';
  doc.setFontSize(10);
  doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
  doc.text(`Rotina: ${tType} (${freq ? `${freq}x na semana` : 'Frequência regular'})`, margin + 10, 132);

  // Big Coupon Callout
  doc.setFillColor(8, 10, 11);
  doc.setDrawColor(neonGreen[0], neonGreen[1], neonGreen[2]);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin + 10, 145, contentWidth - 20, 32, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('CUPOM OFICIAL PARA ECONOMIZAR NA SUA COMPRA:', margin + 18, 155);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(neonGreen[0], neonGreen[1], neonGreen[2]);
  doc.text('BRIGADEIRO', margin + 18, 168);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
  doc.text('Válido na Growth Supplements e Oficial Farma', margin + 85, 167);

  // Brands info box at bottom of cover
  doc.setFontSize(9);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('CATÁLOGO AUDITADO:', margin, 215);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
  doc.text('Growth Supplements  •  Oficial Farma', margin, 223);

  // ==================== PÁGINA 2: SEU PERFIL ====================
  doc.addPage();
  fillBackground();

  // Page Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
  doc.text('SEU PERFIL & DIAGNÓSTICO DE ROTINA', margin, 25);
  doc.setFillColor(neonGreen[0], neonGreen[1], neonGreen[2]);
  doc.rect(margin, 28, 24, 1.5, 'F');

  // Profile Scores Card
  doc.setFillColor(cardDark[0], cardDark[1], cardDark[2]);
  doc.setDrawColor(borderDark[0], borderDark[1], borderDark[2]);
  doc.roundedRect(margin, 36, contentWidth, 110, 3, 3, 'FD');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
  doc.text('Métricas Subjetivas de Bem-Estar (0 a 10)', margin + 8, 46);

  const scores = assessment.structured_profile.scores;
  const scoreItems = [
    { label: 'Qualidade do Sono', val: scores.sleep ?? 7, max: 10 },
    { label: 'Disposição & Energia Diária', val: scores.energy ?? 7, max: 10 },
    { label: 'Nível de Estresse / Tensão', val: scores.stress ?? 5, max: 10 },
    { label: 'Foco & Clareza Mental', val: scores.focus ?? 7, max: 10 },
    { label: 'Libido & Vitalidade', val: scores.libido ?? 7, max: 10 },
    { label: 'Digestão & Conforto Intestinal', val: scores.digestion ?? 8, max: 10 },
  ];

  let yScore = 56;
  scoreItems.forEach((item) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
    doc.text(item.label, margin + 8, yScore);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(neonGreen[0], neonGreen[1], neonGreen[2]);
    doc.text(`${item.val} / 10`, margin + contentWidth - 25, yScore);

    // Progress bar background
    doc.setFillColor(24, 28, 31);
    doc.roundedRect(margin + 8, yScore + 2, contentWidth - 16, 4, 1, 1, 'F');

    // Progress bar fill
    const fillW = Math.max(2, ((contentWidth - 16) * item.val) / item.max);
    doc.setFillColor(neonGreen[0], neonGreen[1], neonGreen[2]);
    doc.roundedRect(margin + 8, yScore + 2, fillW, 4, 1, 1, 'F');

    yScore += 14;
  });

  // Additional Profile Details Card
  doc.setFillColor(cardDark[0], cardDark[1], cardDark[2]);
  doc.roundedRect(margin, 152, contentWidth, 75, 3, 3, 'FD');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(neonGreen[0], neonGreen[1], neonGreen[2]);
  doc.text('PARÂMETROS CLÍNICOS E ALIMENTARES', margin + 8, 162);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);

  const p = assessment.structured_profile;
  const dietText = p.diet ? p.diet.replace('_', ' ').toUpperCase() : 'Não informada';
  const lactoseText = p.lactose_intolerance === true ? 'Sim' : p.lactose_intolerance === false ? 'Não' : 'Não relatado';
  const patternText = p.dietary_pattern ? p.dietary_pattern.toUpperCase() : 'Onívoro';

  doc.text(`• Padrão Alimentar: ${patternText} (Qualidade: ${dietText})`, margin + 8, 172);
  doc.text(`• Intolerância à Lactose: ${lactoseText}`, margin + 8, 180);
  doc.text(
    `• Medicamentos contínuos: ${p.medications.length ? p.medications.join(', ') : 'Nenhum medicamento relatado'}`,
    margin + 8,
    188
  );
  doc.text(
    `• Condições diagnosticadas: ${p.health_conditions.length ? p.health_conditions.join(', ') : 'Nenhuma condição relatada'}`,
    margin + 8,
    196
  );
  doc.text(
    `• Alergias conhecidas: ${p.allergies.length ? p.allergies.join(', ') : 'Nenhuma alergia relatada'}`,
    margin + 8,
    204
  );
  doc.text(
    `• Gestação / Amamentação: ${p.pregnant_or_breastfeeding ? 'SIM (Atenção redobrada)' : 'Não'}`,
    margin + 8,
    212
  );

  // Safety Banner if warnings exist
  if (assessment.safety_evaluation.warnings.length > 0) {
    doc.setFillColor(28, 18, 18);
    doc.setDrawColor(200, 50, 50);
    doc.roundedRect(margin, 232, contentWidth, 24, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 120, 120);
    doc.text('AVISO DE SEGURANÇA E TRIAGEM:', margin + 6, 238);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
    const warnLine = assessment.safety_evaluation.warnings[0];
    const wrappedWarn = doc.splitTextToSize(warnLine, contentWidth - 12);
    doc.text(wrappedWarn, margin + 6, 244);
  }

  // ==================== PÁGINAS DE PRODUTOS ====================
  for (let i = 0; i < assessment.recommendations.length; i++) {
    const rec = assessment.recommendations[i];
    doc.addPage();
    fillBackground();

    // Header of product page
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(neonGreen[0], neonGreen[1], neonGreen[2]);
    doc.text(rec.priorityTitle, margin, 25);

    // Product Title
    doc.setFontSize(20);
    doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
    doc.text(rec.product.name, margin, 35);

    // Brand Badge
    doc.setFillColor(24, 28, 31);
    doc.roundedRect(margin, 40, 48, 7, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(neonGreen[0], neonGreen[1], neonGreen[2]);
    doc.text(rec.product.brand.toUpperCase(), margin + 4, 45);

    // Section 1: Por que apareceu no seu guia
    doc.setFillColor(cardDark[0], cardDark[1], cardDark[2]);
    doc.setDrawColor(borderDark[0], borderDark[1], borderDark[2]);
    doc.roundedRect(margin, 52, contentWidth, 42, 3, 3, 'FD');

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(neonGreen[0], neonGreen[1], neonGreen[2]);
    doc.text('POR QUE APARECEU NO SEU GUIA:', margin + 6, 60);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
    const wrappedReason = doc.splitTextToSize(rec.reason, contentWidth - 12);
    doc.text(wrappedReason, margin + 6, 67);

    // Section 2: Informação de Uso do Catálogo
    doc.setFillColor(cardDark[0], cardDark[1], cardDark[2]);
    doc.roundedRect(margin, 98, contentWidth, 46, 3, 3, 'FD');

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(neonGreen[0], neonGreen[1], neonGreen[2]);
    doc.text('INSTRUÇÃO DE USO CADASTRADA NO CATÁLOGO:', margin + 6, 106);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
    const usageText = rec.product.usage_instruction || 'Informação não cadastrada';
    const wrappedUsage = doc.splitTextToSize(usageText, contentWidth - 12);
    doc.text(wrappedUsage, margin + 6, 114);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('Indicação no catálogo:', margin + 6, 130);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
    const indText = rec.product.indication || 'Informação não cadastrada';
    const wrappedInd = doc.splitTextToSize(indText, contentWidth - 55);
    doc.text(wrappedInd, margin + 45, 130);

    // Section 3: Onde Comprar & Link Clicável & QR Code
    doc.setFillColor(cardDark[0], cardDark[1], cardDark[2]);
    doc.roundedRect(margin, 148, contentWidth, 80, 3, 3, 'FD');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
    doc.text('ONDE COMPRAR COM O CUPOM BRIGADEIRO', margin + 6, 158);

    const hasLink = Boolean(rec.product.url && rec.product.url.startsWith('http'));

    if (hasLink) {
      // Clickable Link Button in PDF
      doc.setFillColor(neonGreen[0], neonGreen[1], neonGreen[2]);
      doc.roundedRect(margin + 6, 166, contentWidth - 45, 12, 2, 2, 'F');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(bgDark[0], bgDark[1], bgDark[2]);
      const btnText = `VER NA ${rec.product.brand.toUpperCase()} (LINK CLICÁVEL)`;
      doc.text(btnText, margin + 12, 174);

      // Create PDF hyperlink
      doc.link(margin + 6, 166, contentWidth - 45, 12, { url: rec.product.url });

      // Generate real QR code image
      try {
        const qrDataUrl = await QRCode.toDataURL(rec.product.url, { margin: 1, width: 90 });
        doc.addImage(qrDataUrl, 'PNG', margin + contentWidth - 36, 164, 30, 30);
        doc.setFontSize(6.5);
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        doc.text('Aponte a câmera', margin + contentWidth - 36, 198);
      } catch {
        // QR error ignore
      }
    } else {
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('Link direto: Informação não cadastrada na base', margin + 6, 172);
    }

    // Equivalent product comparison if exists
    if (rec.equivalentProduct) {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(neonGreen[0], neonGreen[1], neonGreen[2]);
      doc.text('OPÇÃO EQUIVALENTE NA OUTRA MARCA:', margin + 6, 192);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
      doc.text(
        `${rec.equivalentProduct.name} (${rec.equivalentProduct.brand})`,
        margin + 6,
        198
      );

      if (rec.equivalentProduct.url && rec.equivalentProduct.url.startsWith('http')) {
        doc.setFontSize(8);
        doc.setTextColor(neonGreen[0], neonGreen[1], neonGreen[2]);
        doc.textWithLink(
          `[ Clique para ver na ${rec.equivalentProduct.brand} ]`,
          margin + 6,
          205,
          { url: rec.equivalentProduct.url }
        );
      }
    }

    // Coupon highlight card on product page
    doc.setFillColor(24, 28, 31);
    doc.roundedRect(margin + 6, 214, contentWidth - 12, 10, 2, 2, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(neonGreen[0], neonGreen[1], neonGreen[2]);
    doc.text('🔥 CUPOM DE DESCONTO:', margin + 10, 220.5);
    doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
    doc.text('Use o cupom BRIGADEIRO antes de finalizar seu pedido', margin + 55, 220.5);
  }

  // ==================== PÁGINA FINAL: DISCLAIMER ====================
  doc.addPage();
  fillBackground();

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
  doc.text('AVISO LEGAL & DIRETRIZES DE SAÚDE', margin, 35);
  doc.setFillColor(neonGreen[0], neonGreen[1], neonGreen[2]);
  doc.rect(margin, 38, 24, 1.5, 'F');

  doc.setFillColor(cardDark[0], cardDark[1], cardDark[2]);
  doc.setDrawColor(borderDark[0], borderDark[1], borderDark[2]);
  doc.roundedRect(margin, 48, contentWidth, 70, 3, 3, 'FD');

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
  const finalDisclaimer =
    'Este guia possui caráter informativo e educacional e foi elaborado a partir das informações fornecidas pelo usuário e do catálogo cadastrado na plataforma. Ele não substitui avaliação, diagnóstico, prescrição ou acompanhamento de médico, nutricionista ou outro profissional habilitado.';
  const wrappedFinal = doc.splitTextToSize(finalDisclaimer, contentWidth - 16);
  doc.text(wrappedFinal, margin + 8, 62);

  doc.setFontSize(9);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  const extraLegal =
    'As recomendações aqui apresentadas são geradas através de cruzamento determinístico com as bases de produtos cadastradas das marcas Growth Supplements e Oficial Farma. Nenhuma informação aqui constitui promessa de cura ou tratamento de doenças.';
  const wrappedExtra = doc.splitTextToSize(extraLegal, contentWidth - 16);
  doc.text(wrappedExtra, margin + 8, 86);

  // Big Thank You Box
  doc.setFillColor(8, 10, 11);
  doc.setDrawColor(neonGreen[0], neonGreen[1], neonGreen[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, 130, contentWidth, 60, 3, 3, 'FD');

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(neonGreen[0], neonGreen[1], neonGreen[2]);
  doc.text('GUIA CASCA GROSSA | Marcelo Brigadeiro', margin + 12, 146);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
  doc.text('Performance, consistência e suplementação inteligente.', margin + 12, 156);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(neonGreen[0], neonGreen[1], neonGreen[2]);
  doc.text('LEMBRE-SE DE USAR O CUPOM: BRIGADEIRO', margin + 12, 172);

  // Apply footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let pNum = 1; pNum <= totalPages; pNum++) {
    doc.setPage(pNum);
    addFooter(pNum, totalPages);
  }

  return doc.output('blob');
}
