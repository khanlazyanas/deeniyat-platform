import 'dart:io';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../auth/login_screen.dart';
import '../../services/auth_service.dart';
import '../../utils/constants.dart';
import '../payments/transaction_history_screen.dart'; // 🚀 NAYA IMPORT

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final AuthService _authService = AuthService();
  
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _currentPasswordController = TextEditingController();
  final TextEditingController _newPasswordController = TextEditingController();

  bool isLoadingData = true;
  bool isUpdatingProfile = false;
  bool isUpdatingPassword = false;
  
  String avatarUrl = "";
  File? avatarFile;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    super.dispose();
  }

  String getFullImageUrl(String url) {
    if (url.isEmpty) return "";
    String cleanUrl = url.replaceAll('\\', '/');
    if (cleanUrl.startsWith("http")) return cleanUrl;
    final baseUrl = ApiConstants.baseUrl.replaceAll('/api/v1/auth', '').replaceAll('/api/v1', '');
    String finalUrl = "$baseUrl/$cleanUrl";
    return finalUrl.replaceAll(RegExp(r'(?<!:)/+'), '/');
  }

  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _nameController.text = prefs.getString('userName') ?? '';
      _emailController.text = prefs.getString('userEmail') ?? '';
      avatarUrl = prefs.getString('userAvatar') ?? '';
      isLoadingData = false;
    });
  }

  Future<void> _pickImage() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.image,
      allowMultiple: false,
    );

    if (result != null && result.files.single.path != null) {
      File file = File(result.files.single.path!);
      
      final bytes = file.lengthSync();
      if (bytes > 2 * 1024 * 1024) {
        _showMessage("Image size must be less than 2MB.", isError: true);
        return;
      }

      setState(() {
        avatarFile = file;
      });
    }
  }

  Future<void> _updateProfile() async {
    if (_nameController.text.trim().isEmpty) {
      _showMessage("Name cannot be empty", isError: true);
      return;
    }

    setState(() => isUpdatingProfile = true);

    try {
      final response = await _authService.updateProfile(
        name: _nameController.text.trim(),
        avatarFile: avatarFile,
      );

      if (response['success']) {
        _showMessage("Profile updated successfully! ✨");
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('userName', response['data']['name']);
        if (response['data']['avatar'] != null) {
          await prefs.setString('userAvatar', response['data']['avatar']);
          setState(() {
            avatarUrl = response['data']['avatar'];
            avatarFile = null; 
          });
        }
      } else {
        _showMessage(response['message'] ?? "Failed to update profile", isError: true);
      }
    } catch (e) {
      _showMessage("Network Error. Check server connection.", isError: true);
    } finally {
      setState(() => isUpdatingProfile = false);
    }
  }

  Future<void> _updatePassword() async {
    final currentPass = _currentPasswordController.text;
    final newPass = _newPasswordController.text;

    if (currentPass.isEmpty || newPass.isEmpty) {
      _showMessage("Please fill both password fields", isError: true);
      return;
    }
    
    if (newPass.length < 6) {
      _showMessage("New password must be at least 6 characters long.", isError: true);
      return;
    }

    setState(() => isUpdatingPassword = true);

    try {
      final response = await _authService.updatePassword(currentPass, newPass);

      if (response['success']) {
        _showMessage("Password changed successfully! 🔒");
        _currentPasswordController.clear();
        _newPasswordController.clear();
      } else {
        _showMessage("Failed to change password. Check current password.", isError: true);
      }
    } catch (e) {
      _showMessage("Network Error. Check server connection.", isError: true);
    } finally {
      setState(() => isUpdatingPassword = false);
    }
  }

  void _showMessage(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(isError ? Icons.error_outline : Icons.check_circle_outline, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(child: Text(message, style: const TextStyle(fontWeight: FontWeight.w600))),
          ],
        ),
        backgroundColor: isError ? const Color(0xFFE11D48) : const Color(0xFF064E3B),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  void _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
        (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoadingData) {
      return const Scaffold(
        backgroundColor: Color(0xFFF1F5F9),
        body: Center(child: CircularProgressIndicator(color: Color(0xFFD4AF37), strokeWidth: 3.0)),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text(
          'Profile & Security', 
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 22, letterSpacing: -0.5)
        ),
        backgroundColor: Colors.transparent,
        foregroundColor: const Color(0xFFFDE047),
        elevation: 0,
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            onPressed: _logout,
            tooltip: 'Logout',
          ),
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Column(
          children: [
            // 🌟 ULTRA PREMIUM HEADER
            Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.bottomCenter,
              children: [
                Container(
                  height: 240,
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF064E3B), Color(0xFF022C22), Color(0xFF0F172A)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      Opacity(
                        opacity: 0.05,
                        child: Image.network(
                          'https://www.transparenttextures.com/patterns/arabesque.png',
                          fit: BoxFit.cover,
                          repeat: ImageRepeat.repeat,
                        ),
                      ),
                      Positioned(
                        top: -50, right: -30,
                        child: Container(
                          width: 150, height: 150,
                          decoration: BoxDecoration(shape: BoxShape.circle, color: const Color(0xFFD4AF37).withOpacity(0.15)),
                          child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 50, sigmaY: 50), child: Container(color: Colors.transparent)),
                        ),
                      ),
                      Positioned(
                        bottom: -80, left: -40,
                        child: Container(
                          width: 200, height: 200,
                          decoration: BoxDecoration(shape: BoxShape.circle, color: const Color(0xFF10B981).withOpacity(0.15)),
                          child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 50, sigmaY: 50), child: Container(color: Colors.transparent)),
                        ),
                      ),
                    ],
                  ),
                ),
                Positioned(
                  bottom: -60,
                  child: GestureDetector(
                    onTap: _pickImage,
                    child: Stack(
                      alignment: Alignment.bottomRight,
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFFD4AF37), width: 4), 
                            boxShadow: [
                              BoxShadow(color: const Color(0xFFD4AF37).withOpacity(0.3), blurRadius: 25, offset: const Offset(0, 10))
                            ],
                          ),
                          child: CircleAvatar(
                            radius: 64,
                            backgroundColor: const Color(0xFF022C22),
                            backgroundImage: avatarFile != null 
                                ? FileImage(avatarFile!) as ImageProvider
                                : (avatarUrl.isNotEmpty ? NetworkImage(getFullImageUrl(avatarUrl)) : null),
                            child: (avatarFile == null && avatarUrl.isEmpty)
                                ? Text(
                                    _nameController.text.isNotEmpty ? _nameController.text[0].toUpperCase() : 'A', // 🚀 NAYA FIX: 'U' ko 'A' se replace kiya, for Anas
                                    style: const TextStyle(fontSize: 48, fontWeight: FontWeight.w900, color: Color(0xFFD4AF37)),
                                  )
                                : null,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(colors: [Color(0xFFD4AF37), Color(0xFFB48608)]),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 3),
                            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 10, offset: const Offset(0, 5))],
                          ),
                          child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 20),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 80),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionTitle('Personal Information'),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: _cardDecoration(),
                    child: Column(
                      children: [
                        _buildTextField(
                          label: 'Legal Name',
                          controller: _nameController,
                          icon: Icons.person_outline_rounded,
                        ),
                        const SizedBox(height: 20),
                        _buildTextField(
                          label: 'Email Address (Identity Bound)',
                          controller: _emailController,
                          icon: Icons.email_outlined,
                          isReadOnly: true,
                        ),
                        const SizedBox(height: 32),
                        SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton(
                            onPressed: isUpdatingProfile ? null : _updateProfile,
                            style: ElevatedButton.styleFrom(
                              padding: EdgeInsets.zero,
                              elevation: 0,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            child: Ink(
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(colors: [Color(0xFFD4AF37), Color(0xFFB48608)]),
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [BoxShadow(color: const Color(0xFFD4AF37).withOpacity(0.4), blurRadius: 15, offset: const Offset(0, 8))],
                              ),
                              child: Container(
                                alignment: Alignment.center,
                                child: isUpdatingProfile
                                    ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                                    : const Text('UPDATE PROFILE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, letterSpacing: 1.2, fontSize: 15)),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 40),

                  // 🚀 NAYA SECTION: BILLING & PAYMENTS
                  _buildSectionTitle('Billing & Payments'),
                  const SizedBox(height: 16),
                  Container(
                    decoration: _cardDecoration(),
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        borderRadius: BorderRadius.circular(28),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => const TransactionHistoryScreen()),
                          );
                        },
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFD4AF37).withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.4)),
                                ),
                                child: const Icon(Icons.receipt_long_rounded, color: Color(0xFFB48608), size: 28),
                              ),
                              const SizedBox(width: 16),
                              const Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Transaction History', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xFF0F172A))),
                                    SizedBox(height: 4),
                                    Text('View your past payments and receipts', style: TextStyle(fontSize: 13, color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
                                  ],
                                ),
                              ),
                              const Icon(Icons.arrow_forward_ios_rounded, color: Color(0xFFCBD5E1), size: 18),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 40),

                  _buildSectionTitle('Security & Authentication'),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: _cardDecoration(),
                    child: Column(
                      children: [
                        _buildTextField(
                          label: 'Current Password',
                          controller: _currentPasswordController,
                          icon: Icons.lock_outline_rounded,
                          isObscure: true,
                        ),
                        const SizedBox(height: 20),
                        _buildTextField(
                          label: 'New Password',
                          controller: _newPasswordController,
                          icon: Icons.lock_reset_rounded,
                          isObscure: true,
                        ),
                        const SizedBox(height: 32),
                        SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton(
                            onPressed: isUpdatingPassword ? null : _updatePassword,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFBE123C), 
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              elevation: 0,
                              shadowColor: Colors.transparent,
                            ),
                            child: isUpdatingPassword
                                ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                                : const Text('CHANGE PASSWORD', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.2, fontSize: 15)),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 60),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -0.5),
    );
  }

  BoxDecoration _cardDecoration() {
    return BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(28),
      border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.3), width: 1.5),
      boxShadow: [
        BoxShadow(color: const Color(0xFF064E3B).withOpacity(0.08), blurRadius: 24, offset: const Offset(0, 12)),
      ],
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    required IconData icon,
    bool isReadOnly = false,
    bool isObscure = false,
  }) {
    return TextFormField(
      controller: controller,
      readOnly: isReadOnly,
      obscureText: isObscure,
      style: TextStyle(color: isReadOnly ? const Color(0xFF64748B) : const Color(0xFF0F172A), fontWeight: FontWeight.w700, fontSize: 15),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: const Color(0xFF94A3B8), fontSize: 14, fontWeight: FontWeight.w600),
        prefixIcon: Icon(icon, color: isReadOnly ? const Color(0xFFCBD5E1) : const Color(0xFFD4AF37), size: 22),
        filled: true,
        fillColor: isReadOnly ? const Color(0xFFF8FAFC) : Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: const Color(0xFFE2E8F0).withOpacity(0.8))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: const Color(0xFFE2E8F0).withOpacity(0.8))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFD4AF37), width: 2)),
      ),
    );
  }
}