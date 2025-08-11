// User data storage (in a real app, this would be server-side)
const users = {};
let currentUser = null;
let verificationCode = "";
let faceEnrollmentComplete = false;

// DOM Elements

const authPage = document.getElementById("authPage");
const dashboardPage = document.getElementById("dashboardPage");
const video = document.getElementById("videoElement");
const captureBtn = document.getElementById("captureBtn");
const progressBar = document.getElementById("progressBar");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const mfaModal = document.getElementById("mfaModal");
const closeModal = document.getElementById("closeModal");
const verifyBtn = document.getElementById("verifyBtn");
const resendCodeBtn = document.getElementById("resendCodeBtn");
const logoutBtn = document.getElementById("logoutBtn");
const verificationCodeInput = document.getElementById("verificationCode");
const userAvatar = document.getElementById("userAvatar");
const welcomeMessage = document.getElementById("welcomeMessage");
const lastLogin = document.getElementById("lastLogin");
const verificationModal = document.getElementById("verificationModal")




// Register button
registerBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const username = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const conformPassword = document.getElementById("registerConformPassword").value;

  if (!email || !password || !username) {
    return Swal.fire({
      icon: "warning",
      title: "Missing Fields",
      text: "Please fill all fields before registering!",
      confirmButtonColor: "#3085d6"
    });
  }

  const data = { username, email, password, conformPassword };

  try {
    const res = await fetch("http://localhost:3000/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const response = await res.json();
    console.log("Backend Response:", response);

    // Accept either "success: true" OR "status: 'success'"
    if (response.success === true || response.status === "success") {
      Swal.fire({
        icon: "success",
        title: "Registration Successful 🎉",
        text: response.message || "Your account has been created successfully!",
        confirmButtonColor: "#28a745"
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: response.message || "Unknown error occurred.",
        confirmButtonColor: "#d33"
      });
    }
  } catch (err) {
    console.error("Registration error:", err);
    Swal.fire({
      icon: "error",
      title: "Server Error",
      text: "An error occurred during registration.",
      confirmButtonColor: "#d33"
    });
  }
});
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    return Swal.fire({
      icon: "warning",
      title: "Missing Fields",
      text: "Please enter both email and password!",
      confirmButtonColor: "#3085d6",
    });
  }

  try {
    // Step 1: Send email + password to /login
    const res = await fetch("http://localhost:3000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const response = await res.json();

    if (!response.success) {
      return Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: response.message || "Invalid email or password.",
        confirmButtonColor: "#d33",
      });
    }

    // Step 2: Show verification modal to enter code
    verificationModal.style.display = "block";

    // Wait for user to submit code
    const mfaCode = await new Promise((resolve) => {
      document.getElementById("submitCodeBtn").addEventListener(
        "click",
        () => {
          verificationModal.style.display = "none";
          const code = document.getElementById("verificationcode").value.trim();
          resolve(code);
        },
        { once: true }
      );
    });

    // Step 3: Send email + code to /verify-code
    const verifyRes = await fetch("http://localhost:3000/api/users/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: mfaCode }),
    });

    const verifyResponse = await verifyRes.json();

    if (verifyResponse.success) {
      Swal.fire({
        icon: "success",
        title: "Login Successful 🎉",
        text: `Welcome, ${verifyResponse.user.username || email}!`,
        confirmButtonColor: "#28a745",
      });

      showDashboard(verifyResponse.user);
    } else {
      Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text: verifyResponse.error || "Invalid or expired code.",
        confirmButtonColor: "#d33",
      });
    }
  } catch (err) {
    console.error("Login error:", err);
    Swal.fire({
      icon: "error",
      title: "Server Error",
      text: "An error occurred during login.",
      confirmButtonColor: "#d33",
    });
  }
});

document.getElementById("closeVerificationModal").addEventListener("click",()=>{
  verificationModal.style.display = "none";
})
// function to open camera and start video
async function initFaceRecognition() {
  try {
    await Promise.all([
      faceapi.nets.faceLandmark68Net.loadFromUri("/SecureFaceFrontend/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/SecureFaceFrontend/models"),
      faceapi.nets.tinyFaceDetector.loadFromUri("/SecureFaceFrontend/models"),
    ]);
    console.log("Face API models loaded");

    // Start video
    if (navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;

      await new Promise((resolve) => {
        video.onloadeddata = resolve;
      });

      console.log("Camera started");
    }
  } catch (err) {
    console.error("Error loading models or starting camera:", err);
    alert("Face detection models failed to load or camera access denied.");
  }
}

