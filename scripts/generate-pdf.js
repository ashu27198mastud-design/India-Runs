const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../submission/ranked-candidates-output.json');
const pdfPath = path.join(__dirname, '../submission/ranked-candidates-output.pdf');

const candidates = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const doc = new PDFDocument({ margin: 50 });

doc.pipe(fs.createWriteStream(pdfPath));

// Title
doc.fontSize(20).font('Helvetica-Bold').text('Ranked Candidate Output — RANKFORGE AI', { align: 'center' });
doc.moveDown(0.5);

// Metadata
doc.fontSize(12).font('Helvetica').text('Role: Senior GRC Analyst', { align: 'center' });
doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
doc.moveDown(2);

// Summary Section
doc.fontSize(14).font('Helvetica-Bold').text('Executive Summary');
doc.moveDown(0.5);
doc.fontSize(10).font('Helvetica')
   .text('• Best Overall Candidate: Alex Mercer (Rank 1)')
   .text('• Best Hidden Gem: Jamie Lin (Rank 2)')
   .text('• Lowest Risk Candidate: Alex Mercer (Rank 1)')
   .text('• Candidate Requiring Validation (Overfit): Taylor Swift (Rank 9)');
doc.moveDown(1.5);

// Disclaimer
doc.fontSize(9).font('Helvetica-Oblique').fillColor('red')
   .text('Responsible AI Note: This ranked output is generated for decision-support purposes only. Final hiring decisions must be made by authorized human reviewers. The ranking excludes protected attributes and is based only on job-relevant synthetic candidate data.', { align: 'justify' });
doc.fillColor('black');
doc.moveDown(2);

// Top 5 Detailed Breakdown
doc.fontSize(14).font('Helvetica-Bold').text('Top 5 Candidates Detail');
doc.moveDown(1);

candidates.slice(0, 5).forEach((c, index) => {
    doc.fontSize(12).font('Helvetica-Bold').text(`#${c.rank} - ${c.candidateName} (${c.currentRole})`);
    doc.fontSize(10).font('Helvetica-Oblique').text(`Score: ${c.overallFitScore}/100 | Evidence: ${c.evidenceScore}/100 | Risk: ${c.riskScore}/100`);
    doc.moveDown(0.5);
    doc.font('Helvetica').text(`Why ranked here: High trajectory score of ${c.trajectoryScore} and confidence level is ${c.confidenceLevel}.`);
    doc.text(`Strongest evidence: ${c.keyEvidence}`);
    doc.text(`Missing or weak areas: ${c.keyConcernGap}`);
    doc.text(`Recommended Action: ${c.recommendedAction}`);
    
    doc.moveDown(1.5);
});

// Ranking Table (Text-based equivalent)
doc.addPage();
doc.fontSize(14).font('Helvetica-Bold').text('Full Ranked List');
doc.moveDown(1);

candidates.forEach(c => {
    doc.fontSize(10).font('Helvetica-Bold').text(`${c.rank}. ${c.candidateName} - ${c.currentRole}`);
    doc.font('Helvetica').text(`Fit: ${c.overallFitScore} | Exp: ${c.totalExperienceYears} yrs | Risk: ${c.riskScore} | Action: ${c.recommendedAction}`);
    doc.moveDown(0.5);
});

doc.end();

console.log(`PDF successfully generated at ${pdfPath}`);
