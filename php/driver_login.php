<?php
session_start();

if (isset($_SESSION['driver_id'])) {
    header("Location: driver_dashboard.php");
    exit();
}

$conn = new mysqli("localhost", "root", "Jareena@2004", "cab_management");
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$error = "";

if (isset($_POST['login'])) {
    $email    = trim($_POST['email']);
    $password = trim($_POST['password']);

    $stmt = $conn->prepare("SELECT driver_id, name, status FROM drivers WHERE email=? AND password=?");
    $stmt->bind_param("ss", $email, $password);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $driver = $result->fetch_assoc();

        if ($driver['status'] == 'Approved') {
            $_SESSION['driver_id']   = $driver['driver_id'];
            $_SESSION['driver_name'] = $driver['name'];
            header("Location: driver_dashboard.php");
            exit();
        } elseif ($driver['status'] == 'Pending') {
            $error = "Your account is pending admin approval. Please wait!";
        } elseif ($driver['status'] == 'Removed') {
            $error = "Your account has been removed by admin. Contact admin for help.";
        }
    } else {
        $error = "Invalid email or password.";
    }
    $stmt->close();
}
$conn->close();
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Driver Login - Cab Management System</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; font-family:Arial,sans-serif; }
body { background:#1a252f; display:flex; justify-content:center; align-items:center; height:100vh; }
.form-box { background:white; padding:35px 30px; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.3); width:320px; }
.form-box h2 { margin-bottom:6px; color:#2c3e50; font-size:22px; }
.form-box p { color:#888; font-size:13px; margin-bottom:20px; }
input { width:100%; padding:11px 14px; margin:8px 0; border:1px solid #ddd; border-radius:7px; font-size:14px; outline:none; }
input:focus { border-color:#28a745; }
button { width:100%; padding:11px; background:#28a745; color:white; border:none; border-radius:7px; font-size:15px; cursor:pointer; margin-top:10px; }
button:hover { background:#218838; }
.error { background:#ffe0e0; color:#c0392b; padding:9px 12px; border-radius:6px; font-size:13px; margin-bottom:10px; }
.warning { background:#fff3cd; color:#856404; padding:9px 12px; border-radius:6px; font-size:13px; margin-bottom:10px; }
.links { text-align:center; margin-top:16px; font-size:13px; }
.links a { color:#007bff; text-decoration:none; display:block; margin-top:6px; }
</style>
</head>
<body>
<div class="form-box">
    <h2>🚕 Driver Login</h2>
    <p>Login to manage your trips</p>

    <?php if ($error): ?>
        <div class="<?php echo strpos($error,'pending') !== false ? 'warning' : 'error'; ?>">
            <?php echo $error; ?>
        </div>
    <?php endif; ?>

    <form action="driver_login.php" method="POST">
        <input type="email"    name="email"    placeholder="Email Address" required>
        <input type="password" name="password" placeholder="Password"      required>
        <button type="submit" name="login">Login as Driver</button>
    </form>
    <div class="links">
        <a href="driver_register.php">New driver? Register here</a>
        <a href="index.html">← Back to Home</a>
    </div>
</div>
</body>
</html>