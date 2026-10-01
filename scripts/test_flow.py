import requests
import json
import sys

BASE_URL = 'http://localhost:3005'

def run_tests():
    print("=== TEST 1: Profile Extraction ===")
    user_prompt = "Tenho 32 anos, treino 5 vezes por semana, quero ganhar massa muscular, estou dormindo mal e acordo cansado."
    res = requests.post(f"{BASE_URL}/api/ai/extract", json={"text": user_prompt})
    assert res.status_code == 200, f"Extract failed: {res.text}"
    profile = res.json()["profile"]
    print("Extracted profile:", json.dumps(profile, ensure_ascii=False, indent=2))
    assert profile["age"] == 32, f"Expected age 32, got {profile['age']}"
    assert profile["training"]["frequency"] == 5, f"Expected 5x/week, got {profile['training']['frequency']}"
    assert "hipertrofia" in profile["goal"], f"Expected hipertrofia in goal, got {profile['goal']}"
    assert profile["scores"]["sleep"] is not None and profile["scores"]["sleep"] <= 5, "Expected low sleep score"
    print("TEST 1 PASSED: Profile extracted correctly.")

    print("\n=== TEST 2: Deterministic Recommendation Engine & Safety ===")
    rec_res = requests.post(f"{BASE_URL}/api/recommend", json={
        "profile": profile,
        "raw_text": user_prompt,
        "user_name": "Carlos Silva"
    })
    assert rec_res.status_code == 200, f"Recommend failed: {rec_res.text}"
    assessment = rec_res.json()["assessment"]
    print(f"Generated Assessment ID: {assessment['id']}")
    print(f"Safety isSafe: {assessment['safety_evaluation']['isSafe']}")
    recommendations = assessment["recommendations"]
    print(f"Total Recommendations: {len(recommendations)}")
    assert 3 <= len(recommendations) <= 5, f"Expected between 3 and 5 products, got {len(recommendations)}"

    for idx, r in enumerate(recommendations):
        prod = r["product"]
        print(f"  [{r['priorityTitle']}] {prod['name']} ({prod['brand']})")
        print(f"    Uso: {prod['usage_instruction'][:50]}...")
        print(f"    Link: {prod['url']}")
        assert prod["name"], "Product must have name"
        assert prod["brand"] in ["Growth Supplements", "Oficial Farma"], f"Unknown brand: {prod['brand']}"

    print("TEST 2 PASSED: 3-5 deterministic products generated.")

    print("\n=== TEST 3: Assessment Retrieval ===")
    get_res = requests.get(f"{BASE_URL}/api/assessment/{assessment['id']}")
    assert get_res.status_code == 200, f"Failed to get assessment: {get_res.text}"
    fetched = get_res.json()["assessment"]
    assert fetched["id"] == assessment["id"]
    print("TEST 3 PASSED: Assessment fetched by ID successfully.")

    print("\n=== TEST 4: Commercial Click & Coupon Tracking ===")
    first_prod = recommendations[0]["product"]
    clk_res = requests.post(f"{BASE_URL}/api/track/click", json={
        "product_id": first_prod["id"],
        "brand_id": first_prod["brand_id"],
        "assessment_id": assessment["id"],
        "destination_url": first_prod["url"] or "https://gsuplementos.com.br"
    })
    assert clk_res.status_code == 200, f"Click track failed: {clk_res.text}"

    cpn_res = requests.post(f"{BASE_URL}/api/track/coupon", json={
        "type": "copy",
        "coupon": "BRIGADEIRO",
        "source_page": f"test-guide-{assessment['id']}"
    })
    assert cpn_res.status_code == 200, f"Coupon track failed: {cpn_res.text}"
    print("TEST 4 PASSED: Click and coupon events logged.")

    print("\n=== TEST 5: Admin Stats Verification ===")
    stats_res = requests.get(f"{BASE_URL}/api/admin/stats")
    assert stats_res.status_code == 200, f"Stats failed: {stats_res.text}"
    stats = stats_res.json()["stats"]
    print("Admin stats:", json.dumps(stats, ensure_ascii=False, indent=2))
    assert stats["totalClicks"] >= 1, "Expected totalClicks >= 1"
    assert stats["couponCopies"] >= 1, "Expected couponCopies >= 1"
    print("TEST 5 PASSED: Admin stats properly reflects events.")

    print("\n==========================================")
    print("ALL 5 INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("==========================================")

if __name__ == '__main__':
    try:
        run_tests()
    except Exception as e:
        print(f"TEST FAILED: {e}")
        sys.exit(1)
