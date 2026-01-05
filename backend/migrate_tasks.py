import sqlite3

DB_PATH = 'backend/codemaster.db'

def migrate_tasks():
    print(f"Connecting to {DB_PATH}...")
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        # Create user_tasks table
        try:
            c.execute("""
                CREATE TABLE IF NOT EXISTS user_tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    lesson_id INTEGER,
                    task_json TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(user_id) REFERENCES users(id),
                    FOREIGN KEY(lesson_id) REFERENCES lessons(id)
                )
            """)
            print("SUCCESS: Created user_tasks table.")
            
            # Create index for faster lookups
            c.execute("CREATE INDEX IF NOT EXISTS idx_user_lesson ON user_tasks(user_id, lesson_id)")
            print("SUCCESS: Created index idx_user_lesson.")
            
        except Exception as e:
            print(f"ERROR creating table: {e}")

        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Migration Failed: {e}")

if __name__ == "__main__":
    migrate_tasks()
