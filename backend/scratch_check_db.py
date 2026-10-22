import urllib.request
import json

try:
    with urllib.request.urlopen('http://127.0.0.1:8000/api/admin/db-overview') as res:
        data = json.loads(res.read().decode())
        print("SUCCESS! DB Overview:")
        print(f"Total registered users: {data['total_users']}")
        print(f"Database size: {data['db_size_formatted']} ({data['db_path']})")
        print("Table Row Counts:")
        for tbl, count in data['table_stats'].items():
            print(f"  • {tbl}: {count} rows")
        print("\nRegistered Users & Login Activity:")
        for u in data['users']:
            print(f"  • User #{u['id']}: {u['full_name']} <{u['email']}> | Registered: {u['created_at']} | Last Login: {u['last_login']} | Scans: {u['scan_count']} | Routines: {u['routine_count']}")
except Exception as e:
    print("Error querying db-overview:", e)
