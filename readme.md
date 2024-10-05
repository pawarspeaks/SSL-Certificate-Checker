# SSL Certificate Checker

This project is an SSL Certificate Checker application with a Rust backend and a Next.js frontend. It allows users to check the SSL certificate status of a given domain and provides analytics on the checks performed.

## Technology Choices

### Backend: Rust

Rust was chosen for the backend due to its:

1. **Performance**: Rust offers near-C performance, which is crucial for handling multiple SSL certificate checks efficiently.
2. **Safety**: Rust's ownership model and strict compiler checks prevent common programming errors like null or dangling pointer references, ensuring a more robust and secure backend.
3. **Concurrency**: Rust's built-in support for safe concurrency allows for efficient handling of multiple simultaneous requests.
4. **Strong typing**: Rust's strong type system helps catch errors at compile-time, reducing runtime errors and improving overall reliability.

### Frontend: Next.js

Next.js was selected for the frontend because of its:

1. **React-based**: Next.js is built on top of React, providing a familiar and powerful framework for building user interfaces.
2. **Server-Side Rendering (SSR)**: Next.js offers easy-to-implement SSR, improving initial page load times and SEO.
3. **API Routes**: Next.js allows for easy creation of API routes, which can be useful for any client-side API calls.
4. **TypeScript Support**: Next.js has excellent TypeScript support, enabling better type checking and developer experience.
5. **Performance Optimization**: Next.js includes various built-in performance optimizations, such as automatic code splitting and prefetching.

## Assumptions and Design Decisions

1. **Domain Validation**: The application assumes that users will input domain names in various formats (with or without 'https://', 'www', etc.). The frontend includes logic to clean and validate these inputs.
2. **Error Handling**: Comprehensive error handling is implemented on both frontend and backend to provide user-friendly messages for various scenarios.
3. **Analytics**: The application stores and displays basic analytics about the SSL checks performed. This data is assumed to be non-sensitive and stored in-memory for simplicity.
4. **UI Design**: A clean, responsive design was chosen to ensure good user experience across different devices.

## Known Limitations and Areas for Improvement

1. **Scalability**: The current in-memory storage for analytics is not suitable for a production environment with high traffic. A proper database solution should be implemented for scalability.
2. **Rate Limiting**: There's currently no rate limiting implemented, which could lead to potential abuse of the service.
3. **Caching**: Implementing a caching mechanism for recent SSL checks could improve performance and reduce unnecessary network requests.
4. **HTTPS**: The backend server is not set up with HTTPS. In a production environment, the backend should use HTTPS to ensure secure communication.
5. **Testing**: More comprehensive unit and integration tests should be added to ensure reliability and ease of maintenance.
6. **Accessibility**: While basic accessibility features are in place, a more thorough accessibility audit and improvements could be made.
7. **Internationalization**: The application currently only supports English. Adding support for multiple languages would improve its global usability.

## Setup and Running the Application

### Backend (Rust)

1. Navigate to the `ssl-checker-backend` directory.
2. Run `cargo run` to start the backend server.

### Frontend (Next.js)

1. Navigate to the `ssl-checker-frontend` directory.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the development server.
4. The application will be available at `http://localhost:3000`.

## Testing with Postman (Routes Info)

The SSL Certificate Checker provides a single API endpoint for checking SSL certificates. Here are the details for testing this endpoint:

### API Endpoint

- **Route**: `/check_certificate`
- **Method**: POST
- **URL**: `http://localhost:8080/check_certificate` (replace `localhost` with your server's IP if hosted elsewhere)

### Request Body

The request body should be in JSON format with a single field:

```json
{
  "domain": "example.com"
}
```

Replace `example.com` with the domain you want to check.

### Response Example

A successful response will return a JSON object containing details about the SSL certificate:

```json
{
  "validity_status": true,
  "expiration_date": "2024-12-31T23:59:59Z",
  "issuer": "CN=Example CA, O=Example Org, C=US",
  "subject": "CN=example.com, O=Example Org, C=US",
  "valid_for_domain": true,
  "ca_valid": false,
  "self_signed": false,
  "revocation_status": "Not implemented"
}
```
