fn main() {
    println!("cargo:rustc-link-search=native=C:\\Program Files\\OpenSSL-Win64\\lib\\VC\\x64\\MD");
    println!("cargo:rustc-link-lib=static=libssl");
    println!("cargo:rustc-link-lib=static=libcrypto");
}