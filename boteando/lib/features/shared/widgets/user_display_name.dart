import 'package:flutter/material.dart';
import '../../auth/data/models/user_model.dart';

/// Widget que muestra el nombre del usuario con prioridad:
/// 1. username (si existe)
/// 2. email (si existe)
/// 3. phone (siempre existe)
class UserDisplayName extends StatelessWidget {
  final User user;
  final TextStyle? style;
  final int? maxLines;
  final TextOverflow? overflow;

  const UserDisplayName({
    super.key,
    required this.user,
    this.style,
    this.maxLines,
    this.overflow,
  });

  String _getDisplayName() {
    // Prioridad 1: username
    if (user.username != null && user.username!.isNotEmpty) {
      return user.username!;
    }

    // Prioridad 2: email
    if (user.email != null && user.email!.isNotEmpty) {
      return user.email!;
    }

    // Prioridad 3: phone (siempre existe)
    return user.phone;
  }

  @override
  Widget build(BuildContext context) {
    return Text(
      _getDisplayName(),
      style: style,
      maxLines: maxLines,
      overflow: overflow,
    );
  }
}
