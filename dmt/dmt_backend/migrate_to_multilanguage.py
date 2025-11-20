"""
Database Migration Script: Single-Language to Multi-Language
Migrates existing DMT records from single-language schema to multi-language schema

This script:
1. Adds new multi-language columns (_en, _es, _zh) for text fields
2. Copies existing data to _en columns (assuming existing data is in English)
3. Optionally translates to Spanish and Chinese using translation service
4. Removes old single-language columns

IMPORTANT: Back up your database before running this script!

Usage:
    python migrate_to_multilanguage.py [--auto-translate]

Options:
    --auto-translate    Automatically translate existing English text to Spanish and Chinese
                        (requires LibreTranslate service to be running)

Without --auto-translate, Spanish and Chinese fields will be empty and must be filled manually.
"""

import sys
import argparse
from sqlalchemy import text
from database import engine, get_session
from translation_free import translate_field_to_all_languages
from models import DMTRecord

# Text fields that need migration
TEXT_FIELDS = [
    'defect_description',
    'process_analysis',
    'repair_process',
    'engineering_findings'
]


def add_multilanguage_columns():
    """
    Step 1: Add new multi-language columns to DMTRecord table
    """
    print("\n=== Step 1: Adding Multi-Language Columns ===")

    with engine.connect() as conn:
        for field in TEXT_FIELDS:
            try:
                # Add _en column
                print(f"Adding column: {field}_en")
                conn.execute(text(f"ALTER TABLE dmtrecord ADD COLUMN {field}_en TEXT"))

                # Add _es column
                print(f"Adding column: {field}_es")
                conn.execute(text(f"ALTER TABLE dmtrecord ADD COLUMN {field}_es TEXT"))

                # Add _zh column
                print(f"Adding column: {field}_zh")
                conn.execute(text(f"ALTER TABLE dmtrecord ADD COLUMN {field}_zh TEXT"))

                conn.commit()
                print(f"✓ Successfully added multi-language columns for {field}")

            except Exception as e:
                if "Duplicate column name" in str(e):
                    print(f"⚠ Columns for {field} already exist, skipping...")
                else:
                    print(f"✗ Error adding columns for {field}: {e}")
                    raise

    print("✓ All multi-language columns added successfully")


def migrate_existing_data(auto_translate=False):
    """
    Step 2: Migrate existing data to new multi-language columns

    Args:
        auto_translate: If True, automatically translate to Spanish and Chinese
    """
    print(f"\n=== Step 2: Migrating Existing Data (auto_translate={auto_translate}) ===")

    with engine.connect() as conn:
        # Get all records with old columns
        result = conn.execute(text("SELECT id FROM dmtrecord"))
        record_ids = [row[0] for row in result]

        print(f"Found {len(record_ids)} records to migrate")

        for record_id in record_ids:
            print(f"\nMigrating record ID: {record_id}")

            for field in TEXT_FIELDS:
                try:
                    # Get existing value from old column (if it exists)
                    try:
                        result = conn.execute(
                            text(f"SELECT {field} FROM dmtrecord WHERE id = :id"),
                            {"id": record_id}
                        )
                        row = result.fetchone()
                        old_value = row[0] if row else None
                    except Exception as e:
                        # Old column doesn't exist yet
                        print(f"  Old column {field} doesn't exist, skipping...")
                        old_value = None

                    if old_value:
                        print(f"  Migrating {field}: {old_value[:50]}...")

                        if auto_translate:
                            # Translate to all languages
                            print(f"    Auto-translating...")
                            translations = translate_field_to_all_languages(old_value, 'en')

                            conn.execute(
                                text(f"""
                                    UPDATE dmtrecord
                                    SET {field}_en = :en, {field}_es = :es, {field}_zh = :zh
                                    WHERE id = :id
                                """),
                                {
                                    "id": record_id,
                                    "en": translations['en'],
                                    "es": translations['es'],
                                    "zh": translations['zh']
                                }
                            )
                            print(f"    ✓ Translated and saved to all 3 languages")

                        else:
                            # Only copy to _en column, leave _es and _zh empty
                            conn.execute(
                                text(f"""
                                    UPDATE dmtrecord
                                    SET {field}_en = :en
                                    WHERE id = :id
                                """),
                                {"id": record_id, "en": old_value}
                            )
                            print(f"    ✓ Copied to {field}_en (es and zh left blank)")

                    else:
                        print(f"  {field} is empty, skipping...")

                except Exception as e:
                    print(f"  ✗ Error migrating {field}: {e}")
                    continue

            conn.commit()

    print("\n✓ Data migration completed successfully")


