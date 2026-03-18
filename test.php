<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$conn = new mysqli("127.0.0.1", "root", "Jareena@2004", "cab_management");

$email = "jareenabanu58@gmail.com";

$stmt = $conn->prepare("SELECT user_id, name, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

echo "Rows found: " . $result->num_rows;
echo "<br>";

while($row = $result->fetch_assoc()) {
    echo "Name: " . $row['name'] . "<br>";
    echo "Password: " . $row['password'] . "<br>";
}
?>
```