// Helper to capture descriptor
async function captureDescriptor() {
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    alert("No face detected. Please look directly at the camera.");
    return null;
  }

  return Array.from(detection.descriptor);
}

captureBtn.addEventListener('click', async () => {
  await initFaceRecognition();
  const descriptor = await captureDescriptor();
  const username = document.getElementById('User-face').value.trim();

 try {
   const res = await fetch('http://localhost:3000/api/users/register-face', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ username, descriptor })
   });
    const response = await res.json();
    console.log("Backend Response:", response);

     if (response.success === true ) {
      Swal.fire({
        icon: "success",
        title: "Registration Successful 🎉",
        text: response.message || "Your account has been created successfully!",
        confirmButtonColor: "#28a745"
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: response.message || "Unknown error occurred.",
        confirmButtonColor: "#d33"
      });
    }
 } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Server Error",
      text: "An error occurred during registration.",
      confirmButtonColor: "#d33"
    });
 }
});

const faceLoginBtn = document.getElementById("faceLoginBtn");
const usernameModal = document.getElementById("usernameModal");
const startCameraBtn = document.getElementById("startCameraBtn");
let username = "";

faceLoginBtn.addEventListener("click", () => {
  usernameModal.style.display = "block";
});

document.getElementById("closeUsernameModal").addEventListener("click",()=>{
  usernameModal.style.display = "none"
});

startCameraBtn.addEventListener("click", async () => {
  username = document.getElementById("loginUsername").value.trim();
  if (!username) {
    alert("Please enter a username");
    return;
  }

  // Close modal
  usernameModal.style.display = "none";



  // Scroll to camera section
  document.getElementById("videoElement").scrollIntoView({ behavior: "smooth" });

    // Start camera
  await initFaceRecognition();

  // After camera is ready, capture descriptor
  const descriptor = await captureDescriptor();
  if (!descriptor) return;

  const data = { username, descriptor };

  try {
    const res = await fetch("http://localhost:3000/api/users/login-face", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const response = await res.json();

    if (response.success === true || response.status === "success") {
      Swal.fire({
        icon: "success",
        title: "Login Successful 🎉",
        text: `Welcome, ${response.userData.username }!`,
        confirmButtonColor: "#28a745"
      });
       showDashboard(response.userData);
    } else {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: response.message || "Unknown error occurred.",
        confirmButtonColor: "#d33"
      });
    }
  } catch (err) {
    console.error("Face login error:", err);
    alert("An error occurred during face login.");
  }
});


// Initialize the page
function initPage() {
  authPage.style.display = "block";
  dashboardPage.style.display = "none";
}


// Show modal
function showModal(modal) {
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

// Hide modal
function hideModal(modal) {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

// Show dashboard
function showDashboard(user) {
  authPage.style.display = "none";
  dashboardPage.style.display = "block";

  const displayName = user.name || user.username || user.email || "User";
  const initials = displayName.split(" ").map((n) => n[0]).join("");
  userAvatar.textContent = initials;
  welcomeMessage.textContent = `Welcome, ${displayName}`;

  const now = new Date();
  lastLogin.textContent = `Today at ${now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;
}



resendCodeBtn.addEventListener("click", () => {
  if (currentUser) {
    sendVerificationEmail(currentUser);
    alert("A new verification code has been sent");
  }
});

closeModal.addEventListener("click", () => hideModal(mfaModal));

logoutBtn.addEventListener("click", () => {
  currentUser = null;
  faceEnrollmentComplete = false;
  initPage();
});

window.addEventListener("click", (event) => {
  if (event.target === mfaModal) hideModal(mfaModal);
});



// Tips rotation
const environmentTips = [
  { tip: "Enabling low-light enhancement", icon: "fa-moon" },
  { tip: "Adjusting for backlight conditions", icon: "fa-sun" },
  { tip: "Stabilizing image for movement", icon: "fa-running" },
];
let tipIndex = 0;
setInterval(() => {
  const tip = environmentTips[tipIndex];
  document.querySelector(".capture-status p").innerHTML =
    `<i class="fas ${tip.icon}"></i> ${tip.tip}`;
  tipIndex = (tipIndex + 1) % environmentTips.length;
}, 5000);

// Init
initPage();


