# Security Specification for Evently Company

## Data Invariants
1. All data (hotels, employees, attendance, etc.) must belong to the authenticated user who created it.
2. A user can only read and write their own documents.
3. Hierarchical integrity: Sub-collections (like employees) must be associated with the correct user ID.
4. Specific fields like `year` and `month` must be valid numbers within reasonable ranges.
5. `salary` and `amount` fields must be non-negative numbers.

## The "Dirty Dozen" Payloads
1. **Identity Spoofing**: Attempt to write a hotel to `/users/another_user_id/hotels/my_hotel`.
2. **Identity Spoofing (Field level)**: Attempt to create a user profile for yourself but set `isAdmin: true` (if we had admins).
3. **Ghost Field Injection**: Attempt to add `special_status: "premium"` to an employee doc.
4. **Invalid Type**: Set `salary` to `"ten thousand"` (string) instead of number.
5. **Boundary Breach**: Set `month` to `13`.
6. **Integrity Breach**: Set `empId` in an `Advance` doc to a non-existent employee ID (would need cross-doc check).
7. **Resource Poisoning**: Set `description` of an expense to a 2MB string.
8. **PII Leak**: Attempt to read the user profile of another user.
9. **Update Gap**: Update an employee but only change the `salary` field without providing other required fields (if they are required on update). 
10. **State Shortcut**: (Not applicable yet, no terminal states defined).
11. **Orphaned Write**: Create an attendance record for a hotel that doesn't exist.
12. **Timestamp Trust**: Set `createdAt` to a time in the future.

## Test Runner
Testing will be performed via the app integration.
