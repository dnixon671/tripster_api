import 'package:equatable/equatable.dart';
import '../../../auth/data/models/user_model.dart';

class AuthResponse extends Equatable {
  final bool success;
  final User user;
  final String token;

  const AuthResponse({
    required this.success,
    required this.user,
    required this.token,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      success: json['success'] as bool,
      user: User.fromJson(json['user'] as Map<String, dynamic>),
      token: json['token'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {'success': success, 'user': user.toJson(), 'token': token};
  }

  @override
  List<Object?> get props => [success, user, token];
}
