import sqlite3

DB_PATH = 'backend/codemaster.db'

def migrate():
    print(f"Connecting to {DB_PATH}...")
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        # Add image_url
        try:
            c.execute("ALTER TABLE courses ADD COLUMN image_url TEXT")
            print("SUCCESS: Added image_url column.")
        except sqlite3.OperationalError as e:
            if "duplicate column" in str(e):
                print("INFO: image_url column already exists.")
            else:
                print(f"ERROR adding image_url: {e}")
                
        # Add description
        try:
            c.execute("ALTER TABLE courses ADD COLUMN description TEXT")
            print("SUCCESS: Added description column.")
        except sqlite3.OperationalError as e:
            if "duplicate column" in str(e):
                print("INFO: description column already exists.")
            else:
                print(f"ERROR adding description: {e}")

        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Migration Failed: {e}")

if __name__ == "__main__":
    migrate()
