import 'package:dio/dio.dart';
import 'package:logger/logger.dart';

import '../../../../core/network/api_exceptions.dart';
import '../../../../core/network/api_service.dart';
import '../../../../core/services/auth_storage_service.dart';
import '../models/auth_response_model.dart';
import '../models/user_model.dart';

class AuthRepository {
  final ApiService _apiService = ApiService();
  final AuthStorageService _authStorage = AuthStorageService();
  final _logger = Logger();

  // Register user
  Future<AuthResponse> register({
    required String phone,
    required String password,
    required String role, // 'client' or 'driver'
  }) async {
    try {
      final response = await _apiService.post(
        '/auth/register',
        data: {'phone': phone, 'password': password, 'role': role},
      );

      if (response.statusCode == 201) {
        final authResponse = AuthResponse.fromJson(response.data);

        // Save token and user data
        await _authStorage.saveToken(authResponse.token);
        await _authStorage.saveUserRole(authResponse.user.role);
        await _authStorage.saveUserId(authResponse.user.id);
        await _authStorage.saveUserPhone(authResponse.user.phone);
        await _authStorage.setFirstTime(false);

        _logger.i('User registered successfully');
        return authResponse;
      } else {
        throw ApiException(
          message: 'Error al registrar usuario',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      _logger.e('Register error: ${e.message}');

      if (e.response != null) {
        final errorData = e.response!.data;
        final errorMessage = errorData['error'] ?? 'Error al registrar usuario';

        if (e.response!.statusCode == 400) {
          throw ValidationException(errorMessage);
        } else if (e.response!.statusCode == 409) {
          throw ApiException(message: errorMessage, statusCode: 409);
        }
      }

      throw NetworkException('Error de conexión. Verifica tu internet.');
    } catch (e) {
      _logger.e('Unexpected register error: $e');
      throw ApiException(message: 'Error inesperado: $e');
    }
  }

  // Login user
  Future<AuthResponse> login({
    required String phone,
    required String password,
  }) async {
    try {
      final response = await _apiService.post(
        '/auth/login',
        data: {'phone': phone, 'password': password},
      );

      if (response.statusCode == 200) {
        final authResponse = AuthResponse.fromJson(response.data);

        // Save token and user data
        await _authStorage.saveToken(authResponse.token);
        await _authStorage.saveUserRole(authResponse.user.role);
        await _authStorage.saveUserId(authResponse.user.id);
        await _authStorage.saveUserPhone(authResponse.user.phone);

        _logger.i('User logged in successfully');
        return authResponse;
      } else {
        throw ApiException(
          message: 'Error al iniciar sesión',
          statusCode: response.statusCode,
        );
      }
    } on DioException catch (e) {
      _logger.e('Login error: ${e.message}');

      if (e.response != null) {
        final errorData = e.response!.data;
        final errorMessage = errorData['error'] ?? 'Error al iniciar sesión';

        if (e.response!.statusCode == 401) {
          throw UnauthorizedException(errorMessage);
        } else if (e.response!.statusCode == 404) {
          throw ApiException(message: errorMessage, statusCode: 404);
        } else if (e.response!.statusCode == 403) {
          throw ApiException(message: errorMessage, statusCode: 403);
        }
      }

      throw NetworkException('Error de conexión. Verifica tu internet.');
    } catch (e) {
      _logger.e('Unexpected login error: $e');
      throw ApiException(message: 'Error inesperado: $e');
    }
  }

  // Logout user
  Future<void> logout() async {
    try {
      await _apiService.post('/auth/logout');
      await _authStorage.clearAuthData();
      _logger.i('User logged out successfully');
    } on DioException catch (e) {
      _logger.e('Logout error: ${e.message}');
      // Clear local data even if server request fails
      await _authStorage.clearAuthData();
    } catch (e) {
      _logger.e('Unexpected logout error: $e');
      await _authStorage.clearAuthData();
    }
  }

  // Check if user is authenticated
  Future<bool> isAuthenticated() async {
    return await _authStorage.isAuthenticated();
  }

  // Get stored user role
  Future<String?> getUserRole() async {
    return await _authStorage.getUserRole();
  }

  // Check if first time user
  Future<bool> isFirstTime() async {
    return await _authStorage.isFirstTime();
  }

  // Get current user data (from backend to get complete profile)
  Future<User?> getCurrentUser() async {
    try {
      // Primero verificar si hay token
      final token = await _authStorage.getToken();
      if (token == null) {
        return null;
      }

      // Obtener datos completos del perfil desde el backend
      try {
        final response = await _apiService.get('/profile');

        if (response.statusCode == 200 && response.data['success'] == true) {
          final userData = response.data['user'];
          return User.fromJson(userData);
        }
      } catch (e) {
        _logger.w('Error fetching profile from backend, using storage: $e');
      }

      // Fallback: usar datos del storage si falla la llamada al backend
      final userId = await _authStorage.getUserId();
      final phone = await _authStorage.getUserPhone();
      final role = await _authStorage.getUserRole();

      if (userId != null && phone != null && role != null) {
        return User(
          id: userId,
          phone: phone,
          role: role,
          isOnline: true,
          isActive: true,
          createdAt: DateTime.now(),
        );
      }
      return null;
    } catch (e) {
      _logger.e('Error getting current user: $e');
      return null;
    }
  }

  // Get stored token
  Future<String?> getToken() async {
    return await _authStorage.getToken();
  }
}
