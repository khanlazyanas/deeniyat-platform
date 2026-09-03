import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:ui';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';
import 'package:simple_pip_mode/simple_pip_mode.dart';
import '../../utils/constants.dart';
import '../submissions/submit_assignment_screen.dart';
import '../../services/enrollment_service.dart';

class LessonDetailsScreen extends StatefulWidget {
  final String lessonId;
  final String courseId;

  const LessonDetailsScreen({
    super.key, 
    required this.lessonId,
    required this.courseId,
  });

  @override
  State<LessonDetailsScreen> createState() => _LessonDetailsScreenState();
}

class _LessonDetailsScreenState extends State<LessonDetailsScreen> {
  bool isLoading = true;
  Map<String, dynamic>? lessonData;
  YoutubePlayerController? _youtubeController; 
  bool _isVideoPlaying = false; 

  // 🚀 Progress Tracking Variables
  final EnrollmentService _enrollmentService = EnrollmentService();
  Timer? _progressTimer;
  int _lastSyncedTime = 0;
  bool _isAutoResumeDone = false;

  @override
  void initState() {
    super.initState();
    fetchLessonDetails();
    
    // PiP Listener setup
    SimplePipMode.pipStateStream.listen((event) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _progressTimer?.cancel();
    _youtubeController?.close(); 
    super.dispose();
  }

  String getFullImageUrl(String url) {
    if (url.isEmpty) return "";
    String cleanUrl = url.replaceAll('\\', '/');
    if (cleanUrl.startsWith("http")) return cleanUrl;
    final baseUrl = ApiConstants.baseUrl.replaceAll('/api/v1/auth', '').replaceAll('/api/v1', '');
    return "$baseUrl/$cleanUrl".replaceAll(RegExp(r'(?<!:)/+'), '/');
  }

  String? extractYoutubeId(String url) {
    try {
      if (url.contains('youtu.be/')) {
        return url.split('youtu.be/').last.split('?').first;
      } else if (url.contains('watch?v=')) {
        return url.split('watch?v=').last.split('&').first;
      } else if (url.contains('embed/')) {
        return url.split('embed/').last.split('?').first;
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  Future<void> fetchLessonDetails() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      if (token == null) return;

      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/lessons/${widget.lessonId}'),
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
      );

      // Fetch progress
      final enrollRes = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/enrollments/my-courses'),
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
      );

      int savedSeconds = 0;
      if (enrollRes.statusCode == 200) {
        final enrollments = jsonDecode(enrollRes.body);
        for (var enrollment in enrollments) {
          if ((enrollment['courseId']['_id'] ?? enrollment['courseId']) == widget.courseId) {
            if (enrollment['lessonProgress'] != null) {
              for (var progress in enrollment['lessonProgress']) {
                if (progress['lessonId'] == widget.lessonId) {
                  savedSeconds = progress['watchedSeconds'] ?? 0;
                  break;
                }
              }
            }
          }
        }
      }

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          lessonData = data;
          isLoading = false;
        });

