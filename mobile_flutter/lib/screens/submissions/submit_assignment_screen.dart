import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:file_picker/file_picker.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:io';
import 'dart:async';
import '../../utils/constants.dart';

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

class _SubmitAssignmentScreenState extends State<SubmitAssignmentScreen> with SingleTickerProviderStateMixin {
  final TextEditingController _contentController = TextEditingController();
  
  File? _selectedDocument;
  File? _audioFile;
  
  bool isSubmitting = false;
  
  // Audio Recording States
  late final AudioRecorder _audioRecorder;
  bool isRecording = false;
  int recordDuration = 0;
  Timer? _timer;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _audioRecorder = AudioRecorder();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _timer?.cancel();
    _audioRecorder.dispose();
    _pulseController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  // ================= FILE PICKER =================
  Future<void> pickDocument() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx', 'jpg', 'png'],
    );

    if (result != null) {
      setState(() => _selectedDocument = File(result.files.single.path!));
    }
  }

  // ================= AUDIO RECORDING =================
  Future<void> startRecording() async {
    try {
      if (await Permission.microphone.request().isGranted) {
        final Directory appDocumentsDir = await getApplicationDocumentsDirectory();
        final String filePath = '${appDocumentsDir.path}/assignment_audio_${DateTime.now().millisecondsSinceEpoch}.m4a';

        await _audioRecorder.start(const RecordConfig(), path: filePath);
        
        setState(() {
          isRecording = true;
          recordDuration = 0;
          _audioFile = null;
        });

        _timer = Timer.periodic(const Duration(seconds: 1), (Timer t) {
          setState(() => recordDuration++);
        });
      } else {
        _showPremiumSnackBar('Microphone permission is required.', isError: true);
      }
    } catch (e) {
      _showPremiumSnackBar('Could not start recording.', isError: true);
    }
  }

  Future<void> stopRecording() async {
    try {
      _timer?.cancel();
      final path = await _audioRecorder.stop();
      setState(() {
        isRecording = false;
        if (path != null) _audioFile = File(path);
      });
    } catch (e) {
      _showPremiumSnackBar('Error stopping recording.', isError: true);
    }
  }

  Future<void> deleteRecording() async {
    if (_audioFile != null && await _audioFile!.exists()) {
      await _audioFile!.delete();
    }
    setState(() {
      _audioFile = null;
      recordDuration = 0;
    });
  }

  String _formatDuration(int seconds) {
    final minutes = (seconds / 60).floor().toString().padLeft(2, '0');
    final remainingSeconds = (seconds % 60).toString().padLeft(2, '0');
    return '$minutes:$remainingSeconds';
  }

  // ================= API SUBMISSION =================
  Future<void> submitAssignment() async {
    if (_contentController.text.trim().isEmpty && _selectedDocument == null && _audioFile == null) {
      _showPremiumSnackBar('Please write an answer, attach a file, or record audio.', isError: true);
      return;
    }

    setState(() => isSubmitting = true);

    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      var request = http.MultipartRequest(
        'POST',
        Uri.parse('${ApiConstants.baseUrl}/submissions'),
      );

      request.headers.addAll({'Authorization': 'Bearer $token'});
      request.fields['lessonId'] = widget.lessonId;
      request.fields['courseId'] = widget.courseId;
      
      if (_contentController.text.isNotEmpty) {
        request.fields['content'] = _contentController.text;
      }

      // Backend expects 'document'
      if (_selectedDocument != null) {
        request.files.add(await http.MultipartFile.fromPath('document', _selectedDocument!.path));
      }

      // Backend expects 'audio'
      if (_audioFile != null) {
        request.files.add(await http.MultipartFile.fromPath('audio', _audioFile!.path));
      }

      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 201) {
        _showPremiumSnackBar('Assignment submitted successfully! 🎉', isError: false);
        Future.delayed(const Duration(seconds: 1), () => Navigator.pop(context));
      } else {
        _showPremiumSnackBar('Failed to submit assignment.', isError: true);
      }
    } catch (e) {
      _showPremiumSnackBar('Network error. Check connection.', isError: true);
    } finally {
      setState(() => isSubmitting = false);
    }
  }

  void _showPremiumSnackBar(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(isError ? Icons.error_outline_rounded : Icons.check_circle_outline_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(child: Text(message, style: const TextStyle(fontWeight: FontWeight.w500))),
          ],
        ),
        backgroundColor: isError ? const Color(0xFFE11D48) : const Color(0xFF0F766E),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  // ================= UI BUILDER =================
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Submit Assignment', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: Color(0xFF0F172A))),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          border: const Border(top: BorderSide(color: Color(0xFFF1F5F9), width: 1.5)),
          boxShadow: [BoxShadow(color: const Color(0xFF0F172A).withOpacity(0.05), blurRadius: 20, offset: const Offset(0, -10))],
        ),
        child: SafeArea(
          child: SizedBox(
            height: 56,
            child: ElevatedButton(
              onPressed: isSubmitting || isRecording ? null : submitAssignment,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0F766E),
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: isSubmitting
                  ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                  : const Text('Submit Assignment', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Written Answer', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
            const SizedBox(height: 12),
            TextField(
              controller: _contentController,
              maxLines: 5,
              style: const TextStyle(fontSize: 15, color: Color(0xFF334155), fontWeight: FontWeight.w500),
              decoration: InputDecoration(
                hintText: 'Type your answer, feedback, or notes here...',
                hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide(color: const Color(0xFFF1F5F9), width: 1.5)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide(color: const Color(0xFFF1F5F9), width: 1.5)),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: const BorderSide(color: Color(0xFF0F766E), width: 1.5)),
              ),
            ),
            
            const SizedBox(height: 32),
            const Text('Attachments', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
            const SizedBox(height: 12),

            // Document Upload Card
            GestureDetector(
              onTap: pickDocument,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: _selectedDocument == null ? Colors.white : const Color(0xFFF0FDFA),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: _selectedDocument == null ? const Color(0xFFE2E8F0) : const Color(0xFF0D9488), width: 1.5),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: _selectedDocument == null ? const Color(0xFFF1F5F9) : const Color(0xFFCCFBF1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        _selectedDocument == null ? Icons.upload_file_rounded : Icons.description_rounded, 
                        color: _selectedDocument == null ? const Color(0xFF64748B) : const Color(0xFF0D9488)
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _selectedDocument == null ? 'Upload Document' : 'Document Attached',
                            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: _selectedDocument == null ? const Color(0xFF0F172A) : const Color(0xFF0D9488)),
                          ),
                          if (_selectedDocument != null) ...[
                            const SizedBox(height: 4),
                            Text(_selectedDocument!.path.split('/').last, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)), maxLines: 1, overflow: TextOverflow.ellipsis),
                          ]
                        ],
                      ),
                    ),
                    if (_selectedDocument != null)
                      IconButton(
                        icon: const Icon(Icons.close_rounded, color: Color(0xFF94A3B8)),
                        onPressed: () => setState(() => _selectedDocument = null),
                      )
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 16),

            // Audio Recording Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isRecording ? const Color(0xFFFFF1F2) : (_audioFile != null ? const Color(0xFFF0FDFA) : Colors.white),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isRecording ? const Color(0xFFE11D48) : (_audioFile != null ? const Color(0xFF0D9488) : const Color(0xFFE2E8F0)), 
                  width: 1.5
                ),
              ),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: isRecording ? stopRecording : (_audioFile == null ? startRecording : null),
                    child: isRecording
                        ? FadeTransition(
                            opacity: _pulseController,
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(color: const Color(0xFFE11D48), borderRadius: BorderRadius.circular(12)),
                              child: const Icon(Icons.stop_rounded, color: Colors.white),
                            ),
                          )
                        : Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: _audioFile == null ? const Color(0xFFF1F5F9) : const Color(0xFFCCFBF1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              _audioFile == null ? Icons.mic_rounded : Icons.audiotrack_rounded, 
                              color: _audioFile == null ? const Color(0xFF64748B) : const Color(0xFF0D9488),
                            ),
                          ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isRecording ? 'Recording...' : (_audioFile != null ? 'Audio Recorded' : 'Record Audio'),
                          style: TextStyle(
                            fontWeight: FontWeight.w700, 
                            fontSize: 15, 
                            color: isRecording ? const Color(0xFFE11D48) : (_audioFile != null ? const Color(0xFF0D9488) : const Color(0xFF0F172A)),
                          ),
                        ),
                        if (isRecording || _audioFile != null) ...[
                          const SizedBox(height: 4),
                          Text(_formatDuration(recordDuration), style: const TextStyle(fontSize: 13, color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
                        ]
                      ],
                    ),
                  ),
                  if (_audioFile != null && !isRecording)
                    IconButton(
                      icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFE11D48)),
                      onPressed: deleteRecording,
                    )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}