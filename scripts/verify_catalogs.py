import json

with open('catalog_growth.json', encoding='utf-8') as f:
    gw = json.load(f)

print(f"=== GROWTH SUPPLEMENTS ({len(gw)} items) ===")
for i, p in enumerate(gw):
    print(f"{i+1:2d}. {p['name']:<28} | Ind: {p['indication']:<35} | Link: {p['url'][:45] if p['url'] else '(vazio)'}")

with open('catalog_oficial_farma.json', encoding='utf-8') as f:
    of = json.load(f)

print(f"\n=== OFICIAL FARMA ({len(of)} items) ===")
for i, p in enumerate(of):
    print(f"{i+1:2d}. {p['name']:<35} | Ind: {p['indication']:<35} | Link: {p['url'][:45] if p['url'] else '(vazio)'}")