        if (data['videoUrl'] != null && data['videoUrl'].toString().isNotEmpty) {
          final videoId = extractYoutubeId(data['videoUrl']);
          if (videoId != null) {
            _youtubeController = YoutubePlayerController(
              params: const YoutubePlayerParams(
                showControls: true,
                showFullscreenButton: true,
                mute: false,
              ),
            );
            
            _youtubeController!.loadVideoById(videoId: videoId, startSeconds: savedSeconds.toDouble());
            
            // Start Progress Tracking Tracker
            _youtubeController!.listen((event) {
               if (event.playerState == PlayerState.playing) {
                 final int currentSeconds = event.position.inSeconds;
                 
                 // Auto Resume Snackbar only once
                 if (!_isAutoResumeDone && savedSeconds > 5 && currentSeconds >= savedSeconds - 2) {
                   _isAutoResumeDone = true;
                   _showSnackBar('Resumed from ${savedSeconds ~/ 60}:${(savedSeconds % 60).toString().padLeft(2, '0')}');
                 }

                 // Sync every 5 seconds
                 if ((currentSeconds - _lastSyncedTime).abs() >= 5) {
                   _lastSyncedTime = currentSeconds;
                   _enrollmentService.updateVideoProgress(widget.courseId, widget.lessonId, currentSeconds);
                 }
               }
            });

            setState(() {}); 
          }
        }
      } else {
        showError('Failed to load lesson details');
      }
    } catch (e) {
      showError('Network error. Check connection.');
    }
  }

  void _showSnackBar(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(message, style: const TextStyle(fontWeight: FontWeight.w600)),
      backgroundColor: const Color(0xFF064E3B),
      duration: const Duration(seconds: 2),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ));
  }

  void showError(String message) {
    setState(() => isLoading = false);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Row(children: [const Icon(Icons.error_outline_rounded, color: Colors.white, size: 20), const SizedBox(width: 10), Expanded(child: Text(message, style: const TextStyle(fontWeight: FontWeight.w600)))]),
        backgroundColor: const Color(0xFFE11D48),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) return const Scaffold(backgroundColor: Color(0xFFF1F5F9), body: Center(child: CircularProgressIndicator(color: Color(0xFFD4AF37), strokeWidth: 3.0)));
    
    if (lessonData == null) {
      return Scaffold(
        backgroundColor: const Color(0xFFF1F5F9),
        appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0, leading: const BackButton(color: Color(0xFF0F172A))),
        body: const Center(child: Text('Lesson not found', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)))),
      );
    }

    final hasVideo = _youtubeController != null;
    final hasPdf = lessonData!['pdfUrl'] != null && lessonData!['pdfUrl'].toString().isNotEmpty;
    final customThumbnail = lessonData!['thumbnail'] != null && lessonData!['thumbnail'].toString().isNotEmpty 
        ? getFullImageUrl(lessonData!['thumbnail']) 
        : null;

    return PipWidget(
      pipBuilder: (context) {
        // PiP Mode me sirf video dikhani hai
        return Scaffold(
          body: hasVideo ? YoutubePlayer(controller: _youtubeController!) : const Center(child: Text('No Video')),
        );
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF1F5F9), 
        bottomNavigationBar: Container(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          decoration: BoxDecoration(
            color: Colors.white,
            border: const Border(top: BorderSide(color: Color(0xFFF1F5F9), width: 1.5)),
            boxShadow: [BoxShadow(color: const Color(0xFF064E3B).withOpacity(0.08), blurRadius: 30, offset: const Offset(0, -10))],
          ),
          child: SafeArea(
            child: SizedBox(
              height: 56,
              child: ElevatedButton(
                onPressed: () {
                  _youtubeController?.pauseVideo(); 
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => SubmitAssignmentScreen(
                        lessonId: widget.lessonId,
                        courseId: widget.courseId,
                      ),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.zero,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: Ink(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF064E3B), Color(0xFF047857)]),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: const Color(0xFF064E3B).withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 8))],
                  ),
                  child: Container(
                    alignment: Alignment.center,
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.upload_file_rounded, size: 22, color: Color(0xFFD4AF37)), 
                        SizedBox(width: 10),
                        Text('Submit Assignment', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
        body: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            SliverAppBar(
              expandedHeight: hasVideo ? 260.0 : 180.0,
              floating: false,
              pinned: true,
              backgroundColor: const Color(0xFF064E3B),
              elevation: 0,
              leading: Padding(
                padding: const EdgeInsets.all(8.0),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                    child: Container(
                      decoration: BoxDecoration(color: Colors.black.withOpacity(0.4), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white.withOpacity(0.2))),
                      child: IconButton(icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: Colors.white), onPressed: () => Navigator.pop(context)),
                    ),
                  ),
                ),
              ),
              actions: [
                // PiP Button
                if (hasVideo)
                  Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: IconButton(
                      icon: const Icon(Icons.picture_in_picture_alt_rounded, color: Colors.white),
                      onPressed: () {
                        SimplePipMode.enterPipMode();
                      },
                    ),
                  )
              ],
              flexibleSpace: FlexibleSpaceBar(
                background: hasVideo
                    ? SafeArea(
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            YoutubePlayer(controller: _youtubeController!),
                            
                            if (!_isVideoPlaying && customThumbnail != null)
                              GestureDetector(
                                onTap: () {
                                  setState(() => _isVideoPlaying = true);
                                  _youtubeController!.playVideo();
                                },
                                child: Stack(
                                  fit: StackFit.expand,
                                  children: [
                                    Image.network(customThumbnail, fit: BoxFit.cover, errorBuilder: (c,e,s) => Container(color: const Color(0xFF022C22))),
                                    Container(color: Colors.black.withOpacity(0.4)),
                                    Center(
                                      child: ClipRRect(
                                        borderRadius: BorderRadius.circular(50),
                                        child: BackdropFilter(
                                          filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
                                          child: Container(
                                            padding: const EdgeInsets.all(20),
                                            decoration: BoxDecoration(
                                              gradient: const LinearGradient(colors: [Color(0xFFD4AF37), Color(0xFFB48608)]),
                                              shape: BoxShape.circle, 
                                              border: Border.all(color: Colors.white.withOpacity(0.5), width: 2),
                                              boxShadow: [BoxShadow(color: const Color(0xFFD4AF37).withOpacity(0.5), blurRadius: 20, offset: const Offset(0, 10))],
                                            ),
                                            child: const Icon(Icons.play_arrow_rounded, size: 48, color: Colors.white),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                          ],
                        ),
                      )
                    : Stack(
                        fit: StackFit.expand,
                        children: [
                          Container(
                            decoration: const BoxDecoration(
                              gradient: LinearGradient(colors: [Color(0xFF064E3B), Color(0xFF022C22), Color(0xFF0F172A)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                            ),
                          ),
                          Opacity(
                            opacity: 0.05,
                            child: Image.network('https://www.transparenttextures.com/patterns/arabesque.png', fit: BoxFit.cover, repeat: ImageRepeat.repeat),
                          ),
                          const Center(child: Icon(Icons.menu_book_rounded, size: 80, color: Color(0xFFD4AF37))),
                        ],
                      ),
              ),
            ),
            
            SliverToBoxAdapter(
              child: Transform.translate(
                offset: const Offset(0, -24),
                child: Container(
                  decoration: const BoxDecoration(
                    color: Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.only(topLeft: Radius.circular(32), topRight: Radius.circular(32)),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(24, 32, 24, 40),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: const Color(0xFFD4AF37).withOpacity(0.15), 
                                borderRadius: BorderRadius.circular(12), 
                                border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.4))
                              ),
                              child: Text('CHAPTER ${lessonData!['order'] ?? 1}', style: const TextStyle(color: Color(0xFFB48608), fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        Text(
                          lessonData!['title'] ?? 'Untitled Lesson',
                          style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), height: 1.2, letterSpacing: -1),
                        ),
                        const SizedBox(height: 36),
                        
                        if (hasPdf) ...[
                          Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(24),
                              border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.3), width: 1.5),
                              boxShadow: [BoxShadow(color: const Color(0xFF064E3B).withOpacity(0.06), blurRadius: 24, offset: const Offset(0, 12))],
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(color: const Color(0xFF064E3B).withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
                                  child: const Icon(Icons.picture_as_pdf_rounded, color: Color(0xFF064E3B), size: 32),
                                ),
                                const SizedBox(width: 16),
                                const Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('Study Material', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xFF0F172A))),
                                      SizedBox(height: 4),
                                      Text('Download PDF notes for this lesson', style: TextStyle(fontSize: 13, color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
                                    ],
                                  ),
                                ),
                                Container(
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(colors: [Color(0xFFD4AF37), Color(0xFFB48608)]),
                                    shape: BoxShape.circle,
                                    boxShadow: [BoxShadow(color: const Color(0xFFD4AF37).withOpacity(0.4), blurRadius: 10, offset: const Offset(0, 5))]
                                  ),
                                  child: IconButton(icon: const Icon(Icons.download_rounded, color: Colors.white, size: 22), onPressed: () {}),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 48),
                        ],

                        const Text('Lesson Notes', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -0.5)),
                        const SizedBox(height: 16),
                        Text(
                          lessonData!['content'] ?? 'No text content available for this lesson.',
                          style: const TextStyle(fontSize: 16, color: Color(0xFF475569), height: 1.7, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}