import { ExhibitionProduct, StudentAccount } from '../types';

export function isProductOwnedByStudent(
  product: ExhibitionProduct | null | undefined,
  loggedInStudent: StudentAccount | null,
  studentIdentity?: { name: string; className: string } | null
): boolean {
  if (!product) return false;

  if (loggedInStudent) {
    if (product.submittedByStudentId && product.submittedByStudentId === loggedInStudent.id) {
      return true;
    }
    if (
      product.groupCode &&
      loggedInStudent.username &&
      product.groupCode.trim().toUpperCase() === `BIO-${loggedInStudent.username.trim().toUpperCase()}`
    ) {
      return true;
    }
    const accName = loggedInStudent.name?.trim().toLowerCase();
    const prodAuthor = product.author?.trim().toLowerCase() || '';
    if (accName && accName.length >= 2 && prodAuthor.includes(accName)) {
      return true;
    }
  }

  if (studentIdentity?.name) {
    const guestId = `guest:${studentIdentity.name.trim().toLowerCase()}`;
    if (product.submittedByStudentId === guestId) {
      return true;
    }
  }

  return false;
}
