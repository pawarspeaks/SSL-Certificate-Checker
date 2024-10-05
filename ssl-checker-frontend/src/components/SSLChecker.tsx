'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './SSLChecker.css';

interface CertificateInfo {
  validity_status: boolean;
  expiration_date: string;
  issuer: string;
  subject: string;
  valid_for_domain: boolean;
  ca_valid: boolean;
  self_signed: boolean;
  revocation_status: string;
}

interface Analytics {
  total_checks: number;
  invalid_certs: number;
  self_signed_certs: number;
  revoked_certs: number;
}

const SSLChecker: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [certificateInfo, setCertificateInfo] = useState<CertificateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:8080/analytics');
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const validateDomain = (input: string): string => {
    // Remove http:// or https:// if present
    let cleanedInput = input.replace(/^(https?:\/\/)/, '');
    
    // Remove www. if present
    cleanedInput = cleanedInput.replace(/^www\./, '');
    
    // Remove any path or query parameters
    cleanedInput = cleanedInput.split('/')[0];
    
    // More permissive domain validation regex
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*\.[a-zA-Z]{2,}$/;

    if (!domainRegex.test(cleanedInput)) {
      throw new Error('Invalid domain format');
    }
    
    return cleanedInput;
  };

  const getErrorMessage = (error: any): string => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 404) {
        return 'The specified domain could not be found. Please check the domain and try again.';
      } else if (error.response.status === 500) {
        return 'There was a server error. Please try again later.';
      }
    } else if (error.request) {
      // The request was made but no response was received
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }
    // Something happened in setting up the request that triggered an Error
    return error.message || 'An unexpected error occurred. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCertificateInfo(null);

    try {
      const validatedDomain = validateDomain(domain);
      const response = await axios.post('http://localhost:8080/check_certificate', { domain: validatedDomain });
      setCertificateInfo(response.data);
      await fetchAnalytics();
    } catch (err: any) {
      if (err.message === 'Invalid domain format') {
        setError('Please enter a valid domain name (e.g., example.com, subdomain.example.co.uk).');
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        SSL Certificate Checker
      </motion.h1>
      <motion.div
        className="form-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="domain">Domain Name</label>
            <input
              id="domain"
              type="text"
              placeholder="Enter domain name (e.g., example.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Check SSL'}
          </motion.button>
        </form>
      </motion.div>

      {error && (
        <motion.p
          className="error-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}

      {certificateInfo && (
        <motion.div
          className="result-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Certificate Information</h2>
          <div className="result-grid">
            <ResultItem
              label="Validity Status"
              value={certificateInfo.validity_status ? 'Valid' : 'Invalid'}
              status={certificateInfo.validity_status ? 'success' : 'error'}
            />
            <ResultItem label="Expiration Date" value={certificateInfo.expiration_date} />
            <ResultItem label="Issuer" value={certificateInfo.issuer} />
            <ResultItem label="Subject" value={certificateInfo.subject} />
            <ResultItem
              label="Valid for Domain"
              value={certificateInfo.valid_for_domain ? 'Yes' : 'No'}
              status={certificateInfo.valid_for_domain ? 'success' : 'error'}
            />
            <ResultItem
              label="CA Validity"
              value={certificateInfo.ca_valid ? 'Valid' : 'Invalid'}
              status={certificateInfo.ca_valid ? 'success' : 'error'}
            />
            <ResultItem
              label="Self-Signed"
              value={certificateInfo.self_signed ? 'Yes' : 'No'}
              status={certificateInfo.self_signed ? 'warning' : 'success'}
            />
            <ResultItem
              label="Revocation Status"
              value={certificateInfo.revocation_status}
              status={certificateInfo.revocation_status === 'Valid' ? 'success' : 'error'}
            />
          </div>
        </motion.div>
      )}

      {analytics && (
        <motion.div
          className="analytics-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnalyticsItem label="Total Checks" value={analytics.total_checks} />
          <AnalyticsItem label="Invalid Certificates" value={analytics.invalid_certs} />
          <AnalyticsItem label="Self-Signed Certificates" value={analytics.self_signed_certs} />
          <AnalyticsItem label="Revoked Certificates" value={analytics.revoked_certs} />
        </motion.div>
      )}
    </div>
  );
};

const ResultItem: React.FC<{ label: string; value: string | boolean; status?: 'success' | 'error' | 'warning' }> = ({ label, value, status }) => (
  <div className="result-item">
    <span className="result-label">{label}</span>
    <span className={`result-value ${status || ''}`}>
      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
    </span>
  </div>
);

const AnalyticsItem: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <motion.div
    className="analytics-item"
    whileHover={{ scale: 1.05 }}
  >
    <h3 className="analytics-label">{label}</h3>
    <p className="analytics-value">{value}</p>
  </motion.div>
);

export default SSLChecker;