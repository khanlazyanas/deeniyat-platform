import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../auth/login_screen.dart';
import '../../services/auth_service.dart'; // Apne folder structure ke hisab se path check kar lena
import '../../utils/constants.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final AuthService _authService = AuthService();
  
  // Controllers
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _currentPasswordController = TextEditingController();
  final TextEditingController _newPasswordController = TextEditingController();

  // State Variables
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

  // Helper to fix Image URL
  String getFullImageUrl(String url) {
    if (url.isEmpty) return "";
    
    // Windows ke backslash (\) ko forward slash (/) mein badle
    String cleanUrl = url.replaceAll('\\', '/');
    if (cleanUrl.startsWith("http")) return cleanUrl;

    // Base URL se api path hata kar sirf domain/IP rakhein
    final baseUrl = ApiConstants.baseUrl.replaceAll('/api/v1/auth', '');
    
    // Ensure karein ki URL format perfect ho
    String finalUrl = "$baseUrl/$cleanUrl";
    finalUrl = finalUrl.replaceAll(RegExp(r'(?<!:)/+'), '/'); // Remove double slashes except http://
    
    return finalUrl;
  }

  // Load User Data from SharedPreferences
  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _nameController.text = prefs.getString('userName') ?? '';
      _emailController.text = prefs.getString('userEmail') ?? '';
      avatarUrl = prefs.getString('userAvatar') ?? '';
      isLoadingData = false;
    });
  }

  // Pick Image using File Picker
  Future<void> _pickImage() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.image,
      allowMultiple: false,
    );

    if (result != null && result.files.single.path != null) {
      File file = File(result.files.single.path!);
      
      // Check file size (Max 2MB)
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

  // Update Profile API
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
        // Update local storage
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('userName', response['data']['name']);
        if (response['data']['avatar'] != null) {
          await prefs.setString('userAvatar', response['data']['avatar']);
          setState(() {
            avatarUrl = response['data']['avatar'];
            avatarFile = null; // Clear local file after upload
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

  // Update Password API
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

  // SnackBar Helper
  void _showMessage(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.redAccent : Colors.teal,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  // Logout
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
        body: Center(child: CircularProgressIndicator(color: Colors.teal)),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Profile & Security', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
        backgroundColor: const Color(0xFF0F766E),
        foregroundColor: Colors.white,
        elevation: 0,
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
            // Header Background & Avatar
            Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.bottomCenter,
              children: [
                Container(
                  height: 120,
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF0F766E), Color(0xFF14B8A6)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.only(
                      bottomLeft: Radius.circular(30),
                      bottomRight: Radius.circular(30),
                    ),
                  ),
                ),
                Positioned(
                  bottom: -50,
                  child: GestureDetector(
                    onTap: _pickImage,
                    child: Stack(
                      alignment: Alignment.bottomRight,
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 4),
                            boxShadow: [
                              BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 5))
                            ],
                          ),
                          child: CircleAvatar(
                            radius: 50,
                            backgroundColor: Colors.teal.shade50,
                            backgroundImage: avatarFile != null 
                                ? FileImage(avatarFile!) as ImageProvider
                                : (avatarUrl.isNotEmpty ? NetworkImage(getFullImageUrl(avatarUrl)) : null),
                            child: (avatarFile == null && avatarUrl.isEmpty)
                                ? Text(
                                    _nameController.text.isNotEmpty ? _nameController.text[0].toUpperCase() : 'U',
                                    style: const TextStyle(fontSize: 40, fontWeight: FontWeight.bold, color: Colors.teal),
                                  )
                                : null,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: const BoxDecoration(
                            color: Color(0xFF0F766E),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 20),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 60),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Personal Info Card
                  _buildSectionTitle('Personal Information'),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: _cardDecoration(),
                    child: Column(
                      children: [
                        _buildTextField(
                          label: 'Legal Name',
                          controller: _nameController,
                          icon: Icons.person_outline,
                        ),
                        const SizedBox(height: 20),
                        _buildTextField(
                          label: 'Email Address (Identity Bound)',
                          controller: _emailController,
                          icon: Icons.email_outlined,
                          isReadOnly: true,
                        ),
                        const SizedBox(height: 25),
                        SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: ElevatedButton(
                            onPressed: isUpdatingProfile ? null : _updateProfile,
                            style: _primaryButtonStyle(),
                            child: isUpdatingProfile
                                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                : const Text('UPDATE PROFILE', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1)),
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 30),

                  // Security Card
                  _buildSectionTitle('Security & Authentication'),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: _cardDecoration(),
                    child: Column(
                      children: [
                        _buildTextField(
                          label: 'Current Password',
                          controller: _currentPasswordController,
                          icon: Icons.lock_outline,
                          isObscure: true,
                        ),
                        const SizedBox(height: 20),
                        _buildTextField(
                          label: 'New Password',
                          controller: _newPasswordController,
                          icon: Icons.lock_reset_outlined,
                          isObscure: true,
                        ),
                        const SizedBox(height: 25),
                        SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: ElevatedButton(
                            onPressed: isUpdatingPassword ? null : _updatePassword,
                            style: _dangerButtonStyle(),
                            child: isUpdatingPassword
                                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                : const Text('CHANGE PASSWORD', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1)),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Reusable Widgets & Styles
  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF334155), letterSpacing: 0.5),
    );
  }

  BoxDecoration _cardDecoration() {
    return BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      boxShadow: [
        BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 5)),
      ],
      border: Border.all(color: Colors.grey.shade100),
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
      style: TextStyle(color: isReadOnly ? Colors.grey.shade600 : Colors.black87, fontWeight: FontWeight.w500),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: Colors.grey.shade500, fontSize: 14),
        prefixIcon: Icon(icon, color: isReadOnly ? Colors.grey.shade400 : Colors.teal.shade300),
        filled: true,
        fillColor: isReadOnly ? Colors.grey.shade100 : const Color(0xFFF8FAFC),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide.none),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: const BorderSide(color: Colors.teal, width: 1.5)),
      ),
    );
  }

  ButtonStyle _primaryButtonStyle() {
    return ElevatedButton.styleFrom(
      backgroundColor: const Color(0xFF0F766E),
      foregroundColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 2,
    );
  }

  ButtonStyle _dangerButtonStyle() {
    return ElevatedButton.styleFrom(
      backgroundColor: const Color(0xFFE11D48),
      foregroundColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 2,
    );
  }
}