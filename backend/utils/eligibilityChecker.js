/**
 * Eligibility Engine — PlaceBridge (IIIT Nagpur)
 * All 4 criteria must pass for a student to be eligible.
 *
 * @param {Object} student  - Student document from MongoDB
 * @param {Object} company  - Company document from MongoDB
 * @returns {boolean}
 */
function isEligible(student, company) {
  const reasons = [];

  // 1. CGPA check
  if (student.cgpa < company.minCGPA) {
    reasons.push(`CGPA (${student.cgpa}) is below required minimum (${company.minCGPA})`);
  }

  // 2. Backlog check
  if (!company.backlogPolicy && student.backlogs > 0) {
    reasons.push(`Company does not allow backlogs (you have ${student.backlogs})`);
  }

  // 3. Branch check
  if (!company.allowedBranches.includes(student.branch)) {
    reasons.push(`Branch (${student.branch}) is not allowed (Allowed: ${company.allowedBranches.join(', ')})`);
  }

  // 4. Skills check
  const studentSkillsLower = (student.skills || []).map((s) => s.toLowerCase().trim());
  const companySkillsLower = (company.requiredSkills || []).map((s) => s.toLowerCase().trim());
  const hasSkillMatch = studentSkillsLower.some((s) => companySkillsLower.includes(s));
  if (!hasSkillMatch && companySkillsLower.length > 0) {
    reasons.push(`You lack required skills. Required: ${company.requiredSkills.join(', ')}`);
  }

  if (reasons.length > 0) {
    return { eligible: false, reasons };
  }
  
  return { eligible: true, reasons: [] };
}

module.exports = isEligible;
