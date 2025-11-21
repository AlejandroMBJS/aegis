"""
Database Migration Script: Update User Model
Migrates the User table to align with the new User model schema.

This script:
1. Renames the 'employee_number' column to 'username'.
2. Adds a new 'email' column with a UNIQUE constraint.

IMPORTANT: Back up your database before running this script!

Usage:
    python migrate_user_model.py
"""

import sys
import argparse
from sqlalchemy import text
from database import engine

def run_migration():
    """
    Applies the necessary schema changes to the 'user' table.
    """
    print("\n=== Starting User Model Migration ===")

    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # Step 1: Rename 'employee_number' to 'username'
            print("Step 1: Renaming column 'employee_number' to 'username'...")
            try:
                conn.execute(text("ALTER TABLE user RENAME COLUMN employee_number TO username"))
                print("✓ Column renamed successfully.")
            except Exception as e:
                if "already exists" in str(e) or "duplicate column name" in str(e).lower():
                    print("⚠ Column 'username' already exists, skipping rename.")
                elif "no such column" in str(e).lower() or "doesn't exist" in str(e):
                     print("⚠ Column 'employee_number' does not exist, skipping rename.")
                else:
                    raise

            # Step 2: Add 'email' column
            print("\nStep 2: Adding 'email' column...")
            try:
                conn.execute(text("ALTER TABLE user ADD COLUMN email VARCHAR(255)"))
                print("✓ Column 'email' added successfully.")
                print("   Populating email with dummy data (username@example.com)...")
                conn.execute(text("UPDATE user SET email = username || '@example.com' WHERE email IS NULL"))
                print("   Adding UNIQUE constraint to email column...")
                conn.execute(text("CREATE UNIQUE INDEX ix_user_email ON user (email)"))
                print("✓ UNIQUE constraint added to 'email'.")

            except Exception as e:
                if "duplicate column name" in str(e).lower():
                    print("⚠ Column 'email' already exists, skipping.")
                else:
                    # We need to be careful here. If the column exists but the index doesn't,
                    # the previous step might have been partially completed.
                    # A more robust migration would check for the index separately.
                    try:
                        print("   Attempting to add UNIQUE constraint to existing email column...")
                        conn.execute(text("CREATE UNIQUE INDEX ix_user_email ON user (email)"))
                        print("✓ UNIQUE constraint added to 'email'.")
                    except Exception as e2:
                         if "already exists" in str(e2).lower():
                             print("⚠ UNIQUE constraint on 'email' already exists.")
                         else:
                             raise e2 from e


            trans.commit()
            print("\n✓ Migration transaction committed successfully.")

        except Exception as e:
            print(f"\n✗ MIGRATION FAILED: An error occurred: {e}")
            print("   Rolling back changes...")
            trans.rollback()
            sys.exit(1)

def main():
    """
    Main migration function.
    """
    parser = argparse.ArgumentParser(description='Migrate User model schema.')
    parser.add_argument('--force', action='store_true', help='Force migration without interactive prompt.')
    args = parser.parse_args()

    print("=" * 60)
    print("DMT DATABASE MIGRATION: Update User Model")
    print("=" * 60)

    if not args.force:
        print("\n⚠ IMPORTANT: Make sure you have backed up your database!")
        response = input("\nDo you want to proceed with the migration? (yes/no): ")
        if response.lower() != 'yes':
            print("Migration cancelled.")
            sys.exit(0)

    run_migration()

    print("\n" + "=" * 60)
    print("✓ USER MODEL MIGRATION COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    print("\nNOTE: The 'email' column has been populated with dummy data.")
    print("Please update the email addresses for existing users as needed.")

if __name__ == "__main__":
    main()
