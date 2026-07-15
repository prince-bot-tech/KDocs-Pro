// Every document type belongs to a stage of the job journey, and has exactly
// 3 visual templates. Each template just changes the look (fonts/colors/layout),
// the wording logic lives in pdfGenerator.js per document type.

const STAGES = {
  looking: {
    label: 'Looking for a Job',
    documents: {
      cv: { label: 'CV / Resume' },
      cover_letter: { label: 'Cover Letter' },
      job_application: { label: 'Job Application Letter' },
    },
  },
  during: {
    label: 'During a Job',
    documents: {
      leave_request: { label: 'Leave Request Letter' },
      salary_increment: { label: 'Salary Increment Request' },
      offer_acceptance: { label: 'Offer / Promotion Acceptance Letter' },
    },
  },
  after: {
    label: 'After a Job',
    documents: {
      resignation: { label: 'Resignation Letter' },
      reference_request: { label: 'Reference Request Letter' },
      farewell: { label: 'Farewell / Exit Letter' },
    },
  },
};

// 3 templates, reused across every document type - just the look changes.
const TEMPLATE_STYLES = {
  classic: {
    label: 'Classic',
    font: 'Times-Roman',
    boldFont: 'Times-Bold',
    accent: '#1d4ed8',
    headingSize: 16,
  },
  modern: {
    label: 'Modern',
    font: 'Helvetica',
    boldFont: 'Helvetica-Bold',
    accent: '#2563eb',
    headingSize: 18,
  },
  minimal: {
    label: 'Minimal',
    font: 'Courier',
    boldFont: 'Courier-Bold',
    accent: '#3b82f6',
    headingSize: 14,
  },
};

module.exports = { STAGES, TEMPLATE_STYLES };
