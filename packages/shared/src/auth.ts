export type ScopeType = 'GROUP' | 'ENTITY' | 'SITE';

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  roles: string[];
  entityIds: string[];
  siteIds: string[];
  scopeType: ScopeType;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  roles: string[];
  entityIds: string[];
  siteIds: string[];
  scopeType: ScopeType;
}

export type AuthUser = AuthenticatedUser;

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export const OTTO_ROLES = {
  GROUP_ADMIN: 'GROUP_ADMIN',
  SITE_OFFICER: 'SITE_OFFICER',
  CONTRIBUTOR: 'CONTRIBUTOR',
  AUDITOR: 'AUDITOR',
} as const;

export type OttoRole = (typeof OTTO_ROLES)[keyof typeof OTTO_ROLES];
