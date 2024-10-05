# SSL Certificate Checker

This project is an SSL Certificate Checker application with a Rust backend and a Next.js frontend. It allows users to check the SSL certificate status of a given domain and provides analytics on the checks performed.

![Screenshot (4333)](https://github.com/user-attachments/assets/19501ab5-7157-44a7-a7eb-23581775d835)
![Screenshot (4335)](https://github.com/user-attachments/assets/ff403806-18b8-4776-ac4d-7e97605f2338)



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

# RUST libraries

1. actix_cors::Cors
Purpose: This module is used to handle Cross-Origin Resource Sharing (CORS) policies in web applications built with the Actix framework.
Usage:
It's essential when you're building a web service that might be called by frontends hosted on different domains (e.g., making API requests from a web app). CORS allows the backend to specify which origins are allowed to make requests, which HTTP methods are allowed, and more.
You can configure it to allow or block requests from specific domains, allowing requests from all origins, etc.

2. actix_web::{web, App, HttpServer, Responder, HttpResponse}
web: Provides utilities to extract data from incoming HTTP requests (e.g., query parameters, JSON body data, path variables). It also handles request routing in Actix.
App: Represents an Actix web application. It's used to configure routes, middlewares, and other application-wide configurations.
HttpServer: This struct is used to create and run the HTTP server. It binds to a specific address and listens for incoming HTTP requests.
Responder: A trait that allows for types to respond to HTTP requests. If a function returns a type implementing Responder, it can be converted into an HTTP response.
HttpResponse: Represents an HTTP response that the server sends back to the client. You can use it to send responses with specific status codes, headers, and body content.

3. rustls::{ClientConfig, RootCertStore, OwnedTrustAnchor}
ClientConfig:
This struct is part of the Rustls library, which is a TLS (Transport Layer Security) library for encrypted communication.
ClientConfig allows you to configure TLS settings, including which root certificates to trust, cipher suites, and whether or not to require client authentication.
RootCertStore:
This struct holds a collection of trusted root certificates used for verifying the authenticity of TLS certificates. It is essential for validating the certificate presented by the server during the TLS handshake.
OwnedTrustAnchor:
This represents a Trust Anchor—a root certificate that is trusted to validate server certificates during the TLS handshake. Rustls uses this struct to build a chain of trust between the server's certificate and a trusted root certificate.

4. x509_parser::prelude::*
Purpose: The x509_parser library is used to parse and handle X.509 certificates (the format used for SSL/TLS certificates).
Usage:
It provides types and methods for extracting data from certificates such as validity periods, subject/issuer names, extensions, and more.
The prelude::* syntax imports common types and traits from the library into your scope, making it easier to work with X.509 certificates without importing specific structs and functions.

5. serde::{Deserialize, Serialize}
Deserialize: This trait is used to convert structured data (e.g., JSON) into a Rust struct. When a client sends a JSON request, Deserialize is used to map the JSON fields to Rust struct fields.
Serialize: This trait allows converting a Rust struct into a format suitable for transmission or storage (e.g., JSON). You use this when sending data back to the client in response to a request.

6. chrono::{DateTime, Utc}
Purpose: The chrono crate provides utilities for working with dates and times.
DateTime: This struct represents a specific point in time. It is used in the code to handle the start and end dates of an SSL certificate’s validity period.
Utc: Represents the Coordinated Universal Time (UTC) time zone. In this case, Utc::now() is used to get the current time for comparing certificate validity.

7. std::sync::Arc
Purpose: Arc stands for Atomic Reference Counting. It allows multiple threads or asynchronous tasks to share ownership of a value (such as a configuration object) without needing to make copies.
Usage: Arc is used in the code to allow the TLS configuration (like ClientConfig) to be shared between multiple tasks (e.g., multiple requests) safely in a multi-threaded environment.

8. tokio::net::TcpStream
Purpose: TcpStream is part of the Tokio asynchronous runtime. It is used to establish and manage a connection to a remote TCP server.
Usage:
In this code, TcpStream::connect is used to asynchronously connect to a server over the network using TCP.
Once the connection is established, it's wrapped with a TLS connector to perform a secure TLS handshake.

9. tokio_rustls::TlsConnector
Purpose: The TlsConnector struct from the tokio_rustls crate is used to perform a TLS handshake over a TCP connection.
Usage:
After creating a TCP connection to a server, the TlsConnector::connect method is used to negotiate a secure TLS connection.
This connector requires a ClientConfig object for setting up trusted root certificates, cipher suites, etc.

10. webpki_roots::TLS_SERVER_ROOTS
Purpose: This is a collection of root certificates provided by the webpki_roots crate. These are common root certificates (like those issued by trusted certificate authorities) used for validating SSL/TLS certificates during a connection.
Usage:
In the code, TLS_SERVER_ROOTS is added to the RootCertStore to provide a list of trusted root certificates for verifying the server's certificate.

# Overall Flow:
-The application uses Actix Web as the web framework to handle HTTP requests and responses, specifically for SSL certificate checks.
-Rustls and Tokio are used to establish a secure connection to the target domain via TLS over TCP.
-The certificate from the domain is extracted and parsed using x509_parser, and important details such as validity dates, issuer, and subject are retrieved.
-Serde is used to handle the incoming request (a domain name) and format the outgoing response (certificate details).
-The chrono crate is used to check whether the certificate is still valid based on the current time.
-This combination of libraries creates an efficient, asynchronous, and secure application for checking SSL certificates in Rust.
