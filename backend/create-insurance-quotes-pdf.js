const PDFDocument = require('pdfkit');
const fs = require('fs');

// Create a document
const doc = new PDFDocument({ margin: 50 });

// Pipe to a file
doc.pipe(fs.createWriteStream('insurance-quotes-comparison.pdf'));

// Header
doc.fontSize(24).font('Helvetica-Bold').fillColor('#1e40af').text('AUTO INSURANCE QUOTES', { align: 'center' });
doc.fontSize(12).font('Helvetica').fillColor('#000000');
doc.moveDown(0.5);
doc.text('Comparison Report - November 2024', { align: 'center' });
doc.text('Customer: John Smith | Policy Start: December 1, 2024', { align: 'center' });
doc.moveDown(2);

// Quote 1 - SafeRide Auto Insurance
doc.fontSize(18).font('Helvetica-Bold').fillColor('#dc2626').text('Quote 1: SafeRide Premium Plan');
doc.moveDown(0.5);
doc.fontSize(11).font('Helvetica').fillColor('#000000');
doc.text('Provider: SafeRide Auto Insurance');
doc.text('Policy Number: SR-2024-7891');
doc.text('Coverage Type: Comprehensive Coverage');
doc.moveDown();

doc.fontSize(14).font('Helvetica-Bold').fillColor('#16a34a').text('Monthly Premium: $285');
doc.fontSize(14).font('Helvetica-Bold').fillColor('#dc2626').text('Deductible: $750');
doc.fontSize(11).font('Helvetica').fillColor('#000000');
doc.moveDown();

doc.fontSize(12).font('Helvetica-Bold').text('Coverage Details:');
doc.fontSize(11).font('Helvetica');
doc.text('• Bodily Injury Liability: $300,000 per person / $500,000 per accident');
doc.text('• Property Damage Liability: $100,000');
doc.text('• Collision Coverage: Included (Actual Cash Value)');
doc.text('• Comprehensive Coverage: Included');
doc.text('• Medical Payments: $25,000 per person');
doc.text('• Uninsured/Underinsured Motorist: $250,000');
doc.text('• Rental Reimbursement: $40/day (max 30 days)');
doc.text('• Roadside Assistance: Included (unlimited)');
doc.text('• Glass Coverage: $100 deductible');
doc.moveDown();

doc.fontSize(11).font('Helvetica-Bold').text('Best For: Drivers with newer vehicles seeking comprehensive protection');
doc.moveDown();

doc.fontSize(10).font('Helvetica-Bold').fillColor('#16a34a').text('✓ Pros:');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.text('  • Excellent roadside assistance with unlimited service calls');
doc.text('  • Good liability coverage limits');
doc.text('  • Includes rental reimbursement');
doc.text('  • 24/7 claims support');
doc.moveDown();

doc.fontSize(10).font('Helvetica-Bold').fillColor('#dc2626').text('✗ Cons:');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.text('  • Higher monthly premium');
doc.text('  • Higher deductible than competitors');
doc.text('  • Glass coverage has separate deductible');
doc.moveDown(2);

// Quote 2 - BudgetShield Auto
doc.fontSize(18).font('Helvetica-Bold').fillColor('#dc2626').text('Quote 2: BudgetShield Basic Plan');
doc.moveDown(0.5);
doc.fontSize(11).font('Helvetica').fillColor('#000000');
doc.text('Provider: BudgetShield Auto Insurance');
doc.text('Policy Number: BS-2024-4562');
doc.text('Coverage Type: Liability Only');
doc.moveDown();

doc.fontSize(14).font('Helvetica-Bold').fillColor('#16a34a').text('Monthly Premium: $125');
doc.fontSize(14).font('Helvetica-Bold').fillColor('#dc2626').text('Deductible: N/A (Liability Only)');
doc.fontSize(11).font('Helvetica').fillColor('#000000');
doc.moveDown();

