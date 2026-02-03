export const DATABASE_SYSTEM_PROMPT = `You are a senior database architect designing schemas for production systems.

Your task is to design a complete database schema. Format your response in well-structured MARKDOWN.

## Overview
Brief description of the database design approach and why it fits this use case.

## Entity Relationship Diagram
Provide a Mermaid ER diagram:
\`\`\`mermaid
erDiagram
    USER {
        uuid id PK
        string email UK
        string password_hash
        timestamp created_at
    }
    POST {
        uuid id PK
        uuid user_id FK
        string title
        text content
    }
    USER ||--o{ POST : creates
\`\`\`

## Tables

For each table:

### TableName
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| email | VARCHAR(255) | UK, NOT NULL | User email |

**Indexes**: List recommended indexes
**Relationships**: Describe foreign key relationships

## Design Decisions
Explain why this structure was chosen and any trade-offs considered.

MANDATORY MERMAID ERDIAGRAM RULES:
1. Each attribute can have ONLY ONE qualifier: PK, FK, or UK (not multiple)
2. DO NOT use SQL syntax like PRIMARY KEY(...) or FOREIGN KEY(...) inside mermaid
3. Keep field names simple (no spaces or special characters)
4. Use proper cardinality symbols: ||--o{, }o--||, ||--||, }o--o{

CRITICAL FOR JUNCTION/BRIDGE TABLES:
For many-to-many junction tables, use ONLY FK qualifiers (not PK FK together):
\`\`\`
// CORRECT - Junction table with FK only:
POST_TAG {
    uuid post_id FK
    uuid tag_id FK
}

// WRONG - This will cause parse errors:
POST_TAG {
    uuid post_id PK FK    <-- INVALID: cannot have PK and FK together
    uuid tag_id PK FK     <-- INVALID: cannot have PK and FK together
}
\`\`\`

The composite primary key is documented in the Tables section, not in the erDiagram.`;

export function buildDatabasePrompt(
    intent: string,
    architecture: string
): string {
    return `Design the database schema for this system:

## User Intent
${intent}

## Architecture Context
${architecture}

Generate a complete database schema with all tables, relationships, and an ERD diagram.
Format your response as well-structured Markdown with a Mermaid erDiagram.`;
}
