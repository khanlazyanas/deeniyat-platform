import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';

class LessonService {
  static String get baseUrl => '${ApiConstants.baseUrl}/lessons';

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // Get all lessons for a specific course (Protected Route)
  Future<Map<String, dynamic>> getLessonsByCourse(String courseId) async {
    try {
      final token = await _getToken();
      if (token == null) {
        return {'success': false, 'message': 'Unauthorized. Please login.'};
      }

      final response = await http.get(
        Uri.parse('$baseUrl/course/$courseId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return {'success': true, 'data': jsonDecode(response.body)};
      } else {
        return {'success': false, 'message': 'Failed to load lessons'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  // Get single lesson by ID
  Future<Map<String, dynamic>> getLessonById(String lessonId) async {
    try {
      final token = await _getToken();
      final response = await http.get(
        Uri.parse('$baseUrl/$lessonId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return {'success': true, 'data': jsonDecode(response.body)};
      } else {
        return {'success': false, 'message': 'Lesson not found'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }
}