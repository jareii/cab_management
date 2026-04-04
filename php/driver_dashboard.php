<?php
session_start();

if (!isset($_SESSION['driver_id'])) {
    header("Location: driver_login.php");
    exit();
}

$conn = new mysqli("localhost", "root", "Jareena@2004", "cab_management");
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$driver_id   = $_SESSION['driver_id'];
$driver_name = $_SESSION['driver_name'];

// Handle Mark Picked or Dropped
if (isset($_POST['change_status'])) {
    $booking_id = $_POST['booking_id'];
    $new_status = $_POST['new_status'];
    $stmt = $conn->prepare("UPDATE booking SET status=? WHERE booking_id=?");
    $stmt->bind_param("si", $new_status, $booking_id);
    $stmt->execute();
    $stmt->close();
}

// Get driver's cab
$cab_result = $conn->query("SELECT cab_id FROM cabs WHERE driver_id=$driver_id");
$cab_row    = $cab_result->fetch_assoc();
$cab_id     = $cab_row['cab_id'] ?? 0;

// Get all bookings assigned to this driver's cab
$stmt = $conn->prepare("
    SELECT b.booking_id, b.booking_date, b.booking_time,
           b.pickup_location, b.drop_location, b.status,
           u.name as user_name, u.phone as user_phone,
           c.cab_number, c.cab_type, c.ac_type
    FROM booking b
    LEFT JOIN users u ON b.user_id = u.user_id
    LEFT JOIN cabs  c ON b.cab_id  = c.cab_id
    WHERE b.cab_id = ? AND b.status != 'Cancelled'
    ORDER BY b.booking_date DESC, b.booking_time DESC
");
$stmt->bind_param("i", $cab_id);
$stmt->execute();
$bookings = $stmt->get_result();
$stmt->close();

// Count stats
$total     = $conn->query("SELECT COUNT(*) as cnt FROM booking WHERE cab_id=$cab_id AND status != 'Cancelled'")->fetch_assoc()['cnt'];
$picked    = $conn->query("SELECT COUNT(*) as cnt FROM booking WHERE cab_id=$cab_id AND status='Picked'")->fetch_assoc()['cnt'];
$dropped   = $conn->query("SELECT COUNT(*) as cnt FROM booking WHERE cab_id=$cab_id AND status='Dropped'")->fetch_assoc()['cnt'];
$confirmed = $conn->query("SELECT COUNT(*) as cnt FROM booking WHERE cab_id=$cab_id AND status='Confirmed'")->fetch_assoc()['cnt'];

$conn->close();
?>
<!DOCTYPE html>
<html>
<head>
<title>Driver Dashboard - Cab Management System</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; font-family:Arial,sans-serif; }
body { background:#f4f6fb; }
.navbar { display:flex; justify-content:space-between; align-items:center; padding:16px 40px; background:#1a252f; }
.logo { font-size:20px; font-weight:bold; color:white; }
.nav-right { display:flex; align-items:center; gap:16px; }
.nav-right span { color:#ccc; font-size:14px; }
.btn-logout { padding:8px 18px; background:#e74c3c; color:white; border:none; border-radius:6px; cursor:pointer; font-size:14px; text-decoration:none; }
.welcome-card { background:linear-gradient(135deg,#28a745,#1e7e34); color:white; padding:30px 40px; margin:30px 40px; border-radius:12px; }
.welcome-card h1 { font-size:26px; margin-bottom:6px; }
.welcome-card p { font-size:14px; opacity:0.85; }
.stats-row { display:flex; gap:20px; margin:0 40px 30px 40px; }
.stat-card { background:white; padding:20px 24px; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.06); flex:1; text-align:center; }
.stat-card h2 { font-size:32px; color:#28a745; }
.stat-card p { font-size:13px; color:#888; margin-top:4px; }
.section { margin:0 40px 40px 40px; }
.section h3 { font-size:18px; color:#2c3e50; margin-bottom:16px; }
.table-wrap { overflow-x:auto; }
table { width:100%; border-collapse:collapse; background:white; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06); min-width:900px; }
thead { background:#1a252f; color:white; }
thead th { padding:12px 16px; text-align:left; font-size:13px; }
tbody td { padding:12px 16px; font-size:13px; color:#444; border-bottom:1px solid #f0f0f0; vertical-align:middle; }
tbody tr:hover { background:#f8f9ff; }
tbody tr:last-child td { border-bottom:none; }
.badge-confirmed { background:#d4edda; color:#155724; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:bold; }
.badge-picked    { background:#fff3cd; color:#856404; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:bold; }
.badge-dropped   { background:#cce5ff; color:#004085; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:bold; }
.btn-picked  { padding:6px 12px; background:#ffc107; color:#333; border:none; border-radius:5px; cursor:pointer; font-size:12px; font-weight:bold; }
.btn-dropped { padding:6px 12px; background:#007bff; color:white; border:none; border-radius:5px; cursor:pointer; font-size:12px; font-weight:bold; }
.btn-picked:hover  { background:#e0a800; }
.btn-dropped:hover { background:#0056b3; }
.no-data { text-align:center; padding:40px; color:#888; }
</style>
</head>
<body>

<div class="navbar">
    <div class="logo">🚕 Driver Panel</div>
    <div class="nav-right">
        <span>Hello, <?php echo htmlspecialchars($driver_name); ?>!</span>
        <a class="btn-logout" href="driver_logout.php">Logout</a>
    </div>
</div>

<div class="welcome-card">
    <h1>Welcome, <?php echo htmlspecialchars($driver_name); ?>! 🚗</h1>
    <p>Manage your assigned trips — mark when you pick up and drop users.</p>
</div>

<div class="stats-row">
    <div class="stat-card">
        <h2><?php echo $total; ?></h2>
        <p>Total Trips</p>
    </div>
    <div class="stat-card">
        <h2><?php echo $confirmed; ?></h2>
        <p>Pending Pickup</p>
    </div>
    <div class="stat-card">
        <h2><?php echo $picked; ?></h2>
        <p>Currently On Trip</p>
    </div>
    <div class="stat-card">
        <h2><?php echo $dropped; ?></h2>
        <p>Completed Trips</p>
    </div>
</div>

<div class="section">
    <h3>Your Assigned Bookings</h3>
    <div class="table-wrap">
    <?php if ($bookings && $bookings->num_rows > 0): ?>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>User Name</th>
                <th>User Phone</th>
                <th>Pickup Location</th>
                <th>Drop Location</th>
                <th>Date</th>
                <th>Time</th>
                <th>Cab</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
        <?php $i=1; while($row = $bookings->fetch_assoc()): ?>
            <tr>
                <td><?php echo $i++; ?></td>
                <td><?php echo htmlspecialchars($row['user_name'] ?? '-'); ?></td>
                <td><?php echo htmlspecialchars($row['user_phone'] ?? '-'); ?></td>
                <td><?php echo htmlspecialchars($row['pickup_location']); ?></td>
                <td><?php echo htmlspecialchars($row['drop_location']); ?></td>
                <td><?php echo $row['booking_date']; ?></td>
                <td><?php echo $row['booking_time'] ?? '-'; ?></td>
                <td><?php echo htmlspecialchars($row['cab_number']); ?> (<?php echo $row['ac_type']; ?>)</td>
                <td>
                    <?php if($row['status'] == 'Confirmed'): ?>
                        <span class="badge-confirmed">✅ Confirmed</span>
                    <?php elseif($row['status'] == 'Picked'): ?>
                        <span class="badge-picked">🚗 Picked</span>
                    <?php elseif($row['status'] == 'Dropped'): ?>
                        <span class="badge-dropped">📍 Dropped</span>
                    <?php endif; ?>
                </td>
                <td>
                    <?php if($row['status'] == 'Confirmed'): ?>
                        <form method="POST" onsubmit="return confirm('Mark this user as Picked up?')">
                            <input type="hidden" name="booking_id" value="<?php echo $row['booking_id']; ?>">
                            <input type="hidden" name="new_status" value="Picked">
                            <button type="submit" name="change_status" class="btn-picked">🚗 Mark Picked</button>
                        </form>
                    <?php elseif($row['status'] == 'Picked'): ?>
                        <form method="POST" onsubmit="return confirm('Mark this user as Dropped?')">
                            <input type="hidden" name="booking_id" value="<?php echo $row['booking_id']; ?>">
                            <input type="hidden" name="new_status" value="Dropped">
                            <button type="submit" name="change_status" class="btn-dropped">📍 Mark Dropped</button>
                        </form>
                    <?php else: ?>
                        ✅ Trip Completed
                    <?php endif; ?>
                </td>
            </tr>
        <?php endwhile; ?>
        </tbody>
    </table>
    <?php else: ?>
    <div class="no-data">No bookings assigned to you yet.</div>
    <?php endif; ?>
    </div>
</div>

</body>
</html>