doc.fontSize(12).font('Helvetica-Bold').text('Coverage Details:');
doc.fontSize(11).font('Helvetica');
doc.text('• Bodily Injury Liability: $50,000 per person / $100,000 per accident');
doc.text('• Property Damage Liability: $25,000');
doc.text('• Collision Coverage: Not included');
doc.text('• Comprehensive Coverage: Not included');
doc.text('• Medical Payments: $5,000 per person');
doc.text('• Uninsured/Underinsured Motorist: $50,000');
doc.text('• Rental Reimbursement: Not included');
doc.text('• Roadside Assistance: Available for +$15/month');
doc.text('• Towing: $50 per incident (2 incidents per year)');
doc.moveDown();

doc.fontSize(11).font('Helvetica-Bold').text('Best For: Budget-conscious drivers with older vehicles or those who drive infrequently');
doc.moveDown();

doc.fontSize(10).font('Helvetica-Bold').fillColor('#16a34a').text('✓ Pros:');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.text('  • Lowest monthly premium');
doc.text('  • Meets state minimum requirements');
doc.text('  • No deductible (liability only)');
doc.text('  • Flexible payment options');
doc.moveDown();

doc.fontSize(10).font('Helvetica-Bold').fillColor('#dc2626').text('✗ Cons:');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.text('  • Very limited coverage - liability only');
doc.text('  • Low liability limits may not be sufficient');
doc.text('  • No collision or comprehensive coverage');
doc.text('  • No rental car coverage included');
doc.text('  • Limited roadside assistance');

// Add new page for Quote 3
doc.addPage();

// Quote 3 - FamilyGuard Complete
doc.fontSize(18).font('Helvetica-Bold').fillColor('#dc2626').text('Quote 3: FamilyGuard Complete Care');
doc.moveDown(0.5);
doc.fontSize(11).font('Helvetica').fillColor('#000000');
doc.text('Provider: FamilyGuard Insurance Company');
doc.text('Policy Number: FG-2024-9823');
doc.text('Coverage Type: Full Coverage with Enhanced Benefits');
doc.moveDown();

doc.fontSize(14).font('Helvetica-Bold').fillColor('#16a34a').text('Monthly Premium: $235');
doc.fontSize(14).font('Helvetica-Bold').fillColor('#dc2626').text('Deductible: $500');
doc.fontSize(11).font('Helvetica').fillColor('#000000');
doc.moveDown();

doc.fontSize(12).font('Helvetica-Bold').text('Coverage Details:');
doc.fontSize(11).font('Helvetica');
doc.text('• Bodily Injury Liability: $500,000 per person / $1,000,000 per accident');
doc.text('• Property Damage Liability: $250,000');
doc.text('• Collision Coverage: Included (Replacement Cost)');
doc.text('• Comprehensive Coverage: Included');
doc.text('• Medical Payments: $50,000 per person');
doc.text('• Uninsured/Underinsured Motorist: $500,000');
doc.text('• Rental Reimbursement: $60/day (max 45 days)');
doc.text('• Roadside Assistance: Premium - Included (unlimited)');
doc.text('• Glass Coverage: Zero deductible (full replacement)');
doc.text('• Accident Forgiveness: First accident forgiven');
doc.text('• New Car Replacement: Up to 2 years');
doc.text('• Gap Coverage: Included');
doc.moveDown();

doc.fontSize(11).font('Helvetica-Bold').text('Best For: Families with multiple vehicles needing maximum protection and peace of mind');
doc.moveDown();

doc.fontSize(10).font('Helvetica-Bold').fillColor('#16a34a').text('✓ Pros:');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.text('  • Exceptional liability limits protect your assets');
doc.text('  • Lowest deductible option');
doc.text('  • Zero-deductible glass coverage');
doc.text('  • Accident forgiveness included');
doc.text('  • New car replacement guarantee');
doc.text('  • Extended rental coverage (45 days)');
doc.text('  • Gap coverage included at no extra cost');
doc.text('  • Multi-vehicle discount: 15% off for 2+ vehicles');
doc.moveDown();

doc.fontSize(10).font('Helvetica-Bold').fillColor('#dc2626').text('✗ Cons:');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.text('  • Mid-range premium (more than basic, less than premium-only)');
doc.text('  • May have more coverage than needed for older vehicles');
doc.moveDown(2);

