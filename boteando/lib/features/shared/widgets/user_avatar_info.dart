import 'package:flutter/material.dart';
import 'dart:convert';

class UserAvatarInfo extends StatelessWidget {
  final String? profilePhoto;
  final String? username;
  final String? email;
  final String phone;
  final double avatarRadius;
  final Color? iconColor;
  final IconData defaultIcon;
  final TextStyle? nameStyle;
  final TextStyle? phoneStyle;
  final bool showPhoneSubtitle;

  const UserAvatarInfo({
    super.key,
    this.profilePhoto,
    this.username,
    this.email,
    required this.phone,
    this.avatarRadius = 40,
    this.iconColor,
    this.defaultIcon = Icons.person,
    this.nameStyle,
    this.phoneStyle,
    this.showPhoneSubtitle = true,
  });

  /// Obtiene el nombre a mostrar con prioridad: username > email > phone
  String get displayName {
    if (username != null && username!.isNotEmpty) {
      return username!;
    }
    if (email != null && email!.isNotEmpty) {
      return email!;
    }
    return phone;
  }

  /// Verifica si debe mostrar el teléfono como subtítulo
  bool get shouldShowPhoneSubtitle {
    if (!showPhoneSubtitle) return false;
    // Solo mostrar teléfono si el nombre principal NO es el teléfono
    return username != null && username!.isNotEmpty ||
        email != null && email!.isNotEmpty;
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // Avatar
        _buildAvatar(),
        const SizedBox(width: 16),

        // Info
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                displayName,
                style:
                    nameStyle ??
                    const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              if (shouldShowPhoneSubtitle) ...[
                const SizedBox(height: 4),
                Text(
                  phone,
                  style:
                      phoneStyle ??
                      TextStyle(fontSize: 14, color: Colors.grey[600]),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAvatar() {
    // Si hay foto de perfil
    if (profilePhoto != null && profilePhoto!.isNotEmpty) {
      try {
        // Si es base64
        if (profilePhoto!.startsWith('data:image')) {
          final base64String = profilePhoto!.split(',').last;
          final bytes = base64Decode(base64String);
          return CircleAvatar(
            radius: avatarRadius,
            backgroundImage: MemoryImage(bytes),
          );
        }
        // Si es URL
        else if (profilePhoto!.startsWith('http')) {
          return CircleAvatar(
            radius: avatarRadius,
            backgroundImage: NetworkImage(profilePhoto!),
          );
        }
      } catch (e) {
        // Si falla, mostrar icono por defecto
        return _buildDefaultAvatar();
      }
    }

    // Avatar por defecto
    return _buildDefaultAvatar();
  }

  Widget _buildDefaultAvatar() {
    return CircleAvatar(
      radius: avatarRadius,
      backgroundColor: (iconColor ?? Colors.blue).withOpacity(0.2),
      child: Icon(
        defaultIcon,
        size: avatarRadius,
        color: iconColor ?? Colors.blue,
      ),
    );
  }
}
