part of 'auth_bloc.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class AuthCheckRequested extends AuthEvent {}

class AuthLoginRequested extends AuthEvent {
  final String phone;
  final String password;

  const AuthLoginRequested({required this.phone, required this.password});

  @override
  List<Object> get props => [phone, password];
}

class AuthRegisterRequested extends AuthEvent {
  final String phone;
  final String password;
  final String role; // 'client' or 'driver'

  const AuthRegisterRequested({
    required this.phone,
    required this.password,
    required this.role,
  });

  @override
  List<Object> get props => [phone, password, role];
}

class AuthLogoutRequested extends AuthEvent {}

class AuthRoleSelected extends AuthEvent {
  final String role;

  const AuthRoleSelected(this.role);

  @override
  List<Object> get props => [role];
}
