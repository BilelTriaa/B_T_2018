export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  roles: string[];
  entityIds: string[];
  siteIds: string[];
  scopeType: 'GROUP' | 'ENTITY' | 'SITE';
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  roles: string[];
  entityIds: string[];
  siteIds: string[];
  scopeType: 'GROUP' | 'ENTITY' | 'SITE';
}
