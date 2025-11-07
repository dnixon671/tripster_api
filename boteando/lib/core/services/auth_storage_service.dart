import '../constants/app_constants.dart';
import 'secure_storage_service.dart';

class AuthStorageService {
  final SecureStorageService _storage = SecureStorageService();

  // Save auth token
  Future<void> saveToken(String token) async {
    await _storage.write(key: AppConstants.keyToken, value: token);
  }

  // Get auth token
  Future<String?> getToken() async {
    return await _storage.read(key: AppConstants.keyToken);
  }

  // Save user role
  Future<void> saveUserRole(String role) async {
    await _storage.write(key: AppConstants.keyUserRole, value: role);
  }

  // Get user role
  Future<String?> getUserRole() async {
    return await _storage.read(key: AppConstants.keyUserRole);
  }

  // Save user ID
  Future<void> saveUserId(String userId) async {
    await _storage.write(key: AppConstants.keyUserId, value: userId);
  }

  // Get user ID
  Future<String?> getUserId() async {
    return await _storage.read(key: AppConstants.keyUserId);
  }

  // Save user phone
  Future<void> saveUserPhone(String phone) async {
    await _storage.write(key: AppConstants.keyUserPhone, value: phone);
  }

  // Get user phone
  Future<String?> getUserPhone() async {
    return await _storage.read(key: AppConstants.keyUserPhone);
  }

  // Save first time flag
  Future<void> setFirstTime(bool isFirstTime) async {
    await _storage.write(
      key: AppConstants.keyIsFirstTime,
      value: isFirstTime.toString(),
    );
  }

  // Check if first time
  Future<bool> isFirstTime() async {
    final value = await _storage.read(key: AppConstants.keyIsFirstTime);
    return value == null || value == 'true';
  }

  // Check if user is authenticated
  Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  // Clear all auth data
  Future<void> clearAuthData() async {
    await _storage.delete(key: AppConstants.keyToken);
    await _storage.delete(key: AppConstants.keyUserRole);
    await _storage.delete(key: AppConstants.keyUserId);
    await _storage.delete(key: AppConstants.keyUserPhone);
  }

  // Clear all data including first time flag
  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
