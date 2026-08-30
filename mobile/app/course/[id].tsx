import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StatusBar, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Image, 
  Alert,
  Dimensions,
  StyleSheet,
  Animated,
  Easing
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import RazorpayCheckout from 'react-native-razorpay';
import { API_URL } from '../../constants/config';

const { width, height } = Dimensions.get('window');

// Helper to get full image URL
const getFullImageUrl = (url: string) => {
  if (!url) return 'https://via.placeholder.com/400x200?text=Course+Image';
  if (url.startsWith("http") || url.startsWith("file://")) return url;
  return `${API_URL.replace('/api', '')}${url}`;
};

// YouTube Embed URL Generator
const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
  const match = regExp.exec(url);
  if (match && match[1].length === 11) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0&modestbranding=1&showinfo=0&controls=1&playsinline=1&origin=https://deeniyat-platform.vercel.app`;
  }
  return url;
};

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // ✨ Cinematic Entrance Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  // 💰 Dynamic Pricing Calculation
  const safePrice = course?.price || 0;
  const safeGst = course?.gstPercentage || 0;
  const calculatedTax = Math.round((safePrice * safeGst) / 100);
  const totalAmount = safePrice + calculatedTax;

  const triggerEntranceAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/courses/${id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();

      if (response.ok) {
        setCourse(data);

        // Agar user login hai, check karo ki wo enrolled hai ya nahi
        if (token) {
          const userDataString = await AsyncStorage.getItem('userData');
          if (userDataString) {
            const parsedUser = JSON.parse(userDataString);
            setUser(parsedUser);
            if (parsedUser?.enrolledCourses?.includes(id)) {
              setIsEnrolled(true);
            }
          }
        }
        triggerEntranceAnimation();
      } else {
        Alert.alert("Error", data.message || "Failed to load course details.");
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
      Alert.alert("Error", "Network connection failed.");
    } finally {
      setLoading(false);
    }
  };

  // Interaction Wrapper with Haptics
  const handlePress = (action: () => void, style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    Haptics.impactAsync(style);
    action();
  };

  const handleEnrollAndPayment = async () => {
    handlePress(() => {}, Haptics.ImpactFeedbackStyle.Medium);
    const token = await AsyncStorage.getItem('userToken');

    if (!token) {
      Alert.alert(
        "Login Required",
        "You must be logged in to enroll.",
        [{ text: "Login", onPress: () => router.push('/login') }, { text: "Cancel", style: "cancel" }]
      );
      return;
    }

    if (isEnrolled) {
      router.push(`/lesson/${id}` as any);
      return;
    }

    setEnrolling(true);

    // 🚀 SCENARIO 1: FREE COURSE (Bypass Payment)
    if (totalAmount === 0) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("🎉 Access Granted!", "Welcome to the free course. Let's begin learning.");
        await finalizeLocalEnrollment();
        return;
      } catch (e) {
        Alert.alert("Error", "Could not complete free enrollment.");
        setEnrolling(false);
        return;
      }
    }

    // 🚀 SCENARIO 2: PAID COURSE (Razorpay Flow)
    try {
      // 1. Create Order Backend Call
      const orderResponse = await fetch(`${API_URL}/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ amount: totalAmount, courseId: id })
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        Alert.alert("Gateway Error", orderData.error || 'Payment Initialization failed.');
        setEnrolling(false);
        return;
      }

      // 2. Open Razorpay Modal
      const options = {
        description: `Enrollment for ${course?.title}`,
        image: 'https://i.imgur.com/3g7nmJC.png',
        currency: orderData.order.currency || "INR",
        key: 'rzp_test_8YGiWeZrGctMwH', // TEST KEY
        amount: orderData.order.amount,
        name: 'Deeniyat Platform',
        order_id: orderData.order.id,
        prefill: {
          email: user?.email || '',
          contact: '9999999999',
          name: user?.name || ''
        },
        theme: { color: '#10b981' }
      };

      RazorpayCheckout.open(options).then(async (data: any) => {
        // 3. Verify Payment
        const verifyRes = await fetch(`${API_URL}/payments/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({
            razorpay_order_id: data.razorpay_order_id,
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_signature: data.razorpay_signature,
            courseId: id,
            amount: totalAmount
          })
        });

        const verifyData = await verifyRes.json();

        if (verifyRes.ok && verifyData.success) {
          // 4. Save Transaction Record
          const txnResponse = await fetch(`${API_URL}/transactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
              amount: totalAmount,
              type: "Course_Fee",
              courseId: id,
              status: "Completed",
              paymentId: data.razorpay_payment_id
            })
          });

          if (txnResponse.ok) {
             Alert.alert("🎉 Payment Successful!", "Your enrollment is confirmed.");
             await finalizeLocalEnrollment();
          } else {
             Alert.alert("Notice", "Payment verified but transaction record failed.");
             setEnrolling(false);
          }
        } else {
          Alert.alert("Error", "Payment Verification Failed!");
          setEnrolling(false);
        }
      }).catch((error: any) => {
        // User cancelled payment
        setEnrolling(false);
      });

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong with the payment gateway.");
      setEnrolling(false);
    }
  };

  const finalizeLocalEnrollment = async () => {
    setIsEnrolled(true);
    const userDataString = await AsyncStorage.getItem('userData');
    if (userDataString) {
      const storedUser = JSON.parse(userDataString);
      if (!storedUser.enrolledCourses) storedUser.enrolledCourses = [];
      if (!storedUser.enrolledCourses.includes(id)) {
         storedUser.enrolledCourses.push(id);
         await AsyncStorage.setItem('userData', JSON.stringify(storedUser));
      }
    }
    router.replace(`/lesson/${id}` as any);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#010206] justify-center items-center">
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <ActivityIndicator size="large" color="#34d399" />
        <Text className="text-emerald-400 mt-5 font-black tracking-[4] uppercase text-[10px]">
          Decrypting Curriculum...
        </Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View className="flex-1 bg-[#010206] justify-center items-center px-6">
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <Text className="text-5xl mb-6 opacity-80">⚠️</Text>
        <Text className="text-white font-black text-xl mb-3 tracking-wide">Course Not Found</Text>
        <Text className="text-slate-500 text-xs text-center mb-8">The requested module could not be located in the database.</Text>
        <TouchableOpacity 
          onPress={() => handlePress(() => router.back())} 
          className="bg-white/10 px-8 py-4 rounded-full border border-white/20 active:bg-white/20"
        >
          <Text className="text-white font-bold tracking-widest uppercase text-[10px]">Return to Safety</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(course.promoVideo);
  const htmlContent = embedUrl ? `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body { margin: 0; padding: 0; background-color: #030612; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
          iframe { width: 100vw; height: 100vh; border: none; }
        </style>
      </head>
      <body>
        <iframe src="${embedUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </body>
    </html>
  ` : '';

  return (
    <View className="flex-1 bg-[#010206]">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Cross-Platform Ambient Background Glow */}
      <View style={[styles.glowOrb, { top: height * 0.2, right: -100, backgroundColor: 'rgba(52, 211, 153, 0.08)' }]} pointerEvents="none" />
      <View style={[styles.glowOrb, { bottom: 100, left: -80, backgroundColor: 'rgba(59, 130, 246, 0.05)' }]} pointerEvents="none" />

      {/* Cinematic Header with Back Button & Promo Media */}
      <View className="w-full relative z-20" style={{ height: height * 0.32 }}>

        {/* Floating Back Button Overlay */}
        <TouchableOpacity 
          onPress={() => handlePress(() => router.back())}
          activeOpacity={0.8}
          className="absolute top-12 left-6 w-11 h-11 bg-[#010206]/60 backdrop-blur-xl rounded-full items-center justify-center z-30 border border-white/[0.1] shadow-lg"
        >
          <Text className="text-white text-lg font-bold">←</Text>
        </TouchableOpacity>

        {embedUrl ? (
          <WebView
            source={{ html: htmlContent, baseUrl: 'https://google.com' }}
            style={{ flex: 1, backgroundColor: '#030612' }}
            allowsFullscreenVideo={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mediaPlaybackRequiresUserAction={false}
          />
        ) : (
          <View className="w-full h-full relative">
            <Image 
              source={{ uri: getFullImageUrl(course.thumbnail) }}
              className="w-full h-full opacity-80"
              resizeMode="cover"
            />
            {/* Cinematic Gradient Fade into body */}
            <LinearGradient
              colors={['transparent', 'rgba(1, 2, 6, 0.8)', '#010206']}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
        )}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1 z-10"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Animated.View 
          className="px-6 pt-6"
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >

          {/* Course Meta Info Tags */}
          <View className="flex-row items-center gap-3 mb-5">
            <View className="bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <Text className="text-[9px] font-black text-emerald-400 tracking-[2] uppercase">
                {course.level || 'Beginner'} Level
              </Text>
            </View>
            <View className="bg-white/[0.03] border border-white/[0.08] px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <Text className="text-slate-400 text-[9px] font-black uppercase tracking-[2]">
                {course.duration || 'Self-Paced'}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-[32px] font-black text-white tracking-tighter mb-6 leading-[1.1] drop-shadow-xl">
            {course.title}
          </Text>

          {/* Pricing Details Box */}
          {!isEnrolled && totalAmount > 0 && (
            <View className="bg-[#020510] border border-emerald-500/20 rounded-[1.5rem] p-5 mb-8 shadow-lg">
              <Text className="text-slate-500 text-[9px] uppercase tracking-widest font-black mb-3">Order Summary</Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-400 text-sm">Course Fee</Text>
                <Text className="text-slate-300 text-sm">₹{safePrice}</Text>
              </View>
              {safeGst > 0 && (
                <View className="flex-row justify-between mb-4 border-b border-white/[0.05] pb-4">
                  <Text className="text-slate-400 text-sm">Taxes ({safeGst}% GST)</Text>
                  <Text className="text-slate-300 text-sm">₹{calculatedTax}</Text>
                </View>
              )}
              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-white font-bold">Total Amount</Text>
                <Text className="text-emerald-400 text-2xl font-black">₹{totalAmount}</Text>
              </View>
            </View>
          )}

          {/* Teacher Info Card */}
          {course.teacherId && (
            <View className="flex-row items-center gap-4 p-5 bg-gradient-to-r from-[#030612] to-[#020510] rounded-[1.5rem] border border-white/[0.06] mb-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] elevation-10">
              <View className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                <Text className="text-2xl font-black text-emerald-400">{course.teacherId.name.charAt(0)}</Text>
              </View>
              <View>
                <Text className="text-[9px] text-slate-500 font-black uppercase tracking-[3] mb-1">Taught By</Text>
                <Text className="text-white font-extrabold text-lg tracking-tight">Ustad {course.teacherId.name}</Text>
              </View>
            </View>
          )}

          {/* Description / Curriculum Overview */}
          <View className="mb-12 bg-white/[0.01] p-6 rounded-[2rem] border border-white/[0.03]">
            <View className="flex-row items-center mb-4">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 shadow-[0_0_8px_rgba(52,211,153,1)]" />
              <Text className="text-white font-black text-sm uppercase tracking-widest">About Curriculum</Text>
            </View>
            <Text className="text-slate-400 text-[14px] leading-relaxed font-medium opacity-90">
              {course.description}
            </Text>
          </View>

          {/* 🔥 DYNAMIC ENROLL / PAYMENT BUTTON */}
          <TouchableOpacity 
            onPress={handleEnrollAndPayment}
            disabled={enrolling}
            activeOpacity={0.85}
            className={`w-full py-5 rounded-full items-center justify-center flex-row shadow-[0_10px_40px_rgba(52,211,153,0.4)] mb-8 ${
              enrolling 
                ? 'bg-[#020510] border border-emerald-900' 
                : isEnrolled 
                  ? 'bg-[#030612] border border-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,0.2)]' 
                  : 'bg-gradient-to-r from-emerald-400 to-teal-500'
            }`}
          >
            {enrolling ? (
              <ActivityIndicator color="#010206" />
            ) : (
              <Text className={`font-black tracking-[2] uppercase text-[12px] ${isEnrolled ? 'text-emerald-400' : 'text-[#010206]'}`}>
                {isEnrolled ? "Access Dashboard ➔" : (totalAmount > 0 ? `Pay ₹${totalAmount} to Enroll` : "Enroll Now - Free")}
              </Text>
            )}
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  glowOrb: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    opacity: 0.5,
  }
});