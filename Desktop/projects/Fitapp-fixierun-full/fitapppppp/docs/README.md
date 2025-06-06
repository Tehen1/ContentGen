# FIXIE App Documentation

**Dernière mise à jour : 2025-05-02**

This directory contains comprehensive documentation for the FIXIE fitness application with blockchain rewards. These documents should be the first place to look when onboarding new developers or understanding the system architecture.

## Documentation Index

1. [Architecture Overview](architecture.md) - High-level system architecture and technical choices
2. [API Specifications](api-specs.md) - Detailed API documentation for all microservices
3. [Microservices](microservices.md) - Information about each microservice and their responsibilities
4. [Blockchain Integration](blockchain-integration.md) - Details about the blockchain integration and token system

## Best Practices for Documentation

When updating these documents or adding new ones, please follow these guidelines:

1. **Keep documentation up-to-date** - Whenever you make significant changes to the codebase, update the relevant documentation.
2. **Use Markdown formatting** - All documentation should be written in Markdown format for consistency.
3. **Include code examples** - When describing APIs or functionality, include relevant code examples.
4. **Add diagrams when helpful** - Use diagrams to explain complex workflows or architecture (recommend using Mermaid or PlantUML).
5. **Cross-reference** - Link to other relevant documents when appropriate.
6. **Version documentation** - When making major changes, note the version of the system the documentation applies to.

## Generated Documentation

API documentation is automatically generated from code comments and OpenAPI specifications. To update the generated documentation:

```bash
# From the project root
npm run generate-docs
```

This will update the API documentation in the `api-specs.md` file.

## Development Process Documentation

For information about our development process, including:
- Git workflow
- Code review process
- Release procedures
- Testing standards

Please refer to the [Development Process](development-process.md) document (to be created).
