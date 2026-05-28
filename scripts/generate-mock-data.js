const fs = require('fs');
const path = require('path');

const firstNames = ["Alex", "Jamie", "Samir", "Taylor", "Jordan", "Casey", "Morgan", "Riley", "Drew", "Avery", "Chris", "Pat", "Dakota", "Skyler", "Rowan", "Quinn", "Peyton", "Cameron", "Blake", "Reese"];
const lastNames = ["Mercer", "Lin", "Patel", "Swift", "Lee", "Smith", "Davies", "Kim", "Carter", "Johnson", "Williams", "Brown", "Garcia", "Martinez", "Rodriguez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson"];

const roles = [
  { title: "Junior GRC Analyst", expRange: [1, 3], skills: ["Control Testing", "Client Communication", "Risk Assessments"], baseRisk: 20 },
  { title: "Information Security Analyst", expRange: [2, 5], skills: ["Control Testing", "ISO 27001", "Client Communication", "PCI-DSS"], baseRisk: 15 },
  { title: "GRC Analyst", expRange: [3, 6], skills: ["SOC 2", "Vendor Risk", "Audit Report Writing", "Control Testing"], baseRisk: 15 },
  { title: "Senior GRC Analyst", expRange: [5, 9], skills: ["SOC 2", "ISO 27001", "Vendor Risk", "BFSI", "Control Testing", "Stakeholder Management"], baseRisk: 10 },
  { title: "Lead GRC Consultant", expRange: [7, 12], skills: ["SOC 2", "ISO 27001", "Vendor Risk Management", "Audit Report Writing", "Stakeholder Management", "BFSI", "NIST CSF"], baseRisk: 10 },
  { title: "Cybersecurity Risk Manager", expRange: [8, 15], skills: ["SOC 2", "ISO 27001", "Vendor Risk", "BFSI", "Control Testing", "Client Communication", "Audit Report Writing", "Stakeholder Management"], baseRisk: 30 }, // High risk due to potential overfit/flight
  { title: "Director of Compliance", expRange: [12, 20], skills: ["SOC 2", "ISO 27001", "Vendor Risk", "BFSI", "Stakeholder Management", "Board Reporting"], baseRisk: 80 }, // Flight risk for senior roles
  { title: "Internal Auditor", expRange: [4, 15], skills: ["Audit Report Writing", "Stakeholder Management", "SOX Compliance", "Control Testing"], baseRisk: 25 },
  { title: "Compliance Specialist", expRange: [2, 7], skills: ["Healthcare Compliance", "HIPAA", "HITRUST", "Client Communication"], baseRisk: 40 }, // Wrong industry
  { title: "Security Consultant", expRange: [2, 6], skills: ["SOC 2", "ISO 27001", "Vendor Risk", "Control Testing", "Client Communication"], baseRisk: 20 }
];

const locations = ["New York, NY", "Austin, TX", "Chicago, IL", "San Francisco, CA", "Remote", "Boston, MA", "Seattle, WA", "Denver, CO", "Atlanta, GA", "Miami, FL", "London, UK", "Toronto, ON"];

const projects = [
  "Led SOC 2 Type II audit for a major payment processor",
  "Implemented ISO 27001 ISMS for a regional bank",
  "Conducted 50+ vendor risk assessments last quarter",
  "Automated control testing using Python scripts",
  "Managed annual SOX ITGC audits",
  "Developed third-party risk management lifecycle",
  "Assisted with vendor risk",
  "Helped with SOC 2",
  "Led HIPAA gap assessment for hospital network",
  "Managed third-party vendor risk program for a top 10 bank",
  "Streamlined SOC 2 evidence collection",
  "Drafted ISO 27001 Statement of Applicability for a SaaS startup",
  "Authored comprehensive audit reports for the Board of Directors",
  "Tested financial and IT controls across 20 branches",
  "Performed SOC 2 readiness assessments for 5 startups",
  "Tested ISO 27001 controls for a regional credit union",
  "Built global GRC program from scratch",
  "Managed a $5M compliance budget"
];

