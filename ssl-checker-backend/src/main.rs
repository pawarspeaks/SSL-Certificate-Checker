use actix_cors::Cors;
use actix_web::{web, App, HttpServer, Responder, HttpResponse};
use rustls::{ClientConfig, RootCertStore, OwnedTrustAnchor};
use x509_parser::prelude::*;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::sync::Arc;
use tokio::net::TcpStream;
use tokio_rustls::TlsConnector;
use webpki_roots::TLS_SERVER_ROOTS;

#[derive(Deserialize)]
struct DomainRequest {
    domain: String,
}

#[derive(Serialize)]
struct CertificateInfo {
    validity_status: bool,
    expiration_date: String,
    issuer: String,
    subject: String,
    valid_for_domain: bool,
    ca_valid: bool,
    self_signed: bool,
    revocation_status: String,
}

async fn check_certificate(domain: web::Json<DomainRequest>) -> impl Responder {
    let domain = domain.into_inner().domain;
    let addr = format!("{}:443", domain);

    // Build the rustls config for SSL/TLS
    let mut root_cert_store = RootCertStore::empty();
    root_cert_store.add_server_trust_anchors(TLS_SERVER_ROOTS.0.iter().map(|ta| {
        OwnedTrustAnchor::from_subject_spki_name_constraints(
            ta.subject,
            ta.spki,
            ta.name_constraints,
        )
    }));

    let config = ClientConfig::builder()
        .with_safe_defaults()
        .with_root_certificates(root_cert_store)
        .with_no_client_auth();

    let connector = TlsConnector::from(Arc::new(config));

    // Connect to the server
    match TcpStream::connect(&addr).await {
        Ok(stream) => {
            let domain_ref = domain.as_str().try_into().unwrap();
            match connector.connect(domain_ref, stream).await {
                Ok(tls_stream) => {
                    let peer_certificates = tls_stream.get_ref().1.peer_certificates();

                    if let Some(certs) = peer_certificates {
                        if !certs.is_empty() {
                            let cert_der = certs[0].clone();
                            if let Ok((_, cert)) = X509Certificate::from_der(&cert_der.0) {
                                let now = Utc::now();
                                let not_before_opt = DateTime::<Utc>::from_timestamp(cert.validity().not_before.timestamp(), 0);
                                let not_after_opt = DateTime::<Utc>::from_timestamp(cert.validity().not_after.timestamp(), 0);
                                
                                // Unwrap the optional dates or handle the None case
                                let validity_status = now >= not_before_opt.unwrap() && now <= not_after_opt.unwrap();

                                let expiration_date = not_after_opt.map(|date| date.to_rfc3339()).unwrap_or_else(|| "Invalid date".to_string());

                                // Prepare the CertificateInfo struct
                                let info = CertificateInfo {
                                    validity_status,
                                    expiration_date,
                                    issuer: cert.issuer().to_string(),
                                    subject: cert.subject().to_string(),
                                    valid_for_domain: cert.subject_alternative_name()
                                        .map_or(false, |san| {
                                            san.map(|ext| {
                                                ext.value.general_names.iter().any(|name| match name {
                                                    GeneralName::DNSName(dns_name) => dns_name == &domain,
                                                    _ => false,
                                                })
                                            })
                                            .unwrap_or(false)
                                        }),
                                    ca_valid: cert.is_ca(),
                                    self_signed: cert.issuer() == cert.subject(),
                                    revocation_status: "Not implemented".to_string(),
                                };

                                // Return the certificate details as JSON
                                return HttpResponse::Ok().json(info);
                            } else {
                                return HttpResponse::InternalServerError().body("Failed to parse certificate");
                            }
                        } else {
                            return HttpResponse::InternalServerError().body("No certificate found");
                        }
                    } else {
                        return HttpResponse::InternalServerError().body("No peer certificates");
                    }
                },
                Err(e) => return HttpResponse::InternalServerError().body(format!("TLS connect error: {}", e)),
            }
        },
        Err(e) => HttpResponse::InternalServerError().body(format!("TCP connect error: {}", e)),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .wrap(Cors::permissive()) // Allow all origins (development mode)
            .route("/check_certificate", web::post().to(check_certificate))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}