import 'package:equatable/equatable.dart';

class User extends Equatable {
  final String id;
  final String phone;
  final String role; // 'client' or 'driver'
  final String? username;
  final String? email;
  final String? profilePhoto;
  final bool isOnline;
  final bool isActive;
  final double rating;
  final DateTime createdAt;
  final String? driverStatus; // For drivers: 'busy', 'available', 'offline'

  const User({
    required this.id,
    required this.phone,
    required this.role,
    this.username,
    this.email,
    this.profilePhoto,
    required this.isOnline,
    required this.isActive,
    this.rating = 5.0,
    required this.createdAt,
    this.driverStatus,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      phone: json['phone'] as String,
      role: json['role'] as String,
      username: json['username'] as String?,
      email: json['email'] as String?,
      profilePhoto: json['profilePhoto'] as String?,
      isOnline: json['online'] as bool? ?? json['isOnline'] as bool? ?? false,
      isActive: json['isActive'] as bool? ?? true,
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      createdAt: DateTime.parse(json['createdAt'] as String),
      driverStatus: json['driverStatus'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'phone': phone,
      'role': role,
      'username': username,
      'email': email,
      'profilePhoto': profilePhoto,
      'online': isOnline,
      'isActive': isActive,
      'rating': rating,
      'createdAt': createdAt.toIso8601String(),
      if (driverStatus != null) 'driverStatus': driverStatus,
    };
  }

  User copyWith({
    String? id,
    String? phone,
    String? role,
    String? username,
    String? email,
    String? profilePhoto,
    bool? isOnline,
    bool? isActive,
    double? rating,
    DateTime? createdAt,
    String? driverStatus,
  }) {
    return User(
      id: id ?? this.id,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      username: username ?? this.username,
      email: email ?? this.email,
      profilePhoto: profilePhoto ?? this.profilePhoto,
      isOnline: isOnline ?? this.isOnline,
      isActive: isActive ?? this.isActive,
      rating: rating ?? this.rating,
      createdAt: createdAt ?? this.createdAt,
      driverStatus: driverStatus ?? this.driverStatus,
    );
  }

  bool get isClient => role == 'client';
  bool get isDriver => role == 'driver';

  @override
  List<Object?> get props => [
    id,
    phone,
    role,
    username,
    email,
    profilePhoto,
    isOnline,
    isActive,
    rating,
    createdAt,
    driverStatus,
  ];
}
