import json
import numbers_parser
import fitz

# 1. Parse Oficial Farma
doc_of = numbers_parser.Document('planilhas para se consultar/Planilha Suplementos Oficial Farma.numbers')
table_of = doc_of.sheets[0].tables[0]
rows_of = table_of.rows(values_only=True)
header_of = rows_of[0]

oficial_farma_products = []
for idx, r in enumerate(rows_of[1:]):
    if not r or not r[0]:
        continue
    name = str(r[0]).strip()
    indication = str(r[1]).strip() if len(r) > 1 and r[1] is not None else ""
    usage = str(r[2]).strip() if len(r) > 2 and r[2] is not None else ""
    link = str(r[3]).strip() if len(r) > 3 and r[3] is not None else ""
    
    oficial_farma_products.append({
        "id": f"of-{idx+1}",
        "brand": "Oficial Farma",
        "brand_id": "oficial-farma",
        "name": name,
        "indication": indication,
        "usage_instruction": usage,
        "url": link,
        "coupon": "BRIGADEIRO",
        "category": "manipulados_suplementos"
    })

print(f"Loaded {len(oficial_farma_products)} Oficial Farma products.")

# 2. Parse Growth Supplements PDF with bounding box / coordinate matching
doc_gw = fitz.open('planilhas para se consultar/Planilha Suplementos Growth.pdf')

# Page 1 table extraction
tf1 = doc_gw[0].find_tables()
p1_rows = tf1.tables[0].extract()
# header is p1_rows[0] -> ['Nome do Suplemento', 'Indicação']
# Let's extract items from p1_rows
growth_raw_items = []
for r in p1_rows[1:]:
    if not r or not r[0] or not r[0].strip():
        continue
    growth_raw_items.append({
        "name": r[0].strip(),
        "indication": r[1].strip() if len(r) > 1 and r[1] else ""
    })

# Page 2 has 'Como Tomar'
# Page 3 has 'Link'
# Let's verify by precise y-coordinates on doc_gw
def get_words_by_y(page):
    words = page.get_text('words')
    # group by y rounded to 10
    by_y = {}
    for w in words:
        y = round(w[1], -1)
        by_y.setdefault(y, []).append((w[0], w[4])) # x0, word
    # sort words on line by x0
    res = {}
    for y, line_words in by_y.items():
        line_words.sort(key=lambda x: x[0])
        res[y] = " ".join([w[1] for w in line_words]).strip()
    return res

p1_lines = get_words_by_y(doc_gw[0])
p2_lines = get_words_by_y(doc_gw[1])
p3_lines = get_words_by_y(doc_gw[2])

# Filter out headers and page numbers
ignore_keys = [60.0, 800.0]
valid_y = sorted([y for y in p1_lines.keys() if y not in ignore_keys])

growth_products = []
for idx, y in enumerate(valid_y):
    # Match name and indication from p1
    # Check if this corresponds to growth_raw_items[idx]
    if idx < len(growth_raw_items):
        item_name = growth_raw_items[idx]["name"]
        item_ind = growth_raw_items[idx]["indication"]
    else:
        item_name = p1_lines.get(y, "")
        item_ind = ""
    
    usage = p2_lines.get(y, "")
    link = p3_lines.get(y, "")
    
    growth_products.append({
        "id": f"gw-{idx+1}",
        "brand": "Growth Supplements",
        "brand_id": "growth-supplements",
        "name": item_name,
        "indication": item_ind,
        "usage_instruction": usage,
        "url": link,
        "coupon": "BRIGADEIRO",
        "category": "suplementos"
    })

print(f"Loaded {len(growth_products)} Growth Supplements products.")

with open('catalog_growth.json', 'w', encoding='utf-8') as f:
    json.dump(growth_products, f, ensure_ascii=False, indent=2)

with open('catalog_oficial_farma.json', 'w', encoding='utf-8') as f:
    json.dump(oficial_farma_products, f, ensure_ascii=False, indent=2)

all_products = growth_products + oficial_farma_products
with open('catalog_all.json', 'w', encoding='utf-8') as f:
    json.dump(all_products, f, ensure_ascii=False, indent=2)

print("Saved catalog_growth.json, catalog_oficial_farma.json, and catalog_all.json successfully.")
