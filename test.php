<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'db_connection.php';

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

