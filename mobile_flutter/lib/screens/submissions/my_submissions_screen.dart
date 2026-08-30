import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../utils/constants.dart';

class MySubmissionsScreen extends StatefulWidget {
  const MySubmissionsScreen({super.key});

  @override
  State<MySubmissionsScreen> createState() => _MySubmissionsScreenState();
}

class _MySubmissionsScreenState extends State<MySubmissionsScreen> {
  bool isLoading = true;
  List<dynamic> submissions = [];

  @override
  void initState() {
    super.initState();
    fetchMySubmissions();
  }

  Future<void> fetchMySubmissions() async {
    setState(() => isLoading = true);
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      if (token == null) return;

      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/submissions/my-submissions'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        setState(() {
          submissions = jsonDecode(response.body);
        });
      } else {
        showError('Failed to load submissions');
      }
    } catch (e) {
      showError('Network error. Check connection.');
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
        title: const Text('My Assignments', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.teal))
          : submissions.isEmpty
              ? _buildEmptyState()
              : RefreshIndicator(
                  color: Colors.teal,
                  onRefresh: fetchMySubmissions,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16.0),
                    itemCount: submissions.length,
                    itemBuilder: (context, index) {
                      final sub = submissions[index];
                      final courseTitle = sub['courseId'] != null ? sub['courseId']['title'] : 'Unknown Course';
                      final lessonTitle = sub['lessonId'] != null ? sub['lessonId']['title'] : 'Unknown Lesson';
                      final status = sub['status'] ?? 'Pending';
                      final bool isGraded = status == 'Graded';

                      return Card(
                        margin: const EdgeInsets.only(bottom: 16),
                        elevation: 2,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Header: Lesson & Status Tag
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          lessonTitle,
                                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          courseTitle,
                                          style: const TextStyle(color: Colors.grey, fontSize: 13),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: isGraded ? Colors.green.shade100 : Colors.orange.shade100,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      status,
                                      style: TextStyle(
                                        color: isGraded ? Colors.green.shade800 : Colors.orange.shade800,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const Divider(height: 24),
                              
                              // Submission Media Icons
                              Row(
                                children: [
                                  const Text('Submitted:', style: TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
                                  const SizedBox(width: 10),
                                  if (sub['content'] != null && sub['content'].toString().isNotEmpty)
                                    const Icon(Icons.text_snippet, color: Colors.blue, size: 20),
                                  if (sub['audioFileUrl'] != null && sub['audioFileUrl'].toString().isNotEmpty)
                                    const Padding(
                                      padding: EdgeInsets.only(left: 8.0),
                                      child: Icon(Icons.mic, color: Colors.purple, size: 20),
                                    ),
                                  if (sub['documentUrl'] != null && sub['documentUrl'].toString().isNotEmpty)
                                    const Padding(
                                      padding: EdgeInsets.only(left: 8.0),
                                      child: Icon(Icons.picture_as_pdf, color: Colors.red, size: 20),
                                    ),
                                ],
                              ),

                              // Grade and Feedback Section (If Graded)
                              if (isGraded) ...[
                                const SizedBox(height: 16),
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.grey.shade50,
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: Colors.grey.shade200),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          const Icon(Icons.stars, color: Colors.amber, size: 18),
                                          const SizedBox(width: 6),
                                          Text(
                                            'Grade: ${sub['grade']}',
                                            style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black87),
                                          ),
                                        ],
                                      ),
                                      if (sub['feedback'] != null) ...[
                                        const SizedBox(height: 8),
                                        Text(
                                          'Feedback: ${sub['feedback']}',
                                          style: const TextStyle(fontSize: 13, color: Colors.black54),
                                        ),
                                      ]
                                    ],
                                  ),
                                )
                              ]
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.assignment_turned_in, size: 80, color: Colors.grey.shade400),
          const SizedBox(height: 16),
          const Text(
            'No Assignments Yet',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.black87),
          ),
          const SizedBox(height: 8),
          const Text('You have not submitted any assignments.', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}