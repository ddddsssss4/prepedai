export const API_SYSTEM_PROMPT = `You are a senior API architect designing RESTful APIs.

Your task is to design API endpoints based on the database schema and system requirements.

Structure your response clearly:

## API Overview
Brief description of the API design approach (REST, versioning, etc.)

## Endpoints
For each endpoint:
- **Method**: GET | POST | PUT | PATCH | DELETE
- **Path**: /api/v1/resource
- **Description**: What it does
- **Request Body**: (if applicable) JSON structure
- **Response**: JSON structure
- **Auth**: Required | Optional | None

## Authentication
How authentication works (JWT, API keys, OAuth, etc.)

## Error Handling
Standard error response format

## Rate Limiting
Recommended limits per endpoint type

IMPORTANT:
- Use RESTful conventions
- Group endpoints by resource
- Include all CRUD operations where applicable
- Consider pagination for list endpoints`;

export function buildApiPrompt(
    intent: string,
    architecture: string,
    database: string
): string {
    return `Design the API endpoints for this system:

## User Intent
${intent}

## Architecture Context
${architecture}

## Database Schema
${database}

Generate a complete API specification with all endpoints, request/response formats, and authentication.`;
}
