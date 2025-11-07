import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../shared/widgets/user_profile_avatar.dart';
import '../../../shared/widgets/user_display_name.dart';
import 'edit_driver_profile_screen.dart';

class DriverProfileScreen extends StatelessWidget {
  const DriverProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthUnauthenticated) {
            context.go('/login');
          }
        },
        child: BlocBuilder<AuthBloc, AuthState>(
          builder: (context, state) {
            if (state is AuthAuthenticated) {
              // Debug: mostrar user ID
              print('👤 Driver ID: ${state.user.id}');
              print('📸 Profile Photo: ${state.user.profilePhoto}');

              return SafeArea(
                child: ListView(
                  padding: const EdgeInsets.all(16.0),
                  children: [
                    // Header sin AppBar
                    Padding(
                      padding: const EdgeInsets.only(bottom: 16.0),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.person,
                            color: Colors.orange,
                            size: 32,
                          ),
                          const SizedBox(width: 12),
                          const Text(
                            'Perfil',
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Profile Header
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(20.0),
                        child: Column(
                          children: [
                            // Foto de perfil
                            UserProfileAvatar(
                              userId: state.user.id,
                              username: state.user.username,
                              email: state.user.email,
                              phone: state.user.phone,
                              size: 80,
                              iconColor: Colors.orange,
                              defaultIcon: Icons.local_taxi,
                            ),
                            const SizedBox(height: 12),

                            // Nombre (con prioridad: username > email > phone)
                            UserDisplayName(
                              user: state.user,
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),

                            // Teléfono como subtítulo SOLO si el nombre principal NO es el teléfono
                            if ((state.user.username != null &&
                                    state.user.username!.isNotEmpty) ||
                                (state.user.email != null &&
                                    state.user.email!.isNotEmpty)) ...[
                              const SizedBox(height: 4),
                              Text(
                                state.user.phone,
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                            const SizedBox(height: 16),

                            // Badge de Chofer
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.orange.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text(
                                'Chofer',
                                style: TextStyle(
                                  color: Colors.orange,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Vehicle Section
                    const Text(
                      'Mi Vehículo',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildSettingsTile(
                      icon: Icons.directions_car,
                      title: 'Información del Vehículo',
                      subtitle: 'No configurado',
                      onTap: () {
                        // TODO: Navigate to vehicle info
                      },
                    ),
                    const SizedBox(height: 20),

                    // Settings Section
                    const Text(
                      'Configuración',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildSettingsTile(
                      icon: Icons.person_outline,
                      title: 'Editar Perfil',
                      onTap: () async {
                        final result = await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                const EditDriverProfileScreen(),
                          ),
                        );
                        if (result == true) {
                          // Profile updated successfully
                        }
                      },
                    ),
                    _buildSettingsTile(
                      icon: Icons.account_balance_wallet,
                      title: 'Cuenta Bancaria',
                      subtitle: 'Para recibir pagos',
                      onTap: () {
                        // TODO: Navigate to bank account
                      },
                    ),
                    _buildSettingsTile(
                      icon: Icons.notifications_outlined,
                      title: 'Notificaciones',
                      onTap: () {
                        // TODO: Navigate to notifications settings
                      },
                    ),
                    _buildSettingsTile(
                      icon: Icons.help_outline,
                      title: 'Ayuda y Soporte',
                      onTap: () {
                        // TODO: Navigate to help
                      },
                    ),
                    const SizedBox(height: 20),

                    // Logout Button
                    ElevatedButton.icon(
                      onPressed: () {
                        _showLogoutDialog(context);
                      },
                      icon: const Icon(Icons.logout),
                      label: const Text('Cerrar Sesión'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ],
                ),
              );
            }
            return const Center(child: CircularProgressIndicator());
          },
        ),
      ),
    );
  }

  Widget _buildSettingsTile({
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: Colors.orange),
        title: Text(title),
        subtitle: subtitle != null
            ? Text(subtitle, style: const TextStyle(fontSize: 12))
            : null,
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Cerrar Sesión'),
        content: const Text('¿Estás seguro que deseas cerrar sesión?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(dialogContext);
              context.read<AuthBloc>().add(AuthLogoutRequested());
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Cerrar Sesión'),
          ),
        ],
      ),
    );
  }
}
