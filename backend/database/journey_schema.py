import sqlite3
import os
import json
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'skincare.db')

def init_journey_tables():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # 1. Daily Skincare Routine Logs
    cur.execute('''
        CREATE TABLE IF NOT EXISTS daily_routines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            log_date TEXT NOT NULL,
            period TEXT NOT NULL, -- 'morning', 'evening', 'afternoon'
            is_completed INTEGER DEFAULT 1, -- 1 for completed, 0 for missed
            missed_reason TEXT,
            steps_completed TEXT, -- JSON array of steps e.g. ["cleanser", "moisturizer", "sunscreen"]
            products_used TEXT, -- JSON array of product objects
            skin_feel TEXT,
            reactions TEXT, -- JSON array of reaction strings
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, log_date, period)
        )
    ''')

    # 2. User Vanity Shelf & Product Start Dates
    cur.execute('''
        CREATE TABLE IF NOT EXISTS user_products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER,
            product_name TEXT NOT NULL,
            brand TEXT,
            category TEXT NOT NULL, -- 'Cleanser', 'Serum', 'Moisturizer', 'Sunscreen', 'Treatment', etc.
            start_date TEXT NOT NULL, -- 'YYYY-MM-DD'
            is_active INTEGER DEFAULT 1,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')

    # 3. User Skin Reaction Logs
    cur.execute('''
        CREATE TABLE IF NOT EXISTS skin_reactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            log_date TEXT NOT NULL,
            reaction_type TEXT NOT NULL, -- 'Dryness', 'Irritation / Burning', 'Redness / Flush', 'Breakout / Purging', 'Peeling / Flaking', 'Calm & Balanced'
            severity TEXT NOT NULL, -- 'Mild', 'Moderate', 'Severe'
            suspected_product TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')

    # Ensure users table has last_login and is_active columns
    try:
        cur.execute("PRAGMA table_info(users)")
        user_cols = [c[1] for c in cur.fetchall()]
        if 'last_login' not in user_cols:
            cur.execute("ALTER TABLE users ADD COLUMN last_login TIMESTAMP")
        if 'is_active' not in user_cols:
            cur.execute("ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1")
        cur.execute("UPDATE users SET last_login = created_at WHERE last_login IS NULL")
        conn.commit()
    except Exception as e:
        print("[DB Migration Note] Error checking/adding users columns:", e)

    conn.commit()

    # Check if seed data exists for demo user (id=1)
    cur.execute('SELECT COUNT(*) FROM daily_routines WHERE user_id = 1')
    routine_count = cur.fetchone()[0]

    if routine_count == 0:
        seed_demo_data(conn)

    conn.close()

def seed_demo_data(conn):
    cur = conn.cursor()
    # Ensure user 1 exists
    cur.execute('SELECT id FROM users WHERE id = 1')
    if not cur.fetchone():
        return

    # Seed User Products (Vanity Shelf)
    user_products_data = [
        (1, 1, 'Hydrating Facial Cleanser', 'CeraVe', 'Cleanser', '2026-09-15', 1, 'Gentle daily morning & evening wash with ceramides & hyaluronic acid'),
        (1, 2, 'Niacinamide 10% + Zinc 1%', 'The Ordinary', 'Serum', '2026-10-01', 1, 'Started for barrier repair, sebum regulation & redness'),
        (1, 3, 'Toleriane Double Repair Moisturizer', 'La Roche-Posay', 'Moisturizer', '2026-09-15', 1, 'Daily soothing cream with prebiotic thermal water'),
        (1, 4, 'Relief Sun: Rice + Probiotics SPF 50+', 'Beauty of Joseon', 'Sunscreen', '2026-09-20', 1, 'Broad-spectrum organic UV defense, no white cast')
    ]
    cur.executemany('''
        INSERT OR IGNORE INTO user_products 
        (user_id, product_id, product_name, brand, category, start_date, is_active, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', user_products_data)

    # Base dates around current time (October 20-22, 2026)
    # Oct 20 (Yesterday - Monday)
    cur.execute('''
        INSERT OR REPLACE INTO daily_routines
        (user_id, log_date, period, is_completed, steps_completed, products_used, skin_feel, reactions, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        1,
        '2026-10-20',
        'morning',
        1,
        json.dumps(['Cleanser', 'Moisturizer', 'Sunscreen']),
        json.dumps([
            {'name': 'Hydrating Facial Cleanser', 'category': 'Cleanser', 'brand': 'CeraVe', 'time': '08:15 AM'},
            {'name': 'Toleriane Double Repair Moisturizer', 'category': 'Moisturizer', 'brand': 'La Roche-Posay', 'time': '08:18 AM'},
            {'name': 'Relief Sun: Rice + Probiotics SPF 50+', 'category': 'Sunscreen', 'brand': 'Beauty of Joseon', 'time': '08:22 AM'}
        ]),
        'Fresh and protected',
        json.dumps([]),
        'Morning routine completed ahead of commute.'
    ))

    cur.execute('''
        INSERT OR REPLACE INTO daily_routines
        (user_id, log_date, period, is_completed, steps_completed, products_used, skin_feel, reactions, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        1,
        '2026-10-20',
        'evening',
        1,
        json.dumps(['Cleanser', 'Moisturizer']),
        json.dumps([
            {'name': 'Hydrating Facial Cleanser', 'category': 'Cleanser', 'brand': 'CeraVe', 'time': '10:05 PM'},
            {'name': 'Toleriane Double Repair Moisturizer', 'category': 'Moisturizer', 'brand': 'La Roche-Posay', 'time': '10:10 PM'}
        ]),
        'Skin felt slightly dry',
        json.dumps(['Dryness']),
        'Skipped active serum tonight to rest skin barrier.'
    ))

    # Skin reaction on Oct 20
    cur.execute('''
        INSERT OR IGNORE INTO skin_reactions
        (user_id, log_date, reaction_type, severity, suspected_product, notes)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        1,
        '2026-10-20',
        'Dryness',
        'Mild',
        'Weather / AC Exposure',
        'Mild tightness along cheekbones after evening cleanse.'
    ))

    # Oct 21 (Tuesday)
    cur.execute('''
        INSERT OR REPLACE INTO daily_routines
        (user_id, log_date, period, is_completed, steps_completed, products_used, skin_feel, reactions, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        1,
        '2026-10-21',
        'morning',
        1,
        json.dumps(['Cleanser', 'Serum', 'Moisturizer', 'Sunscreen']),
        json.dumps([
            {'name': 'Hydrating Facial Cleanser', 'category': 'Cleanser', 'brand': 'CeraVe', 'time': '08:30 AM'},
            {'name': 'Niacinamide 10% + Zinc 1%', 'category': 'Serum', 'brand': 'The Ordinary', 'time': '08:33 AM'},
            {'name': 'Toleriane Double Repair Moisturizer', 'category': 'Moisturizer', 'brand': 'La Roche-Posay', 'time': '08:36 AM'},
            {'name': 'Relief Sun SPF 50+', 'category': 'Sunscreen', 'brand': 'Beauty of Joseon', 'time': '08:40 AM'}
        ]),
        'Well hydrated, reduced redness',
        json.dumps([]),
        'Added extra layer of moisturizer to counter dryness.'
    ))

    # Oct 21 Evening - Not recorded yet to reflect user prompt example
    # ("Evening: Routine not recorded yet")

    # Add Oct 19, 18, 17, 16, 15 routines to build authentic 7-day streak and adherence history
    for i in range(2, 8):
        past_date = (datetime(2026, 10, 22) - timedelta(days=i)).strftime('%Y-%m-%d')
        # morning routine
        cur.execute('''
            INSERT OR REPLACE INTO daily_routines
            (user_id, log_date, period, is_completed, steps_completed, products_used, skin_feel, reactions, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            1,
            past_date,
            'morning',
            1,
            json.dumps(['Cleanser', 'Moisturizer', 'Sunscreen']),
            json.dumps([
                {'name': 'Hydrating Facial Cleanser', 'category': 'Cleanser', 'brand': 'CeraVe', 'time': '08:20 AM'},
                {'name': 'Toleriane Double Repair Moisturizer', 'category': 'Moisturizer', 'brand': 'La Roche-Posay', 'time': '08:25 AM'},
                {'name': 'Relief Sun SPF 50+', 'category': 'Sunscreen', 'brand': 'Beauty of Joseon', 'time': '08:30 AM'}
            ]),
            'Comfortable and protected',
            json.dumps([]),
            f'Consistent morning routine on {past_date}.'
        ))

        # evening routine (one missed on day 5 to showcase missed routine tracking!)
        is_completed = 0 if i == 5 else 1
        missed_reason = 'Traveled late from conference and fell asleep' if i == 5 else None
        cur.execute('''
            INSERT OR REPLACE INTO daily_routines
            (user_id, log_date, period, is_completed, missed_reason, steps_completed, products_used, skin_feel, reactions, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            1,
            past_date,
            'evening',
            is_completed,
            missed_reason,
            json.dumps(['Cleanser', 'Serum', 'Moisturizer']) if is_completed else json.dumps([]),
            json.dumps([
                {'name': 'Hydrating Facial Cleanser', 'category': 'Cleanser', 'brand': 'CeraVe', 'time': '09:45 PM'},
                {'name': 'Niacinamide 10% + Zinc 1%', 'category': 'Serum', 'brand': 'The Ordinary', 'time': '09:50 PM'},
                {'name': 'Toleriane Double Repair Moisturizer', 'category': 'Moisturizer', 'brand': 'La Roche-Posay', 'time': '09:55 PM'}
            ]) if is_completed else json.dumps([]),
            'Supple and calm' if is_completed else 'Tired',
            json.dumps([]),
            f'Evening log for {past_date}' if is_completed else 'Missed evening skincare'
        ))

    conn.commit()

if __name__ == '__main__':
    init_journey_tables()
    print("Skin Journey tables successfully created and seeded!")
