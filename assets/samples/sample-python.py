"""
Text Splitter Module
Implements various text splitting strategies for RAG applications
"""

from typing import List, Dict
import re


class TextChunk:
    """Represents a single chunk of text with metadata"""
    
    def __init__(self, text: str, start: int, end: int, index: int):
        self.text = text
        self.start = start
        self.end = end
        self.index = index
        self.metadata = {}
    
    def __repr__(self):
        return f"Chunk({self.index}, {len(self.text)} chars)"


class CharacterSplitter:
    """Splits text into fixed-size character chunks"""
    
    def __init__(self, chunk_size: int = 500, overlap: int = 50):
        self.chunk_size = chunk_size
        self.overlap = overlap
    
    def split(self, text: str) -> List[TextChunk]:
        """Split text into chunks with overlap"""
        chunks = []
        start = 0
        index = 0
        
        while start < len(text):
            end = min(start + self.chunk_size, len(text))
            chunk_text = text[start:end]
            
            chunk = TextChunk(chunk_text, start, end, index)
            chunks.append(chunk)
            
            start += self.chunk_size - self.overlap
            index += 1
        
        return chunks


class SentenceSplitter:
    """Splits text at sentence boundaries"""
    
    def __init__(self, chunk_size: int = 500):
        self.chunk_size = chunk_size
        # Simple sentence regex
        self.sentence_pattern = re.compile(r'[^.!?]+[.!?]+')
    
    def split(self, text: str) -> List[TextChunk]:
        """Split text into sentence-based chunks"""
        sentences = self.sentence_pattern.findall(text)
        chunks = []
        
        current_chunk = ""
        start = 0
        index = 0
        
        for sentence in sentences:
            if len(current_chunk) + len(sentence) > self.chunk_size and current_chunk:
                chunk = TextChunk(current_chunk, start, start + len(current_chunk), index)
                chunks.append(chunk)
                
                start += len(current_chunk)
                current_chunk = sentence
                index += 1
            else:
                current_chunk += sentence
        
        # Add final chunk
        if current_chunk:
            chunk = TextChunk(current_chunk, start, start + len(current_chunk), index)
            chunks.append(chunk)
        
        return chunks


def main():
    """Example usage"""
    text = "This is a sample text. It has multiple sentences. Each sentence should be preserved."
    
    # Character splitting
    char_splitter = CharacterSplitter(chunk_size=30, overlap=5)
    char_chunks = char_splitter.split(text)
    
    print(f"Character chunks: {len(char_chunks)}")
    for chunk in char_chunks:
        print(f"  {chunk}")
    
    # Sentence splitting
    sent_splitter = SentenceSplitter(chunk_size=50)
    sent_chunks = sent_splitter.split(text)
    
    print(f"\nSentence chunks: {len(sent_chunks)}")
    for chunk in sent_chunks:
        print(f"  {chunk}")


if __name__ == "__main__":
    main()