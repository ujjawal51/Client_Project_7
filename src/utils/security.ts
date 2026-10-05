import DOMPurify from 'dompurify';
import type { FormErrors } from '../types';

/**
 * Sanitizes input string to prevent XSS injection attacks.
 * Uses DOMPurify to strip dangerous HTML, tags, and script payloads.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Strip all HTML tags for pure sanitized plain text
    ALLOWED_ATTR: [],
  }).trim();
}

export interface OptimizationFormData {
  articleTitle: string;
  articleUrl: string;
  metricType: string;
  currentValue: string | number;
  targetValue: string | number;
  assignedStaff?: string;
  notes?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

/**
 * Validates optimization task input before saving.
 * Highlights missing or malformed fields in red and prevents submission.
 */
export function validateOptimizationInput(data: Partial<OptimizationFormData>): ValidationResult {
  const errors: FormErrors = {};

  const cleanTitle = (data.articleTitle || '').trim();
  if (!cleanTitle) {
    errors.articleTitle = 'Title is required and cannot be empty.';
  } else if (cleanTitle.length < 3) {
    errors.articleTitle = 'Title must be at least 3 characters long.';
  }

  const cleanUrl = (data.articleUrl || '').trim();
  if (!cleanUrl) {
    errors.articleUrl = 'Article URL is required.';
  } else {
    try {
      const parsed = new URL(cleanUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        errors.articleUrl = 'Please provide a valid URL with http or https protocol.';
      }
    } catch {
      errors.articleUrl = 'Please provide a valid URL format (e.g. https://newsblog.example.com/article).';
    }
  }

  if (!data.metricType) {
    errors.metricType = 'Please select a performance metric type.';
  }

  const currVal = Number(data.currentValue);
  if (data.currentValue === '' || data.currentValue === undefined || isNaN(currVal) || currVal < 0) {
    errors.currentValue = 'Current metric value must be a valid positive number.';
  }

  const targetVal = Number(data.targetValue);
  if (data.targetValue === '' || data.targetValue === undefined || isNaN(targetVal) || targetVal < 0) {
    errors.targetValue = 'Target metric value must be a valid positive number.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
