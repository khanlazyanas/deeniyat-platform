import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';

class CourseService {
  // Base URL for courses
  static String get baseUrl => '${ApiConstants.baseUrl}/courses';

  // Token helper for protected routes
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // 1. Get All Courses (Public route - corresponds to GET /api/v1/courses)
  Future<Map<String, dynamic>> getAllCourses() async {
    try {
      final response = await http.get(Uri.parse(baseUrl));
      
      if (response.statusCode == 200) {
        return {'success': true, 'data': jsonDecode(response.body)};
      } else {
        return {'success': false, 'message': 'Failed to fetch courses. Status: ${response.statusCode}'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  // 2. Get Course by ID (Public route - corresponds to GET /api/v1/courses/:id)
  Future<Map<String, dynamic>> getCourseById(String courseId) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/$courseId'));
      
      if (response.statusCode == 200) {
        return {'success': true, 'data': jsonDecode(response.body)};
      } else {
        return {'success': false, 'message': 'Course not found'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  // 3. Get My Enrolled Courses (Protected route - corresponds to GET /api/v1/courses/my-courses)
  Future<Map<String, dynamic>> getMyCourses() async {
    try {
      final token = await _getToken();
      if (token == null) {
        return {'success': false, 'message': 'Unauthorized. Please login again.'};
      }

      final response = await http.get(
        Uri.parse('$baseUrl/my-courses'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return {'success': true, 'data': jsonDecode(response.body)};
      } else {
        return {'success': false, 'message': 'Failed to fetch your courses'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }
}