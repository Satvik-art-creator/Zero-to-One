/**
 * Eligibility Engine — PlaceBridge (IIIT Nagpur)
 * All 4 criteria must pass for a student to be eligible.
 *
 * @param {Object} student  - Student document from MongoDB
 * @param {Object} company  - Company document from MongoDB
 * @returns {boolean}
 */
function isEligible(student, company) {
  // 1. CGPA check
  if (student.cgpa < company.minCGPA) return false;

  // 2. Backlog check — backlogPolicy false means NO backlogs allowed
  if (!company.backlogPolicy && student.backlogs > 0) return false;

  // 3. Branch check
  if (!company.allowedBranches.includes(student.branch)) return false;

  // 4. Skills check — at least one skill must match (case-insensitive)
  const studentSkillsLower = student.skills.map((s) => s.toLowerCase());
  const companySkillsLower = company.requiredSkills.map((s) => s.toLowerCase());
  const hasSkillMatch = studentSkillsLower.some((s) => companySkillsLower.includes(s));
  if (!hasSkillMatch) return false;

  return true;
}

module.exports = isEligible;
