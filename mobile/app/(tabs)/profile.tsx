import { View, Text, StatusBar, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../../constants/config';

// Image URL Helper
const getFullImageUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("file://")) return url;
  return `${API_URL.replace('/api', '')}${url}`;
};

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  
  // Profile States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUri, setAvatarUri] = useState<string>(""); 
  const [profileLoading, setProfileLoading] = useState(false);

  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          setUserData(parsed);
          setName(parsed.name || "");
          setEmail(parsed.email || "");
          setAvatarUri(parsed.avatar || "");
        }
      } catch (error) {
        console.error("Failed to load user data", error);
      }
    };
    loadUserData();
  }, []);

  // 📸 Image Picker Logic
  const pickImage = async () => {
    // Permission maangte hain
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Gallery access is needed to change your avatar.");
      return;
    }

    // Gallery open karo
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square crop
      quality: 0.5, // Optimize size
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri); // Preview update
    }
  };

  // 📝 Update Profile Handle
  const handleProfileUpdate = async () => {
    setProfileLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const formData = new FormData();
      formData.append("name", name);
      
      // Agar nayi image choose ki hai (local file uri hai)
      if (avatarUri && !avatarUri.startsWith('http') && avatarUri.startsWith('file')) {
        const filename = avatarUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        
        formData.append('avatar', {
          uri: avatarUri,
          name: filename,
          type,
        } as any);
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
          // FormData bhejte waqt Content-Type set nahi karte, fetch khud boundary set karta hai
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success ✨", "Profile updated successfully!");
        
        // AsyncStorage mein updated data save karo
        const updatedUser = {
          ...userData,
          name: data.name || name,
          avatar: data.avatar || userData.avatar
        };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        setUserData(updatedUser);
        
        if (data.avatar) {
          setAvatarUri(data.avatar);
        }
      } else {
        Alert.alert("Error", data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Profile Update Error:", error);
      Alert.alert("Network Error", "Could not connect to the server.");
    } finally {
      setProfileLoading(false);
    }
  };

  // 🔒 Update Password Handle
  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Missing Fields", "Please enter both current and new password.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Weak Password", "New password must be at least 6 characters.");
      return;
    }

    setPasswordLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/auth/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success 🔒", "Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        Alert.alert("Error", data.message || "Failed to change password.");
      }
    } catch (error) {
      console.error("Password Update Error:", error);
      Alert.alert("Network Error", "Could not connect to the server.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // 🚪 Logout Handle
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            router.replace('/login');
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#010206]"
    >
      <StatusBar barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-16">
        
        {/* Header Section */}
        <View className="mb-10">
          <View className="self-start bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full mb-4 flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-emerald-400 mr-2" />
            <Text className="text-[10px] font-black text-emerald-400 tracking-[2] uppercase">Account Configuration</Text>
          </View>
          <Text className="text-4xl font-extrabold text-white tracking-wide mb-2">Settings</Text>
          <Text className="text-slate-400 text-xs leading-relaxed">Manage your digital identity and secure your account credentials.</Text>
        </View>

        {/* --- PROFILE UPDATE SECTION --- */}
        <View className="bg-[#030612] border border-white/[0.05] rounded-[2rem] p-6 mb-8 shadow-lg">
          <View className="flex-row items-center mb-8 border-b border-white/[0.05] pb-6">
            <View className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl items-center justify-center mr-4">
              <Text className="text-emerald-400 text-lg">👤</Text>
            </View>
            <Text className="text-xl font-bold text-white tracking-wide">Profile Details</Text>
          </View>

          {/* Avatar Upload */}
          <View className="items-center mb-8">
            <TouchableOpacity onPress={pickImage} className="relative group active:scale-95 transition-transform">
              <View className="w-28 h-28 rounded-full border-2 border-emerald-500/30 overflow-hidden bg-[#010206] items-center justify-center">
                {avatarUri ? (
                  <Image source={{ uri: getFullImageUrl(avatarUri) }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <Text className="text-4xl text-emerald-400 font-bold">{name ? name.charAt(0).toUpperCase() : "U"}</Text>
                )}
              </View>
              <View className="absolute bottom-0 right-0 bg-emerald-400 w-8 h-8 rounded-full items-center justify-center border-2 border-[#030612]">
                <Text className="text-[#010206] text-xs">📷</Text>
              </View>
            </TouchableOpacity>
            <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-4">Tap image to upload</Text>
          </View>

          {/* Inputs */}
          <View className="space-y-5">
            <View>
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2] mb-2 pl-1">Legal Name</Text>
              <TextInput 
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#475569"
                className="w-full bg-[#010206] border border-white/[0.05] rounded-2xl px-5 py-4 text-white font-bold"
              />
            </View>
            
            <View>
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2] mb-2 pl-1">Email Address</Text>
              <TextInput 
                value={email}
                editable={false}
                className="w-full bg-[#010206]/50 border border-white/[0.02] rounded-2xl px-5 py-4 text-slate-500 font-bold opacity-70"
              />
              <Text className="text-amber-500/80 text-[10px] mt-2 pl-2">🔒 Email cannot be changed.</Text>
            </View>

            <TouchableOpacity 
              onPress={handleProfileUpdate}
              disabled={profileLoading}
              className={`w-full py-4 mt-2 rounded-full items-center ${profileLoading ? 'bg-emerald-500/50' : 'bg-emerald-500/10 border border-emerald-500/30 active:bg-emerald-500/20'}`}
            >
              {profileLoading ? <ActivityIndicator color="#34d399" /> : <Text className="text-emerald-400 font-black tracking-[2] uppercase text-xs">Update Profile</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* --- SECURITY SECTION --- */}
        <View className="bg-[#030612] border border-white/[0.05] rounded-[2rem] p-6 mb-8 shadow-lg">
          <View className="flex-row items-center mb-8 border-b border-white/[0.05] pb-6">
            <View className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 rounded-xl items-center justify-center mr-4">
              <Text className="text-rose-400 text-lg">🔑</Text>
            </View>
            <Text className="text-xl font-bold text-white tracking-wide">Authentication</Text>
          </View>

          <View className="space-y-5">
            <View>
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2] mb-2 pl-1">Current Password</Text>
              <TextInput 
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor="#475569"
                className="w-full bg-[#010206] border border-white/[0.05] rounded-2xl px-5 py-4 text-white font-bold tracking-widest"
              />
            </View>
            
            <View>
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2] mb-2 pl-1">New Password</Text>
              <TextInput 
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor="#475569"
                className="w-full bg-[#010206] border border-white/[0.05] rounded-2xl px-5 py-4 text-white font-bold tracking-widest"
              />
            </View>

            <TouchableOpacity 
              onPress={handlePasswordUpdate}
              disabled={passwordLoading}
              className={`w-full py-4 mt-2 rounded-full items-center ${passwordLoading ? 'bg-rose-500/50' : 'bg-rose-500/10 border border-rose-500/30 active:bg-rose-500/20'}`}
            >
              {passwordLoading ? <ActivityIndicator color="#fb7185" /> : <Text className="text-rose-400 font-black tracking-[2] uppercase text-xs">Change Password</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* --- LOGOUT BUTTON --- */}
        <TouchableOpacity 
          onPress={handleLogout}
          className="w-full py-4 mb-20 bg-red-500/10 border border-red-500/20 rounded-full items-center active:bg-red-500/20"
        >
          <Text className="text-red-400 font-black tracking-[2] uppercase text-xs">Log Out from Device</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}