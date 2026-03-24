# Text Splitter Visualizer

An interactive tool to analyze and compare text chunking strategies used in retrieval-based systems such as RAG (Retrieval-Augmented Generation).

---

## Overview

This project provides a visual interface for understanding how different text splitting techniques segment input data. It supports multiple strategies and exposes key metrics to evaluate chunk quality and distribution.

---

## Features

- **Splitting Strategies**
  - Character-based
  - Token-based (word-level)
  - Sentence-based
  - Recursive splitting

- **Language Support**
  - Python, JavaScript, C++, Markdown, HTML, LaTeX

- **Visualization**
  - Chunk-wise color separation
  - Overlap highlighting
  - Metadata on hover

- **Metrics**
  - Total characters
  - Number of chunks
  - Average / min / max chunk size
  - Standard deviation
  - Token count (where applicable)

- **Input Options**
  - Direct text input
  - File upload support for common text/code formats

---

## Usage

1. Provide input text or upload a file  
2. Select a splitting strategy  
3. Configure:
   - Chunk size  
   - Overlap  
4. View generated chunks and metrics in real time  

---

## Project Structure

```
├── index.html
├── css/
├── js/
│   ├── app/
│   ├── splitters/
│   ├── utils/
│   ├── components/
│   └── constants/
├── assets/
└── README.md
```

---

## Architecture

- **Modular design**: Each splitter is implemented as an independent class  
- **Extensible system**: New splitters can be added with minimal changes  
- **Centralized state management**: Ensures consistent UI updates  
- **Separation of concerns**: Clear distinction between logic, UI, and utilities  

---

## Running Locally

**Option 1:** Open `index.html` directly  

**Option 2 (recommended):**
```bash
python -m http.server 8000
# or
npx http-server
```

---

## Deployment

This is a static frontend project and can be deployed on:

- GitHub Pages  
- Netlify  
- Vercel  

No build step required.

---

## Extending the Project

To add a new splitter:
1. Create a class extending the base splitter  
2. Implement the `split()` method  
3. Register it in the application  

---

## License

MIT License  