def add_report_number_column():
    """
    Step 3: Add report_number column if it doesn't exist
    """
    print("\n=== Step 3: Adding report_number Column ===")

    with engine.connect() as conn:
        try:
            print("Adding column: report_number")
            conn.execute(text("ALTER TABLE dmtrecord ADD COLUMN report_number VARCHAR(100)"))
            conn.commit()
            print("✓ Successfully added report_number column")

            # Auto-generate report numbers for existing records (1000 + id)
            print("Auto-generating report numbers for existing records...")
            conn.execute(text("UPDATE dmtrecord SET report_number = CONCAT('', 1000 + id)"))
            conn.commit()
            print("✓ Report numbers generated successfully")

        except Exception as e:
            if "Duplicate column name" in str(e):
                print("⚠ report_number column already exists, skipping...")
            else:
                print(f"✗ Error adding report_number column: {e}")
                raise


def drop_old_columns():
    """
    Step 4: Drop old single-language columns
    WARNING: This is destructive! Make sure data is migrated correctly first.
    """
    print("\n=== Step 4: Dropping Old Single-Language Columns ===")
    print("⚠ WARNING: This will permanently delete old columns!")

    response = input("Are you sure you want to drop old columns? (yes/no): ")
    if response.lower() != 'yes':
        print("Skipping column deletion.")
        return

    with engine.connect() as conn:
        for field in TEXT_FIELDS:
            try:
                print(f"Dropping old column: {field}")
                conn.execute(text(f"ALTER TABLE dmtrecord DROP COLUMN {field}"))
                conn.commit()
                print(f"✓ Dropped {field}")

            except Exception as e:
                if "Can't DROP" in str(e):
                    print(f"⚠ Column {field} doesn't exist, skipping...")
                else:
                    print(f"✗ Error dropping {field}: {e}")
                    continue

    print("✓ Old columns dropped successfully")


def verify_migration():
    """
    Step 5: Verify migration was successful
    """
    print("\n=== Step 5: Verifying Migration ===")

    with engine.connect() as conn:
        # Count records
        result = conn.execute(text("SELECT COUNT(*) FROM dmtrecord"))
        total_records = result.fetchone()[0]
        print(f"Total records in database: {total_records}")

        # Check for data in new columns
        for field in TEXT_FIELDS:
            result = conn.execute(text(f"SELECT COUNT(*) FROM dmtrecord WHERE {field}_en IS NOT NULL AND {field}_en != ''"))
            count_en = result.fetchone()[0]

            result = conn.execute(text(f"SELECT COUNT(*) FROM dmtrecord WHERE {field}_es IS NOT NULL AND {field}_es != ''"))
            count_es = result.fetchone()[0]

            result = conn.execute(text(f"SELECT COUNT(*) FROM dmtrecord WHERE {field}_zh IS NOT NULL AND {field}_zh != ''"))
            count_zh = result.fetchone()[0]

            print(f"{field}:")
            print(f"  EN: {count_en} records")
            print(f"  ES: {count_es} records")
            print(f"  ZH: {count_zh} records")

    print("\n✓ Migration verification completed")


def main():
    """
    Main migration function
    """
    parser = argparse.ArgumentParser(description='Migrate DMT database to multi-language schema')
    parser.add_argument('--auto-translate', action='store_true',
                        help='Automatically translate existing text to Spanish and Chinese')
    parser.add_argument('--skip-drop', action='store_true',
                        help='Skip dropping old columns (useful for testing)')

    args = parser.parse_args()

    print("=" * 60)
    print("DMT DATABASE MIGRATION: Single-Language → Multi-Language")
    print("=" * 60)

    print(f"\nConfiguration:")
    print(f"  Auto-translate: {args.auto_translate}")
    print(f"  Skip drop old columns: {args.skip_drop}")

    if args.auto_translate:
        print("\n⚠ Auto-translation requires LibreTranslate service to be running!")
        print("  Make sure LibreTranslate is available at the configured URL.")

    print("\n⚠ IMPORTANT: Make sure you have backed up your database!")
    response = input("\nDo you want to proceed? (yes/no): ")

    if response.lower() != 'yes':
        print("Migration cancelled.")
        sys.exit(0)

    try:
        # Step 1: Add new columns
        add_multilanguage_columns()

        # Step 2: Migrate data
        migrate_existing_data(auto_translate=args.auto_translate)

        # Step 3: Add report_number column
        add_report_number_column()

        # Step 4: Drop old columns (optional)
        if not args.skip_drop:
            drop_old_columns()

        # Step 5: Verify
        verify_migration()

        print("\n" + "=" * 60)
        print("✓ MIGRATION COMPLETED SUCCESSFULLY!")
        print("=" * 60)

        if not args.auto_translate:
            print("\nNOTE: Spanish and Chinese fields are empty.")
            print("You can:")
            print("  1. Fill them manually through the UI")
            print("  2. Run this script again with --auto-translate flag")

    except Exception as e:
        print(f"\n✗ MIGRATION FAILED: {e}")
        print("\nPlease restore from backup and fix the issue before retrying.")
        sys.exit(1)


if __name__ == "__main__":
    main()
