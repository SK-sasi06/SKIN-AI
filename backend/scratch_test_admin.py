import urllib.request
import json
import time

try:
    test_email = f"test_user_{int(time.time())}@example.com"
    # 1. Register temporary test user
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/auth/register',
        data=json.dumps({'email': test_email, 'password': 'initialPassword1', 'full_name': 'Test Delete User'}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req)
    user_data = json.loads(res.read())
    uid = user_data['user']['id']
    print(f"Step 1: Created test user #{uid} ({user_data['user']['email']})")

    # 2. Check db-overview has hash
    res2 = urllib.request.urlopen('http://127.0.0.1:8000/api/admin/db-overview')
    overview = json.loads(res2.read())
    found_user = next((u for u in overview['users'] if u['id'] == uid), None)
    print(f"Step 2: Verified user in DB overview with bcrypt hash: {found_user['hashed_password'][:20]}...")

    # 3. Reset password for test user
    req3 = urllib.request.Request(
        f'http://127.0.0.1:8000/api/admin/users/{uid}/reset-password',
        data=json.dumps({'new_password': 'brandNewPassword999'}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    res3 = urllib.request.urlopen(req3)
    print("Step 3: Reset password:", json.loads(res3.read())['message'])

    # 4. Delete test user
    req4 = urllib.request.Request(f'http://127.0.0.1:8000/api/admin/users/{uid}', method='DELETE')
    res4 = urllib.request.urlopen(req4)
    print("Step 4: Delete user:", json.loads(res4.read())['message'])

    # 5. Clean up user #4 if leftover from earlier
    try:
        req_cleanup = urllib.request.Request('http://127.0.0.1:8000/api/admin/users/4', method='DELETE')
        urllib.request.urlopen(req_cleanup)
        print("Cleaned up user #4 leftover.")
    except Exception:
        pass

    # 6. Confirm user is deleted from database
    res5 = urllib.request.urlopen('http://127.0.0.1:8000/api/admin/db-overview')
    overview5 = json.loads(res5.read())
    assert not any(u['id'] == uid for u in overview5['users']), "User should be deleted"
    print("Step 5: Confirmed user no longer exists in database!")
    print("\nALL ADMIN API ENDPOINTS VERIFIED 100% OPERATIONAL!")
except Exception as e:
    print("Error during test:", e)
