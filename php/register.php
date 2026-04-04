<?php
session_start();

if (isset($_SESSION['user_id'])) {
    header("Location: dashboard.php");
    exit();
}

$conn = new mysqli("localhost", "root", "Jareena@2004", "cab_management");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$error   = "";
$success = "";

if (isset($_POST['register'])) {
    $name     = trim($_POST['name']);
    $phone    = trim($_POST['phone']);
    $email    = trim($_POST['email']);
    $password = trim($_POST['password']);

    // Check if email already exists
    $check = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
    $check->bind_param("s", $email);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        $error = "Email already registered!";
    } else {
        $stmt = $conn->prepare("INSERT INTO users (name, phone, email, password) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $name, $phone, $email, $password);
        if ($stmt->execute()) {
            $success = "Registration Successful! Please login.";
        } else {
            $error = "Registration failed. Please try again.";
        }
        $stmt->close();
    }
    $check->close();
}
$conn->close();
?>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Register - Cab Management System</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; font-family:Arial,sans-serif; }
body { background:#f4f6fb; display:flex; justify-content:center; align-items:center; min-height:100vh; }
.form-box { background:white; padding:35px 30px; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.1); width:320px; }
.form-box h2 { margin-bottom:6px; color:#2c3e50; font-size:22px; }
.form-box p { color:#888; font-size:13px; margin-bottom:20px; }
label { display:block; font-size:13px; color:#555; margin-bottom:4px; margin-top:12px; }
input { width:100%; padding:11px 14px; border:1px solid #ddd; border-radius:7px; font-size:14px; outline:none; }
input:focus { border-color:#007bff; }
button { width:100%; padding:11px; background:#007bff; color:white; border:none; border-radius:7px; font-size:15px; cursor:pointer; margin-top:16px; }
button:hover { background:#0056b3; }
.success { background:#d4edda; color:#155724; padding:10px 12px; border-radius:6px; font-size:13px; margin-bottom:10px; }
.error { background:#ffe0e0; color:#c0392b; padding:10px 12px; border-radius:6px; font-size:13px; margin-bottom:10px; }
.bottom-link { text-align:center; margin-top:16px; font-size:13px; color:#555; }
.bottom-link a { color:#007bff; text-decoration:none; }
</style>
</head>
<body>
<div class="form-box">
    <h2>&#128661; Create Account</h2>
    <p>Register to book your cab</p>

    <?php if ($success): ?>
        <div class="success">&#10003; <?php echo $success; ?> <a href="login.php">Login here</a></div>
    <?php endif; ?>
    <?php if ($error): ?>
        <div class="error">&#10007; <?php echo $error; ?></div>
    <?php endif; ?>

    <form action="register.php" method="POST">
        <label>Full Name</label>
        <input type="text"     name="name"     placeholder="Enter your name"   required>
        <label>Phone Number</label>
        <input type="text"     name="phone"    placeholder="Enter phone number" required>
        <label>Email Address</label>
        <input type="email"    name="email"    placeholder="Enter email"        required>
        <label>Password</label>
        <input type="password" name="password" placeholder="Enter password"     required>
        <button type="submit" name="register">Register</button>
    </form>

    <div class="bottom-link">
        Already have an account? <a href="login.php">Login here</a>
    </div>
</div>
</body>
</html>