const activitySignals = [
  "Active contributor to GRC open source frameworks.",
  "Transitioning from a pure technical pentesting role to GRC. High trajectory.",
  "Stable tenure. Very strong audit fundamentals.",
  "Keyword matched perfectly but resume seems heavily tailored (overfit).",
  "Looking to pivot into BFSI. Strong communication skills.",
  "Consistently promoted within a leading financial institution. Strong internal mobility signals.",
  "Recent certifications in Cloud Security. No direct BFSI.",
  "Extensive experience in traditional bank audits, currently upskilling in modern cloud compliance frameworks.",
  "Fast-tracked at a Big 4 consulting firm. Very high exposure to diverse clients.",
  "Overqualified for a Senior Analyst role. Currently managing a large team.",
  "Regular speaker at local ISACA chapter events.",
  "Just completed CISSP certification.",
  "Frequent job hopper (4 jobs in 3 years).",
  "Returned to workforce after a 2-year break, highly motivated.",
  "Internal transfer from IT support to security compliance."
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCandidate(id) {
  const role = getRandomItem(roles);
  const exp = getRandomInt(role.expRange[0], role.expRange[1]);
  
  // Scramble skills slightly to add variance
  const numSkills = getRandomInt(Math.max(3, role.skills.length - 2), role.skills.length + 1);
  const shuffledSkills = [...role.skills].sort(() => 0.5 - Math.random());
  const finalSkills = Array.from(new Set(shuffledSkills.slice(0, numSkills)));
  
  // Guarantee unique names
  const fName = firstNames[id % firstNames.length];
  const lName = lastNames[Math.floor(id / firstNames.length) % lastNames.length];

  return {
    id: `c${id}`,
    name: `${fName} ${lName}`,
    currentRole: role.title,
    totalExperienceYears: exp,
    location: getRandomItem(locations),
    skills: finalSkills,
    activitySignals: getRandomItem(activitySignals),
    projects: [getRandomItem(projects), getRandomItem(projects)]
  };
}

const dataset = [];
for (let i = 1; i <= 100; i++) {
  dataset.push(generateCandidate(i));
}

// Inject our specific test cases to ensure the demo script still works perfectly
dataset[0] = {
  "id": "c1",
  "name": "Alex Mercer",
  "currentRole": "Lead GRC Consultant",
  "totalExperienceYears": 8,
  "location": "New York, NY",
  "skills": ["SOC 2", "ISO 27001", "Vendor Risk Management", "Audit Report Writing", "Stakeholder Management", "BFSI", "NIST CSF"],
  "activitySignals": "Active contributor to GRC open source frameworks, recently published an article on SOC 2 compliance for fintechs.",
  "projects": ["Led SOC 2 Type II audit for a major payment processor", "Implemented ISO 27001 ISMS for a regional bank"]
};

dataset[1] = {
  "id": "c2",
  "name": "Jamie Lin",
  "currentRole": "Information Security Analyst",
  "totalExperienceYears": 4,
  "location": "Austin, TX",
  "skills": ["Control Testing", "ISO 27001", "Risk Assessments", "Client Communication", "PCI-DSS"],
  "activitySignals": "Transitioning from a pure technical pentesting role to GRC. High trajectory, very fast learner.",
  "projects": ["Conducted 50+ vendor risk assessments last quarter", "Automated control testing using Python scripts"]
};

dataset[2] = {
  "id": "c3",
  "name": "Taylor Swift",
  "currentRole": "Cybersecurity Risk Manager",
  "totalExperienceYears": 9,
  "location": "San Francisco, CA",
  "skills": ["SOC 2", "ISO 27001", "Vendor Risk", "BFSI", "Control Testing", "Client Communication", "Audit Report Writing", "Stakeholder Management"],
  "activitySignals": "Keyword matched perfectly. However, resume seems heavily tailored (overfit). Previous roles were primarily in basic IT support until recently.",
  "projects": ["Assisted with vendor risk", "Helped with SOC 2"]
};

const outputPath = path.join(__dirname, '../src/data/mockDataset.json');
fs.writeFileSync(outputPath, JSON.stringify(dataset, null, 2));

console.log(`Successfully generated 100 mock candidates at ${outputPath}`);
