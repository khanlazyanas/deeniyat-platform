interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const sendEmail = async (options: EmailOptions) => {
  try {
    // Sender details
    const senderEmail = "anaskhan995620@gmail.com"; 
    const senderName = "Deeniyat Platform"; // 👈 BizFlow ki jagah Deeniyat kar diya

    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      console.error("❌ BREVO_API_KEY is missing in .env");
      throw new Error("Email service is not configured properly.");
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey, 
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail 
        },
        to: [{ email: options.email }],
        subject: options.subject,
        // Hamare authController ne HTML format mein 'message' bheja hai
        htmlContent: options.message 
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ BREVO NE EMAIL REJECT KIYA. REASON:", JSON.stringify(data));
      throw new Error(data.message || 'API se Email fail ho gaya');
    }
    
    console.log("✅ EMAIL BHEJ DIYA GAYA! TO:", options.email);
  } catch (error) {
    console.error("🔥 EMAIL FUNCTION CRASH HUA:", error);
    throw new Error('Email nahi bheja ja saka');
  }
};

export default sendEmail;