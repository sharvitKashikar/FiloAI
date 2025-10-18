const PDFDocument = require('pdfkit');
const fs = require('fs');

// Create a document
const doc = new PDFDocument({ margin: 50 });

// Pipe to a file
doc.pipe(fs.createWriteStream('sample-insurance-quote.pdf'));

// Title
doc.fontSize(20).font('Helvetica-Bold').text('INSURANCE QUOTE COMPARISON', { align: 'center' });
doc.moveDown();

// Quote A
doc.fontSize(16).font('Helvetica-Bold').fillColor('#2563eb').text('Quote A - Premium Protection Plan');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.text('Policy Number: PP-2025-001');
doc.text('Coverage Type: Comprehensive Auto Insurance');
doc.fontSize(12).font('Helvetica-Bold').fillColor('#16a34a').text('Premium: $250/month ($3,000/year)');
doc.fontSize(12).font('Helvetica-Bold').fillColor('#dc2626').text('Deductible: $500');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.moveDown();

doc.fontSize(12).font('Helvetica-Bold').text('Coverage Details:');
doc.fontSize(10).font('Helvetica');
doc.text('• Liability Coverage: $500,000');
doc.text('• Collision Coverage: Included');
doc.text('• Comprehensive Coverage: Included');
doc.text('• Medical Payments: $50,000');
doc.text('• Uninsured Motorist: $250,000');
doc.text('• Rental Car Coverage: $50/day (30 days max)');
doc.text('• Roadside Assistance: Included');
doc.moveDown();

doc.fontSize(11).font('Helvetica-Bold').text('Best For: Families with multiple vehicles, looking for complete protection');
doc.moveDown();

doc.fontSize(10).font('Helvetica-Bold').fillColor('#16a34a').text('Pros:');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.text('+ Comprehensive coverage with low deductible');
doc.text('+ Includes roadside assistance');
doc.text('+ High liability limits');
doc.text('+ Rental car coverage included');
doc.moveDown();

doc.fontSize(10).font('Helvetica-Bold').fillColor('#dc2626').text('Cons:');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.text('- Higher monthly premium');
doc.text('- Annual payment required for discount');
doc.moveDown(2);

// Quote B
doc.fontSize(16).font('Helvetica-Bold').fillColor('#2563eb').text('Quote B - Basic Shield Plan');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.text('Policy Number: BS-2025-002');
doc.text('Coverage Type: Basic Auto Insurance');
doc.fontSize(12).font('Helvetica-Bold').fillColor('#16a34a').text('Premium: $150/month ($1,800/year)');
doc.fontSize(12).font('Helvetica-Bold').fillColor('#dc2626').text('Deductible: $1,500');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.moveDown();

doc.fontSize(12).font('Helvetica-Bold').text('Coverage Details:');
doc.fontSize(10).font('Helvetica');
doc.text('• Liability Coverage: $100,000');
doc.text('• Collision Coverage: Not included');
doc.text('• Comprehensive Coverage: Not included');
doc.text('• Medical Payments: $10,000');
doc.text('• Uninsured Motorist: $50,000');
doc.text('• Rental Car Coverage: Not included');
doc.text('• Roadside Assistance: Available for $10/month extra');
doc.moveDown();

doc.fontSize(11).font('Helvetica-Bold').text('Best For: Budget-conscious drivers with older vehicles');
doc.moveDown();

doc.fontSize(10).font('Helvetica-Bold').fillColor('#16a34a').text('Pros:');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.text('+ Lowest monthly premium');
doc.text('+ Meets state minimum requirements');
doc.text('+ No contract lock-in');
doc.moveDown();

doc.fontSize(10).font('Helvetica-Bold').fillColor('#dc2626').text('Cons:');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.text('- High deductible');
doc.text('- Limited coverage');
doc.text('- No collision or comprehensive');
doc.text('- Low liability limits');

// Add new page for Quote C
doc.addPage();

// Quote C
doc.fontSize(16).font('Helvetica-Bold').fillColor('#2563eb').text('Quote C - Complete Care Plan');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.text('Policy Number: CC-2025-003');
doc.text('Coverage Type: Full Coverage Auto Insurance');
doc.fontSize(12).font('Helvetica-Bold').fillColor('#16a34a').text('Premium: $220/month ($2,640/year)');
doc.fontSize(12).font('Helvetica-Bold').fillColor('#dc2626').text('Deductible: $300');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.moveDown();

doc.fontSize(12).font('Helvetica-Bold').text('Coverage Details:');
doc.fontSize(10).font('Helvetica');
doc.text('• Liability Coverage: $750,000');
doc.text('• Collision Coverage: Included');
doc.text('• Comprehensive Coverage: Included');
doc.text('• Medical Payments: $100,000');
doc.text('• Uninsured Motorist: $500,000');
doc.text('• Rental Car Coverage: $75/day (45 days max)');
doc.text('• Roadside Assistance: Included');
doc.text('• Accident Forgiveness: Included');
doc.text('• Glass Coverage: Zero deductible');
doc.moveDown();

doc.fontSize(11).font('Helvetica-Bold').text('Best For: New car owners and families needing maximum protection');
doc.moveDown();

doc.fontSize(10).font('Helvetica-Bold').fillColor('#16a34a').text('Pros:');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.text('+ Lowest deductible');
doc.text('+ Highest liability coverage');
doc.text('+ Accident forgiveness included');
doc.text('+ Zero deductible glass coverage');
doc.text('+ Extended rental coverage');
doc.moveDown();

doc.fontSize(10).font('Helvetica-Bold').fillColor('#dc2626').text('Cons:');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.text('- Higher premium than basic plan');
doc.text('- May be overkill for older vehicles');
doc.moveDown(2);

// Recommendation
doc.fontSize(16).font('Helvetica-Bold').fillColor('#7c3aed').text('RECOMMENDATION FOR FAMILY OF 4');
doc.moveDown();
doc.fontSize(12).font('Helvetica').fillColor('#000000');
doc.text('Based on comprehensive analysis, Quote C (Complete Care Plan) is the BEST option for a family of 4 because:', { continued: false });
doc.moveDown();
doc.fontSize(11).font('Helvetica');
doc.text('1. Optimal Balance: Mid-range premium with maximum coverage');
doc.text('2. Lowest Deductible: Only $300 out of pocket in case of accident');
doc.text('3. High Limits: $750,000 liability protects family assets');
doc.text('4. Accident Forgiveness: Protects premium from increasing after first accident');
doc.text('5. Extended Rental Coverage: $75/day for 45 days ensures family mobility');
doc.text('6. Peace of Mind: Comprehensive protection for all scenarios');
doc.moveDown();

doc.fontSize(11).font('Helvetica-Bold').fillColor('#16a34a');
doc.text('Total Annual Savings vs Quote A: $360/year');
doc.text('Additional Protection vs Quote B: Worth the $70/month difference');
doc.moveDown(2);

// Contact Info
doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('CONTACT INFORMATION');
doc.fontSize(10).font('Helvetica');
doc.text('Customer Service: 1-800-INSURANCE');
doc.text('Policy Questions: quotes@insurance.com');
doc.text('Claims: 1-800-CLAIMS-24');

// Finalize PDF file
doc.end();

console.log('PDF created successfully: sample-insurance-quote.pdf');
