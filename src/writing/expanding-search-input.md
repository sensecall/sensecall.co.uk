---
layout: post.njk
title: "Building an Accessible, Expanding Search Input Field"
date: 2025-03-21
tags: ["code", "javascript", "css"]
description: "A modern implementation of an expanding search input field that grows as you type, perfect for search forms and message inputs."
status: draft
---

I recently worked with our design team to prototype an interesting solution: how to create a search box that works well for both simple and complex searches. You know, like when you're quickly looking up "weather" versus searching for "best Italian restaurants open late on Sunday in Manchester city centre".

## The Problem

When searching complex datasets, users sometimes need to need to construct long search queries, but most of the time their search queries are short and sweet. After watching how people actually use search, we noticed about 80% of searches are short and sweet (2-5 words), but the remaining 20% can be quite detailed and specific. We needed to create a search input that works well for both.

### Example 1 - a normal text input with a long query
<div class="example">
    <div class="example__header">
        Text input with a long query
    </div>
    <div class="example__content">
        <div class="example-input">
            <input type="text" value="site:gov.uk 'service assessment' AND (accessibility OR 'user needs') -template filetype:pdf before:2024-01-01 after:2023-01-01" class="example-textfield" />
            <button class="example-button">Search</button>
        </div>
    </div>
</div>

#### Problems with this approach:
- Text gets cut off, forcing users to scroll horizontally
- Hard to review complex queries when you can't see the whole thing at once
- No visual indication that content is truncated

### Example 2 - textarea with a short query
<div class="example">
    <div class="example__header">
        Textarea with a short query
    </div>
    <div class="example__content">
        <div class="example-input">
            <textarea class="example-textarea" rows="4">service assessment</textarea>
            <button class="example-button">Search</button>
        </div>
    </div>
</div>

#### Problems with this approach:
- Takes up too much vertical space for short queries
- Fixed height means it's either too big for short queries or too small for long ones

## The Solution

Our solution combines the best of both approaches: an input that starts small but grows naturally with the content. It maintains the familiar single-line appearance for simple searches while smoothly expanding to accommodate longer queries.

### Example 3 - expanding search input
<div class="example">
    <div class="example__header">
        Interactive demo: Expanding search input
    </div>
    <div class="example__content">
        <div class="expanding-search max-w-2xl w-full relative" role="search">
            <label class="block mb-0.5 text-base font-semibold" for="search">Search</label>
            <div class="example-input">
                <textarea 
                    id="search"
                    class="expanding-search__input flex-1 px-2 py-2 font-mono text-sm border-2 border-[#dee2e6] rounded resize-none appearance-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                    placeholder="Type your search query..."
                    rows="1"
                    aria-label="Search"
                ></textarea>
                <button class="example-button">Search</button>
            </div>
            <div class="expanding-search__measure" aria-hidden="true"></div>
        </div>
        <div class="mt-4 text-sm">
            <div class="text-gray-600 mb-2">Try these example queries:</div>
            <div class="flex flex-wrap gap-2">
                <button class="example-query-btn px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded text-sm transition-colors" data-query="weather">weather</button>
                <button class="example-query-btn px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded text-sm transition-colors" data-query="best Italian restaurants open late on Sunday in Manchester city centre">restaurants in Manchester</button>
                <button class="example-query-btn px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded text-sm transition-colors" data-query="site:gov.uk 'service assessment' AND (accessibility OR 'user needs') -template filetype:pdf before:2024-01-01 after:2023-01-01">complex search query</button>
            </div>
        </div>
        <div class="mt-8 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
            <h2 class="mt-0 mb-6 text-lg text-gray-900 dark:text-gray-100">Customise the demo</h2>
            <div class="space-y-4">
                <label class="flex items-center justify-between gap-4">
                    Font size
                    <input type="range" id="fontSize" min="12" max="24" value="16" step="1" class="flex-1 min-w-[150px]">
                    <span class="min-w-[45px] text-right">16px</span>
                </label>
                <label class="flex items-center justify-between gap-4">
                    Input width
                    <input type="range" id="inputWidth" min="200" max="800" value="300" step="10" class="flex-1 min-w-[150px]">
                    <span class="min-w-[45px] text-right">300px</span>
                </label>
                <label class="flex items-center justify-between gap-4">
                    Max rows
                    <input type="range" id="maxRows" min="1" max="20" value="20" step="1" class="flex-1 min-w-[150px]">
                    <span class="min-w-[45px] text-right">20</span>
                </label>
            </div>
        </div>
    </div>
</div>

#### Advantages of this approach:
- Starts small for simple searches but grows naturally with content
- Maintains familiar single-line appearance until needed
- Provides clear visual feedback as content grows
- Fully accessible with keyboard and screen reader support

