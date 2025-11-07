import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../shared/widgets/user_display_name.dart';
import '../../../shared/widgets/user_profile_avatar.dart';
import '../widgets/availability_toggle_card.dart';
import '../widgets/driver_stat_card.dart';

class DriverHomeScreen extends StatefulWidget {
  const DriverHomeScreen({super.key});

  @override
  State<DriverHomeScreen> createState() => _DriverHomeScreenState();
}

class _DriverHomeScreenState extends State<DriverHomeScreen> {
  bool _isAvailable = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          if (state is AuthAuthenticated) {
            return SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header sin AppBar
                    Padding(
                      padding: const EdgeInsets.only(bottom: 16.0),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.local_taxi,
                            color: Colors.orange,
                            size: 32,
                          ),
                          const SizedBox(width: 12),
                          const Text(
                            'Boteando',
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Welcome Card
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Row(
                          children: [
                            UserProfileAvatar(
                              userId: state.user.id,
                              username: state.user.username,
                              email: state.user.email,
                              phone: state.user.phone,
                              size: 50,
                              iconColor: Colors.orange,
                              defaultIcon: Icons.local_taxi,
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Panel de Chofer',
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  UserDisplayName(
                                    user: state.user,
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Availability Toggle
                    AvailabilityToggleCard(
                      isAvailable: _isAvailable,
                      onToggle: (value) {
                        setState(() {
                          _isAvailable = value;
                        });
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              value
                                  ? 'Ahora estás disponible para viajes'
                                  : 'Ya no estás disponible',
                            ),
                            backgroundColor: value ? Colors.green : Colors.grey,
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 20),

                    // Today's Stats
                    const Text(
                      'Estadísticas de Hoy',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: DriverStatCard(
                            icon: Icons.route,
                            title: 'Viajes',
                            value: '0',
                            color: Colors.blue,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: DriverStatCard(
                            icon: Icons.attach_money,
                            title: 'Ganancias',
                            value: '\$0',
                            color: Colors.green,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: DriverStatCard(
                            icon: Icons.access_time,
                            title: 'Horas',
                            value: '0h',
                            color: Colors.purple,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: DriverStatCard(
                            icon: Icons.star,
                            title: 'Calificación',
                            value: '5.0',
                            color: Colors.amber,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Requests
                    const Text(
                      'Solicitudes Recientes',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Center(
                          child: Column(
                            children: [
                              Icon(
                                Icons.inbox_outlined,
                                size: 48,
                                color: Colors.grey[400],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'No hay solicitudes pendientes',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                _isAvailable
                                    ? 'Esperando solicitudes...'
                                    : 'Activa disponibilidad para recibir solicitudes',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey[500],
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }
          return const Center(child: CircularProgressIndicator());
        },
      ),
    );
  }
}
