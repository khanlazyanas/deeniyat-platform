import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  // Apna local IP address dalein (localhost 10.0.2.2 hota hai emulator ke liye, physical device ke liye PC ka IP)
  static const String baseUrl = 'http://10.21.53.43:8000/api/v1/auth';

  // Helper function: Get Token
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // 1. Register User
  Future<Map<String, dynamic>> register(String name, String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'name': name, 'email': email, 'password': password}),
    );
    return _handleAuthResponse(response);
  }

  // 2. Login User
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    return _handleAuthResponse(response);
  }

  // 3. Update Profile (Multipart for Avatar matching backend upload.single('avatar'))
  Future<Map<String, dynamic>> updateProfile({String? name, File? avatarFile}) async {
    final token = await getToken();
    var request = http.MultipartRequest('PUT', Uri.parse('$baseUrl/profile'));
    request.headers.addAll({'Authorization': 'Bearer $token'});

    if (name != null) request.fields['name'] = name;
    
    if (avatarFile != null) {
      request.files.add(await http.MultipartFile.fromPath('avatar', avatarFile.path));
    }

    var streamedResponse = await request.send();
    var response = await http.Response.fromStream(streamedResponse);
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      // Update local storage if needed
      return {'success': true, 'data': data};
    } else {
      return {'success': false, 'message': jsonDecode(response.body)['message'] ?? 'Update failed'};
    }
  }

  // 4. Update Password
  Future<Map<String, dynamic>> updatePassword(String currentPassword, String newPassword) async {
    final token = await getToken();
    final response = await http.put(
      Uri.parse('$baseUrl/password'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'currentPassword': currentPassword, 'newPassword': newPassword}),
    );
    return {'success': response.statusCode == 200, 'data': jsonDecode(response.body)};
  }

  // 5. Forgot Password
  Future<Map<String, dynamic>> forgotPassword(String email) async {
    final response = await http.post(
      Uri.parse('$baseUrl/forgot-password'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email}),
    );
    return {'success': response.statusCode == 200, 'message': jsonDecode(response.body)['message']};
  }

  // Token Save Helper
  Future<Map<String, dynamic>> _handleAuthResponse(http.Response response) async {
    final data = jsonDecode(response.body);
    if (response.statusCode == 200 || response.statusCode == 201) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', data['token']);
      await prefs.setString('userId', data['_id']);
      await prefs.setString('userName', data['name']);
      await prefs.setString('userEmail', data['email']);
      await prefs.setString('userRole', data['role']);
      await prefs.setString('userAvatar', data['avatar'] ?? '');
      return {'success': true, 'user': data};
    }
    return {'success': false, 'message': data['message'] ?? 'Authentication failed'};
  }
}