// Comparison Summary
doc.fontSize(18).font('Helvetica-Bold').fillColor('#7c3aed').text('COMPARISON SUMMARY');
doc.moveDown();

doc.fontSize(11).font('Helvetica').fillColor('#000000');
doc.text('Quick Comparison Table:', { continued: false });
doc.moveDown(0.5);

const tableTop = doc.y;
const col1 = 50;
const col2 = 200;
const col3 = 320;
const col4 = 440;

// Table header
doc.fontSize(9).font('Helvetica-Bold');
doc.text('Feature', col1, tableTop);
doc.text('SafeRide', col2, tableTop);
doc.text('BudgetShield', col3, tableTop);
doc.text('FamilyGuard', col4, tableTop);

let rowY = tableTop + 20;
doc.fontSize(9).font('Helvetica');

// Rows
const rows = [
  ['Monthly Premium', '$285', '$125', '$235'],
  ['Deductible', '$750', 'N/A', '$500'],
  ['Liability Limits', '$300K/$500K', '$50K/$100K', '$500K/$1M'],
  ['Collision', '✓', '✗', '✓'],
  ['Comprehensive', '✓', '✗', '✓'],
  ['Rental Car', '$40/30d', '✗', '$60/45d'],
  ['Glass Coverage', '$100 ded.', '✗', '$0 ded.'],
  ['Accident Forgive', '✗', '✗', '✓']
];

rows.forEach(row => {
  doc.text(row[0], col1, rowY);
  doc.text(row[1], col2, rowY);
  doc.text(row[2], col3, rowY);
  doc.text(row[3], col4, rowY);
  rowY += 18;
});

doc.moveDown(3);

// Recommendations
doc.fontSize(16).font('Helvetica-Bold').fillColor('#7c3aed').text('PERSONALIZED RECOMMENDATIONS');
doc.moveDown();

doc.fontSize(11).font('Helvetica').fillColor('#000000');

doc.fontSize(12).font('Helvetica-Bold').fillColor('#16a34a').text('For Budget-Conscious Drivers:');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.text('→ BudgetShield Basic Plan ($125/mo) - Best if you have an older vehicle and want to meet minimum requirements.');
doc.moveDown();

doc.fontSize(12).font('Helvetica-Bold').fillColor('#16a34a').text('For Families with Multiple Vehicles:');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.text('→ FamilyGuard Complete Care ($235/mo) - RECOMMENDED for families! Offers 15% multi-vehicle discount, highest liability protection, and accident forgiveness. Best value with comprehensive benefits.');
doc.moveDown();

doc.fontSize(12).font('Helvetica-Bold').fillColor('#16a34a').text('For Single Vehicle with Newer Car:');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.text('→ SafeRide Premium Plan ($285/mo) - Good for those wanting premium roadside assistance and willing to pay slightly more.');
doc.moveDown(2);

// Final Recommendation
doc.fontSize(14).font('Helvetica-Bold').fillColor('#7c3aed').text('🏆 BEST OVERALL VALUE:');
doc.fontSize(11).font('Helvetica-Bold').fillColor('#16a34a').text('FamilyGuard Complete Care - Quote 3');
doc.fontSize(10).font('Helvetica').fillColor('#000000');
doc.text('Annual Savings vs SafeRide: $600/year');
doc.text('Additional Coverage vs BudgetShield: Worth the extra $110/month for peace of mind');
doc.moveDown(2);

// Contact Information
doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000').text('CONTACT INFORMATION');
doc.fontSize(9).font('Helvetica');
doc.text('SafeRide Auto Insurance: 1-800-SAFE-RIDE | www.saferide.com');
doc.text('BudgetShield Auto Insurance: 1-888-BUDGET-99 | www.budgetshield.com');
doc.text('FamilyGuard Insurance: 1-877-FAMILY-88 | www.familyguard.com');
doc.moveDown();
doc.fontSize(8).fillColor('#666666');
doc.text('This comparison is for informational purposes only. Rates are subject to change. Contact providers for official quotes.', { align: 'center' });

// Finalize PDF file
doc.end();

console.log('PDF created successfully: insurance-quotes-comparison.pdf');
