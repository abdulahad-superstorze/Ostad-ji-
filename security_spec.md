# Security Specification for TutorDesk

## Data Invariants
1. A teacher profile `/teachers/{teacherId}` can only be read and written by the authenticated user whose `request.auth.uid == teacherId`.
2. A student `/students/{studentId}` belongs strictly to a `teacherId` equal to `request.auth.uid`. No cross-tenant reads or writes are allowed.
3. Attendance `/attendance/{attendanceId}` and payments `/payments/{paymentId}` must be tied to `request.auth.uid` through `teacherId`.
4. Strict field size validation and allowed field sets are enforced to prevent injection or resource exhaustion.

## Dirty Dozen Payloads & Invariant Protections
1. Unauthenticated read/write -> Rejected by `isSignedIn()`.
2. Teacher attempting to read another teacher's profile -> Rejected by `request.auth.uid == teacherId`.
3. Student document injection with forged `teacherId` -> Rejected by `incoming().teacherId == request.auth.uid`.
4. Student record update modifying immutable `teacherId` -> Rejected by `incoming().teacherId == existing().teacherId`.
5. Oversized string payload (e.g. 10KB student name) -> Rejected by `name.size() <= 120`.
6. Negative or NaN monthly fee -> Rejected by `monthlyFee is number && monthlyFee >= 0`.
7. Attendance entry without valid date format -> Rejected by date regex / size check.
8. Attendance entry for another teacher's student -> Rejected by `teacherId == request.auth.uid`.
9. Payment record spoofing negative amount -> Rejected by `amount is number && amount >= 0`.
10. Unbounded list query without owner filter -> Rejected by `allow list: if isSignedIn() && resource.data.teacherId == request.auth.uid`.
11. Malformed document ID injection -> Rejected by `isValidId(id)`.
12. Shadow fields added to student object during update -> Rejected by key boundary checks.
