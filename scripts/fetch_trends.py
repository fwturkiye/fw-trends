from pytrends.request import TrendReq
import json, os
from datetime import datetime

pytrends = TrendReq(hl='tr-TR', tz=180)

KEYWORDS = ['spor salonu', 'fitness', 'gym']

CITIES = {
    'İstanbul':  'TR-34',
    'Ankara':    'TR-06',
    'İzmir':     'TR-35',
    'Bursa':     'TR-16',
    'Antalya':   'TR-07',
    'Adana':     'TR-01',
    'Konya':     'TR-42',
    'Gaziantep': 'TR-27',
    'Şanlıurfa': 'TR-63',
    'Kocaeli':   'TR-41',
    'Mersin':    'TR-33',
    'Diyarbakır':'TR-21',
    'Hatay':     'TR-31',
    'Manisa':    'TR-45',
    'Kayseri':   'TR-38',
}

result = {'updated': datetime.now().isoformat(), 'cities': {}, 'keywords': {}}

for city, geo in CITIES.items():
    try:
        pytrends.build_payload(KEYWORDS, timeframe='today 12-m', geo=geo)
        df = pytrends.interest_over_time()
        if not df.empty:
            result['cities'][city] = {kw: df[kw].tolist() for kw in KEYWORDS}
            result['cities'][city]['dates'] = [str(d.date()) for d in df.index]
            print(f"✓ {city}")
    except Exception as e:
        print(f"✗ {city}: {e}")

os.makedirs('data', exist_ok=True)
with open('data/trends.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print("Tamamlandı:", datetime.now())
