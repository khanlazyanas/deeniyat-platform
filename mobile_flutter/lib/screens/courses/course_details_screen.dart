import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../utils/constants.dart';

class CourseDetailsScreen extends StatefulWidget {
  final String courseId;

  const CourseDetailsScreen({super.key, required this.courseId});

  @override
  State<CourseDetailsScreen> createState() => _CourseDetailsScreenState();
}

class _CourseDetailsScreenState extends State<CourseDetailsScreen> {
  bool isLoading = true;
  Map<String, dynamic>? courseData;

  @override
  void initState() {
    super.initState();
    fetchCourseDetails();
  }

  Future<void> fetchCourseDetails() async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/courses/${widget.courseId}'),
      );

      if (response.statusCode == 200) {
        setState(() {
          courseData = jsonDecode(response.body);
          isLoading = false;
        });
      } else {
        showError('Failed to load course details');
      }
    } catch (e) {
      showError('Network error. Check connection.');
    }
  }

  void showError(String message) {
    setState(() => isLoading = false);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message), backgroundColor: Colors.redAccent),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFFF8F9FA),
        body: Center(child: CircularProgressIndicator(color: Colors.teal)),
      );
    }

    if (courseData == null) {
      return const Scaffold(
        body: Center(child: Text('Course not found')),
      );
    }

    final teacherName = courseData!['teacherId'] != null ? courseData!['teacherId']['name'] : 'Unknown Ustad';
    final price = courseData!['price'] != null && courseData!['price'] > 0 ? '₹${courseData!['price']}' : 'Free';
    final level = courseData!['level'] ?? 'Beginner';

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      // Bottom Enrollment Button
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: const Offset(0, -5))],
        ),
        child: ElevatedButton(
          onPressed: () {
            // TODO: Payment Gateway / Enrollment Logic Add Hoga
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.teal,
            padding: const EdgeInsets.symmetric(vertical: 15),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: Text('Enroll Now - $price', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
        ),
      ),
      body: CustomScrollView(
        slivers: [
          // Premium Image Header
          SliverAppBar(
            expandedHeight: 250.0,
            floating: false,
            pinned: true,
            backgroundColor: Colors.teal,
            foregroundColor: Colors.white,
            flexibleSpace: FlexibleSpaceBar(
              background: courseData!['thumbnail'] != null
                  ? Image.network(courseData!['thumbnail'], fit: BoxFit.cover)
                  : Container(
                      color: Colors.teal.shade200,
                      child: const Icon(Icons.menu_book, size: 80, color: Colors.white),
                    ),
            ),
          ),
          
          // Course Details Body
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title & Level
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          courseData!['title'] ?? 'Course Title',
                          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black87),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(color: Colors.orange.shade100, borderRadius: BorderRadius.circular(20)),
                        child: Text(level, style: TextStyle(color: Colors.orange.shade800, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 15),
                  
                  // Ustad Info
                  Row(
                    children: [
                      const CircleAvatar(
                        backgroundColor: Colors.teal,
                        radius: 20,
                        child: Icon(Icons.person, color: Colors.white),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Created by', style: TextStyle(color: Colors.grey, fontSize: 12)),
                          Text(teacherName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 25),
                  const Divider(),
                  const SizedBox(height: 15),
                  
                  // Description
                  const Text('About this Course', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Text(
                    courseData!['description'] ?? 'No detailed description available.',
                    style: const TextStyle(fontSize: 15, color: Colors.black54, height: 1.5),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}