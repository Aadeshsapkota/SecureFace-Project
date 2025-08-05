// utils/verifyMemory.js
const pendingVerifications = new Map();

export const savePendingVerification = (email, data) => {
  pendingVerifications.set(email, data);
};

export const getPendingVerification = (email) => {
  return pendingVerifications.get(email);
};

export const deletePendingVerification = (email) => {
  pendingVerifications.delete(email);
};
