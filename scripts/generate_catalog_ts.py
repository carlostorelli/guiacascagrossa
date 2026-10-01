import json
import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[àáâãä]', 'a', text)
    text = re.sub(r'[èéêë]', 'e', text)
    text = re.sub(r'[ìíîï]', 'i', text)
    text = re.sub(r'[òóôõö]', 'o', text)
    text = re.sub(r'[ùúûü]', 'u', text)
    text = re.sub(r'[ç]', 'c', text)
    text = re.sub(r'[^a-z0-9]+', '-', text).strip('-')
    return text

with open('catalog_growth.json', encoding='utf-8') as f:
    gw_items = json.load(f)

with open('catalog_oficial_farma.json', encoding='utf-8') as f:
    of_items = json.load(f)

products = []

# Map of equivalent slugs
equiv_map = {
    'omega 3': 'omega-3',
    'oleo de peixe ultra': 'omega-3',
    'complexo b': 'complexo-b',
    'coenzima q10': 'coenzima-q10',
    'coenzimaq10': 'coenzima-q10',
    'coenzima q10 100mg': 'coenzima-q10',
    'nac': 'nac-cisteina',
    'n acetil cisteina': 'nac-cisteina',
    'psyllium': 'psyllium',
    'psylium': 'psyllium',
    'psyllium 500mg': 'psyllium',
    'cha verde': 'cha-verde',
    'arginina': 'arginina',
    'l-arginina': 'arginina',
    'colageno tipo ii': 'saude-articular',
    'glucosamina + condroitina + ct2 + acido hialuronico': 'saude-articular',
    'melatonina + associacoes': 'sono-profundo',
    'sossegarte black': 'sono-profundo',
    'glicina': 'sono-profundo',
    'taurina': 'sono-foco',
}

# Categorize and tag items
def get_tags_and_equiv(name, indication):
    name_clean = slugify(name).replace('-', ' ')
    eq = None
    for k, v in equiv_map.items():
        if k in name_clean:
            eq = v
            break

    tags = []
    ind_lower = indication.lower()
    if 'emagrecimento' in ind_lower or 'apetite' in ind_lower or 'gordura' in ind_lower:
        tags.append('emagrecimento')
    if 'hipertrofia' in ind_lower or 'massa' in ind_lower or 'proteina' in name.lower() or 'creatina' in name.lower():
        tags.append('hipertrofia')
    if 'sono' in ind_lower or 'dormir' in ind_lower or 'calmante' in ind_lower:
        tags.append('sono')
    if 'energia' in ind_lower or 'disposicao' in ind_lower or 'foco' in ind_lower:
        tags.append('energia')
        tags.append('foco')
    if 'ansiedade' in ind_lower or 'estresse' in ind_lower:
        tags.append('estresse')
        tags.append('ansiedade')
    if 'libido' in ind_lower:
        tags.append('libido')
    if 'intestino' in ind_lower or 'estomago' in ind_lower or 'digestao' in ind_lower or 'disbiose' in ind_lower:
        tags.append('digestao')
    if 'vegano' in ind_lower or 'vegetariano' in ind_lower:
        tags.append('vegano')
    if 'lactose' in ind_lower:
        tags.append('lactose')
    if 'articular' in ind_lower or 'lesoes' in ind_lower or 'articulacoes' in ind_lower:
        tags.append('articulacoes')
    if 'todos' in ind_lower or 'saude geral' in ind_lower or 'imunidade' in ind_lower:
        tags.append('saude_geral')
    
    return tags, eq

for p in gw_items:
    tags, eq = get_tags_and_equiv(p['name'], p['indication'])
    products.append({
        "id": p['id'],
        "brand_id": "growth-supplements",
        "brand": "Growth Supplements",
        "name": p['name'],
        "slug": slugify(p['name'] + "-growth"),
        "category": "Suplementos Esportivos",
        "description": f"{p['name']} da Growth Supplements, formulado para alta pureza e desempenho.",
        "indication": p['indication'] if p['indication'] else "Informação não cadastrada",
        "usage_instruction": p['usage_instruction'] if p['usage_instruction'] else "Informação não cadastrada",
        "ingredients": "Consulte a embalagem oficial para lista completa de ingredientes.",
        "warnings": "Não exceder a recomendação diária de consumo indicada na embalagem.",
        "restrictions": "Alérgicos: consulte a lista de ingredientes no site oficial.",
        "image_url": "",
        "url": p['url'] if p['url'] else "",
        "coupon": "BRIGADEIRO",
        "active": True,
        "priority": 10 if "Creatina" in p['name'] or "Whey" in p['name'] else 5,
        "equivalent_slug": eq,
        "tags": tags,
        "created_at": "2026-09-01T00:00:00Z",
        "updated_at": "2026-10-01T00:00:00Z"
    })

for p in of_items:
    tags, eq = get_tags_and_equiv(p['name'], p['indication'])
    products.append({
        "id": p['id'],
        "brand_id": "oficial-farma",
        "brand": "Oficial Farma",
        "name": p['name'],
        "slug": slugify(p['name'] + "-oficialfarma"),
        "category": "Fórmulas & Manipulados",
        "description": f"{p['name']} da Oficial Farma, manipulado em farmácia de ponta com matéria-prima certificada.",
        "indication": p['indication'] if p['indication'] else "Informação não cadastrada",
        "usage_instruction": p['usage_instruction'] if p['usage_instruction'] else "Informação não cadastrada",
        "ingredients": "Fórmula manipulada com ativos de grau farmacêutico.",
        "warnings": "Uso sob orientação médica ou de profissional habilitado.",
        "restrictions": "Consulte restrições específicas para sua condição de saúde.",
        "image_url": "",
        "url": p['url'] if p['url'] else "",
        "coupon": "BRIGADEIRO",
        "active": True,
        "priority": 8,
        "equivalent_slug": eq,
        "tags": tags,
        "created_at": "2026-09-01T00:00:00Z",
        "updated_at": "2026-10-01T00:00:00Z"
    })

ts_content = f"""import {{ Product, Brand }} from '@/types';

export const BRANDS: Brand[] = [
  {{
    id: 'growth-supplements',
    name: 'Growth Supplements',
    website: 'https://www.gsuplementos.com.br',
    active: true,
    coupon: 'BRIGADEIRO',
  }},
  {{
    id: 'oficial-farma',
    name: 'Oficial Farma',
    website: 'https://www.oficialfarma.com.br',
    active: true,
    coupon: 'BRIGADEIRO',
  }},
];

export const INITIAL_PRODUCTS: Product[] = {json.dumps(products, ensure_ascii=False, indent=2)};
"""

with open('lib/db/initialCatalog.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f"Generated lib/db/initialCatalog.ts with {len(products)} products ({len(gw_items)} Growth, {len(of_items)} Oficial Farma).")
