<?php
session_start();

if (!isset($_SESSION['admin_id'])) {
    header("Location: admin_login.php");
    exit();
}

$conn = new mysqli("127.0.0.1", "root", "Jareena@2004", "cab_management");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$admin_name = $_SESSION['admin_name'];

// Handle status change
if (isset($_POST['change_status'])) {
    $booking_id = $_POST['booking_id'];
    $new_status = $_POST['new_status'];
    $stmt = $conn->prepare("UPDATE booking SET status=? WHERE booking_id=?");
    $stmt->bind_param("si", $new_status, $booking_id);
    $stmt->execute();
    $stmt->close();
}

// Count stats
$total_users    = $conn->query("SELECT COUNT(*) as cnt FROM users")->fetch_assoc()['cnt'];
$total_bookings = $conn->query("SELECT COUNT(*) as cnt FROM booking")->fetch_assoc()['cnt'];
$total_cabs     = $conn->query("SELECT COUNT(*) as cnt FROM cabs")->fetch_assoc()['cnt'];
$total_drivers  = $conn->query("SELECT COUNT(*) as cnt FROM drivers")->fetch_assoc()['cnt'];

// Get all bookings
$bookings = $conn->query("
    SELECT b.booking_id, b.booking_date, b.booking_time,
           b.pickup_location, b.drop_location, b.status,
           u.name as user_name, u.phone as user_phone, u.email,
           c.cab_number, c.cab_type,
           d.name as driver_name, d.phone as driver_phone, d.license_no
    FROM booking b
    LEFT JOIN users u ON b.user_id = u.user_id
    LEFT JOIN cabs c ON b.cab_id = c.cab_id
    LEFT JOIN drivers d ON c.driver_id = d.driver_id
    ORDER BY b.booking_date DESC, b.booking_time DESC
");

$conn->close();
?>

<!DOCTYPE html>
<html>
<head>
<title>Admin Panel - Cab Management System</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; font-family:Arial,sans-serif; }
body { background:#f4f6fb; }
.navbar { display:flex; justify-content:space-between; align-items:center; padding:16px 40px; background:#2c3e50; }
.logo { font-size:20px; font-weight:bold; color:white; }
.nav-right { display:flex; align-items:center; gap:16px; }
.nav-right span { color:#ccc; font-size:14px; }
.btn-logout { padding:8px 18px; background:#e74c3c; color:white; border:none; border-radius:6px; cursor:pointer; font-size:14px; text-decoration:none; }
.welcome-card { background:linear-gradient(135deg,#e74c3c,#c0392b); color:white; padding:30px 40px; margin:30px 40px; border-radius:12px; }
.welcome-card h1 { font-size:26px; margin-bottom:6px; }
.welcome-card p { font-size:14px; opacity:0.85; }
.stats-row { display:flex; gap:20px; margin:0 40px 30px 40px; }
.stat-card { background:white; padding:20px 24px; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.06); flex:1; text-align:center; }
.stat-card h2 { font-size:32px; color:#e74c3c; }
.stat-card p { font-size:13px; color:#888; margin-top:4px; }
.section { margin:0 40px 40px 40px; }
.section h3 { font-size:18px; color:#2c3e50; margin-bottom:16px; }
.table-wrap { overflow-x:auto; }
table { width:100%; border-collapse:collapse; background:white; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06); min-width:1200px; }
thead { background:#2c3e50; color:white; }
thead th { padding:12px 16px; text-align:left; font-size:13px; }
tbody td { padding:11px 16px; font-size:13px; color:#444; border-bottom:1px solid #f0f0f0; vertical-align:middle; }
tbody tr:hover { background:#f8f9ff; }
tbody tr:last-child td { border-bottom:none; }
.badge-confirmed { background:#d4edda; color:#155724; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:bold; }
.badge-cancelled { background:#ffe0e0; color:#c0392b; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:bold; }
.badge-picked { background:#fff3cd; color:#856404; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:bold; }
.badge-dropped { background:#cce5ff; color:#004085; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:bold; }
.btn-picked { padding:5px 10px; background:#ffc107; color:#333; border:none; border-radius:5px; cursor:pointer; font-size:11px; margin:2px; }
.btn-dropped { padding:5px 10px; background:#007bff; color:white; border:none; border-radius:5px; cursor:pointer; font-size:11px; margin:2px; }
.btn-picked:hover { background:#e0a800; }
.btn-dropped:hover { background:#0056b3; }
</style>
</head>
<body>

<div class="navbar">
    <div class="logo">🔐 Admin Panel — Cab System</div>
    <div class="nav-right">
        <span>Welcome, <?php echo htmlspecialchars($admin_name); ?>!</span>
        <a class="btn-logout" href="admin_logout.php">Logout</a>
    </div>
</div>

<div class="welcome-card">
    <h1>Admin Dashboard 🚕</h1>
    <p>View and manage all bookings, trips, users and drivers.</p>
</div>

<div class="stats-row">
    <div class="stat-card">
        <h2><?php echo $total_users; ?></h2>
        <p>Total Users</p>
    </div>
    <div class="stat-card">
        <h2><?php echo $total_bookings; ?></h2>
        <p>Total Bookings</p>
    </div>
    <div class="stat-card">
        <h2><?php echo $total_cabs; ?></h2>
        <p>Total Cabs</p>
    </div>
    <div class="stat-card">
        <h2><?php echo $total_drivers; ?></h2>
        <p>Total Drivers</p>
    </div>
</div>

<div class="section">
    <h3>All Bookings & Trip Details</h3>
    <div class="table-wrap">
    <?php if ($bookings && $bookings->num_rows > 0): ?>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>User Name</th>
                <th>User Phone</th>
                <th>Email</th>
                <th>Pickup Location</th>
                <th>Drop Location</th>
                <th>Date</th>
                <th>Time</th>
                <th>Cab Number</th>
                <th>Cab Type</th>
                <th>Driver Name</th>
                <th>Driver Phone</th>
                <th>License No</th>
                <th>Status</th>
                <th>Change Status</th>
            </tr>
        </thead>
        <tbody>
            <?php $i = 1; while($row = $bookings->fetch_assoc()): ?>
            <tr>
                <td><?php echo $i++; ?></td>
                <td><?php echo htmlspecialchars($row['user_name'] ?? '-'); ?></td>
                <td><?php echo htmlspecialchars($row['user_phone'] ?? '-'); ?></td>
                <td><?php echo htmlspecialchars($row['email'] ?? '-'); ?></td>
                <td><?php echo htmlspecialchars($row['pickup_location']); ?></td>
                <td><?php echo htmlspecialchars($row['drop_location']); ?></td>
                <td><?php echo $row['booking_date']; ?></td>
                <td><?php echo $row['booking_time'] ?? '-'; ?></td>
                <td><?php echo htmlspecialchars($row['cab_number'] ?? '-'); ?></td>
                <td><?php echo htmlspecialchars($row['cab_type'] ?? '-'); ?></td>
                <td><?php echo htmlspecialchars($row['driver_name'] ?? '-'); ?></td>
                <td><?php echo htmlspecialchars($row['driver_phone'] ?? '-'); ?></td>
                <td><?php echo htmlspecialchars($row['license_no'] ?? '-'); ?></td>
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
                <td>
                    <?php if($row['status'] == 'Confirmed'): ?>
                        <form method="POST" style="display:inline">
                            <input type="hidden" name="booking_id" value="<?php echo $row['booking_id']; ?>">
                            <input type="hidden" name="new_status" value="Picked">
                            <button type="submit" name="change_status" class="btn-picked">🚗 Mark Picked</button>
                        </form>
                    <?php elseif($row['status'] == 'Picked'): ?>
                        <form method="POST" style="display:inline">
                            <input type="hidden" name="booking_id" value="<?php echo $row['booking_id']; ?>">
                            <input type="hidden" name="new_status" value="Dropped">
                            <button type="submit" name="change_status" class="btn-dropped">📍 Mark Dropped</button>
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
    <div style="text-align:center;padding:40px;color:#888;">No bookings found.</div>
    <?php endif; ?>
    </div>
</div>

</body>
</html>
