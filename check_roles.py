import asyncio, asyncpg, sys
sys.stdout.reconfigure(encoding="utf-8")

async def main():
    conn = await asyncpg.connect(host="localhost", port=5432, database="book_shop",
                                 user="postgres", password="An0986756583")

    # Check if password_hash column exists
    col = await conn.fetchval("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name='users' AND column_name='password_hash'
    """)
    if col:
        await conn.execute("ALTER TABLE users DROP COLUMN password_hash")
        print("[OK] Dropped password_hash column from users table")
    else:
        print("[OK] password_hash column already absent")

    # Verify users table structure
    cols = await conn.fetch("""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name='users' ORDER BY ordinal_position
    """)
    print("users table columns:")
    for c in cols:
        print(f"  {c['column_name']} | {c['data_type']} | nullable={c['is_nullable']}")

    await conn.close()

asyncio.run(main())
