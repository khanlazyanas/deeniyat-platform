import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../utils/constants.dart';

class CourseLessonsScreen extends StatefulWidget {
  final String courseId;
  final String courseTitle;

  const CourseLessonsScreen({
    super.key,
    required this.courseId,
    required this.courseTitle,
  });

  @override
  State<CourseLessonsScreen> createState() => _CourseLessonsScreenState();
}

class _CourseLessonsScreenState extends State<CourseLessonsScreen> {
  bool isLoading = true;
  List<dynamic> lessons = [];

  @override
  void initState() {
    super.initState();
    fetchLessons();
  }

  Future<void> fetchLessons() async {
    setState(() => isLoading = true);
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      if (token == null) return;

      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/lessons/course/${widget.courseId}'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        setState(() {
          lessons = jsonDecode(response.body);
        });
      } else {
        showError('Failed to load lessons');
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
        title: Text(widget.courseTitle, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.teal))
          : lessons.isEmpty
              ? const Center(
                  child: Text('No lessons added to this course yet.', style: TextStyle(color: Colors.grey, fontSize: 16)),
                )
              : RefreshIndicator(
                  color: Colors.teal,
                  onRefresh: fetchLessons,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16.0),
                    itemCount: lessons.length,
                    itemBuilder: (context, index) {
                      final lesson = lessons[index];
                      final bool hasVideo = lesson['videoUrl'] != null && lesson['videoUrl'].toString().isNotEmpty;
                      final bool hasPdf = lesson['pdfUrl'] != null && lesson['pdfUrl'].toString().isNotEmpty;
                      final bool hasAudio = lesson['audioUrl'] != null && lesson['audioUrl'].toString().isNotEmpty;

                      return Card(
                        margin: const EdgeInsets.only(bottom: 16),
                        elevation: 1,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(15),
                          onTap: () {
                            // TODO: Navigate to Lesson Content/Player Screen
                          },
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Row(
                              children: [
                                // Chapter Number / Icon
                                Container(
                                  height: 50,
                                  width: 50,
                                  decoration: BoxDecoration(
                                    color: Colors.teal.shade50,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Center(
                                    child: Text(
                                      '${lesson['order'] ?? index + 1}',
                                      style: TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.teal.shade700,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                
                                // Lesson Title and Tags
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        lesson['title'] ?? 'Untitled Lesson',
                                        style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.black87,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      
                                      // Media Tags (Icons indicating content type)
                                      Row(
                                        children: [
                                          if (hasVideo) _buildTag(Icons.play_circle_fill, 'Video', Colors.red),
                                          if (hasPdf) _buildTag(Icons.picture_as_pdf, 'PDF', Colors.orange),
                                          if (hasAudio) _buildTag(Icons.audiotrack, 'Audio', Colors.purple),
                                          if (!hasVideo && !hasPdf && !hasAudio) 
                                            _buildTag(Icons.article, 'Reading', Colors.blue),
                                        ],
                                      )
                                    ],
                                  ),
                                ),
                                const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  Widget _buildTag(IconData icon, String label, MaterialColor color) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.shade50,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.shade200),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color.shade700),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color.shade700),
          ),
        ],
      ),
    );
  }
}