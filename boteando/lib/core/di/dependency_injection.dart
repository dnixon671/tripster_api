import 'package:get_it/get_it.dart';

import '../network/api_service.dart';
import '../services/auth_storage_service.dart';
import '../services/secure_storage_service.dart';
import '../../features/auth/data/repositories/auth_repository.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';

final getIt = GetIt.instance;

Future<void> setupDependencyInjection() async {
  // Services
  getIt.registerLazySingleton<SecureStorageService>(
    () => SecureStorageService(),
  );
  getIt.registerLazySingleton<AuthStorageService>(() => AuthStorageService());

  // API Service
  final apiService = ApiService();
  apiService.initialize();
  getIt.registerLazySingleton<ApiService>(() => apiService);

  // Repositories
  getIt.registerLazySingleton<AuthRepository>(() => AuthRepository());

  // BLoCs
  getIt.registerFactory<AuthBloc>(() => AuthBloc(authRepository: getIt()));
}
