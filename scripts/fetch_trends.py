from pytrends.request import TrendReq
import json, os, time
from datetime import datetime

pytrends = TrendReq(hl='tr-TR', tz=180)

CITIES = {
    'Marmara': {
        'İstanbul':  'TR-34',
        'Bursa':     'TR-16',
        'Kocaeli':   'TR-41',
        'Tekirdağ':  'TR-59',
        'Balıkesir': 'TR-10',
        'Edirne':    'TR-22',
    },
    'Ege': {
        'İzmir':     'TR-35',
        'Manisa':    'TR-45',
        'Aydın':     'TR-09',
        'Denizli':   'TR-20',
        'Muğla':     'TR-48',
        'Uşak':      'TR-64',
    },
    'İç Anadolu': {
        'Ankara':    'TR-06',
        'Konya':     'TR-42',
        'Kayseri':   'TR-38',
        'Eskişehir': 'TR-26',
        'Sivas':     'TR-58',
        'Aksaray':   'TR-68',
    },
    'Akdeniz': {
        'Antalya':   'TR-07',
        'Mersin':    'TR-33',
        'Adana':     'TR-01',
        'Hatay':     'TR-31',
        'Isparta':   'TR-32',
        'Burdur':    'TR-15',
    },
    'Karadeniz': {
        'Samsun':    'TR-55',
        'Trabzon':   'TR-61',
        'Ordu':      'TR-52',
        'Zonguldak': 'TR-67',
        'Kastamonu': 'TR-37',
        'Rize':      'TR-53',
    },
    'Doğu Anadolu': {
        'Erzurum':   'TR-25',
        'Malatya':   'TR-44',
        'Elazığ':    'TR-23',
        'Van':       'TR-65',
        'Ağrı':      'TR-04',
        'Kars':      'TR-36',
    },
    'Güneydoğu Anadolu': {
        'Gaziantep': 'TR-27',
        'Şanlıurfa': 'TR-63',
        'Diyarbakır':'TR-21',
        'Mardin':    'TR-47',
        'Batman':    'TR-72',
        'Adıyaman':  'TR-02',
    },
}

CATEGORIES = {
    'fitness': ['spor salonu', 'fitness', 'gym'],
    'wellness': ['yoga', 'pilates', 'meditasyon'],
    'rising': ['hyrox', 'padel'],
}

result = {
    'updated': datetime.now().isoformat(),
    'cities': {},
    'regions': list(CITIES.keys()),
}

for region, cities in CITIES.items():
    for city, geo in cities.items():
        print(f"→ {city} ({region})")
        result['cities'][city] = {'region': region, 'geo': geo}
        for cat, keywords in CATEGORIES.items():
            try:
                pytrends.build_payload(keywords, timeframe='today 12-m', geo=geo)
                df = pytrends.interest_over_time()
                if not df.empty:
                    result['cities'][city][cat] = {kw: df[kw].tolist() for kw in keywords}
                    result['cities'][city]['dates'] = [str(d.date()) for d in df.index]
                time.sleep(1.5)
            except Exception as e:
                print(f"  ✗ {cat}: {e}")
                time.sleep(3)

os.makedirs('data', exist_ok=True)
with open('data/trends.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print("\n✅ Tamamlandı:", datetime.now())
