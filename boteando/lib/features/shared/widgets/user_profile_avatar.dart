import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:get_it/get_it.dart';
import '../../../core/network/api_service.dart';

class UserProfileAvatar extends StatelessWidget {
  final String userId;
  final String? username;
  final String? email;
  final String phone;
  final double size;
  final Color? iconColor;
  final IconData defaultIcon;
  final bool showName;
  final TextStyle? nameStyle;
  final TextStyle? phoneStyle;

  const UserProfileAvatar({
    super.key,
    required this.userId,
    this.username,
    this.email,
    required this.phone,
    this.size = 100,
    this.iconColor,
    this.defaultIcon = Icons.person,
    this.showName = false,
    this.nameStyle,
    this.phoneStyle,
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
    return username != null && username!.isNotEmpty ||
        email != null && email!.isNotEmpty;
  }

  /// Construye la URL de la foto de perfil
  String _getProfilePictureUrl() {
    final apiService = GetIt.instance<ApiService>();
    final baseUrl = apiService.baseUrl;
    final imageSize = (size * 2).toInt(); // 2x para pantallas de alta densidad
    return '$baseUrl/profile_picture/$userId?s=$imageSize';
  }

  @override
  Widget build(BuildContext context) {
    if (showName) {
      return Row(
        children: [
          _buildAvatar(),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  displayName,
                  style:
                      nameStyle ??
                      const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
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

    return _buildAvatar();
  }

  Widget _buildAvatar() {
    final radius = size / 2;
    final imageUrl = _getProfilePictureUrl();

    // Debug: imprimir URL
    print('🖼️ Loading profile picture from: $imageUrl');

    return CachedNetworkImage(
      imageUrl: imageUrl,
      imageBuilder: (context, imageProvider) =>
          CircleAvatar(radius: radius, backgroundImage: imageProvider),
      placeholder: (context, url) => CircleAvatar(
        radius: radius,
        backgroundColor: (iconColor ?? Colors.blue).withOpacity(0.2),
        child: SizedBox(
          width: size * 0.4,
          height: size * 0.4,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            color: iconColor ?? Colors.blue,
          ),
        ),
      ),
      errorWidget: (context, url, error) {
        print('⚠️ Error loading image (will retry): $error');
        // En lugar de mostrar icono por defecto, mostrar la imagen cargada
        // porque el backend siempre devuelve una imagen (foto o avatar generado)
        return CircleAvatar(
          radius: radius,
          backgroundImage: NetworkImage(imageUrl),
          onBackgroundImageError: (exception, stackTrace) {
            print('❌ Failed to load even default avatar: $exception');
          },
          child: Container(), // Fallback transparente
        );
      },
    );
  }

  // Widget _buildDefaultAvatar(double radius) {
  //   return CircleAvatar(
  //     radius: radius,
  //     backgroundColor: (iconColor ?? Colors.blue).withOpacity(0.2),
  //     child: Icon(
  //       defaultIcon,
  //       size: size * 0.5,
  //       color: iconColor ?? Colors.blue,
  //     ),
  //   );
  // }
}
