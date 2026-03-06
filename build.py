import os
import json

CONTENT_DIR = 'content'
OUTPUT_FILE = 'assets/js/data.js'

def parse_markdown_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        file_content = f.read()
    
    frontmatter = {}
    content = ""
    
    if file_content.startswith('---'):
        parts = file_content.split('---', 2)
        if len(parts) >= 3:
            fm_text = parts[1]
            content = parts[2]
            
            for line in fm_text.split('\n'):
                if ':' in line:
                    key, val = line.split(':', 1)
                    # Strip whitespace and any quotes
                    frontmatter[key.strip().lower()] = val.strip().strip('"').strip("'")
        else:
            content = file_content
    else:
        content = file_content
        
    return frontmatter, content.strip()

def build_data():
    blog_data = []
    
    if not os.path.exists(CONTENT_DIR):
        print(f"Directory '{CONTENT_DIR}' not found.")
        return
    
    # Walk through the CONTENT_DIR and find all .md files
    for root, dirs, files in os.walk(CONTENT_DIR):
        for filename in files:
            if not filename.endswith('.md'): continue
                
            filepath = os.path.join(root, filename)
            rel_path = os.path.relpath(filepath, CONTENT_DIR)
            path_parts = rel_path.split(os.sep)
            
            # Extract collection and sub-collection
            # Expected: content/Collection/SubCollection/file.md
            # Or: content/Collection/file.md
            
            collection = "Misc"
            sub_collection = "General"
            
            if len(path_parts) >= 3:
                collection = path_parts[0]
                sub_collection = path_parts[1]
            elif len(path_parts) == 2:
                collection = path_parts[0]
                sub_collection = "General"
            elif len(path_parts) == 1:
                # Top level file in content folder
                collection = "General"
                sub_collection = "Posts"
                
            frontmatter, content = parse_markdown_file(filepath)
            
            # Fetch frontmatter values or defaults
            title = frontmatter.get('title', filename.replace('.md', ''))
            date = frontmatter.get('date', 'Unknown Date')
            summary = frontmatter.get('summary', '')
            
            # Priority: slug > id > generated from path
            post_id = frontmatter.get('slug')
            if not post_id:
                post_id = frontmatter.get('id', rel_path.replace(os.sep, '-').replace(' ', '-').lower()[:-3])
            
            # Ensure post_id doesn't have leading/trailing slashes if used for hash
            post_id = post_id.strip('/')
            
            post = {
                'id': post_id,
                'title': title,
                'date': date,
                'collection': collection,
                'subCollection': sub_collection,
                'summary': summary,
                'content': content
            }
            blog_data.append(post)
                
    # Sort posts by date descending
    blog_data.sort(key=lambda x: x['date'], reverse=True)
    
    # Save to data.js
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json_data = json.dumps(blog_data, indent=4)
        f.write(f"const blogData = {json_data};\n")
    print(f"Successfully built {OUTPUT_FILE} with {len(blog_data)} posts from {CONTENT_DIR}.")

if __name__ == '__main__':
    build_data()
