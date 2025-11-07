import AdminActivityLog from "../models/AdminActivityLog.js";

// crear registro de actividad de administrador para la actualización de roles de usuario
export const logRoleUpdate = async ({
  adminId,
  targetUserId,
  oldRole,
  newRole,
  ipAddress,
  userAgent
}) => {
  return await AdminActivityLog.create({
    adminId,
    action: 'role_update',
    targetType: 'user',
    targetId: targetUserId,
    ipAddress,
    userAgent,
    changes: [{
      field: 'role',
      oldValue: oldRole,
      newValue: newRole
    }],
    metadata: {
      system: 'user-management',
      actionSource: 'admin-dashboard'
    }
  });
};

// Guardar el registro de actividad (si es necesario)
export const logAdminActivity = async (activityLog) => {
  try {
    const log = new AdminActivityLog(activityLog);
    await log.save();
  } catch (error) {
    console.error('Error al guardar el registro de actividad del administrador:', error);
  }
  return activityLog;
}