<style>
    /* Core expanding search functionality */
    .expanding-search__input {
        min-height: 40px;
        overflow-y: hidden;
    }

    .expanding-search__input--scrollable {
        overflow-y: scroll;
    }

    .expanding-search__measure {
        position: absolute;
        top: 0;
        left: 0;
        visibility: hidden;
        width: 100%;
        padding: 8px 12px;
        font-size: 14px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.5;
        border: 2px solid transparent;
        white-space: pre-wrap;
        word-wrap: break-word;
        box-sizing: border-box;
        min-height: 40px;
        pointer-events: none;
        user-select: none;
        -webkit-user-select: none;
        opacity: 0;
        z-index: -1;
    }

    @media (max-width: 480px) {
        .controls label {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
        }

        .controls span {
            text-align: left;
        }

        .controls input[type="range"] {
            width: 100%;
            margin: 0.5rem 0;
        }

        .example-query-btn {
            width: 100%;
            text-align: left;
        }
    }

    .example-input {
        display: flex;
        gap: 0.5rem;
        align-items: stretch;
    }

    .example-textfield,
    .example-textarea,
    .expanding-search__input {
        flex: 1;
        height: 40px;
        padding: 8px 12px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 14px;
        border: 2px solid #dee2e6;
        border-radius: 4px;
        background-color: white;
        color: #1a1a1a;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .dark .example-textfield,
    .dark .example-textarea,
    .dark .expanding-search__input {
        background-color: #1a1a1a;
        color: #e5e5e5;
        border-color: #4a4a4a;
    }

    .example-textfield:focus,
    .example-textarea:focus,
    .expanding-search__input:focus {
        outline: none;
        border-color: #4A90E2;
        box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
    }

    .dark .example-textfield:focus,
    .dark .example-textarea:focus,
    .dark .expanding-search__input:focus {
        border-color: #60a5fa;
        box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
    }

    .example-textfield {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .example-textarea {
        height: 5rem;
        resize: none;
    }

    .example-button {
        padding: 0 1rem;
        height: 40px;
        background: #4A90E2;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        white-space: nowrap;
        font-size: 14px;
        transition: background-color 0.15s ease-in-out;
    }

    .example-button:hover {
        background: #357abd;
    }

    .example-button:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.3);
    }

    .dark .example-button {
        background: #60a5fa;
    }

    .dark .example-button:hover {
        background: #3b82f6;
    }

    .dark .example-button:focus {
        box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
    }
</style>

