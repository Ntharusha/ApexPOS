import os

src_dir = '/home/ghost69/projects/Projects/Apex Pos/ApexPOS/client/src'

# We will define a replacement map
# We want to replace 'http://localhost:5000/api' and 'http://localhost:5000'
# with dynamic variables that fallback to localhost:5000 if not in production.

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            filepath = os.path.join(root, file)
            # Skip api/axios.ts to avoid self-reference loops
            if 'axios.ts' in filepath:
                continue
                
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            modified = False
            
            # Check if file contains localhost:5000
            if 'http://localhost:5000' in content:
                print(f"Modifying API URLs in: {file}")
                
                # Check if we need to define API_BASE / API_URL at the top of the file
                # We can just define the constants at the top of the file (after imports) or inside the file
                # But a cleaner way: replace the inline strings with a global helper or variable.
                # To keep it extremely simple and avoid import statements, we can replace:
                # 'http://localhost:5000/api' -> (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
                # 'http://localhost:5000' -> (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000')
                # `http://localhost:5000/api` -> `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}`
                # `http://localhost:5000` -> `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}`
                
                # Let's perform these replacements carefully
                
                # 1. Template literals with /api
                if '`http://localhost:5000/api' in content:
                    content = content.replace(
                        '`http://localhost:5000/api',
                        '`${import.meta.env.VITE_API_URL || \'http://localhost:5000/api\'}'
                    )
                    modified = True
                
                # 2. Template literals without /api
                if '`http://localhost:5000' in content:
                    content = content.replace(
                        '`http://localhost:5000',
                        '`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(\'/api\', \'\') : \'http://localhost:5000\'}'
                    )
                    modified = True

                # 3. Double-quoted strings with /api
                if '"http://localhost:5000/api' in content:
                    content = content.replace(
                        '"http://localhost:5000/api',
                        '(import.meta.env.VITE_API_URL || "http://localhost:5000/api") + "'
                    )
                    # wait, this works if it is "http://localhost:5000/api/..." -> (import.meta.env.VITE_API_URL || "http://localhost:5000/api") + "/..."
                    # Let's be careful with quotes.
                    # A better way is to define VITE_API_URL fallback as a local const at the top of the file!
                    # For example, we find the last import statement, and insert:
                    # const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                    # const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
                    # Then we replace 'http://localhost:5000/api' with API_BASE
                    # and 'http://localhost:5000' with API_URL.
                    pass

                # Let's use simple string replacement for common patterns in this codebase:
                # Pattern A: 'http://localhost:5000/api'
                content = content.replace("'http://localhost:5000/api'", "(import.meta.env.VITE_API_URL || 'http://localhost:5000/api')")
                # Pattern B: `http://localhost:5000/api`
                content = content.replace("`http://localhost:5000/api", "`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}")
                # Pattern C: 'http://localhost:5000'
                content = content.replace("'http://localhost:5000'", "(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000')")
                # Pattern D: `http://localhost:5000`
                content = content.replace("`http://localhost:5000", "`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}")
                
                modified = True

            if modified:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)

print("Replacement complete!")
