const PDFDocument = require('pdfkit');
const { TEMPLATE_STYLES } = require('./templates');

function letterBody(docType, f) {
  const today = f.date || new Date().toLocaleDateString('en-GB');
  const name = f.fullName || 'Your Name';
  const greet = f.recipientName ? `Dear ${f.recipientName},` : 'Dear Hiring Manager,';

  const bodies = {
    cover_letter: [
      `${greet}`,
      `I am writing to apply for the ${f.position || 'position'} role at ${f.companyName || 'your company'}. With experience in ${f.experience || 'my field'}, I believe I would be a strong addition to your team.`,
      `${f.achievements || 'In my previous roles, I have consistently delivered strong results and worked well within a team.'}`,
      `I would welcome the chance to discuss how I can contribute to ${f.companyName || 'your organisation'}. Thank you for considering my application.`,
      `Yours sincerely,`,
      `${name}`,
    ],
    job_application: [
      `${greet}`,
      `I am applying for the position of ${f.position || 'position'} advertised by ${f.companyName || 'your organisation'}. I hold ${f.qualification || 'relevant qualifications'} and ${f.experience || 'relevant experience'} that make me suitable for this role.`,
      `${f.reason || 'I am confident that my skills align well with what you are looking for, and I am eager to bring my abilities to your team.'}`,
      `I have attached my CV for your review and look forward to the opportunity of an interview.`,
      `Yours faithfully,`,
      `${name}`,
    ],
    leave_request: [
      `${greet}`,
      `I am writing to formally request leave from ${f.startDate || '[start date]'} to ${f.endDate || '[end date]'}, due to ${f.reason || 'personal reasons'}.`,
      `I will ensure my responsibilities are handed over appropriately, and I am happy to assist remotely if needed during this period.`,
      `Thank you for considering my request.`,
      `Regards,`,
      `${name}`,
    ],
    salary_increment: [
      `${greet}`,
      `I am writing to formally request a review of my current salary as ${f.position || 'an employee'} at ${f.companyName || 'the company'}. Over the past ${f.duration || 'period'}, I have ${f.achievements || 'taken on additional responsibilities and delivered strong results'}.`,
      `Given these contributions, I would like to request a salary increment in line with my performance and current market rates.`,
      `I am happy to discuss this further at your convenience. Thank you for your consideration.`,
      `Regards,`,
      `${name}`,
    ],
    offer_acceptance: [
      `${greet}`,
      `I am pleased to formally accept the offer for the position of ${f.position || 'position'} at ${f.companyName || 'the company'}, as discussed.`,
      `${f.terms || 'I confirm my understanding and acceptance of the terms and conditions outlined.'}`,
      `I look forward to starting on ${f.startDate || '[start date]'} and contributing to the team.`,
      `Regards,`,
      `${name}`,
    ],
    resignation: [
      `${greet}`,
      `I am writing to formally notify you of my resignation from the position of ${f.position || 'my position'} at ${f.companyName || 'the company'}, effective ${f.lastDay || '[last working day]'}.`,
      `${f.reason ? `This decision comes as ${f.reason}.` : 'This was not an easy decision, but I believe it is the right step for my career at this time.'}`,
      `I am grateful for the opportunities for growth I was given during my time here, and I will do everything I can to ensure a smooth handover.`,
      `Yours sincerely,`,
      `${name}`,
    ],
    reference_request: [
      `${greet}`,
      `I hope you are doing well. I am currently ${f.reason || 'applying for new opportunities'}, and I would be grateful if you would be willing to serve as a reference for me.`,
      `During my time at ${f.companyName || 'the company'} as ${f.position || 'a team member'}, ${f.achievements || 'I had the opportunity to grow professionally and contribute meaningfully to the team'}.`,
      `Please let me know if you are comfortable with this, and if there is any information you would like me to provide.`,
      `Thank you very much for your time.`,
      `Regards,`,
      `${name}`,
    ],
    farewell: [
      `Dear Colleagues,`,
      `As some of you may know, ${today} marks my last day at ${f.companyName || 'the company'}. I wanted to take a moment to thank you all for the support, collaboration, and friendship over ${f.duration || 'my time here'}.`,
      `${f.message || 'It has been a privilege working alongside such a dedicated team, and I will carry the lessons learned here with me.'}`,
      `Please stay in touch: ${f.email || '[personal email]'}.`,
      `Warm regards,`,
      `${name}`,
    ],
    admission_application: [
      `${greet}`,
      `I am writing to apply for admission into the ${f.course || 'programme'} at ${f.institutionName || 'your institution'}. I hold ${f.qualification || 'the necessary qualifications'} and am keen to further my studies in this field.`,
      `${f.reason || 'I am confident that this institution offers the right environment for me to grow academically and pursue my goals.'}`,
      `I have attached my supporting documents for your review and look forward to your favourable response.`,
      `Yours faithfully,`,
      `${name}`,
    ],
    leave_permission: [
      `${greet}`,
      `I am writing to formally request permission for leave from ${f.institutionName || 'the institution'}, ${f.classOrYear ? `(${f.classOrYear})` : ''} from ${f.startDate || '[start date]'} to ${f.endDate || '[end date]'}, due to ${f.reason || 'personal reasons'}.`,
      `${f.parentName ? `This request has the knowledge and support of my parent/guardian, ${f.parentName}.` : 'I will catch up on any missed work upon my return.'}`,
      `Thank you for considering my request.`,
      `Regards,`,
      `${name}`,
    ],
    fee_bursary_request: [
      `${greet}`,
      `I am writing to request consideration for a fee waiver / bursary at ${f.institutionName || 'the institution'} for my ${f.course || 'studies'}.`,
      `${f.reason || 'Due to my current financial circumstances, I am unable to meet the full cost of my fees, and would be grateful for any support that can be extended to me.'}`,
      `I am committed to my studies and would deeply appreciate your assistance. Thank you for your time and consideration.`,
      `Yours sincerely,`,
      `${name}`,
    ],
  };

  return bodies[docType] || [`${greet}`, 'Document content.', `${name}`];
}

