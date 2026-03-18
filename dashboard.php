<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

require 'db_connection.php';

$user_id   = $_SESSION['user_id'];
$user_name = $_SESSION['user_name'];

// Handle cancel booking
if (isset($_POST['cancel'])) {
    $booking_id = $_POST['booking_id'];
    $stmt = $conn->prepare("UPDATE booking SET status='Cancelled' WHERE booking_id=? AND user_id=?");
    $stmt->bind_param("ii", $booking_id, $user_id);
    $stmt->execute();
    $stmt->close();
}

// Get user's bookings
$stmt = $conn->prepare("
    SELECT b.booking_id, b.booking_date, b.booking_time,
           b.pickup_location, b.drop_location, b.status,
           c.cab_number, c.cab_type,
           d.name as driver_name, d.phone as driver_phone
    FROM booking b
    LEFT JOIN cabs c ON b.cab_id = c.cab_id
    LEFT JOIN drivers d ON c.driver_id = d.driver_id
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC, b.booking_time DESC
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$bookings = $stmt->get_result();
$stmt->close();
$conn->close();
?>

<!DOCTYPE html>
<html>
<head>
<title>Dashboard - Cab Management System</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; font-family:Arial,sans-serif; }
body { background:#f4f6fb; }
.navbar { display:flex; justify-content:space-between; align-items:center; padding:16px 40px; background:white; box-shadow:0 2px 10px rgba(0,0,0,0.08); }
.logo { font-size:20px; font-weight:bold; color:#2c3e50; }
.nav-right { display:flex; align-items:center; gap:16px; }
.nav-right span { color:#555; font-size:14px; }
.btn-logout { padding:8px 18px; background:#e74c3c; color:white; border:none; border-radius:6px; cursor:pointer; font-size:14px; text-decoration:none; }
.welcome-card { background:linear-gradient(135deg,#007bff,#0056b3); color:white; padding:30px 40px; margin:30px 40px; border-radius:12px; }
.welcome-card h1 { font-size:26px; margin-bottom:6px; }
.welcome-card p { font-size:14px; opacity:0.85; }
.stats-row { display:flex; gap:20px; margin:0 40px 30px 40px; }
.stat-card { background:white; padding:20px 24px; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.06); flex:1; text-align:center; }
.stat-card h2 { font-size:32px; color:#007bff; }
.stat-card p { font-size:13px; color:#888; margin-top:4px; }
.book-btn-wrap { margin:0 40px 30px 40px; }
.btn-book { padding:12px 30px; background:#28a745; color:white; border:none; border-radius:8px; font-size:16px; cursor:pointer; text-decoration:none; display:inline-block; }
.btn-book:hover { background:#218838; }
.section { margin:0 40px 40px 40px; }
.section h3 { font-size:18px; color:#2c3e50; margin-bottom:16px; }
.table-wrap { overflow-x:auto; }
table { width:100%; border-collapse:collapse; background:white; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06); min-width:900px; }
thead { background:#007bff; color:white; }
thead th { padding:12px 16px; text-align:left; font-size:14px; }
tbody td { padding:12px 16px; font-size:13px; color:#444; border-bottom:1px solid #f0f0f0; vertical-align:middle; }
tbody tr:hover { background:#f8f9ff; }
tbody tr:last-child td { border-bottom:none; }
.badge-confirmed { background:#d4edda; color:#155724; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:bold; }
.badge-cancelled { background:#ffe0e0; color:#c0392b; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:bold; }
.badge-picked { background:#fff3cd; color:#856404; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:bold; }
.badge-dropped { background:#cce5ff; color:#004085; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:bold; }
.btn-cancel { padding:5px 12px; background:#e74c3c; color:white; border:none; border-radius:5px; cursor:pointer; font-size:12px; }
.btn-cancel:hover { background:#c0392b; }
.no-bookings { text-align:center; padding:40px; color:#888; background:white; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
</style>
</head>
<body>

<div class="navbar">
    <div class="logo">🚕 Cab System</div>
    <div class="nav-right">
        <span>Hello, <?php echo htmlspecialchars($user_name); ?>!</span>
        <a class="btn-logout" href="logout.php">Logout</a>
    </div>
</div>

<div class="welcome-card">
    <h1>Welcome, <?php echo htmlspecialchars($user_name); ?>! 👋</h1>
    <p>Book a cab anytime and travel comfortably.</p>
</div>

<div class="stats-row">
    <div class="stat-card">
        <h2><?php echo $bookings->num_rows; ?></h2>
        <p>Total Bookings</p>
    </div>
    <div class="stat-card">
        <h2>🚕</h2>
        <p>Ready to Ride</p>
    </div>
    <div class="stat-card">
        <h2>24/7</h2>
        <p>Service Available</p>
    </div>
</div>

<div class="book-btn-wrap">
    <a class="btn-book" href="booking.php">+ Book a Cab</a>
</div>

<div class="section">
    <h3>Your Bookings</h3>
    <div class="table-wrap">
    <?php if ($bookings->num_rows > 0): ?>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Date</th>
                <th>Time</th>
                <th>Pickup</th>
                <th>Drop</th>
                <th>Cab</th>
                <th>Driver</th>
                <th>Driver Phone</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            <?php $i = 1; while($row = $bookings->fetch_assoc()): ?>
            <tr>
                <td><?php echo $i++; ?></td>
                <td><?php echo $row['booking_date']; ?></td>
                <td><?php echo $row['booking_time'] ?? '-'; ?></td>
                <td><?php echo htmlspecialchars($row['pickup_location']); ?></td>
                <td><?php echo htmlspecialchars($row['drop_location']); ?></td>
                <td><?php echo htmlspecialchars($row['cab_number'] ?? '-'); ?> (<?php echo htmlspecialchars($row['cab_type'] ?? '-'); ?>)</td>
                <td><?php echo htmlspecialchars($row['driver_name'] ?? 'Not Assigned'); ?></td>
                <td><?php echo htmlspecialchars($row['driver_phone'] ?? '-'); ?></td>
                <td>
                    <?php if($row['status'] == 'Confirmed'): ?>
                        <span class="badge-confirmed">✅ Confirmed</span>
                    <?php elseif($row['status'] == 'Picked'): ?>
                        <span class="badge-picked">🚗 Picked</span>
                    <?php elseif($row['status'] == 'Dropped'): ?>
                        <span class="badge-dropped">📍 Dropped</span>
                    <?php else: ?>
                        <span class="badge-cancelled">❌ Cancelled</span>
                    <?php endif; ?>
                </td>
                <td style="display:flex;gap:6px;flex-wrap:wrap;">
                    <?php if($row['status'] == 'Confirmed'): ?>
                        <a href="edit_booking.php?id=<?php echo $row['booking_id']; ?>" style="padding:5px 10px;background:#007bff;color:white;border-radius:5px;font-size:12px;text-decoration:none;">✏️ Edit</a>
                        <form method="POST" onsubmit="return confirm('Cancel this booking?')">
                            <input type="hidden" name="booking_id" value="<?php echo $row['booking_id']; ?>">
                            <button type="submit" name="cancel" class="btn-cancel">❌ Cancel</button>
                        </form>
                    <?php else: ?>
                    -
                    <?php endif; ?>
                </td>
            </tr>
            <?php endwhile; ?>
        </tbody>
    </table>
    <?php else: ?>
    <div class="no-bookings">
        <p>You have no bookings yet. Click <strong>Book a Cab</strong> to get started!</p>
    </div>
    <?php endif; ?>
    </div>
</div>

</body>
</html>
