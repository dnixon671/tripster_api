import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:logger/logger.dart';

class SecureStorageService {
  static final SecureStorageService _instance =
      SecureStorageService._internal();
  factory SecureStorageService() => _instance;
  SecureStorageService._internal();

  final _storage = const FlutterSecureStorage();
  final _logger = Logger();

  // Android specific options
  AndroidOptions _getAndroidOptions() =>
      const AndroidOptions(encryptedSharedPreferences: true);

  // iOS specific options
  IOSOptions _getIOSOptions() =>
      const IOSOptions(accessibility: KeychainAccessibility.first_unlock);

  // Write data
  Future<void> write({required String key, required String value}) async {
    try {
      await _storage.write(
        key: key,
        value: value,
        aOptions: _getAndroidOptions(),
        iOptions: _getIOSOptions(),
      );
      _logger.d('Stored data for key: $key');
    } catch (e) {
      _logger.e('Error writing to secure storage: $e');
      rethrow;
    }
  }

  // Read data
  Future<String?> read({required String key}) async {
    try {
      final value = await _storage.read(
        key: key,
        aOptions: _getAndroidOptions(),
        iOptions: _getIOSOptions(),
      );
      _logger.d('Read data for key: $key');
      return value;
    } catch (e) {
      _logger.e('Error reading from secure storage: $e');
      return null;
    }
  }

  // Delete data
  Future<void> delete({required String key}) async {
    try {
      await _storage.delete(
        key: key,
        aOptions: _getAndroidOptions(),
        iOptions: _getIOSOptions(),
      );
      _logger.d('Deleted data for key: $key');
    } catch (e) {
      _logger.e('Error deleting from secure storage: $e');
      rethrow;
    }
  }

  // Delete all data
  Future<void> deleteAll() async {
    try {
      await _storage.deleteAll(
        aOptions: _getAndroidOptions(),
        iOptions: _getIOSOptions(),
      );
      _logger.d('Deleted all secure storage data');
    } catch (e) {
      _logger.e('Error deleting all from secure storage: $e');
      rethrow;
    }
  }

  // Check if key exists
  Future<bool> containsKey({required String key}) async {
    try {
      final value = await read(key: key);
      return value != null;
    } catch (e) {
      _logger.e('Error checking key in secure storage: $e');
      return false;
    }
  }

  // Get all keys
  Future<Map<String, String>> readAll() async {
    try {
      final all = await _storage.readAll(
        aOptions: _getAndroidOptions(),
        iOptions: _getIOSOptions(),
      );
      _logger.d('Read all data from secure storage');
      return all;
    } catch (e) {
      _logger.e('Error reading all from secure storage: $e');
      return {};
    }
  }
}
