import React, { useState, useCallback } from 'react';
import type { FormErrors, MetricType, OptimizationItem } from '../types';
import { sanitizeInput, validateOptimizationInput } from '../utils/security';
import { trackTelemetry } from '../utils/telemetry';
import { PlusCircle, AlertCircle } from 'lucide-react';

interface OptimizationFormProps {
  onAddItem: (item: OptimizationItem) => void;
}

export const OptimizationForm: React.FC<OptimizationFormProps> = React.memo(({ onAddItem }) => {
  const [articleTitle, setArticleTitle] = useState('');
  const [articleUrl, setArticleUrl] = useState('');
  const [metricType, setMetricType] = useState<MetricType>('LCP');
  const [currentValue, setCurrentValue] = useState<string>('3.2');
  const [targetValue, setTargetValue] = useState<string>('1.8');
  const [assignedStaff, setAssignedStaff] = useState('Floor Staff A');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Form submission handler with validation, XSS sanitization, and telemetry
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitAttempted(true);

      const validation = validateOptimizationInput({
        articleTitle,
        articleUrl,
        metricType,
        currentValue,
        targetValue,
      });

      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      // XSS Sanitization before state storage
      const sanitizedTitle = sanitizeInput(articleTitle);
      const sanitizedUrl = sanitizeInput(articleUrl);
      const sanitizedNotes = sanitizeInput(notes);
      const sanitizedStaff = sanitizeInput(assignedStaff) || 'Unassigned Staff';

      let unit = 's';
      if (metricType === 'TTFB' || metricType === 'FID') unit = 'ms';
      if (metricType === 'ImageSize') unit = 'KB';
      if (metricType === 'CLS') unit = 'score';
      if (metricType === 'CacheHit') unit = '%';

      const newItem: OptimizationItem = {
        id: `OPT-${Math.floor(1000 + Math.random() * 9000)}`,
        articleTitle: sanitizedTitle,
        articleUrl: sanitizedUrl,
        metricType,
        currentValue: parseFloat(currentValue),
        targetValue: parseFloat(targetValue),
        unit,
        status: 'Needs Audit',
        assignedStaff: sanitizedStaff,
        notes: sanitizedNotes || 'Logged from News Blog floor terminal.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onAddItem(newItem);

      // Telemetry simulation
      trackTelemetry('Add Task', {
        taskId: newItem.id,
        metric: metricType,
        articleTitle: sanitizedTitle,
      });

      // Reset form fields
      setArticleTitle('');
      setArticleUrl('');
      setNotes('');
      setErrors({});
      setSubmitAttempted(false);
    },
    [articleTitle, articleUrl, metricType, currentValue, targetValue, assignedStaff, notes, onAddItem]
  );

  return (
    <section className="form-card" aria-labelledby="form-heading">
      <div className="card-header">
        <h2 id="form-heading" className="card-title">
          <PlusCircle size={20} className="card-icon" aria-hidden="true" />
          Log Digital Performance Audit
        </h2>
        <span className="card-badge">Floor Staff Action</span>
      </div>

      <form onSubmit={handleSubmit} noValidate className="optimization-form">
        <div className="form-grid">
          {/* Article Title */}
          <div className="form-group">
            <label htmlFor="articleTitle" className="form-label">
              Article or Page Title <span className="required-star">*</span>
            </label>
            <input
              id="articleTitle"
              type="text"
              className={`form-input ${errors.articleTitle ? 'input-error error' : ''}`}
              value={articleTitle}
              onChange={(e) => {
                setArticleTitle(e.target.value);
                if (submitAttempted && errors.articleTitle) {
                  setErrors((prev) => ({ ...prev, articleTitle: undefined }));
                }
              }}
              placeholder="e.g. Breaking: Global Election Results 2026"
              aria-label="Article or Page Title"
              aria-required="true"
              aria-invalid={errors.articleTitle ? 'true' : 'false'}
              aria-describedby={errors.articleTitle ? 'articleTitle-error' : undefined}
            />
            {errors.articleTitle && (
              <span id="articleTitle-error" className="field-error-message" role="alert">
                <AlertCircle size={14} aria-hidden="true" />
                {errors.articleTitle}
              </span>
            )}
          </div>

          {/* Article URL */}
          <div className="form-group">
            <label htmlFor="articleUrl" className="form-label">
              Article URL <span className="required-star">*</span>
            </label>
            <input
              id="articleUrl"
              type="url"
              className={`form-input ${errors.articleUrl ? 'input-error error' : ''}`}
              value={articleUrl}
              onChange={(e) => {
                setArticleUrl(e.target.value);
                if (submitAttempted && errors.articleUrl) {
                  setErrors((prev) => ({ ...prev, articleUrl: undefined }));
                }
              }}
              placeholder="https://newsblog.example.com/world/article"
              aria-label="Article URL"
              aria-required="true"
              aria-invalid={errors.articleUrl ? 'true' : 'false'}
              aria-describedby={errors.articleUrl ? 'articleUrl-error' : undefined}
            />
            {errors.articleUrl && (
              <span id="articleUrl-error" className="field-error-message" role="alert">
                <AlertCircle size={14} aria-hidden="true" />
                {errors.articleUrl}
              </span>
            )}
          </div>

          {/* Metric Type */}
          <div className="form-group">
            <label htmlFor="metricType" className="form-label">
              Target Metric Type <span className="required-star">*</span>
            </label>
            <select
              id="metricType"
              className={`form-input form-select ${errors.metricType ? 'input-error error' : ''}`}
              value={metricType}
              onChange={(e) => setMetricType(e.target.value as MetricType)}
              aria-label="Target Metric Type"
              aria-required="true"
              aria-invalid={errors.metricType ? 'true' : 'false'}
            >
              <option value="LCP">Largest Contentful Paint (LCP - seconds)</option>
              <option value="TTFB">Time to First Byte (TTFB - ms)</option>
              <option value="FID">First Input Delay (FID/INP - ms)</option>
              <option value="CLS">Cumulative Layout Shift (CLS - score)</option>
              <option value="ImageSize">Payload Image Compression (ImageSize - KB)</option>
              <option value="CacheHit">Edge CDN Cache Hit Ratio (CacheHit - %)</option>
            </select>
          </div>

          {/* Current & Target Metric Values */}
          <div className="form-group-split">
            <div className="form-group">
              <label htmlFor="currentValue" className="form-label">
                Current Metric Value <span className="required-star">*</span>
              </label>
              <input
                id="currentValue"
                type="number"
                step="any"
                className={`form-input ${errors.currentValue ? 'input-error error' : ''}`}
                value={currentValue}
                onChange={(e) => {
                  setCurrentValue(e.target.value);
                  if (submitAttempted && errors.currentValue) {
                    setErrors((prev) => ({ ...prev, currentValue: undefined }));
                  }
                }}
                aria-label="Current Metric Value"
                aria-required="true"
                aria-invalid={errors.currentValue ? 'true' : 'false'}
                aria-describedby={errors.currentValue ? 'currentValue-error' : undefined}
              />
              {errors.currentValue && (
                <span id="currentValue-error" className="field-error-message" role="alert">
                  <AlertCircle size={14} aria-hidden="true" />
                  {errors.currentValue}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="targetValue" className="form-label">
                Target Metric Value <span className="required-star">*</span>
              </label>
              <input
                id="targetValue"
                type="number"
                step="any"
                className={`form-input ${errors.targetValue ? 'input-error error' : ''}`}
                value={targetValue}
                onChange={(e) => {
                  setTargetValue(e.target.value);
                  if (submitAttempted && errors.targetValue) {
                    setErrors((prev) => ({ ...prev, targetValue: undefined }));
                  }
                }}
                aria-label="Target Metric Value"
                aria-required="true"
                aria-invalid={errors.targetValue ? 'true' : 'false'}
                aria-describedby={errors.targetValue ? 'targetValue-error' : undefined}
              />
              {errors.targetValue && (
                <span id="targetValue-error" className="field-error-message" role="alert">
                  <AlertCircle size={14} aria-hidden="true" />
                  {errors.targetValue}
                </span>
              )}
            </div>
          </div>

          {/* Assigned Floor Staff */}
          <div className="form-group">
            <label htmlFor="assignedStaff" className="form-label">
              Assigned Floor Operator
            </label>
            <input
              id="assignedStaff"
              type="text"
              className="form-input"
              value={assignedStaff}
              onChange={(e) => setAssignedStaff(e.target.value)}
              placeholder="e.g. Floor Staff Operator"
              aria-label="Assigned Floor Operator"
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Observation / Root Cause Notes
            </label>
            <input
              id="notes"
              type="text"
              className="form-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Unoptimized web fonts causing FOIT on 3G"
              aria-label="Observation / Root Cause Notes"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            aria-label="Add Optimization Task"
          >
            <PlusCircle size={16} aria-hidden="true" />
            <span>Add Optimization Task</span>
          </button>
        </div>
      </form>
    </section>
  );
});

OptimizationForm.displayName = 'OptimizationForm';
