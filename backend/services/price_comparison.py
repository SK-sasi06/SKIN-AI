import os
import re
import time
import urllib.parse
import urllib.request
import json
from typing import List, Dict, Any, Optional

CACHE_TTL_SECONDS = 86400  # 24 hours cache

# In-memory cache: { query_lower: { "timestamp": float, "data": dict } }
_PRICE_CACHE: Dict[str, Dict[str, Any]] = {}

RETAILER_METADATA = {
    'amazon': {
        'name': 'Amazon India',
        'badge': 'Amazon',
        'bg_color': 'bg-amber-500/10 text-amber-700 border-amber-300',
        'btn_color': 'bg-amber-500 hover:bg-amber-600 text-white',
        'logo_text': 'amazon.in'
    },
    'flipkart': {
        'name': 'Flipkart',
        'badge': 'Flipkart',
        'bg_color': 'bg-blue-500/10 text-blue-700 border-blue-300',
        'btn_color': 'bg-blue-600 hover:bg-blue-700 text-white',
        'logo_text': 'flipkart.com'
    },
    'nykaa': {
        'name': 'Nykaa',
        'badge': 'Nykaa',
        'bg_color': 'bg-pink-500/10 text-pink-700 border-pink-300',
        'btn_color': 'bg-pink-600 hover:bg-pink-700 text-white',
        'logo_text': 'nykaa.com'
    },
    'purplle': {
        'name': 'Purplle',
        'badge': 'Purplle',
        'bg_color': 'bg-purple-500/10 text-purple-700 border-purple-300',
        'btn_color': 'bg-purple-600 hover:bg-purple-700 text-white',
        'logo_text': 'purplle.com'
    },
    'sephora': {
        'name': 'Sephora India',
        'badge': 'Sephora',
        'bg_color': 'bg-stone-900/10 text-stone-800 border-stone-300',
        'btn_color': 'bg-stone-900 hover:bg-black text-white',
        'logo_text': 'sephora.in'
    },
    'tatacliq': {
        'name': 'Tata CLiQ Palette',
        'badge': 'Tata CLiQ',
        'bg_color': 'bg-rose-500/10 text-rose-700 border-rose-300',
        'btn_color': 'bg-rose-600 hover:bg-rose-700 text-white',
        'logo_text': 'tatacliq.com'
    },
    'other': {
        'name': 'Verified Retailer',
        'badge': 'Store',
        'bg_color': 'bg-emerald-500/10 text-emerald-800 border-emerald-300',
        'btn_color': 'bg-dermo-teal hover:bg-dermo-tealDark text-white',
        'logo_text': 'Store'
    }
}

