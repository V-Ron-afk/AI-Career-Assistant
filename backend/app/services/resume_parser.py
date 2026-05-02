"""
Resume parsing service.
Extracts raw text from PDF and DOCX files for AI processing.
"""

import io
import os
from pathlib import Path

import pdfplumber
import docx2txt


class ResumeParserService:
    """Handles text extraction from resume files."""

    SUPPORTED_TYPES = {
        "application/pdf": "_parse_pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "_parse_docx",
        "application/msword": "_parse_docx",
    }

    def parse(self, file_content: bytes, content_type: str) -> str:
        """Parse resume file and return extracted text."""
        parser_method = self.SUPPORTED_TYPES.get(content_type)
        if not parser_method:
            raise ValueError(f"Unsupported file type: {content_type}. Use PDF or DOCX.")

        parser = getattr(self, parser_method)
        text = parser(file_content)

        if not text or len(text.strip()) < 50:
            raise ValueError("Could not extract meaningful text from the resume. Ensure it is not image-based.")

        return self._clean_text(text)

    def _parse_pdf(self, content: bytes) -> str:
        """Extract text from PDF using pdfplumber."""
        text_parts = []
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        return "\n".join(text_parts)

    def _parse_docx(self, content: bytes) -> str:
        """Extract text from DOCX using docx2txt."""
        # docx2txt requires a file path; write to temp
        import tempfile
        with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        try:
            text = docx2txt.process(tmp_path)
        finally:
            os.unlink(tmp_path)

        return text or ""

    def _clean_text(self, text: str) -> str:
        """Normalize whitespace while preserving structure."""
        lines = text.split("\n")
        cleaned = []
        for line in lines:
            stripped = line.strip()
            if stripped:
                cleaned.append(stripped)
        return "\n".join(cleaned)


resume_parser = ResumeParserService()
