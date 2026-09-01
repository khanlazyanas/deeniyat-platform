import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';

class EnrollmentService {
  static String get baseUrl => '${ApiConstants.baseUrl}/enrollments';

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // Check Enrolled Courses
  Future<Map<String, dynamic>> getMyEnrollments() async {
    try {
      final token = await _getToken();
      final response = await http.get(
        Uri.parse('$baseUrl/my-courses'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) {
        return {'success': true, 'data': jsonDecode(response.body)};
      }
      return {'success': false, 'message': 'Failed to fetch enrollments'};
    } catch (e) {
      return {'success': false, 'message': 'Network Error: $e'};
    }
  }

  // Enroll in Free Course
  Future<Map<String, dynamic>> enrollStudent(String courseId) async {
    try {
      final token = await _getToken();
      final response = await http.post(
        Uri.parse(baseUrl),
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
        body: jsonEncode({'courseId': courseId}),
      );
      if (response.statusCode == 201) return {'success': true};
      return {'success': false, 'message': jsonDecode(response.body)['message'] ?? 'Enrollment failed'};
    } catch (e) {
      return {'success': false, 'message': 'Network Error: $e'};
    }
  }
}