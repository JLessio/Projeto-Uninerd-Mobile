import type { IUser } from '../../@types/index';

export const Permissions = {
  PROFILE_READ_SELF: 'profile:read:self',
  PROFILE_UPDATE_SELF: 'profile:update:self',
  PROFILE_DELETE_SELF: 'profile:delete:self',
  PROFILE_UPLOAD_PHOTO: 'profile:upload-photo:self',
  DOCTOR_LIST: 'doctor:list',
  DOCTOR_READ: 'doctor:read',
  DOCTOR_MANAGE: 'doctor:manage',
  SCHEDULE_MANAGE_SELF: 'schedule:manage:self',
  AVAILABILITY_READ: 'availability:read',
  SPECIALTY_MANAGE: 'specialty:manage',
  APPOINTMENT_LIST_SELF: 'appointment:list:self',
  APPOINTMENT_CREATE: 'appointment:create',
  APPOINTMENT_READ_SELF: 'appointment:read:self',
  APPOINTMENT_UPDATE_SELF: 'appointment:update:self',
  APPOINTMENT_CANCEL_SELF: 'appointment:cancel:self',
  APPOINTMENT_COMPLETE_SELF: 'appointment:complete:self',
  CANCELLATION_NOTIFICATION_READ_SELF: 'cancellation-notification:read:self',
  CANCELLATION_NOTIFICATION_UPDATE_SELF: 'cancellation-notification:update:self',
  ADMIN_USERS_READ: 'admin:users:read',
  ADMIN_USERS_MANAGE: 'admin:users:manage',
  ADMIN_APPOINTMENTS_MANAGE: 'admin:appointments:manage',
  ADMIN_CONFIRM_ACTION: 'admin:confirm-action',
} as const;

export type Permission = typeof Permissions[keyof typeof Permissions];
export type Role = IUser['nivel'];

const commonProfile: Permission[] = [Permissions.PROFILE_READ_SELF, Permissions.PROFILE_UPDATE_SELF, Permissions.PROFILE_UPLOAD_PHOTO];

export const rolePermissions: Readonly<Record<Role, ReadonlySet<Permission>>> = {
  paciente: new Set<Permission>([
    ...commonProfile, Permissions.PROFILE_DELETE_SELF, Permissions.DOCTOR_LIST, Permissions.DOCTOR_READ,
    Permissions.AVAILABILITY_READ, Permissions.APPOINTMENT_LIST_SELF, Permissions.APPOINTMENT_CREATE,
    Permissions.APPOINTMENT_READ_SELF, Permissions.APPOINTMENT_UPDATE_SELF, Permissions.APPOINTMENT_CANCEL_SELF,
    Permissions.CANCELLATION_NOTIFICATION_READ_SELF, Permissions.CANCELLATION_NOTIFICATION_UPDATE_SELF,
  ]),
  medico: new Set<Permission>([
    ...commonProfile, Permissions.PROFILE_DELETE_SELF, Permissions.DOCTOR_LIST, Permissions.DOCTOR_READ,
    Permissions.SCHEDULE_MANAGE_SELF, Permissions.APPOINTMENT_LIST_SELF, Permissions.APPOINTMENT_READ_SELF,
    Permissions.APPOINTMENT_UPDATE_SELF, Permissions.APPOINTMENT_CANCEL_SELF, Permissions.APPOINTMENT_COMPLETE_SELF,
    Permissions.CANCELLATION_NOTIFICATION_READ_SELF, Permissions.CANCELLATION_NOTIFICATION_UPDATE_SELF,
  ]),
  admin: new Set<Permission>([
    ...commonProfile, Permissions.DOCTOR_LIST, Permissions.DOCTOR_READ, Permissions.DOCTOR_MANAGE,
    Permissions.AVAILABILITY_READ, Permissions.SPECIALTY_MANAGE, Permissions.ADMIN_USERS_READ,
    Permissions.ADMIN_USERS_MANAGE, Permissions.ADMIN_APPOINTMENTS_MANAGE, Permissions.ADMIN_CONFIRM_ACTION,
  ]),
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.has(permission) ?? false;
}
