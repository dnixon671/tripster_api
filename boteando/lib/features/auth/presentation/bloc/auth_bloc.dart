import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:logger/logger.dart';

import '../../data/models/user_model.dart';
import '../../data/repositories/auth_repository.dart';
import '../../../../core/network/api_exceptions.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository authRepository;
  final _logger = Logger();

  AuthBloc({required this.authRepository}) : super(AuthInitial()) {
    on<AuthCheckRequested>(_onAuthCheckRequested);
    on<AuthLoginRequested>(_onAuthLoginRequested);
    on<AuthRegisterRequested>(_onAuthRegisterRequested);
    on<AuthLogoutRequested>(_onAuthLogoutRequested);
    on<AuthRoleSelected>(_onAuthRoleSelected);
  }

  Future<void> _onAuthCheckRequested(
    AuthCheckRequested event,
    Emitter<AuthState> emit,
  ) async {
    try {
      emit(AuthLoading());

      // Check if first time
      final isFirstTime = await authRepository.isFirstTime();
      if (isFirstTime) {
        emit(const AuthUnauthenticated(isFirstTime: true));
        return;
      }

      // Check if authenticated
      final isAuthenticated = await authRepository.isAuthenticated();
      if (!isAuthenticated) {
        emit(const AuthUnauthenticated(isFirstTime: false));
        return;
      }

      // Get current user
      final user = await authRepository.getCurrentUser();
      if (user != null) {
        final token = await authRepository.getToken() ?? '';
        emit(AuthAuthenticated(user: user, token: token));
      } else {
        emit(const AuthUnauthenticated(isFirstTime: false));
      }
    } catch (e) {
      _logger.e('Auth check error: $e');
      emit(const AuthUnauthenticated(isFirstTime: false));
    }
  }

  Future<void> _onAuthLoginRequested(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    try {
      emit(AuthLoading());

      final authResponse = await authRepository.login(
        phone: event.phone,
        password: event.password,
      );

      emit(
        AuthAuthenticated(user: authResponse.user, token: authResponse.token),
      );
    } on UnauthorizedException catch (e) {
      _logger.e('Login unauthorized: $e');
      emit(AuthError(e.message));
    } on ApiException catch (e) {
      _logger.e('Login API error: $e');
      emit(AuthError(e.message));
    } on NetworkException catch (e) {
      _logger.e('Login network error: $e');
      emit(AuthError(e.message));
    } catch (e) {
      _logger.e('Login unexpected error: $e');
      emit(const AuthError('Error inesperado al iniciar sesión'));
    }
  }

  Future<void> _onAuthRegisterRequested(
    AuthRegisterRequested event,
    Emitter<AuthState> emit,
  ) async {
    try {
      emit(AuthLoading());

      final authResponse = await authRepository.register(
        phone: event.phone,
        password: event.password,
        role: event.role,
      );

      emit(
        AuthAuthenticated(user: authResponse.user, token: authResponse.token),
      );
    } on ValidationException catch (e) {
      _logger.e('Register validation error: $e');
      emit(AuthError(e.message));
    } on ApiException catch (e) {
      _logger.e('Register API error: $e');
      emit(AuthError(e.message));
    } on NetworkException catch (e) {
      _logger.e('Register network error: $e');
      emit(AuthError(e.message));
    } catch (e) {
      _logger.e('Register unexpected error: $e');
      emit(const AuthError('Error inesperado al registrar usuario'));
    }
  }

  Future<void> _onAuthLogoutRequested(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    try {
      emit(AuthLoading());
      await authRepository.logout();
      emit(const AuthUnauthenticated(isFirstTime: false));
    } catch (e) {
      _logger.e('Logout error: $e');
      emit(const AuthError('Error al cerrar sesión'));
    }
  }

  Future<void> _onAuthRoleSelected(
    AuthRoleSelected event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthRoleSelection(selectedRole: event.role));
  }
}
