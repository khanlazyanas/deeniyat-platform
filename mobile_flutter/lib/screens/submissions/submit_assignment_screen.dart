import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:file_picker/file_picker.dart'; // Ensure this line is present
import '../../utils/constants.dart';
import 'dart:io';

class SubmitAssignmentScreen extends StatefulWidget {
  final String lessonId;
  final String courseId;

  const SubmitAssignmentScreen({
    super.key,
    required this.lessonId,
    required this.courseId,
  });

  @override
  State<SubmitAssignmentScreen> createState() => _SubmitAssignmentScreenState();
}

class _SubmitAssignmentScreenState extends State<SubmitAssignmentScreen> {
  final TextEditingController _contentController = TextEditingController();
  File? _selectedDocument;
  bool isSubmitting = false;

  Future<void> pickDocument() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx', 'jpg', 'png'],
    );

    if (result != null) {
      setState(() {
        _selectedDocument = File(result.files.single.path!);
      });
    }
  }

  Future<void> submitAssignment() async {
    if (_contentController.text.trim().isEmpty && _selectedDocument == null) {
      showSnackBar('Please write something or attach a file', Colors.redAccent);
      return;
    }

    setState(() => isSubmitting = true);

    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      if (token == null) return;

      var request = http.MultipartRequest(
        'POST',
        Uri.parse('${ApiConstants.baseUrl}/submissions'),
      );

      request.headers.addAll({
        'Authorization': 'Bearer $token',
      });

      // Fields attach karna
      request.fields['lessonId'] = widget.lessonId;
      request.fields['courseId'] = widget.courseId;
      if (_contentController.text.isNotEmpty) {
        request.fields['content'] = _contentController.text;
      }

      // File attach karna
      if (_selectedDocument != null) {
        request.files.add(
          await http.MultipartFile.fromPath('document', _selectedDocument!.path),
        );
      }

      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 201) {
        showSnackBar('Assignment submitted successfully!', Colors.green);
        Future.delayed(const Duration(seconds: 1), () {
          Navigator.pop(context); // Wapas lesson screen par bhejna
        });
      } else {
        showSnackBar('Failed to submit assignment', Colors.redAccent);
      }
    } catch (e) {
      showSnackBar('Network error. Check connection.', Colors.redAccent);
    } finally {
      setState(() => isSubmitting = false);
    }
  }

  void showSnackBar(String message, Color color) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message), backgroundColor: color),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text('Submit Assignment', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Your Answer',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
            ),
            const SizedBox(height: 10),
            
            // Text Input Box
            TextField(
              controller: _contentController,
              maxLines: 6,
              decoration: InputDecoration(
                hintText: 'Type your answer or feedback here...',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(15),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.all(16),
              ),
            ),
            const SizedBox(height: 20),
            
            // File Attachment Section
            const Text(
              'Attach Document (Optional)',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
            ),
            const SizedBox(height: 10),
            InkWell(
              onTap: pickDocument,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 20),
                decoration: BoxDecoration(
                  color: Colors.teal.shade50,
                  borderRadius: BorderRadius.circular(15),
                  border: Border.all(color: Colors.teal.shade200, style: BorderStyle.solid),
                ),
                child: Column(
                  children: [
                    Icon(
                      _selectedDocument == null ? Icons.upload_file : Icons.check_circle,
                      size: 40,
                      color: _selectedDocument == null ? Colors.teal : Colors.green,
                    ),
                    const SizedBox(height: 10),
                    Text(
                      _selectedDocument == null ? 'Tap to select PDF/Image' : 'File Selected',
                      style: TextStyle(
                        color: _selectedDocument == null ? Colors.teal.shade700 : Colors.green.shade700,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (_selectedDocument != null) ...[
                      const SizedBox(height: 5),
                      Text(
                        _selectedDocument!.path.split('/').last,
                        style: const TextStyle(fontSize: 12, color: Colors.black54),
                        textAlign: TextAlign.center,
                      )
                    ]
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 40),
            
            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                onPressed: isSubmitting ? null : submitAssignment,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.teal,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: isSubmitting
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text(
                        'Submit Now',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
              ),
            )
          ],
        ),
      ),
    );
  }
}