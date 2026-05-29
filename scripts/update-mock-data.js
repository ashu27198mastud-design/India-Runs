const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'mockDataset.json');
let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Filter out Taylor Swift
data = data.filter(c => c.name !== 'Taylor Swift');

const firstNames = ['Sarah', 'David', 'Marcus', 'Elena', 'James', 'Aisha', 'Chen', 'Michael', 'Chloe', 'Daniel'];
const lastNames = ['Jenkins', 'Chen', 'Thorne', 'Rodriguez', 'Kim', 'Patel', 'Wei', 'OConnor', 'Brooks', 'Morgan'];

let nameIndex = 0;

// Replace names (avoid Mercer and Jamie Lin if possible, just rewrite all remaining)
data = data.map(c => {
  if (c.name === 'Jamie Lin') return c; // keep this one if wanted, or change it
  
  const fName = firstNames[nameIndex % firstNames.length];
  const lName = lastNames[nameIndex % lastNames.length];
  c.name = `${fName} ${lName}`;
  nameIndex++;
  return c;
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('Mock data updated successfully.');
