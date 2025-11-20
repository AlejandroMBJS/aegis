"""
Translation Service for DMT System
Uses LibreTranslate (free, no API key required)

This service automatically translates text fields between English, Spanish, and Chinese.
All translations happen automatically when creating or updating DMT records.

Functions:
- translate_text(): Translates a single text from source to target language
- translate_field_to_all_languages(): Translates a field to all 3 supported languages
- translate_all_text_fields(): Translates all text fields in a DMT record payload

LibreTranslate Installation:
    pip install libretranslate

    Or run as Docker container:
    docker run -p 5000:5000 libretranslate/libretranslate

Public instance: https://libretranslate.de (may have rate limits)
"""

import requests
from typing import Dict, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# LibreTranslate configuration
# Option 1: Use public instance (may have rate limits)
LIBRETRANSLATE_URL = "https://libretranslate.de/translate"

# Option 2: Use local instance (recommended for production)
# LIBRETRANSLATE_URL = "http://localhost:5000/translate"

# Language codes
SUPPORTED_LANGUAGES = {
    'en': 'English',
    'es': 'Spanish',
    'zh': 'Chinese'
}


def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """
    Translates text from source language to target language using LibreTranslate.

    Args:
        text: The text to translate
        source_lang: Source language code ('en', 'es', 'zh')
        target_lang: Target language code ('en', 'es', 'zh')

    Returns:
        Translated text string

    Example:
        >>> translate_text("Hello world", "en", "es")
        "Hola mundo"
    """
    # If source and target are the same, no translation needed
    if source_lang == target_lang:
        return text

    # If text is empty or None, return empty string
    if not text or text.strip() == '':
        return ''

    try:
        # Prepare the request payload
        payload = {
            'q': text,
            'source': source_lang,
            'target': target_lang,
            'format': 'text'
        }

        # Make the translation request
        response = requests.post(LIBRETRANSLATE_URL, json=payload, timeout=10)
        response.raise_for_status()  # Raise exception for bad status codes

        # Extract translated text from response
        result = response.json()
        translated_text = result.get('translatedText', text)

        logger.info(f"Translated from {source_lang} to {target_lang}: '{text[:50]}...' -> '{translated_text[:50]}...'")
        return translated_text

    except requests.exceptions.RequestException as e:
        logger.error(f"Translation API error: {e}")
        # Fallback: return original text if translation fails
        return text
    except Exception as e:
        logger.error(f"Unexpected error during translation: {e}")
        return text


def translate_field_to_all_languages(text: str, source_lang: str) -> Dict[str, str]:
    """
    Translates a text field to all 3 supported languages (en, es, zh).

    Args:
        text: The text to translate
        source_lang: Source language code ('en', 'es', 'zh')

    Returns:
        Dictionary with keys 'en', 'es', 'zh' containing translations

    Example:
        >>> translate_field_to_all_languages("Defect found on surface", "en")
        {
            'en': 'Defect found on surface',
            'es': 'Defecto encontrado en la superficie',
            'zh': '表面发现缺陷'
        }
    """
    if not text or text.strip() == '':
        return {'en': '', 'es': '', 'zh': ''}

    result = {}

    # Translate to all target languages
    for target_lang in SUPPORTED_LANGUAGES.keys():
        result[target_lang] = translate_text(text, source_lang, target_lang)

    return result


def translate_all_text_fields(data: dict, source_lang: str) -> dict:
    """
    Translates all text fields in a DMT record payload to all 3 languages.

    This function handles the 4 multi-language text fields in DMT records:
    - defect_description
    - process_analysis
    - repair_process
    - engineering_findings

    Args:
        data: Dictionary containing text field values (e.g., {'defect_description': 'Some text'})
        source_lang: Source language code ('en', 'es', 'zh')

    Returns:
        Dictionary with all multi-language fields populated

    Example:
        >>> data = {
        ...     'defect_description': 'Surface scratch',
        ...     'process_analysis': 'Manual handling issue'
        ... }
        >>> translate_all_text_fields(data, 'en')
        {
            'defect_description_en': 'Surface scratch',
            'defect_description_es': 'Rayón en la superficie',
            'defect_description_zh': '表面划痕',
            'process_analysis_en': 'Manual handling issue',
            'process_analysis_es': 'Problema de manipulación manual',
            'process_analysis_zh': '人工处理问题',
            ...
        }
    """
    result = {}

    # Define the text fields that need translation
    text_fields = [
        'defect_description',
        'process_analysis',
        'repair_process',
        'engineering_findings'
    ]

    for field_name in text_fields:
        if field_name in data and data[field_name]:
            # Translate this field to all languages
            translations = translate_field_to_all_languages(data[field_name], source_lang)

            # Add translated versions to result with _en, _es, _zh suffixes
            result[f'{field_name}_en'] = translations['en']
            result[f'{field_name}_es'] = translations['es']
            result[f'{field_name}_zh'] = translations['zh']

    return result


# Optional: Function to check if LibreTranslate service is available
def check_translation_service() -> bool:
    """
    Checks if the LibreTranslate service is available and responding.

    Returns:
        True if service is available, False otherwise
    """
    try:
        response = requests.get(LIBRETRANSLATE_URL.replace('/translate', '/languages'), timeout=5)
        response.raise_for_status()
        logger.info("Translation service is available")
        return True
    except Exception as e:
        logger.error(f"Translation service is not available: {e}")
        return False


if __name__ == "__main__":
    # Test the translation service
    print("Testing LibreTranslate service...")
    print(f"Service available: {check_translation_service()}")

    # Test single translation
    test_text = "This is a defect description"
    print(f"\nOriginal (EN): {test_text}")
    print(f"Spanish: {translate_text(test_text, 'en', 'es')}")
    print(f"Chinese: {translate_text(test_text, 'en', 'zh')}")

    # Test multi-language translation
    print("\n\nTesting multi-language field translation:")
    translations = translate_field_to_all_languages(test_text, 'en')
    for lang, text in translations.items():
        print(f"{lang.upper()}: {text}")
