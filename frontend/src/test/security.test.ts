import { describe, expect, it } from 'vitest';
import { API_BASE_URL } from '../api/client';
import { normalizeRole } from '../utils/auth';
import { scoreBand } from '../utils/score';

describe('frontend security assumptions', () => {
  it('uses the API Gateway instead of direct service ports', () => {
    expect(API_BASE_URL).toContain('8765');
    expect(API_BASE_URL).not.toContain('8082');
    expect(API_BASE_URL).not.toContain('8090');
  });

  it('normalizes supported role names', () => {
    expect(normalizeRole('Admin')).toBe('ADMIN');
    expect(normalizeRole('Student')).toBe('STUDENT');
    expect(normalizeRole('teacher')).toBe('TEACHER');
  });

  it('assigns score feedback bands', () => {
    expect(scoreBand(95).label).toBe('Excellent');
    expect(scoreBand(70).label).toBe('Good Progress');
    expect(scoreBand(40).label).toBe('Needs Practice');
  });
});
