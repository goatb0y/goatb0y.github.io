# 🛸 U.S.S. SIDDHARTH // PUBLISHING GUIDE

This project uses a filesystem-based Markdown workflow. To add content, simply add files to the folders and push to GitHub.

## 🚀 How to Add New Posts

1.  **Navigate to the content folder**: Choose the appropriate category (e.g., `content/Design Projects/Interfaces`).
2.  **Create a new file**: Name it something like `my-new-project.md`.
3.  **Add Frontmatter**: Every file *must* start with this block:
    ```markdown
    ---
    id: unique-id-123
    title: My Project Title
    date: 2026-02-25
    summary: A short blurb for the search index.
    ---
    ```
4.  **Write your content**: Use standard Markdown below the second `---`.

## 📂 Structure & Organization
*   **Collections**: The first folder level (e.g., `Design`) becomes the main header in the sidebar.
*   **Sub-Collections**: The second folder level (e.g., `Humanist Funerals in Sweden`) becomes the indented category header.
*   **Images**: Organise images into subfolders within `assets/images/posts/` named after the post's slug or ID.
    *   **Folder**: `assets/images/posts/[post-id-or-slug]/`
    *   **Linking**: Use **absolute paths** (starting with `/`) in Markdown:
        `![Alt Text](/assets/images/posts/my-post-id/image.jpg)`
    *   **Benefit**: This prevents file name conflicts and keeps the assets directory clean.

## ✍️ Formatting Tips

### 📊 Mermaid.js Diagrams
Create live flowcharts by using `mermaid` code blocks:
~~~markdown
```mermaid
graph LR;
    A[Concept] --> B[Design];
    B --> C[Implementation];
```
~~~

### ✨ Typography
*   Use `### Header` for section titles within articles (matches the LCARS dashboard style).
*   Use **bold** for emphasis on techno-optimist keywords.

### 🖼️ Advanced Images
You can now define parameters for images like size, layout, and zoomability directly in Markdown:

```markdown
![Alt Text](/path/to/image.jpg){size=medium layout=right zoomable}
```

*   **Parameters**:
    *   `size`: `small`, `medium`, `large`, `full`
    *   `layout`: `left`, `right`, `center`
    *   `zoomable`: Include this to enable the click-to-zoom lightbox effect.
*   **Examples**:
    *   `{size=small layout=left}` - Small image floating on the left.
    *   `{size=full zoomable}` - Full-width zoomable image.

## 🛠️ Deployment Logic
*   **Locally**: Run `python build.py` to refresh the site immediately while you are editing.
*   **Live**: Just `git push`. A GitHub Action will automatically run the build script and update your dashboard live on the web!
