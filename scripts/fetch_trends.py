from pytrends.request import TrendReq
import json, os, time
from datetime import datetime

pytrends = TrendReq(hl='tr-TR', tz=180)

CITIES = {
    'Marmara':           {'Istanbul': 'TR-34', 'Bursa': 'TR-16', 'Kocaeli': 'TR-41'},
    'Ege':               {'Izmir': 'TR-35', 'Manisa': 'TR-45'},
    'Ic Anadolu':        {'Ankara': 'TR-06', 'Konya': 'TR-42', 'Kayseri': 'TR-38'},
    'Akdeniz':           {'Antalya': 'TR-07', 'Mersin': 'TR-33', 'Adana': 'TR-01', 'Hatay': 'TR-31'},
    'Guneydogu Anadolu': {'Gaziantep': 'TR-27', 'Sanliurfa': 'TR-63', 'Diyarbakir': 'TR-21'},
}

CITY_LABELS = {
    'Istanbul': 'İstanbul', 'Bursa': 'Bursa', 'Kocaeli': 'Kocaeli',
    'Izmir': 'İzmir', 'Manisa': 'Manisa',
    'Ankara': 'Ankara', 'Konya': 'Konya', 'Kayseri': 'Kayseri',
    'Antalya': 'Antalya', 'Mersin': 'Mersin', 'Adana': 'Adana', 'Hatay': 'Hatay',
    'Gaziantep': 'Gaziantep', 'Sanliurfa': 'Şanlıurfa', 'Diyarbakir': 'Diyarbakır',
}

REGION_LABELS = {
    'Marmara': 'Marmara',
    'Ege': 'Ege',
    'Ic Anadolu': 'İç Anadolu',
    'Akdeniz': 'Akdeniz',
    'Guneydogu Anadolu': 'Güneydoğu Anadolu',
}

CATEGORIES = {
    'fitness':  ['spor salonu', 'fitness', 'gym'],
    'wellness': ['yoga', 'pilates', 'meditasyon'],
    'rising':   ['hyrox', 'padel'],
}

def fetch_with_retry(keywords, geo, retries=3):
    for attempt in range(retries):
        try:
            pytrends.build_payload(keywords, timeframe='today 12-m', geo=geo)
            df = pytrends.interest_over_time()
            return df
        except Exception as e:
            print(f"    Deneme {attempt+1}/{retries}: {e}")
            time.sleep(15 * (attempt + 1))
    return None

result = {
    'updated': datetime.now().isoformat(),
    'cities': {},
    'regions': list(REGION_LABELS.values()),
}

total = sum(len(v) for v in CITIES.values())
done = 0

for region_key, cities in CITIES.items():
    region_label = REGION_LABELS[region_key]
    for city_key, geo in cities.items():
        city_label = CITY_LABELS.get(city_key, city_key)
        done += 1
        print(f"\n[{done}/{total}] {city_label} ({region_label})")
        result['cities'][city_label] = {'region': region_label, 'geo': geo}
        for cat, keywords in CATEGORIES.items():
            print(f"  -> {cat}")
            df = fetch_with_retry(keywords, geo)
            if df is not None and not df.empty:
                result['cities'][city_label][cat] = {kw: df[kw].tolist() for kw in keywords if kw in df.columns}
                if 'dates' not in result['cities'][city_label]:
                    result['cities'][city_label]['dates'] = [str(d.date()) for d in df.index]
                print(f"     OK")
            else:
                print(f"     Veri yok")
            time.sleep(10)
        time.sleep(5)

os.makedirs('data', exist_ok=True)
with open('data/trends.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"\nTamamlandi: {datetime.now()}")
print(f"Toplam sehir: {len(result['cities'])}")
