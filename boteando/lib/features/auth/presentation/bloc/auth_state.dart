part of 'auth_bloc.dart';

abstract class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthUnauthenticated extends AuthState {
  final bool isFirstTime;

  const AuthUnauthenticated({this.isFirstTime = false});

  @override
  List<Object?> get props => [isFirstTime];
}

class AuthRoleSelection extends AuthState {
  final String? selectedRole;

  const AuthRoleSelection({this.selectedRole});

  @override
  List<Object?> get props => [selectedRole];
}

class AuthAuthenticated extends AuthState {
  final User user;
  final String token;

  const AuthAuthenticated({required this.user, required this.token});

  @override
  List<Object> get props => [user, token];
}

class AuthError extends AuthState {
  final String message;

  const AuthError(this.message);

  @override
  List<Object> get props => [message];
}