<script>
    class ExpandingSearch {
        constructor(element) {
            this.container = element;
            this.textarea = element.querySelector('.expanding-search__input');
            this.measureDiv = element.querySelector('.expanding-search__measure');

            // Get computed styles for dynamic measurements
            const styles = window.getComputedStyle(this.textarea);
            this.LINE_HEIGHT = parseFloat(styles.lineHeight);
            this.PADDING = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
            this.MAX_ROWS = 20;

            // Mobile detection
            this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            this.init();
        }

        init() {
            this.textarea.addEventListener('input', () => this.adjustHeight());
            this.textarea.addEventListener('keydown', (e) => this.handleKeydown(e));
            this.textarea.addEventListener('paste', (e) => this.handlePaste(e));
            this.textarea.addEventListener('focus', () => this.handleFocus());
            this.textarea.addEventListener('blur', () => this.handleBlur());
            window.addEventListener('resize', () => this.updateMeasurements());
            window.addEventListener('orientationchange', () => {
                setTimeout(() => this.updateMeasurements(), 100);
            });
            this.adjustHeight();

            // Prevent zoom on mobile when focusing input
            if (this.isMobile) {
                this.textarea.style.fontSize = '16px';
            }

            // Add example query handlers
            this.setupExampleQueries();
        }

        handleFocus() {
            if (this.isMobile) {
                setTimeout(() => {
                    const rect = this.textarea.getBoundingClientRect();
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    window.scrollTo({
                        top: rect.top + scrollTop - 20,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        }

        handleBlur() {
            if (this.isMobile) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }

        updateMeasurements() {
            const styles = window.getComputedStyle(this.textarea);
            this.LINE_HEIGHT = parseFloat(styles.lineHeight);
            this.PADDING = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
            
            this.measureDiv.style.width = this.textarea.clientWidth + 'px';
            
            this.adjustHeight();
        }

        adjustHeight() {
            this.measureDiv.style.width = this.textarea.clientWidth + 'px';
            this.measureDiv.textContent = this.textarea.value + '\n';
            
            const scrollHeight = this.measureDiv.scrollHeight;
            const numberOfLines = Math.ceil((scrollHeight - this.PADDING) / this.LINE_HEIGHT);
            const maxHeight = (this.MAX_ROWS * this.LINE_HEIGHT) + this.PADDING;
            
            this.textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
            this.textarea.classList.toggle('expanding-search__input--scrollable', scrollHeight > maxHeight);
        }

        handleKeydown(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.submitSearch();
            }
        }

        handlePaste(event) {
            event.preventDefault();
            const text = (event.clipboardData || window.clipboardData)
                .getData('text')
                .replace(/\n/g, ' ');
            document.execCommand('insertText', false, text);
        }

        submitSearch() {
            const query = this.textarea.value.trim();
            if (query) {
                console.log('Search submitted:', query);
            }
        }

        setMaxRows(rows) {
            this.MAX_ROWS = rows;
            this.adjustHeight();
        }

        setFontSize(size) {
            this.textarea.style.fontSize = `${size}px`;
            this.measureDiv.style.fontSize = `${size}px`;
            this.updateMeasurements();
        }

        setWidth(width) {
            this.container.style.width = `${width}px`;
            this.measureDiv.style.width = this.textarea.clientWidth + 'px';
            this.updateMeasurements();
        }

        setupExampleQueries() {
            const buttons = document.querySelectorAll('.example-query-btn');
            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    const query = button.dataset.query;
                    this.textarea.value = query;
                    this.adjustHeight();
                    this.textarea.focus();
                    this.submitSearch();
                });
            });
        }
    }

    // Demo controls class
    class SearchDemo {
        constructor(searchComponent) {
            this.search = searchComponent;
            this.setupControls();
            this.loadSettings();
            
            window.addEventListener('orientationchange', () => {
                setTimeout(() => this.handleOrientationChange(), 100);
            });
        }

        handleOrientationChange() {
            this.search.updateMeasurements();
            this.updateControlsLayout();
        }

        updateControlsLayout() {
            const isMobile = window.innerWidth <= 480;
            const controls = document.querySelector('.controls');
            
            if (isMobile) {
                controls.style.width = 'calc(100% - 20px)';
            } else {
                controls.style.width = '';
            }
        }

        loadSettings() {
            const settings = JSON.parse(localStorage.getItem('searchBoxSettings') || '{}');
            
            const fontSize = settings.fontSize || 16;
            const width = settings.width || 300;
            const maxRows = settings.maxRows || 20;

            document.getElementById('fontSize').value = fontSize;
            document.getElementById('fontSize').nextElementSibling.textContent = `${fontSize}px`;
            document.getElementById('inputWidth').value = width;
            document.getElementById('inputWidth').nextElementSibling.textContent = `${width}px`;
            document.getElementById('maxRows').value = maxRows;
            document.getElementById('maxRows').nextElementSibling.textContent = maxRows;

            this.search.setFontSize(fontSize);
            this.search.setWidth(width);
            this.search.setMaxRows(maxRows);
        }

        saveSettings() {
            const settings = {
                fontSize: parseInt(document.getElementById('fontSize').value),
                width: parseInt(document.getElementById('inputWidth').value),
                maxRows: parseInt(document.getElementById('maxRows').value)
            };
            localStorage.setItem('searchBoxSettings', JSON.stringify(settings));
        }

        setupControls() {
            const controls = {
                fontSize: document.getElementById('fontSize'),
                inputWidth: document.getElementById('inputWidth'),
                maxRows: document.getElementById('maxRows')
            };

            Object.entries(controls).forEach(([key, input]) => {
                input.addEventListener('input', () => {
                    const value = input.value;
                    const unit = key === 'maxRows' ? '' : 'px';
                    input.nextElementSibling.textContent = `${value}${unit}`;
                    
                    switch(key) {
                        case 'fontSize':
                            this.search.setFontSize(value);
                            break;
                        case 'inputWidth':
                            this.search.setWidth(value);
                            break;
                        case 'maxRows':
                            this.search.setMaxRows(parseInt(value, 10));
                            break;
                    }
                    this.saveSettings();
                });
            });
        }
    }

    // Initialize
    const searchComponent = new ExpandingSearch(document.querySelector('.expanding-search'));
    new SearchDemo(searchComponent);
</script>

## The Technical Bits

We're combining a few different techniques to make this work:

Instead of a standard `<input type="text">`, we use a `<textarea>` element, which allows us to use the `resize` property to make it behave like a single-line input.

```html
<div class="expanding-search" role="search">
    <textarea 
        class="expanding-search__input" 
        rows="1"
        aria-label="Search"
    ></textarea>
</div>
```

Some CSS to make the textarea behave like a single-line input:
```css
.expanding-search__input {
    resize: none; // stops users from manually resizing the textarea
    overflow-y: hidden; // hides the scrollbar until we need it
    min-height: 40px; // ensures it starts at single-line height
}
```

We use a hidden `<div>` element to calculate the perfect size of the textarea:
```html
<div class="expanding-search__measure" aria-hidden="true"></div>
```

This invisible div mirrors the textarea's content, letting us measure how tall the content should be without any visual glitches. When combined with smooth transitions, it creates that satisfying expanding effect you see in the demo.

Then we use some JavaScript to change the number of rows in the textarea to match the size of the hidden div:
```javascript
// ...
```

## The Prototype

Using vanilla JavaScript (no frameworks needed), I knocked together an interactive prototype to test the concept. The prototype helped us:
- Validate the interaction design with real users
- Test keyboard navigation and screen reader compatibility
- Fine-tune the expansion behaviour
- Ensure it worked well across different devices and screen sizes

The demo above shows the core concept - you can adjust things like rows, maximum width, and other aspects to suit your specific needs. I'll be adding more examples showing different ways to implement this pattern soon.

Stay tuned for more updates. In the meantime, you can follow me on [LinkedIn](https://www.linkedin.com/in/sensecall/) for the latest. 
