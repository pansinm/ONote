---
name: onote
description: Modify ONote notes via WebDAV protocol using read-before-write pattern. Use when user wants to edit, update, or modify notes through WebDAV. Triggers on requests like "update my note via webdav", "modify note X using webdav", "change content in my notes through webdav".
---

# ONote WebDAV Note Modification Skill

## Overview

This skill guides safe modification of ONote notes using the WebDAV protocol (HTTP). All operations use standard WebDAV methods (GET/PUT) with HTTP Basic Authentication.

**Core Principle**: ALWAYS read file content via WebDAV GET before making modifications to prevent data loss.

## WebDAV Protocol Basics

ONote runs a WebDAV server that exposes notes via HTTP:
- **Default URL**: `http://localhost:21221/`
- **Authentication**: HTTP Basic Auth (username/password)
- **Methods**: GET (read), PUT (write), PROPFIND (list)

## Required Information

Before modifying notes, you need:
1. **WebDAV server URL** (default: `http://localhost:21221/`)
2. **Username** (configured in ONote settings)
3. **Password** (configured in ONote settings)
4. **File path** (relative to WebDAV root)

## Mandatory Workflow

### Step 1: READ via WebDAV GET
Always read current content first using curl:
```bash
curl -u username:password \
  http://localhost:21221/path/to/note.md
```

### Step 2: ANALYZE
- Parse the content
- Identify what needs to be modified
- Prepare the new content

### Step 3: WRITE via WebDAV PUT
Write modified content back:
```bash
curl -u username:password \
  -X PUT \
  -T /path/to/modified/file.md \
  http://localhost:21221/path/to/note.md
```

Or with inline data:
```bash
curl -u username:password \
  -X PUT \
  -d "modified content here" \
  http://localhost:21221/path/to/note.md
```

## Common Operations

### Read File
```bash
curl -u user:pass http://localhost:21221/notes/daily.md
```

### Write File
```bash
# From file
curl -u user:pass -X PUT -T modified.md \
  http://localhost:21221/notes/daily.md

# Inline content
curl -u user:pass -X PUT \
  -d "New content" \
  http://localhost:21221/notes/daily.md
```

### List Directory
```bash
curl -u user:pass -X PROPFIND \
  http://localhost:21221/notes/
```

## Modification Patterns

### Pattern 1: Text Replacement
1. GET file content
2. Use sed/awk/text processing to replace text
3. PUT modified content back

```bash
# Read
content=$(curl -u user:pass http://localhost:21221/note.md)

# Modify
modified=$(echo "$content" | sed 's/old/new/g')

# Write
echo "$modified" | curl -u user:pass -X PUT \
  --data-binary @- \
  http://localhost:21221/note.md
```

### Pattern 2: Append Content
1. GET current content
2. Append new content
3. PUT combined content

```bash
content=$(curl -u user:pass http://localhost:21221/note.md)
new_content="$content\n\n## New Section\nContent here"
echo -e "$new_content" | curl -u user:pass -X PUT \
  --data-binary @- \
  http://localhost:21221/note.md
```

### Pattern 3: Prepend Content
1. GET current content
2. Prepend new content (e.g., frontmatter)
3. PUT combined content

```bash
content=$(curl -u user:pass http://localhost:21221/note.md)
new_content="---\ntitle: My Note\n---\n\n$content"
echo -e "$new_content" | curl -u user:pass -X PUT \
  --data-binary @- \
  http://localhost:21221/note.md
```

## Error Handling

### Authentication Failed (401)
```
HTTP/1.1 401 Unauthorized
→ Check username/password
→ Verify user exists in ONote WebDAV settings
```

### File Not Found (404)
```
HTTP/1.1 404 Not Found
→ Verify file path
→ Use PROPFIND to list directory
```

### Connection Refused
```
curl: (7) Failed to connect
→ Check if ONote WebDAV server is running
→ Verify server URL and port
```

## Examples

### Example 1: Replace Text
**User**: "Replace 'hello' with 'world' in my daily note via webdav"

```bash
# Read
content=$(curl -s -u user:pass \
  http://localhost:21221/daily.md)

# Replace
modified=$(echo "$content" | sed 's/hello/world/g')

# Write
echo "$modified" | curl -s -u user:pass -X PUT \
  --data-binary @- \
  http://localhost:21221/daily.md
```

### Example 2: Add Frontmatter
**User**: "Add tags to my project note using webdav"

```bash
# Read
content=$(curl -s -u user:pass \
  http://localhost:21221/project.md)

# Prepend frontmatter
new_content="---
tags: [project, active]
---

$content"

# Write
echo "$new_content" | curl -s -u user:pass -X PUT \
  --data-binary @- \
  http://localhost:21221/project.md
```

### Example 3: Append Section
**User**: "Add a 'Next Steps' section at the end via webdav"

```bash
# Read
content=$(curl -s -u user:pass \
  http://localhost:21221/meeting.md)

# Append
new_content="$content

## Next Steps

- [ ] Follow up with team"

# Write
echo "$new_content" | curl -s -u user:pass -X PUT \
  --data-binary @- \
  http://localhost:21221/meeting.md
```

## Best Practices

1. **Always read before write** - Prevent data loss
2. **Use --data-binary @-** - Preserve exact content including newlines
3. **Add -s flag** - Silent mode for cleaner output
4. **Store credentials securely** - Don't hardcode passwords
5. **Verify server is running** - Check ONote WebDAV server status first
6. **Use proper encoding** - Handle special characters correctly

## Security Notes

- WebDAV credentials are stored in `~/.onote-setting.json`
- Use HTTPS in production (not HTTP)
- Don't expose credentials in logs or output

