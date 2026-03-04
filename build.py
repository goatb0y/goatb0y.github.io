import os
import json

CONTENT_DIR = 'content'
OUTPUT_FILE = 'assets/js/data.js'

def parse_markdown_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    frontmatter = {}
    content = []
    
    in_frontmatter = False
    
    if lines and lines[0].strip() == '---':
        in_frontmatter = True
        for i in range(1, len(lines)):
            line = lines[i]
            if line.strip() == '---':
                content = lines[i+1:]
                break
            else:
                if ':' in line:
                    key, val = line.split(':', 1)
                    frontmatter[key.strip().lower()] = val.strip()
    else:
        content = lines
        
    return frontmatter, "".join(content)

def build_data():
    blog_data = []
    
    if not os.path.exists(CONTENT_DIR):
        print(f"Directory '{CONTENT_DIR}' not found.")
        return
        
    for collection in os.listdir(CONTENT_DIR):
        collection_path = os.path.join(CONTENT_DIR, collection)
        if not os.path.isdir(collection_path): continue
            
        for sub_collection in os.listdir(collection_path):
            sub_collection_path = os.path.join(collection_path, sub_collection)
            if not os.path.isdir(sub_collection_path): continue
                
            for filename in os.listdir(sub_collection_path):
                if not filename.endswith('.md'): continue
                    
                filepath = os.path.join(sub_collection_path, filename)
                frontmatter, content = parse_markdown_file(filepath)
                
                # Fetch frontmatter values or defaults
                title = frontmatter.get('title', filename.replace('.md', ''))
                date = frontmatter.get('date', 'Unknown Date')
                summary = frontmatter.get('summary', '')
                
                # Priority: slug > id > generated from path
                post_id = frontmatter.get('slug')
                if not post_id:
                    post_id = frontmatter.get('id', f"{collection}-{sub_collection}-{filename}".replace(' ', '-').lower()[:-3])
                
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
