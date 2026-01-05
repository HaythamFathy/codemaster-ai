import sqlite3

DB_PATH = 'backend/codemaster.db'

def inspect():
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("PRAGMA table_info(courses)")
        columns = c.fetchall()
        print(f"Columns in {DB_PATH}/courses:")
        for col in columns:
            print(col)
        conn.close()
    except Exception as e:
        print(e)

if __name__ == "__main__":
    inspect()
