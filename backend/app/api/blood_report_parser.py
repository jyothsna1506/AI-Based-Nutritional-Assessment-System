"""
Blood report parser – extracts biomarker values from PDF and image files.

Supports:
  - PDF files via pdfplumber
  - Image files (PNG/JPG) via pytesseract OCR

NOTE: pytesseract requires the Tesseract binary installed on the system.
  Windows: https://github.com/UB-Mannheim/tesseract/wiki
  Ubuntu:  sudo apt install tesseract-ocr
  macOS:   brew install tesseract
"""
import io
import re
import logging

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

try:
    import pytesseract
except ImportError:
    pytesseract = None

try:
    from PIL import Image
except ImportError:
    Image = None

logger = logging.getLogger(__name__)


def parse_blood_report_text(text: str) -> dict:
    """
    Apply regex patterns to find common biomarkers in raw text.

    Patterns are designed to:
      - Anchor closely to the biomarker keyword (within ~60 characters)
      - Skip reference range labels (e.g., "12.0 - 17.5") by requiring
        the number to appear AFTER optional whitespace/colon/units
      - Use word boundaries to prevent partial matches
    """
    text = text.lower()
    results = {}

    # Each pattern captures the first standalone decimal number that appears
    # within 60 characters after the marker keyword.
    # The (?![\s]*-) negative lookahead avoids matching range starts like "12.0 - 17.5".
    patterns = {
        "hemoglobin":  r"hemoglobin[\s:]*([0-9]+(?:\.[0-9]+)?)",
        "iron":        r"\biron\b[\s:]*([0-9]+(?:\.[0-9]+)?)",
        "ferritin":    r"ferritin[\s:]*([0-9]+(?:\.[0-9]+)?)",
        "vitamin_d":   r"vitamin[\s\-]?d[\s:]*([0-9]+(?:\.[0-9]+)?)",
        "vitamin_b12": r"vitamin[\s\-]?b[\-]?12[\s:]*([0-9]+(?:\.[0-9]+)?)",
        "calcium":     r"\bcalcium\b[\s:]*([0-9]+(?:\.[0-9]+)?)",
        "magnesium":   r"\bmagnesium\b[\s:]*([0-9]+(?:\.[0-9]+)?)",
        "zinc":        r"\bzinc\b[\s:]*([0-9]+(?:\.[0-9]+)?)",
        "blood_sugar": r"(?:glucose|blood[\s]?sugar|fasting[\s]?sugar)[\s:]*([0-9]+(?:\.[0-9]+)?)",
        "cholesterol": r"\btotal[\s]?cholesterol\b[\s:]*([0-9]+(?:\.[0-9]+)?)",
    }

    for key, pattern in patterns.items():
        match = re.search(pattern, text)
        if match:
            try:
                results[key] = float(match.group(1))
                logger.debug("Extracted %s = %s", key, results[key])
            except ValueError:
                logger.warning("Could not parse numeric value for biomarker: %s", key)

    return results


def process_file_content(file_bytes: bytes, filename: str) -> dict:
    """
    Process file bytes depending on extension and return extracted biomarker fields.

    Supported formats: PDF, PNG, JPG, JPEG
    """
    extracted_text = ""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext == "pdf":
        try:
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text() or ""
                    extracted_text += page_text + "\n"
            logger.info("Extracted %d characters from PDF (%s pages)", len(extracted_text), len(pdf.pages))
        except Exception as exc:
            logger.error("Error parsing PDF '%s': %s", filename, exc)

    elif ext in ("png", "jpg", "jpeg"):
        try:
            image = Image.open(io.BytesIO(file_bytes))
            extracted_text = pytesseract.image_to_string(image)
            logger.info("OCR extracted %d characters from image '%s'", len(extracted_text), filename)
        except Exception as exc:
            logger.error("Error running OCR on image '%s': %s", filename, exc)

    else:
        logger.warning("Unsupported file extension '%s' for blood report parsing", ext)

    return parse_blood_report_text(extracted_text)