function drawLetter(doc, style, docType, f) {
  const today = f.date || new Date().toLocaleDateString('en-GB');

  doc.font(style.boldFont).fontSize(style.headingSize).fillColor(style.accent);
  doc.text(f.fullName || 'Your Name', { align: 'left' });
  doc.font(style.font).fontSize(10).fillColor('#333333');
  if (f.address) doc.text(f.address);
  if (f.phone) doc.text(f.phone);
  if (f.email) doc.text(f.email);
  doc.moveDown(1);
  doc.text(today);
  doc.moveDown(1);

  if (f.companyName || f.recipientName) {
    if (f.recipientName) doc.text(f.recipientName);
    if (f.companyName) doc.text(f.companyName);
    doc.moveDown(1);
  }

  doc.font(style.font).fontSize(11).fillColor('#111111');
  const paragraphs = letterBody(docType, f);
  paragraphs.forEach((p) => {
    doc.text(p, { align: 'left', lineGap: 4 });
    doc.moveDown(0.8);
  });
}

function drawCV(doc, style, f) {
  doc.font(style.boldFont).fontSize(22).fillColor(style.accent);
  doc.text(f.fullName || 'Your Name');
  doc.font(style.font).fontSize(10).fillColor('#444444');
  doc.text([f.email, f.phone, f.address].filter(Boolean).join('  |  '));
  doc.moveDown(1);

  function section(title, content) {
    doc.font(style.boldFont).fontSize(13).fillColor(style.accent);
    doc.text(title.toUpperCase());
    doc.moveTo(doc.x, doc.y + 2).lineTo(545, doc.y + 2).strokeColor(style.accent).stroke();
    doc.moveDown(0.5);
    doc.font(style.font).fontSize(10.5).fillColor('#111111');
    doc.text(content || '-', { lineGap: 3 });
    doc.moveDown(1);
  }

  section('Professional Summary', f.summary);
  section('Work Experience', f.experience);
  section('Education', f.education);
  section('Skills', f.skills);
  if (f.achievements) section('Achievements', f.achievements);
  if (f.referees) section('Referees', f.referees);
}

function addWatermark(doc) {
  const { width, height } = doc.page;
  doc.save();
  doc.rotate(-35, { origin: [width / 2, height / 2] });
  doc.fontSize(46).fillColor('#94a3b8').opacity(0.28);
  for (let y = -height; y < height * 2; y += 160) {
    doc.text('KDOCS-PRO PREVIEW - PAY TO DOWNLOAD', -100, y, { width: width + 400, align: 'center' });
  }
  doc.opacity(1);
  doc.restore();
}

/**
 * Generates a PDF buffer for the given document type + template + form fields.
 * When watermark=true, this is the free preview (blurred with a repeating
 * watermark and no clean copy). When watermark=false, this is the real,
 * clean file - only ever produced AFTER a confirmed M-Pesa payment.
 */
function generatePdf({ docType, templateKey, fields, watermark }) {
  return new Promise((resolve, reject) => {
    const style = TEMPLATE_STYLES[templateKey] || TEMPLATE_STYLES.modern;
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    if (docType === 'cv') {
      drawCV(doc, style, fields);
    } else {
      drawLetter(doc, style, docType, fields);
    }

    if (watermark) addWatermark(doc);

    doc.end();
  });
}

module.exports = { generatePdf };
