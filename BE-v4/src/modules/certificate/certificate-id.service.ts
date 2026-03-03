import { getNextSequence } from "../../counter/counter.service";

export const generateCourseCertificateId = async () => {
  const year = new Date().getFullYear().toString().slice(-2); // 25

  const counterName = `COURSE_${year}`;

  const nextSequence = await getNextSequence(counterName);

  const paddedSequence = nextSequence.toString().padStart(5, "0");

  return `CNTTCPP${year}${paddedSequence}`;
};

export const generateInternshipCertificateId = async () => {
  const year = new Date().getFullYear();

  const stateCode = "TN";   // configurable
  const branchCode = "02";  // configurable

  const counterName = `INTERNSHIP_${stateCode}_${branchCode}_${year}`;

  const nextSequence = await getNextSequence(counterName);

  const paddedSequence = nextSequence.toString().padStart(7, "0");

  return `UDYAM-${stateCode}-${branchCode}-${paddedSequence}`;
};