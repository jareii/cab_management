<?php
session_start();

if (isset($_SESSION['user_id'])) {
    header("Location: dashboard.php");
    exit();
}

$conn = new mysqli("127.0.0.1", "root", "Jareena@2004", "cab_management");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$error = "";

if (isset($_POST['login'])) {
    $email = trim($_POST['email']);
    $pass  = trim($_POST['password']);

    $stmt = $conn->prepare("SELECT user_id, name, password FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows >= 1) {
        $user = $result->fetch_assoc();
        if ($pass === $user['password']) {
            $_SESSION['user_id']   = $user['user_id'];
            $_SESSION['user_name'] = $user['name'];
            header("Location: dashboard.php");
            exit();
        } else {
            $error = "Incorrect password.";
        }
    } else {
        $error = "No account found with that email.";
    }
    $stmt->close();
}
$conn->close();
?>
<!DOCTYPE html>
<html>
<head>
<title>Login - Cab Management System</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; font-family:Arial,sans-serif; }
body { background:#f4f6fb; display:flex; justify-content:center; align-items:center; height:100vh; }
.form-box { background:white; padding:35px 30px; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.1); width:320px; }
.form-box h2 { margin-bottom:6px; color:#2c3e50; font-size:22px; }
.form-box p { color:#888; font-size:13px; margin-bottom:20px; }
input { width:100%; padding:11px 14px; margin:8px 0; border:1px solid #ddd; border-radius:7px; font-size:14px; outline:none; }
input:focus { border-color:#007bff; }
button { width:100%; padding:11px; background:#007bff; color:white; border:none; border-radius:7px; font-size:15px; cursor:pointer; margin-top:10px; }
button:hover { background:#0056b3; }
.bottom-link { text-align:center; margin-top:16px; font-size:13px; color:#555; }
.bottom-link a { color:#007bff; text-decoration:none; }
.error { background:#ffe0e0; color:#c0392b; padding:9px 12px; border-radius:6px; font-size:13px; margin-bottom:10px; }
</style>
</head>
<body>
<div class="form-box">
    <h2>🚕 Welcome Back</h2>
    <p>Login to your cab account</p>
    <?php if ($error): ?>
        <div class="error"><?php echo $error; ?></div>
    <?php endif; ?>
    <form action="login.php" method="POST">
        <input type="email"    name="email"    placeholder="Email Address" required>
        <input type="password" name="password" placeholder="Password"      required>
        <button type="submit"  name="login">Login</button>
    </form>
    <div class="bottom-link">
        Don't have an account? <a href="register.php">Register here</a>
    </div>
</div>
</body>
</html>
```