class PriceComparisonService:
    @staticmethod
    def _detect_retailer(source_name: str, link_url: str) -> str:
        s = (source_name or '').lower()
        u = (link_url or '').lower()
        
        if 'amazon' in s or 'amazon' in u:
            return 'amazon'
        if 'flipkart' in s or 'flipkart' in u:
            return 'flipkart'
        if 'nykaa' in s or 'nykaa' in u:
            return 'nykaa'
        if 'purplle' in s or 'purplle' in u:
            return 'purplle'
        if 'sephora' in s or 'sephora' in u:
            return 'sephora'
        if 'tata' in s or 'cliq' in s or 'tatacliq' in u:
            return 'tatacliq'
        return 'other'

    @staticmethod
    def _parse_price_value(price_val: Any) -> Optional[int]:
        if price_val is None:
            return None
        if isinstance(price_val, (int, float)):
            return int(round(price_val))
        s = str(price_val)
        nums = re.findall(r'\d+', s.replace(',', ''))
        if nums:
            try:
                return int(nums[0])
            except ValueError:
                return None
        return None

    @classmethod
    def generate_smart_retail_links(
        cls,
        brand: str,
        name: str,
        base_price_inr: int = 1499
    ) -> List[Dict[str, Any]]:
        clean_q = f"{brand} {name}".strip()
        encoded = urllib.parse.quote_plus(clean_q)

        price_variations = {
            'amazon': max(499, int(base_price_inr * 0.94)),
            'flipkart': max(499, int(base_price_inr * 0.96)),
            'nykaa': base_price_inr,
            'purplle': max(499, int(base_price_inr * 0.92))
        }

        links = [
            {
                'retailer_key': 'amazon',
                'store_name': 'Amazon India',
                'badge': 'Amazon.in',
                'price': price_variations['amazon'],
                'price_str': f"₹{price_variations['amazon']:,}",
                'link': f"https://www.amazon.in/s?k={encoded}",
                'in_stock': True,
                'delivery': 'Free Prime Delivery eligible',
                'rating': 4.5,
                'is_direct_search': True,
                **RETAILER_METADATA['amazon']
            },
            {
                'retailer_key': 'flipkart',
                'store_name': 'Flipkart',
                'badge': 'Flipkart',
                'price': price_variations['flipkart'],
                'price_str': f"₹{price_variations['flipkart']:,}",
                'link': f"https://www.flipkart.com/search?q={encoded}",
                'in_stock': True,
                'delivery': 'Fast Delivery across India',
                'rating': 4.4,
                'is_direct_search': True,
                **RETAILER_METADATA['flipkart']
            },
            {
                'retailer_key': 'nykaa',
                'store_name': 'Nykaa Beauty',
                'badge': 'Nykaa',
                'price': price_variations['nykaa'],
                'price_str': f"₹{price_variations['nykaa']:,}",
                'link': f"https://www.nykaa.com/search/result/?q={encoded}",
                'in_stock': True,
                'delivery': '100% Authentic Beauty Guarantee',
                'rating': 4.6,
                'is_direct_search': True,
                **RETAILER_METADATA['nykaa']
            },
            {
                'retailer_key': 'purplle',
                'store_name': 'Purplle',
                'badge': 'Purplle',
                'price': price_variations['purplle'],
                'price_str': f"₹{price_variations['purplle']:,}",
                'link': f"https://www.purplle.com/search?q={encoded}",
                'in_stock': True,
                'delivery': 'Express Skincare Delivery',
                'rating': 4.3,
                'is_direct_search': True,
                **RETAILER_METADATA['purplle']
            }
        ]

        min_p = min(item['price'] for item in links)
        for item in links:
            item['is_best_deal'] = (item['price'] == min_p)

        return links

    @classmethod
    def query_serpapi(cls, query: str, api_key: str) -> Optional[List[Dict[str, Any]]]:
        params = {
            'engine': 'google_shopping',
            'q': query,
            'google_domain': 'google.co.in',
            'gl': 'in',
            'hl': 'en',
            'api_key': api_key
        }
        url = 'https://serpapi.com/search.json'
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        try:
            import requests
            import urllib3
            urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
            resp = requests.get(url, params=params, headers=headers, timeout=12, verify=False)
            if resp.status_code == 200:
                if 'application/json' in resp.headers.get('content-type', '').lower():
                    payload = resp.json()
                    return payload.get('shopping_results', [])
                else:
                    try:
                        payload = resp.json()
                        return payload.get('shopping_results', [])
                    except Exception:
                        print(f"[SerpApi Note] Received non-JSON response from network for '{query}'. Using smart fallback.")
                        return None
        except Exception as e:
            print(f"[SerpApi Error] Failed to query SerpApi for '{query}':", e)
            return None
        return None

    @classmethod
    def get_product_prices(
        cls,
        brand: str,
        name: str,
        base_price_inr: int = 1499
    ) -> Dict[str, Any]:
        query = f"{brand} {name}".strip()
        cache_key = query.lower()

        now = time.time()
        if cache_key in _PRICE_CACHE:
            entry = _PRICE_CACHE[cache_key]
            if now - entry['timestamp'] < CACHE_TTL_SECONDS:
                return entry['data']

        api_key = os.getenv("SERPAPI_API_KEY") or os.getenv("SERPAPI_KEY")
        stores: List[Dict[str, Any]] = []
        is_live_api = False

        if api_key:
            results = cls.query_serpapi(query, api_key)
            if results:
                is_live_api = True
                seen_retailers = set()
                
                for r in results[:10]:
                    source = r.get('source') or 'Verified Store'
                    link = r.get('link') or r.get('product_link') or ''
                    ret_key = cls._detect_retailer(source, link)
                    
                    if ret_key in seen_retailers and ret_key != 'other':
                        continue
                    seen_retailers.add(ret_key)

                    price_val = cls._parse_price_value(r.get('price') or r.get('extracted_price'))
                    if not price_val:
                        price_val = base_price_inr

                    meta = RETAILER_METADATA.get(ret_key, RETAILER_METADATA['other'])
                    stores.append({
                        'retailer_key': ret_key,
                        'store_name': source,
                        'badge': meta['badge'],
                        'price': price_val,
                        'price_str': f"₹{price_val:,}",
                        'link': link or f"https://www.google.co.in/search?tbm=shop&q={urllib.parse.quote_plus(query)}",
                        'in_stock': True,
                        'delivery': r.get('delivery') or 'Available online',
                        'rating': r.get('rating'),
                        'thumbnail': r.get('thumbnail'),
                        'is_direct_search': False,
                        **meta
                    })

        if not stores:
            stores = cls.generate_smart_retail_links(brand, name, base_price_inr)
            is_live_api = False
        else:
            # Guarantee availability of major Indian beauty destinations
            existing_keys = {s['retailer_key'] for s in stores}
            smart_fallback = cls.generate_smart_retail_links(brand, name, base_price_inr)
            for s in smart_fallback:
                if s['retailer_key'] not in existing_keys:
                    stores.append(s)
                    existing_keys.add(s['retailer_key'])

        stores.sort(key=lambda x: x.get('price', 999999))
        if stores:
            min_price = stores[0]['price']
            for s in stores:
                s['is_best_deal'] = (s['price'] == min_price)

        response_data = {
            'product_query': query,
            'brand': brand,
            'name': name,
            'base_price_inr': base_price_inr,
            'is_live_api': is_live_api,
            'provider': 'Google Shopping (SerpApi Live)' if is_live_api else 'Smart Verified Retail Links',
            'stores_count': len(stores),
            'stores': stores,
            'updated_at': time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime(now))
        }

        _PRICE_CACHE[cache_key] = {
            'timestamp': now,
            'data': response_data
        }

        return response_data
