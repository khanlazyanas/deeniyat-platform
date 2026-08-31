import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../utils/constants.dart';
import '../submissions/submit_assignment_screen.dart'; // 🚀 Submit Assignment ka import add kiya

class LessonDetailsScreen extends StatefulWidget {
  final String lessonId;

  const LessonDetailsScreen({super.key, required this.lessonId});

  @override
  State<LessonDetailsScreen> createState() => _LessonDetailsScreenState();
}

class _LessonDetailsScreenState extends State<LessonDetailsScreen> {
  bool isLoading = true;
  Map<String, dynamic>? lessonData;

  @override
  void initState() {
    super.initState();
    fetchLessonDetails();
  }

  Future<void> fetchLessonDetails() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      if (token == null) return;

      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/lessons/${widget.lessonId}'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        setState(() {
          lessonData = jsonDecode(response.body);
          isLoading = false;
        });
      } else {
        showError('Failed to load lesson details');
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

    if (lessonData == null) {
      return Scaffold(
        appBar: AppBar(backgroundColor: Colors.teal, title: const Text('Error')),
        body: const Center(child: Text('Lesson not found')),
      );
    }

    final hasVideo = lessonData!['videoUrl'] != null && lessonData!['videoUrl'].toString().isNotEmpty;
    final hasPdf = lessonData!['pdfUrl'] != null && lessonData!['pdfUrl'].toString().isNotEmpty;

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text('Lesson Details', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      
      // Bottom Button for Assignment Submission
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -5))],
        ),
        child: ElevatedButton.icon(
          // 🚀 Yahan navigation logic update kar diya gaya hai
          onPressed: () {
            // Check kijiye ki lessonData aur courseId available hain
            if (lessonData != null && lessonData!['courseId'] != null) {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => SubmitAssignmentScreen(
                    lessonId: widget.lessonId,
                    courseId: lessonData!['courseId'],
                  ),
                ),
              );
            } else {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Course data not loaded properly.')),
              );
            }
          },
          icon: const Icon(Icons.upload_file),
          label: const Text('Submit Assignment', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.teal,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 15),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        ),
      ),
      
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Video Player Placeholder
            if (hasVideo)
              Container(
                width: double.infinity,
                height: 220,
                color: Colors.black,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    Image.network(
                      'https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg', // Dummy thumbnail
                      fit: BoxFit.cover,
                      width: double.infinity,
                      opacity: const AlwaysStoppedAnimation(0.5),
                      errorBuilder: (context, error, stackTrace) => Container(color: Colors.black87),
                    ),
                    IconButton(
                      icon: const Icon(Icons.play_circle_fill, size: 60, color: Colors.white),
                      onPressed: () {
                        // TODO: Implement actual video playback (url_launcher ya video_player)
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Video player will be integrated here')),
                        );
                      },
                    ),
                  ],
                ),
              )
            else
              Container(
                width: double.infinity,
                height: 150,
                color: Colors.teal.shade100,
                child: const Center(child: Icon(Icons.menu_book, size: 60, color: Colors.teal)),
              ),

            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title and Chapter number
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: Colors.teal.shade50, borderRadius: BorderRadius.circular(8)),
                        child: Text(
                          'Ch ${lessonData!['order'] ?? 1}',
                          style: TextStyle(color: Colors.teal.shade700, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          lessonData!['title'] ?? 'Untitled Lesson',
                          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.black87),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  
                  // PDF Download/View Button
                  if (hasPdf)
                    Card(
                      elevation: 0,
                      color: Colors.red.shade50,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10), side: BorderSide(color: Colors.red.shade200)),
                      child: ListTile(
                        leading: const Icon(Icons.picture_as_pdf, color: Colors.red),
                        title: const Text('Study Material (PDF)', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red)),
                        trailing: const Icon(Icons.download, color: Colors.red),
                        onTap: () {
                           // TODO: PDF Viewer logic
                        },
                      ),
                    ),
                  
                  const SizedBox(height: 20),
                  const Divider(),
                  const SizedBox(height: 15),
                  
                  // Text Content
                  const Text('Lesson Notes', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Text(
                    lessonData!['content'] ?? 'No text content available for this lesson.',
                    style: const TextStyle(fontSize: 15, color: Colors.black87, height: 1.6),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}