import fitz  # PyMuPDF for PDF
import docx  # python-docx for DOCX

def read_pdf(file_bytes):
    """Extract text from PDF bytes"""
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return None

def read_docx(file_bytes):
    """Extract text from DOCX bytes"""
    try:
        import io
        doc = docx.Document(io.BytesIO(file_bytes))
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error reading DOCX: {e}")
        return None

def extract_text_from_file(file_bytes, filename):
    """
    Extract text from uploaded file
    Supports PDF and DOCX
    """
    filename_lower = filename.lower()
    
    if filename_lower.endswith('.pdf'):
        text = read_pdf(file_bytes)
        return text
    elif filename_lower.endswith('.docx'):
        text = read_docx(file_bytes)
        return text
    else:
        return None