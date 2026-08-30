import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'dart:convert';

import '../../utils/constants.dart';

class CoursesScreen extends StatefulWidget {
  const CoursesScreen({super.key});

  @override
  State<CoursesScreen> createState() => _CoursesScreenState();
}

class _CoursesScreenState extends State<CoursesScreen> {
  bool isLoading = true;
  List<dynamic> courses = [];

  @override
  void initState() {
    super.initState();
    fetchCourses();
  }

  Future<void> fetchCourses() async {
    setState(() => isLoading = true);
    try {
      // Backend ke /courses route ko call kar rahe hain
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/courses'),
      );

      if (response.statusCode == 200) {
        setState(() {
          courses = jsonDecode(response.body);
        });
      } else {
        showError('Failed to load courses');
      }
    } catch (e) {
      showError('Network error. Please check connection.');
    } finally {
      setState(() => isLoading = false);
    }
  }

  void showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Colors.redAccent,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text(
          'Explore Courses',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.teal))
          : courses.isEmpty
          ? const Center(
              child: Text(
                'No courses available right now.',
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
            )
          : RefreshIndicator(
              color: Colors.teal,
              onRefresh: fetchCourses,
              child: ListView.builder(
                padding: const EdgeInsets.all(16.0),
                itemCount: courses.length,
                itemBuilder: (context, index) {
                  final course = courses[index];
                  // Backend fields map karna: title, description, level, price, teacherId
                  final teacherName = course['teacherId'] != null
                      ? course['teacherId']['name']
                      : 'Unknown Ustad';
                  final price = course['price'] != null && course['price'] > 0
                      ? '₹${course['price']}'
                      : 'Free';
                  final level = course['level'] ?? 'Beginner';

                  return Card(
                    margin: const EdgeInsets.only(bottom: 20),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                    elevation: 3,
                    shadowColor: Colors.black12,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Thumbnail ya Default color box
                        Container(
                          height: 150,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: Colors.teal.shade100,
                            borderRadius: const BorderRadius.vertical(
                              top: Radius.circular(15),
                            ),
                            image: course['thumbnail'] != null
                                ? DecorationImage(
                                    image: NetworkImage(course['thumbnail']),
                                    fit: BoxFit.cover,
                                  )
                                : null,
                          ),
                          child: course['thumbnail'] == null
                              ? const Center(
                                  child: Icon(
                                    Icons.menu_book,
                                    size: 50,
                                    color: Colors.teal,
                                  ),
                                )
                              : null,
                        ),

                        Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Title aur Price
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      course['title'] ?? 'Course Title',
                                      style: const TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  Text(
                                    price,
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: price == 'Free'
                                          ? Colors.green
                                          : Colors.teal,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),

                              // Description
                              Text(
                                course['description'] ??
                                    'No description available for this course.',
                                style: const TextStyle(
                                  color: Colors.grey,
                                  height: 1.4,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 16),

                              // Ustad Name aur Level
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(
                                        Icons.person,
                                        size: 16,
                                        color: Colors.grey,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        teacherName,
                                        style: const TextStyle(
                                          color: Colors.black87,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 10,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.orange.shade100,
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Text(
                                      level,
                                      style: TextStyle(
                                        color: Colors.orange.shade800,
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
    );
  }
}
