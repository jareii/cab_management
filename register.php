<?php
// Database connection
$servername = "127.0.0.1";
$username   = "root";
$password   = "Jareena@2004";
$dbname     = "cab_management";


$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Handle form submission
if(isset($_POST['register']))
{
    $name = $_POST['name'];
    $phone = $_POST['phone'];
    $email = $_POST['email'];
    $pass = $_POST['password'];

    $sql = "INSERT INTO users (name, phone, email, password)
            VALUES ('$name', '$phone', '$email', '$pass')";

    if($conn->query($sql) === TRUE)
    {
        echo "<script>alert('Registration Successful!'); window.location='register.php';</script>";
    }
    else
    {
        echo "Error: " . $conn->error;
    }
}

$conn->close();
?>

<!DOCTYPE html>
<html>
<head>
<title>User Registration</title>
<style>
body{
    font-family: Arial;
    background:#f4f6fb;
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
}
.form-box{
    background:white;
    padding:30px;
    border-radius:10px;
    box-shadow:0 0 10px rgba(0,0,0,0.1);
    width:300px;
}
input{
    width:100%;
    padding:10px;
    margin:10px 0;
}
button{
    width:100%;
    padding:10px;
    background:#007bff;
    color:white;
    border:none;
    border-radius:5px;
}
</style>
</head>
<body>
<div class="form-box">
<h2>User Register</h2>
<form action="register.php" method="POST">
<input type="text" name="name" placeholder="Enter Name" required>
<input type="text" name="phone" placeholder="Phone Number" required>
<input type="email" name="email" placeholder="Email" required>
<input type="password" name="password" placeholder="Password" required>
<button type="submit" name="register">Register</button>
</form>
</div>
</body>
</html>