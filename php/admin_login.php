<?php
session_start();

if (isset($_SESSION['admin_id'])) {
    header("Location: admin.php");
    exit();
}

$conn = new mysqli("localhost", "root", "Jareena@2004", "cab_management");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$error = "";

if (isset($_POST['login'])) {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    $stmt = $conn->prepare("SELECT admin_id, username FROM admin WHERE username=? AND password=?");
    $stmt->bind_param("ss", $username, $password);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $admin = $result->fetch_assoc();
        $_SESSION['admin_id']   = $admin['admin_id'];
        $_SESSION['admin_name'] = $admin['username'];
        header("Location: admin.php");
        exit();
    } else {
        $error = "Invalid username or password.";
    }
    $stmt->close();
}
$conn->close();
?>

<!DOCTYPE html>
<html>
<head>
<title>Admin Login - Cab Management System</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; font-family:Arial,sans-serif; }
body { background:#2c3e50; display:flex; justify-content:center; align-items:center; height:100vh; }
.form-box { background:white; padding:35px 30px; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.3); width:320px; }
.form-box h2 { margin-bottom:6px; color:#2c3e50; font-size:22px; }
.form-box p { color:#888; font-size:13px; margin-bottom:20px; }
input { width:100%; padding:11px 14px; margin:8px 0; border:1px solid #ddd; border-radius:7px; font-size:14px; outline:none; }
input:focus { border-color:#e74c3c; }
button { width:100%; padding:11px; background:#e74c3c; color:white; border:none; border-radius:7px; font-size:15px; cursor:pointer; margin-top:10px; }
button:hover { background:#c0392b; }
.error { background:#ffe0e0; color:#c0392b; padding:9px 12px; border-radius:6px; font-size:13px; margin-bottom:10px; }
.bottom-link { text-align:center; margin-top:16px; font-size:13px; }
.bottom-link a { color:#007bff; text-decoration:none; }
</style>
</head>
<body>
<div class="form-box">
    <h2>🔐 Admin Login</h2>
    <p>Cab Management System</p>

    <?php if ($error): ?>
        <div class="error"><?php echo $error; ?></div>
    <?php endif; ?>

    <form action="admin_login.php" method="POST">
        <input type="text"     name="username" placeholder="Admin Username" required>
        <input type="password" name="password" placeholder="Password"       required>
        <button type="submit" name="login">Login as Admin</button>
    </form>
    <div class="bottom-link">
        <a href="login.php">← Back to User Login</a>
    </div>
</div>
</body>
</html>