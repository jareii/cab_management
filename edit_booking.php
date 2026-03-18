<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

$conn = new mysqli("127.0.0.1", "root", "Jareena@2004", "cab_management");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$user_id   = $_SESSION['user_id'];
$user_name = $_SESSION['user_name'];
$success   = "";
$error     = "";

$booking_id = $_GET['id'] ?? 0;

// Get existing booking
$stmt = $conn->prepare("SELECT * FROM booking WHERE booking_id=? AND user_id=?");
$stmt->bind_param("ii", $booking_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();
$booking = $result->fetch_assoc();
$stmt->close();

// If booking not found or not belongs to user
if (!$booking) {
    header("Location: dashboard.php");
    exit();
}

// If already picked or dropped or cancelled — cannot edit
if (in_array($booking['status'], ['Picked', 'Dropped', 'Cancelled'])) {
    header("Location: dashboard.php");
    exit();
}

// Handle edit form submission
if (isset($_POST['update'])) {
    $pickup = trim($_POST['pickup_location']);
    $drop   = trim($_POST['drop_location']);
    $cab_id = $_POST['cab_id'];
    $date   = $_POST['booking_date'];

    $stmt = $conn->prepare("UPDATE booking SET pickup_location=?, drop_location=?, cab_id=?, booking_date=? WHERE booking_id=? AND user_id=?");
    $stmt->bind_param("ssisii", $pickup, $drop, $cab_id, $date, $booking_id, $user_id);

    if ($stmt->execute()) {
        $success = "Booking updated successfully!";
        // Refresh booking data
        $stmt2 = $conn->prepare("SELECT * FROM booking WHERE booking_id=?");
        $stmt2->bind_param("i", $booking_id);
        $stmt2->execute();
        $booking = $stmt2->get_result()->fetch_assoc();
        $stmt2->close();
    } else {
        $error = "Update failed. Please try again.";
    }
    $stmt->close();
}

// Get all cabs
$cabs = $conn->query("SELECT c.cab_id, c.cab_number, c.cab_type, c.ac_type, d.name as driver_name FROM cabs c LEFT JOIN drivers d ON c.driver_id = d.driver_id");

$conn->close();
?>

<!DOCTYPE html>
<html>
<head>
<title>Edit Booking - Cab Management System</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; font-family:Arial,sans-serif; }
body { background:#f4f6fb; }
.navbar { display:flex; justify-content:space-between; align-items:center; padding:16px 40px; background:white; box-shadow:0 2px 10px rgba(0,0,0,0.08); }
.logo { font-size:20px; font-weight:bold; color:#2c3e50; }
.nav-right { display:flex; align-items:center; gap:16px; }
.btn-logout { padding:8px 18px; background:#e74c3c; color:white; border:none; border-radius:6px; cursor:pointer; font-size:14px; text-decoration:none; }
.btn-back { padding:8px 18px; background:#6c757d; color:white; border:none; border-radius:6px; cursor:pointer; font-size:14px; text-decoration:none; }
.page-title { padding:30px 40px 10px 40px; }
.page-title h2 { font-size:22px; color:#2c3e50; }
.page-title p { color:#888; font-size:14px; margin-top:4px; }
.form-wrap { padding:20px 40px 40px 40px; }
.form-card { background:white; padding:30px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.06); max-width:500px; }
.form-card h3 { font-size:18px; color:#2c3e50; margin-bottom:20px; }
label { display:block; font-size:13px; color:#555; margin-bottom:5px; margin-top:14px; }
input, select { width:100%; padding:11px 14px; border:1px solid #ddd; border-radius:7px; font-size:14px; outline:none; transition:border 0.2s; }
input:focus, select:focus { border-color:#007bff; }
.btn-update { width:100%; padding:12px; background:#007bff; color:white; border:none; border-radius:7px; font-size:15px; cursor:pointer; margin-top:20px; }
.btn-update:hover { background:#0056b3; }
.success { background:#d4edda; color:#155724; padding:10px 14px; border-radius:6px; font-size:14px; margin-bottom:16px; }
.error { background:#ffe0e0; color:#c0392b; padding:10px 14px; border-radius:6px; font-size:14px; margin-bottom:16px; }
</style>
</head>
<body>

<div class="navbar">
    <div class="logo">🚕 Cab System</div>
    <div class="nav-right">
        <a class="btn-back" href="dashboard.php">← Dashboard</a>
        <span>Hello, <?php echo htmlspecialchars($user_name); ?>!</span>
        <a class="btn-logout" href="logout.php">Logout</a>
    </div>
</div>

<div class="page-title">
    <h2>Edit Booking #<?php echo $booking_id; ?></h2>
    <p>Update your booking details below</p>
</div>

<div class="form-wrap">
    <div class="form-card">
        <h3>Update Trip Details</h3>

        <?php if ($success): ?>
            <div class="success">✅ <?php echo $success; ?> <a href="dashboard.php">View Bookings</a></div>
        <?php endif; ?>
        <?php if ($error): ?>
            <div class="error">❌ <?php echo $error; ?></div>
        <?php endif; ?>

        <form action="edit_booking.php?id=<?php echo $booking_id; ?>" method="POST">
            <label>Pickup Location</label>
            <input type="text" name="pickup_location" value="<?php echo htmlspecialchars($booking['pickup_location']); ?>" required>

            <label>Drop Location</label>
            <input type="text" name="drop_location" value="<?php echo htmlspecialchars($booking['drop_location']); ?>" required>

            <label>Booking Date</label>
            <input type="date" name="booking_date" value="<?php echo $booking['booking_date']; ?>" min="<?php echo date('Y-m-d'); ?>" required>

            <label>Select Cab</label>
            <select name="cab_id" required>
                <?php while($cab = $cabs->fetch_assoc()): ?>
                <option value="<?php echo $cab['cab_id']; ?>" <?php echo $cab['cab_id'] == $booking['cab_id'] ? 'selected' : ''; ?>>
                    <?php echo $cab['cab_number'] . " - " . $cab['cab_type'] . " (" . $cab['ac_type'] . ") - Driver: " . ($cab['driver_name'] ?? 'Not Assigned'); ?>
                </option>
                <?php endwhile; ?>
            </select>

            <button type="submit" name="update" class="btn-update">✏️ Update Booking</button>
        </form>
    </div>
</div>

</body>
</html>
