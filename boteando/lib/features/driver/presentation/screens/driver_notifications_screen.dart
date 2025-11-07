import 'package:flutter/material.dart';

class DriverNotificationsScreen extends StatelessWidget {
  const DriverNotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header sin AppBar
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  const Icon(
                    Icons.notifications,
                    color: Colors.orange,
                    size: 28,
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'Notificaciones',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const Spacer(),
                  TextButton(
                    onPressed: () {
                      // TODO: Marcar todas como leídas
                    },
                    child: const Text('Marcar todas'),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),

            // Lista de notificaciones
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16.0),
                children: [
                  _buildNotificationCard(
                    title: 'Nueva solicitud de viaje',
                    message: 'Un pasajero solicita un viaje desde tu ubicación',
                    time: 'Hace 5 min',
                    isRead: false,
                    icon: Icons.local_taxi,
                    color: Colors.orange,
                  ),
                  _buildNotificationCard(
                    title: 'Viaje completado',
                    message: 'Has completado exitosamente el viaje #12345',
                    time: 'Hace 1 hora',
                    isRead: true,
                    icon: Icons.check_circle,
                    color: Colors.green,
                  ),
                  _buildNotificationCard(
                    title: 'Pago recibido',
                    message: 'Se ha acreditado \$15.50 a tu cuenta',
                    time: 'Hace 2 horas',
                    isRead: true,
                    icon: Icons.attach_money,
                    color: Colors.blue,
                  ),
                  _buildNotificationCard(
                    title: 'Actualización del sistema',
                    message:
                        'Nueva versión disponible con mejoras de rendimiento',
                    time: 'Hace 1 día',
                    isRead: true,
                    icon: Icons.system_update,
                    color: Colors.grey,
                  ),

                  // Estado vacío si no hay notificaciones (comentado por ahora)
                  // _buildEmptyState(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationCard({
    required String title,
    required String message,
    required String time,
    required bool isRead,
    required IconData icon,
    required Color color,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: isRead ? 0 : 2,
      color: isRead ? null : Colors.orange.withOpacity(0.05),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.1),
          child: Icon(icon, color: color, size: 24),
        ),
        title: Text(
          title,
          style: TextStyle(
            fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
            fontSize: 16,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              message,
              style: TextStyle(color: Colors.grey[600], fontSize: 14),
            ),
            const SizedBox(height: 4),
            Text(time, style: TextStyle(color: Colors.grey[400], fontSize: 12)),
          ],
        ),
        trailing: !isRead
            ? Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: Colors.orange,
                  shape: BoxShape.circle,
                ),
              )
            : null,
        onTap: () {
          // TODO: Marcar como leída y mostrar detalles
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.notifications_none, size: 80, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text(
              'No hay notificaciones',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Recibirás notificaciones sobre tus viajes aquí',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: Colors.grey[400]),
            ),
          ],
        ),
      ),
    );
  }
}
