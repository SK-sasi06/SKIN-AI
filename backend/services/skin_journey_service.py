import os
import sqlite3
import json
import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database', 'skincare.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

class SkinJourneyService:

    @staticmethod
    def _format_date_label(date_str: str) -> Dict[str, str]:
        try:
            dt = datetime.strptime(date_str, '%Y-%m-%d')
            # Assuming current reference date 2026-10-22
            today = datetime(2026, 10, 22).date()
            d = dt.date()
            diff = (today - d).days

            if diff == 0:
                rel = 'Today'
            elif diff == 1:
                rel = 'Yesterday'
            elif diff > 1:
                rel = f"{diff} days ago"
            else:
                rel = f"In {-diff} days"

            return {
                'month_short': dt.strftime('%b').upper(),
                'day_num': dt.strftime('%d'),
                'weekday': dt.strftime('%A'),
                'relative': rel,
                'full_date': dt.strftime('%B %d, %Y')
            }
        except Exception:
            return {
                'month_short': 'OCT',
                'day_num': '20',
                'weekday': 'Day',
                'relative': date_str,
                'full_date': date_str
            }

    @classmethod
    def get_timeline(cls, user_id: int, limit: int = 30) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cur = conn.cursor()

        # 1. Fetch routines
        cur.execute('''
            SELECT id, log_date, period, is_completed, missed_reason,
                   steps_completed, products_used, skin_feel, reactions, notes, created_at
            FROM daily_routines
            WHERE user_id = ?
            ORDER BY log_date DESC, period DESC
        ''', (user_id,))
        routine_rows = [dict(r) for r in cur.fetchall()]

        # 2. Fetch skin reactions
        cur.execute('''
            SELECT id, log_date, reaction_type, severity, suspected_product, notes, created_at
            FROM skin_reactions
            WHERE user_id = ?
            ORDER BY log_date DESC
        ''', (user_id,))
        reaction_rows = [dict(r) for r in cur.fetchall()]

        # 3. Fetch photo scans
        cur.execute('''
            SELECT id, image_name, dominant_concern, confidence_score, all_predictions, created_at
            FROM analysis_reports
            WHERE user_id = ?
            ORDER BY created_at DESC
        ''', (user_id,))
        scan_rows = [dict(r) for r in cur.fetchall()]

        conn.close()

        # Group by log_date
        by_date = {}

        for r in routine_rows:
            d = r['log_date']
            if d not in by_date:
                by_date[d] = {
                    'date': d,
                    'date_meta': cls._format_date_label(d),
                    'morning': None,
                    'evening': None,
                    'reactions': [],
                    'scans': [],
                    'overall_status': 'Incomplete'
                }

            routine_obj = {
                'id': r['id'],
                'period': r['period'],
                'is_completed': bool(r['is_completed']),
                'missed_reason': r['missed_reason'],
                'steps': json.loads(r['steps_completed'] or '[]'),
                'products': json.loads(r['products_used'] or '[]'),
                'skin_feel': r['skin_feel'],
                'reactions': json.loads(r['reactions'] or '[]'),
                'notes': r['notes'],
                'created_at': r['created_at']
            }
            if r['period'] == 'morning':
                by_date[d]['morning'] = routine_obj
            elif r['period'] == 'evening':
                by_date[d]['evening'] = routine_obj

        for rx in reaction_rows:
            d = rx['log_date']
            if d not in by_date:
                by_date[d] = {
                    'date': d,
                    'date_meta': cls._format_date_label(d),
                    'morning': None,
                    'evening': None,
                    'reactions': [],
                    'scans': [],
                    'overall_status': 'Reaction Logged'
                }
            by_date[d]['reactions'].append(rx)

        for sc in scan_rows:
            created_str = str(sc['created_at'])
            d = created_str.split(' ')[0] if ' ' in created_str else created_str[:10]
            if d not in by_date:
                by_date[d] = {
                    'date': d,
                    'date_meta': cls._format_date_label(d),
                    'morning': None,
                    'evening': None,
                    'reactions': [],
                    'scans': [],
                    'overall_status': 'Scan Recorded'
                }
            try:
                preds = json.loads(sc['all_predictions']) if isinstance(sc['all_predictions'], str) else sc['all_predictions']
            except Exception:
                preds = []
            
            by_date[d]['scans'].append({
                'id': sc['id'],
                'image_name': sc['image_name'],
                'image_url': f"/api/images/{sc['image_name']}" if sc['image_name'] else None,
                'dominant_concern': sc['dominant_concern'],
                'confidence_score': sc['confidence_score'],
                'confidence_pct': round((sc['confidence_score'] or 0) * 100, 1),
                'all_predictions': preds,
                'created_at': sc['created_at']
            })

        # Calculate overall day status
        result = []
        for d in sorted(by_date.keys(), reverse=True):
            item = by_date[d]
            m = item['morning']
            e = item['evening']
            
            if m and m['is_completed'] and e and e['is_completed']:
                item['overall_status'] = 'Full Routine Completed'
                item['status_badge'] = 'bg-emerald-50 text-emerald-800 border-emerald-200'
            elif (m and m['is_completed']) or (e and e['is_completed']):
                item['overall_status'] = 'Partial Routine'
                item['status_badge'] = 'bg-amber-50 text-amber-800 border-amber-200'
            elif (m and not m['is_completed']) or (e and not e['is_completed']):
                item['overall_status'] = 'Missed Routine'
                item['status_badge'] = 'bg-rose-50 text-rose-800 border-rose-200'
            else:
                item['overall_status'] = 'Active Day'
                item['status_badge'] = 'bg-stone-50 text-stone-700 border-stone-200'

            result.append(item)

        return result[:limit]

    @classmethod
    def save_routine(cls, user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        log_date = data.get('log_date') or datetime.now().strftime('%Y-%m-%d')
        period = data.get('period') or 'morning'
        is_completed = 1 if data.get('is_completed', True) else 0
        missed_reason = data.get('missed_reason')
        steps = json.dumps(data.get('steps', []))
        products = json.dumps(data.get('products', []))
        skin_feel = data.get('skin_feel', '')
        reactions = json.dumps(data.get('reactions', []))
        notes = data.get('notes', '')

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            INSERT INTO daily_routines
            (user_id, log_date, period, is_completed, missed_reason, steps_completed, products_used, skin_feel, reactions, notes, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id, log_date, period) DO UPDATE SET
                is_completed = excluded.is_completed,
                missed_reason = excluded.missed_reason,
                steps_completed = excluded.steps_completed,
                products_used = excluded.products_used,
                skin_feel = excluded.skin_feel,
                reactions = excluded.reactions,
                notes = excluded.notes,
                updated_at = CURRENT_TIMESTAMP
        ''', (user_id, log_date, period, is_completed, missed_reason, steps, products, skin_feel, reactions, notes))
        conn.commit()
        last_id = cur.lastrowid
        conn.close()

        return {'status': 'success', 'routine_id': last_id, 'log_date': log_date, 'period': period}

    @classmethod
    def delete_routine(cls, user_id: int, routine_id: int) -> bool:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('DELETE FROM daily_routines WHERE id = ? AND user_id = ?', (routine_id, user_id))
        deleted = cur.rowcount > 0
        conn.commit()
        conn.close()
        return deleted

    @classmethod
    def get_streak_and_adherence(cls, user_id: int) -> Dict[str, Any]:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT log_date, period, is_completed
            FROM daily_routines
            WHERE user_id = ? AND is_completed = 1
            ORDER BY log_date DESC
        ''', (user_id,))
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()

        # Set of unique dates with at least 1 completed routine
        completed_dates = set(r['log_date'] for r in rows)

        # Calculate streak starting today or yesterday
        ref_date = datetime(2026, 10, 22).date()
        today_str = ref_date.strftime('%Y-%m-%d')
        yesterday_str = (ref_date - timedelta(days=1)).strftime('%Y-%m-%d')

        streak = 0
        curr_d = ref_date if today_str in completed_dates else (ref_date - timedelta(days=1))
        
        while curr_d.strftime('%Y-%m-%d') in completed_dates:
            streak += 1
            curr_d -= timedelta(days=1)

        # Adherence stats over last 7 and 30 days
        last_7_days = [(ref_date - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(7)]
        last_30_days = [(ref_date - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(30)]

        completed_in_7 = sum(1 for d in last_7_days if d in completed_dates)
        completed_in_30 = sum(1 for d in last_30_days if d in completed_dates)

        adherence_7_pct = round((completed_in_7 / 7) * 100)
        adherence_30_pct = round((completed_in_30 / 30) * 100)

        # Today's status & alerts
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT period, is_completed FROM daily_routines WHERE user_id = ? AND log_date = ?', (user_id, today_str))
        today_routines = {r['period']: r['is_completed'] for r in cur.fetchall()}
        conn.close()

        alerts = []
        if 'morning' not in today_routines:
            alerts.append({
                'type': 'reminder',
                'title': 'Morning Routine Pending',
                'message': 'Log your morning cleanser, moisturizer, and sunscreen to protect your skin barrier today.'
            })
        elif today_routines.get('morning') == 1 and 'evening' not in today_routines:
            alerts.append({
                'type': 'notice',
                'title': 'Evening Routine Ready to Record',
                'message': 'Evening routine awaiting completion. Don’t forget to wash away daily grime and rehydrate.'
            })

        return {
            'streak_days': streak,
            'completed_days_count': len(completed_dates),
            'adherence_7_days_pct': adherence_7_pct,
            'adherence_30_days_pct': adherence_30_pct,
            'today_am_completed': today_routines.get('morning') == 1,
            'today_pm_completed': today_routines.get('evening') == 1,
            'alerts': alerts
        }

    @classmethod
    def get_user_products(cls, user_id: int) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT id, product_id, product_name, brand, category, start_date, is_active, notes, created_at
            FROM user_products
            WHERE user_id = ? AND is_active = 1
            ORDER BY start_date DESC
        ''', (user_id,))
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()

        ref_date = datetime(2026, 10, 22).date()
        result = []
        for r in rows:
            try:
                s_date = datetime.strptime(r['start_date'], '%Y-%m-%d').date()
                days = (ref_date - s_date).days
            except Exception:
                days = 0
            
            result.append({
                **r,
                'days_used': max(0, days),
                'formatted_start': r['start_date']
            })
        return result

    @classmethod
    def add_user_product(cls, user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            INSERT INTO user_products
            (user_id, product_id, product_name, brand, category, start_date, is_active, notes)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?)
        ''', (
            user_id,
            data.get('product_id'),
            data['product_name'].strip(),
            data.get('brand', '').strip(),
            data.get('category', 'Moisturizer'),
            data.get('start_date') or datetime.now().strftime('%Y-%m-%d'),
            data.get('notes', '')
        ))
        conn.commit()
        new_id = cur.lastrowid
        conn.close()
        return {'status': 'success', 'product_id': new_id}

    @classmethod
    def delete_user_product(cls, user_id: int, product_id: int) -> bool:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('DELETE FROM user_products WHERE id = ? AND user_id = ?', (product_id, user_id))
        deleted = cur.rowcount > 0
        conn.commit()
        conn.close()
        return deleted

    @classmethod
    def log_skin_reaction(cls, user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        conn = get_db_connection()
        cur = conn.cursor()
        log_date = data.get('log_date') or datetime.now().strftime('%Y-%m-%d')
        cur.execute('''
            INSERT INTO skin_reactions
            (user_id, log_date, reaction_type, severity, suspected_product, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            log_date,
            data.get('reaction_type', 'Dryness'),
            data.get('severity', 'Mild'),
            data.get('suspected_product', ''),
            data.get('notes', '')
        ))
        conn.commit()
        new_id = cur.lastrowid
        conn.close()
        return {'status': 'success', 'reaction_id': new_id}

    @classmethod
    def get_skin_reactions(cls, user_id: int) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT id, log_date, reaction_type, severity, suspected_product, notes, created_at
            FROM skin_reactions
            WHERE user_id = ?
            ORDER BY log_date DESC
        ''', (user_id,))
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return rows

    @classmethod
    def get_improvement_analytics(cls, user_id: int) -> Dict[str, Any]:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT id, image_name, dominant_concern, confidence_score, all_predictions, created_at
            FROM analysis_reports
            WHERE user_id = ?
            ORDER BY created_at ASC
        ''', (user_id,))
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()

        if not rows:
            return {
                'timeline': [],
                'concerns_trend': {},
                'milestones': [],
                'disclaimer': 'No analysis scans recorded yet. Upload a facial scan in Analyze Skin to begin tracking objective skin indicator progression.'
            }

        timeline = []
        for r in rows:
            try:
                preds = json.loads(r['all_predictions']) if isinstance(r['all_predictions'], str) else r['all_predictions']
            except Exception:
                preds = []

            scores_map = {p['label']: round(p['confidence'] * 100, 1) for p in preds if 'label' in p and 'confidence' in p}
            
            # Severity classifications
            acne_score = scores_map.get('Acne', round(r['confidence_score'] * 100, 1) if r['dominant_concern'] == 'Acne' else 15.0)
            redness_score = scores_map.get('Skin Redness', 20.0)
            texture_score = scores_map.get('Skin Texture', 20.0)
            pigment_score = scores_map.get('Skin Pigmentation', 15.0)

            acne_severity = 'Severe' if acne_score > 45 else ('Moderate' if acne_score >= 25 else 'Mild')
            redness_severity = 'Elevated' if redness_score > 35 else ('Moderate' if redness_score >= 20 else 'Mild / Balanced')
            texture_severity = 'Rough' if texture_score > 35 else ('Uneven' if texture_score >= 20 else 'Refined / Smooth')

            created_date = str(r['created_at']).split(' ')[0] if ' ' in str(r['created_at']) else str(r['created_at'])[:10]
            
            timeline.append({
                'report_id': r['id'],
                'date': created_date,
                'created_at': r['created_at'],
                'image_name': r['image_name'],
                'image_url': f"/api/images/{r['image_name']}" if r['image_name'] else None,
                'dominant_concern': r['dominant_concern'],
                'confidence_pct': round((r['confidence_score'] or 0) * 100, 1),
                'acne': acne_score,
                'acne_severity': acne_severity,
                'redness': redness_score,
                'redness_severity': redness_severity,
                'texture': texture_score,
                'texture_severity': texture_severity,
                'pigmentation': pigment_score,
                'scores_map': scores_map
            })

        # Calculate deltas between first and latest scan
        first_scan = timeline[0]
        latest_scan = timeline[-1]
        
        acne_delta = round(latest_scan['acne'] - first_scan['acne'], 1)
        redness_delta = round(latest_scan['redness'] - first_scan['redness'], 1)
        texture_delta = round(latest_scan['texture'] - first_scan['texture'], 1)

        milestones = []
        if acne_delta < 0:
            milestones.append(f"Estimated acne score decreased by {abs(acne_delta)}% from baseline ({first_scan['acne_severity']} → {latest_scan['acne_severity']}).")
        elif acne_delta == 0:
            milestones.append(f"Estimated acne indicator remained stable at {latest_scan['acne']}% ({latest_scan['acne_severity']}).")
        
        if redness_delta < 0:
            milestones.append(f"Skin redness observation decreased by {abs(redness_delta)}% indicating reduced skin flushing.")

        return {
            'timeline': timeline,
            'first_scan': first_scan,
            'latest_scan': latest_scan,
            'metrics_deltas': {
                'acne': acne_delta,
                'redness': redness_delta,
                'texture': texture_delta
            },
            'milestones': milestones,
            'disclaimer': 'Visual model estimations indicate relative probability changes over time. Cosmetic guidance only — not a clinical claim that any specific product directly caused the change.'
        }

    @classmethod
    def get_product_effectiveness_journal(cls, user_id: int, product_id: Optional[int] = None) -> Dict[str, Any]:
        user_products = cls.get_user_products(user_id)
        if not user_products:
            return {'status': 'empty', 'message': 'No products in your vanity shelf yet.'}

        target_product = None
        if product_id:
            target_product = next((p for p in user_products if p['id'] == product_id), user_products[0])
        else:
            target_product = user_products[0]

        start_date = target_product['start_date']

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT id, dominant_concern, confidence_score, all_predictions, created_at
            FROM analysis_reports
            WHERE user_id = ?
            ORDER BY created_at ASC
        ''', (user_id,))
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()

        before_scans = []
        after_scans = []

        for r in rows:
            c_date = str(r['created_at']).split(' ')[0]
            if c_date < start_date:
                before_scans.append(r)
            else:
                after_scans.append(r)

        # Compute average concern confidence
        def calc_avg_conf(scans):
            if not scans:
                return 0.0
            return round(sum(s['confidence_score'] for s in scans) / len(scans) * 100, 1)

        return {
            'product': target_product,
            'start_date': start_date,
            'days_in_use': target_product['days_used'],
            'before_scans_count': len(before_scans),
            'after_scans_count': len(after_scans),
            'baseline_avg_confidence': calc_avg_conf(before_scans),
            'current_avg_confidence': calc_avg_conf(after_scans),
            'observation_note': f"Comparing skin indicator metrics before {start_date} against scans recorded during {target_product['days_used']} days of active usage. Observational review only."
        }

    @classmethod
    def generate_progress_summary(cls, user_id: int) -> Dict[str, Any]:
        adherence_data = cls.get_streak_and_adherence(user_id)
        analytics_data = cls.get_improvement_analytics(user_id)
        reactions = cls.get_skin_reactions(user_id)
        products = cls.get_user_products(user_id)

        completed_7 = adherence_data.get('adherence_7_days_pct', 70)
        streak = adherence_data.get('streak_days', 0)
        latest_scan = analytics_data.get('latest_scan')
        first_scan = analytics_data.get('first_scan')

        # Try Groq AI synthesis if API key is configured
        groq_key = os.getenv('GROQ_API_KEY')
        ai_summary_text = None

        if groq_key:
            try:
                import urllib.request
                prompt_content = f"""
You are an expert dermatological cosmetic AI assistant. Generate a concise, encouraging, personalized 3-sentence Skin Journey daily progress summary for this user:
- Streak: {streak} consecutive days of skincare routine
- Last 7 days adherence: {completed_7}%
- Latest analyzed skin concern: {latest_scan.get('dominant_concern') if latest_scan else 'Acne'} ({latest_scan.get('acne_severity') if latest_scan else 'Mild'})
- Acne delta from baseline: {analytics_data.get('metrics_deltas', {}).get('acne', 0)}%
- Recent skin reactions: {', '.join([r['reaction_type'] + ' (' + r['severity'] + ')' for r in reactions[:2]]) or 'None reported'}
- Active vanity products: {', '.join([p['product_name'] + ' (' + str(p['days_used']) + ' days)' for p in products[:3]])}

Strict Rules:
1. State facts objectively: "You completed your evening routine on X of the last 7 days. Your latest photo shows a lower estimated acne score than last week."
2. Do not falsely claim absolute medical cure or claim that a single product proved causation.
3. Keep it warm, precise, and under 75 words.
"""
                req_data = json.dumps({
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": "You are a licensed dermatological cosmetologist crafting concise clinical skin progress summaries."},
                        {"role": "user", "content": prompt_content}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 150
                }).encode('utf-8')

                req = urllib.request.Request(
                    "https://api.groq.com/openai/v1/chat/completions",
                    data=req_data,
                    headers={
                        "Authorization": f"Bearer {groq_key}",
                        "Content-Type": "application/json",
                        "User-Agent": "ALSkincare-AI/1.0"
                    }
                )
                with urllib.request.urlopen(req, timeout=8) as response:
                    res_body = json.loads(response.read().decode('utf-8'))
                    ai_summary_text = res_body['choices'][0]['message']['content'].strip()
            except Exception as e:
                print("[Groq AI Summary Note] Fallback to clinical template:", e)

        # Fallback intelligent template synthesis if Groq unavailable
        if not ai_summary_text:
            days_completed = round((completed_7 / 100) * 7)
            acne_note = ""
            if analytics_data.get('metrics_deltas', {}).get('acne', 0) < 0:
                acne_note = "Your latest photo shows a lower estimated acne score than previous evaluations."
            elif latest_scan:
                acne_note = f"Your latest scan reflects steady maintenance with primary characteristic classified as {latest_scan['dominant_concern']}."
            else:
                acne_note = "Awaiting your next weekly photo upload to compute indicator trajectories."

            reaction_note = ""
            if reactions:
                reaction_note = f"User feedback noted {reactions[0]['reaction_type'].lower()} ({reactions[0]['severity'].lower()}), which was addressed with gentle barrier rehydration."
            else:
                reaction_note = "Skin barrier tolerance remains calm with no adverse reactions reported."

            ai_summary_text = f"You completed your routine on {days_completed} of the last 7 days. {acne_note} {reaction_note}"

        return {
            'summary': ai_summary_text,
            'streak_days': streak,
            'adherence_pct': completed_7,
            'latest_concern': latest_scan.get('dominant_concern') if latest_scan else 'General Skincare',
            'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M')
        }

    @classmethod
    def generate_monthly_report(cls, user_id: int, year: int = 2026, month: int = 10) -> Dict[str, Any]:
        month_str = f"{year}-{month:02d}"
        month_name = datetime(year, month, 1).strftime('%B %Y')

        conn = get_db_connection()
        cur = conn.cursor()
        
        # Monthly routines
        cur.execute('''
            SELECT id, log_date, period, is_completed, missed_reason
            FROM daily_routines
            WHERE user_id = ? AND log_date LIKE ?
        ''', (user_id, f"{month_str}%"))
        routines = [dict(r) for r in cur.fetchall()]

        # Monthly reactions
        cur.execute('''
            SELECT reaction_type, severity, COUNT(*) as count
            FROM skin_reactions
            WHERE user_id = ? AND log_date LIKE ?
            GROUP BY reaction_type, severity
        ''', (user_id, f"{month_str}%"))
        reactions_summary = [dict(r) for r in cur.fetchall()]

        # Monthly scans
        cur.execute('''
            SELECT id, dominant_concern, confidence_score, created_at
            FROM analysis_reports
            WHERE user_id = ? AND created_at LIKE ?
            ORDER BY created_at ASC
        ''', (user_id, f"{month_str}%"))
        scans = [dict(r) for r in cur.fetchall()]

        conn.close()

        total_logged = len(routines)
        completed_count = sum(1 for r in routines if r['is_completed'] == 1)
        missed_count = total_logged - completed_count
        adherence_pct = round((completed_count / max(1, total_logged)) * 100) if total_logged else 0

        first_scan = scans[0] if scans else None
        latest_scan = scans[-1] if scans else None

        return {
            'month': month_name,
            'month_code': month_str,
            'total_routines_logged': total_logged,
            'completed_routines': completed_count,
            'missed_routines': missed_count,
            'adherence_rate_pct': adherence_pct,
            'total_scans_taken': len(scans),
            'first_scan': first_scan,
            'latest_scan': latest_scan,
            'reactions_summary': reactions_summary,
            'executive_summary': f"During {month_name}, you logged {completed_count} completed skincare sessions ({adherence_pct}% adherence). Consistent morning sunscreen and evening hydration maintained barrier health with {len(scans)} objective facial scans tracked.",
            'guidance_disclaimer': 'Monthly retrospective generated for cosmetic awareness and habit reinforcement. Does not constitute clinical medical diagnosis.'
        }

    @classmethod
    def search_timeline(cls, user_id: int, query: str) -> Dict[str, Any]:
        q = (query or '').strip().lower()
        if not q:
            return {'answer': 'Please enter a search query, like "What products did I use last Wednesday?"', 'results': []}

        timeline = cls.get_timeline(user_id, limit=60)
        matched_days = []

        # Check for weekday queries (e.g., 'wednesday', 'monday', 'yesterday', 'today')
        for day in timeline:
            date_meta = day.get('date_meta', {})
            w = date_meta.get('weekday', '').lower()
            rel = date_meta.get('relative', '').lower()
            date_str = day.get('date', '').lower()

            day_text_parts = [w, rel, date_str]
            if day.get('morning'):
                m = day['morning']
                day_text_parts.extend(m.get('steps', []))
                day_text_parts.extend([p.get('name', '') for p in m.get('products', [])])
                day_text_parts.append(m.get('skin_feel') or '')
                day_text_parts.append(m.get('notes') or '')
            if day.get('evening'):
                e = day['evening']
                day_text_parts.extend(e.get('steps', []))
                day_text_parts.extend([p.get('name', '') for p in e.get('products', [])])
                day_text_parts.append(e.get('skin_feel') or '')
                day_text_parts.append(e.get('notes') or '')
            for rx in day.get('reactions', []):
                day_text_parts.append(rx.get('reaction_type', ''))
                day_text_parts.append(rx.get('notes', ''))

            full_text = ' '.join(day_text_parts).lower()

            # Match criteria
            if (q in full_text) or any(term in full_text for term in q.split() if len(term) > 3):
                matched_days.append(day)

        # Build natural language answer
        answer = ""
        if matched_days:
            first_m = matched_days[0]
            m_date = first_m['date_meta']['full_date']
            m_rel = first_m['date_meta']['relative']
            
            prods = []
            if first_m.get('morning') and first_m['morning'].get('products'):
                prods.extend([p['name'] for p in first_m['morning']['products']])
            if first_m.get('evening') and first_m['evening'].get('products'):
                prods.extend([p['name'] for p in first_m['evening']['products']])

            prods_str = ', '.join(prods) if prods else "Standard Cleanser and Moisturizer"
            reactions_str = ""
            if first_m.get('reactions'):
                reactions_str = f" User logged reaction: {first_m['reactions'][0]['reaction_type']} ({first_m['reactions'][0]['severity']})."

            answer = f"On {m_date} ({m_rel}), you recorded: {prods_str}.{reactions_str}"
        else:
            answer = f"No direct routine or reaction match found for '{query}'. Try searching for a specific product, date, or reaction like 'Cleanser', 'Yesterday', or 'Dryness'."

        return {
            'query': query,
            'answer': answer,
            'count': len(matched_days),
            'results': matched_days
        }
