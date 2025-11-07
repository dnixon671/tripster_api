class AppConstants {
  // API Configuration
  static const String baseUrl = 'http://192.168.0.108:3000';
  static const String apiBaseUrl = '$baseUrl/api';

  // Endpoints
  static const String authRegister = '$apiBaseUrl/auth/register';
  static const String authLogin = '$apiBaseUrl/auth/login';
  static const String authLogout = '$apiBaseUrl/auth/logout';
  static const String dashboardClient = '$apiBaseUrl/dashboard/client';
  static const String dashboardDriver = '$apiBaseUrl/dashboard/driver';
  static const String dashboard = '$apiBaseUrl/dashboard';

  // Storage Keys
  static const String keyToken = 'auth_token';
  static const String keyUserRole = 'user_role';
  static const String keyUserId = 'user_id';
  static const String keyUserPhone = 'user_phone';
  static const String keyIsFirstTime = 'is_first_time';

  // Timeouts
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
