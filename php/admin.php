<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();

if (!isset($_SESSION['admin_id'])) {
    header("Location: admin_login.php");
    exit();
}

$conn = new mysqli("localhost", "root", "Jareena@2004", "cab_management");
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$admin_name = $_SESSION['admin_name'];
$conn->query("SET SESSION sql_mode = ''");

// Handle driver status change
if (isset($_POST['change_driver_status'])) {
    $driver_id  = $_POST['driver_id'];
    $new_status = $_POST['driver_status'];
    $stmt = $conn->prepare("UPDATE drivers SET status=? WHERE driver_id=?");
    $stmt->bind_param("si", $new_status, $driver_id);
    $stmt->execute();
    $stmt->close();
    header("Location: admin.php?tab=drivers");
    exit();
}

// Get active tab
$active_tab = isset($_GET['tab']) ? $_GET['tab'] : 'bookings';

// Count stats
$total_users     = $conn->query("SELECT COUNT(*) as cnt FROM users")->fetch_assoc()['cnt'];
$total_bookings  = $conn->query("SELECT COUNT(*) as cnt FROM booking")->fetch_assoc()['cnt'];
$total_cabs      = $conn->query("SELECT COUNT(*) as cnt FROM cabs")->fetch_assoc()['cnt'];
$total_drivers   = $conn->query("SELECT COUNT(*) as cnt FROM drivers WHERE status='Approved'")->fetch_assoc()['cnt'];
$pending_drivers = $conn->query("SELECT COUNT(*) as cnt FROM drivers WHERE status='Pending'")->fetch_assoc()['cnt'];
$active_trips    = $conn->query("SELECT COUNT(*) as cnt FROM booking WHERE status='Picked'")->fetch_assoc()['cnt'];
$total_dropped   = $conn->query("SELECT COUNT(*) as cnt FROM booking WHERE status='Dropped'")->fetch_assoc()['cnt'];

// Get all bookings
$bookings = $conn->query("
    SELECT b.booking_id, b.booking_date, b.booking_time,
           b.pickup_location, b.drop_location, b.status,
           u.name as user_name, u.phone as user_phone, u.email as user_email,
           c.cab_number, c.cab_type, c.ac_type,
           d.name as driver_name, d.phone as driver_phone, d.license_no
    FROM booking b
    LEFT JOIN users u ON b.user_id = u.user_id
    LEFT JOIN cabs c ON b.cab_id = c.cab_id
    LEFT JOIN drivers d ON c.driver_id = d.driver_id
    ORDER BY b.booking_date DESC, b.booking_time DESC
");

// Get all users
$users = $conn->query("
    SELECT u.user_id, u.name, u.phone, u.email,
           COUNT(b.booking_id) as total_bookings
    FROM users u
    LEFT JOIN booking b ON u.user_id = b.user_id
    GROUP BY u.user_id
    ORDER BY u.user_id DESC
");

// Get all drivers
$drivers = $conn->query("
    SELECT d.driver_id, d.name, d.phone, d.email, d.license_no, d.status,
           c.cab_number, c.cab_type, c.ac_type,
           COUNT(b.booking_id) as total_trips
    FROM drivers d
    LEFT JOIN cabs c ON d.driver_id = c.driver_id
    LEFT JOIN booking b ON c.cab_id = b.cab_id
    GROUP BY d.driver_id
    ORDER BY
        CASE d.status
            WHEN 'Pending'  THEN 1
            WHEN 'Approved' THEN 2
            WHEN 'Removed'  THEN 3
        END
");

// Get all cabs
$cabs = $conn->query("
    SELECT c.cab_id, c.cab_number, c.cab_type, c.ac_type,
           d.name as driver_name, d.phone as driver_phone, d.status as driver_status,
           COUNT(b.booking_id) as total_bookings
    FROM cabs c
    LEFT JOIN drivers d ON c.driver_id = d.driver_id
    LEFT JOIN booking b ON c.cab_id = b.cab_id
    GROUP BY c.cab_id
");

// Get active trips
$active = $conn->query("
    SELECT b.booking_id, b.pickup_location, b.drop_location, b.booking_date, b.booking_time,
           u.name as user_name, u.phone as user_phone,
           d.name as driver_name, d.phone as driver_phone,
           c.cab_number, c.cab_type, c.ac_type
    FROM booking b
    LEFT JOIN users u ON b.user_id = u.user_id
    LEFT JOIN cabs c ON b.cab_id = c.cab_id
    LEFT JOIN drivers d ON c.driver_id = d.driver_id
    WHERE b.status = 'Picked'
    ORDER BY b.booking_date DESC
");

$conn->close();
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="30">
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
.stats-row { display:flex; gap:16px; margin:0 40px 30px 40px; flex-wrap:wrap; }
.stat-card { background:white; padding:18px 20px; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.06); flex:1; text-align:center; min-width:120px; }
.stat-card h2 { font-size:28px; color:#e74c3c; }
.stat-card.blue h2 { color:#007bff; }
.stat-card.green h2 { color:#28a745; }
.stat-card.orange h2 { color:#ffc107; }
.stat-card.purple h2 { color:#6f42c1; }
.stat-card p { font-size:12px; color:#888; margin-top:4px; }
.section { margin:0 40px 40px 40px; }
.tabs { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
.tab { padding:10px 20px; border-radius:8px; cursor:pointer; font-size:13px; font-weight:bold; border:none; text-decoration:none; display:inline-block; }
.tab.active { background:#2c3e50; color:white; }
.tab:not(.active) { background:#e9ecef; color:#333; }
.tab-content { display:none; }
.tab-content.active { display:block; }
.table-wrap { overflow-x:auto; }
table { width:100%; border-collapse:collapse; background:white; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06); min-width:800px; }
thead { background:#2c3e50; color:white; }
thead th { padding:12px 14px; text-align:left; font-size:12px; }
tbody td { padding:10px 14px; font-size:12px; color:#444; border-bottom:1px solid #f0f0f0; vertical-align:middle; }
tbody tr:hover { background:#f8f9ff; }
tbody tr:last-child td { border-bottom:none; }
.badge-confirmed { background:#d4edda; color:#155724; padding:3px 8px; border-radius:20px; font-size:10px; font-weight:bold; }
.badge-cancelled { background:#ffe0e0; color:#c0392b; padding:3px 8px; border-radius:20px; font-size:10px; font-weight:bold; }
.badge-picked    { background:#fff3cd; color:#856404; padding:3px 8px; border-radius:20px; font-size:10px; font-weight:bold; }
.badge-dropped   { background:#cce5ff; color:#004085; padding:3px 8px; border-radius:20px; font-size:10px; font-weight:bold; }
.badge-approved  { background:#d4edda; color:#155724; padding:3px 8px; border-radius:20px; font-size:10px; font-weight:bold; }
.badge-pending   { background:#fff3cd; color:#856404; padding:3px 8px; border-radius:20px; font-size:10px; font-weight:bold; }
.badge-removed   { background:#ffe0e0; color:#c0392b; padding:3px 8px; border-radius:20px; font-size:10px; font-weight:bold; }
.btn-approve { padding:4px 10px; background:#28a745; color:white; border:none; border-radius:4px; cursor:pointer; font-size:11px; margin:2px; }
.btn-remove  { padding:4px 10px; background:#e74c3c; color:white; border:none; border-radius:4px; cursor:pointer; font-size:11px; margin:2px; }
.btn-readd   { padding:4px 10px; background:#007bff; color:white; border:none; border-radius:4px; cursor:pointer; font-size:11px; margin:2px; }
.pending-row { background:#fffde7 !important; }
.active-trip-card { background:white; border-radius:10px; padding:20px; margin-bottom:14px; box-shadow:0 2px 8px rgba(0,0,0,0.06); border-left:4px solid #ffc107; }
.active-trip-card h4 { color:#2c3e50; margin-bottom:12px; font-size:15px; }
.trip-details { display:flex; gap:30px; flex-wrap:wrap; }
.trip-detail { font-size:13px; color:#555; }
.trip-detail strong { color:#2c3e50; display:block; font-size:11px; color:#888; margin-bottom:2px; }
.no-data { text-align:center; padding:40px; color:#888; background:white; border-radius:10px; }
</style>
</head>
<body>

<div class="navbar">
    <div class="logo">&#128274; Admin Panel</div>
    <div class="nav-right">
        <span>Welcome, <?php echo htmlspecialchars($admin_name); ?>!</span>
        <a class="btn-logout" href="admin_logout.php">Logout</a>
    </div>
</div>

<div class="welcome-card">
    <h1>Admin Dashboard &#128661;</h1>
    <p>Complete overview of all users, drivers, cabs, bookings and active trips.</p>
    <p style="margin-top:8px;font-size:12px;opacity:0.7;">&#128308; Page auto refreshes every 30 seconds &nbsp;|&nbsp; Last updated: <?php echo date('h:i:s A'); ?></p>
</div>

<!-- STATS -->
<div class="stats-row">
    <div class="stat-card blue">
        <h2><?php echo $total_users; ?></h2>
        <p>Total Users</p>
    </div>
    <div class="stat-card">
        <h2><?php echo $total_bookings; ?></h2>
        <p>Total Bookings</p>
    </div>
    <div class="stat-card green">
        <h2><?php echo $total_drivers; ?></h2>
        <p>Active Drivers</p>
    </div>
    <div class="stat-card orange">
        <h2><?php echo $pending_drivers; ?></h2>
        <p>Pending Drivers</p>
    </div>
    <div class="stat-card purple">
        <h2><?php echo $total_cabs; ?></h2>
        <p>Total Cabs</p>
    </div>
    <div class="stat-card" style="border-left:4px solid #ffc107;">
        <h2 style="color:#ffc107;"><?php echo $active_trips; ?></h2>
        <p>Active Trips Now</p>
    </div>
    <div class="stat-card green">
        <h2><?php echo $total_dropped; ?></h2>
        <p>Completed Trips</p>
    </div>
</div>

<!-- TABS -->
<div class="section">
    <div class="tabs">
        <a href="admin.php?tab=bookings" class="tab <?php echo $active_tab=='bookings'?'active':''; ?>">&#128203; All Bookings (<?php echo $total_bookings; ?>)</a>
        <a href="admin.php?tab=active"   class="tab <?php echo $active_tab=='active'?'active':''; ?>">&#128661; Active Trips (<?php echo $active_trips; ?>)</a>
        <a href="admin.php?tab=users"    class="tab <?php echo $active_tab=='users'?'active':''; ?>">&#128100; Users (<?php echo $total_users; ?>)</a>
        <a href="admin.php?tab=drivers"  class="tab <?php echo $active_tab=='drivers'?'active':''; ?>">&#128663; Drivers <?php if($pending_drivers>0) echo "($pending_drivers pending)"; ?></a>
        <a href="admin.php?tab=cabs"     class="tab <?php echo $active_tab=='cabs'?'active':''; ?>">&#128661; Cabs (<?php echo $total_cabs; ?>)</a>
    </div>

    <!-- ALL BOOKINGS -->
    <div class="tab-content <?php echo $active_tab=='bookings'?'active':''; ?>">
        <div class="table-wrap">
        <?php if ($bookings && $bookings->num_rows > 0): ?>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>User Name</th>
                    <th>User Phone</th>
                    <th>Pickup</th>
                    <th>Drop</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Cab No</th>
                    <th>Cab Type</th>
                    <th>AC</th>
                    <th>Driver</th>
                    <th>Driver Phone</th>
                    <th>License</th>
                    <th>Status</th>
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
                    <td><?php echo htmlspecialchars($row['cab_number'] ?? '-'); ?></td>
                    <td><?php echo htmlspecialchars($row['cab_type'] ?? '-'); ?></td>
                    <td><?php echo htmlspecialchars($row['ac_type'] ?? '-'); ?></td>
                    <td><?php echo htmlspecialchars($row['driver_name'] ?? '-'); ?></td>
                    <td><?php echo htmlspecialchars($row['driver_phone'] ?? '-'); ?></td>
                    <td><?php echo htmlspecialchars($row['license_no'] ?? '-'); ?></td>
                    <td>
                        <?php if($row['status']=='Confirmed'): ?>
                            <span class="badge-confirmed">&#10003; Confirmed</span>
                        <?php elseif($row['status']=='Picked'): ?>
                            <span class="badge-picked">&#128661; Picked</span>
                        <?php elseif($row['status']=='Dropped'): ?>
                            <span class="badge-dropped">&#128205; Dropped</span>
                        <?php else: ?>
                            <span class="badge-cancelled">&#10007; Cancelled</span>
                        <?php endif; ?>
                    </td>
                </tr>
            <?php endwhile; ?>
            </tbody>
        </table>
        <?php else: ?>
        <div class="no-data">No bookings found.</div>
        <?php endif; ?>
        </div>
    </div>

    <!-- ACTIVE TRIPS -->
    <div class="tab-content <?php echo $active_tab=='active'?'active':''; ?>">
        <?php if ($active && $active->num_rows > 0):
            while($row = $active->fetch_assoc()): ?>
        <div class="active-trip-card">
            <h4>&#128661; Trip #<?php echo $row['booking_id']; ?> — Currently On Trip</h4>
            <div class="trip-details">
                <div class="trip-detail">
                    <strong>User Name</strong>
                    <?php echo htmlspecialchars($row['user_name'] ?? '-'); ?>
                </div>
                <div class="trip-detail">
                    <strong>User Phone</strong>
                    <?php echo htmlspecialchars($row['user_phone'] ?? '-'); ?>
                </div>
                <div class="trip-detail">
                    <strong>Pickup Location</strong>
                    <?php echo htmlspecialchars($row['pickup_location']); ?>
                </div>
                <div class="trip-detail">
                    <strong>Drop Location</strong>
                    <?php echo htmlspecialchars($row['drop_location']); ?>
                </div>
                <div class="trip-detail">
                    <strong>Driver Name</strong>
                    <?php echo htmlspecialchars($row['driver_name'] ?? '-'); ?>
                </div>
                <div class="trip-detail">
                    <strong>Driver Phone</strong>
                    <?php echo htmlspecialchars($row['driver_phone'] ?? '-'); ?>
                </div>
                <div class="trip-detail">
                    <strong>Cab Number</strong>
                    <?php echo htmlspecialchars($row['cab_number'] ?? '-'); ?>
                </div>
                <div class="trip-detail">
                    <strong>Cab Type</strong>
                    <?php echo htmlspecialchars($row['cab_type'] ?? '-'); ?>
                </div>
                <div class="trip-detail">
                    <strong>Booking Date</strong>
                    <?php echo $row['booking_date']; ?>
                </div>
                <div class="trip-detail">
                    <strong>Booking Time</strong>
                    <?php echo $row['booking_time'] ?? '-'; ?>
                </div>
            </div>
        </div>
        <?php endwhile;
        else: ?>
        <div class="no-data">No active trips right now.</div>
        <?php endif; ?>
    </div>

    <!-- ALL USERS -->
    <div class="tab-content <?php echo $active_tab=='users'?'active':''; ?>">
        <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Total Bookings</th>
                </tr>
            </thead>
            <tbody>
            <?php $i=1; while($row = $users->fetch_assoc()): ?>
                <tr>
                    <td><?php echo $i++; ?></td>
                    <td><?php echo htmlspecialchars($row['name']); ?></td>
                    <td><?php echo htmlspecialchars($row['phone']); ?></td>
                    <td><?php echo htmlspecialchars($row['email'] ?? '-'); ?></td>
                    <td><?php echo $row['total_bookings']; ?></td>
                </tr>
            <?php endwhile; ?>
            </tbody>
        </table>
        </div>
    </div>

    <!-- ALL DRIVERS -->
    <div class="tab-content <?php echo $active_tab=='drivers'?'active':''; ?>">
        <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>License No</th>
                    <th>Cab Number</th>
                    <th>Cab Type</th>
                    <th>Total Trips</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
            <?php $i=1; while($row = $drivers->fetch_assoc()): ?>
                <tr class="<?php echo $row['status']=='Pending'?'pending-row':''; ?>">
                    <td><?php echo $i++; ?></td>
                    <td><?php echo htmlspecialchars($row['name']); ?></td>
                    <td><?php echo htmlspecialchars($row['phone']); ?></td>
                    <td><?php echo htmlspecialchars($row['email'] ?? '-'); ?></td>
                    <td><?php echo htmlspecialchars($row['license_no']); ?></td>
                    <td><?php echo htmlspecialchars($row['cab_number'] ?? 'Not Assigned'); ?></td>
                    <td><?php echo htmlspecialchars($row['cab_type'] ?? '-'); ?></td>
                    <td><?php echo $row['total_trips']; ?></td>
                    <td>
                        <?php if($row['status']=='Approved'): ?>
                            <span class="badge-approved">&#10003; Approved</span>
                        <?php elseif($row['status']=='Pending'): ?>
                            <span class="badge-pending">&#9203; Pending</span>
                        <?php else: ?>
                            <span class="badge-removed">&#10007; Removed</span>
                        <?php endif; ?>
                    </td>
                    <td>
                        <?php if($row['status']=='Pending'): ?>
                            <form method="POST" style="display:inline">
                                <input type="hidden" name="driver_id" value="<?php echo $row['driver_id']; ?>">
                                <input type="hidden" name="driver_status" value="Approved">
                                <button type="submit" name="change_driver_status" class="btn-approve">&#10003; Approve</button>
                            </form>
                            <form method="POST" style="display:inline">
                                <input type="hidden" name="driver_id" value="<?php echo $row['driver_id']; ?>">
                                <input type="hidden" name="driver_status" value="Removed">
                                <button type="submit" name="change_driver_status" class="btn-remove" onclick="return confirm('Reject this driver?')">&#10007; Reject</button>
                            </form>
                        <?php elseif($row['status']=='Approved'): ?>
                            <form method="POST" style="display:inline">
                                <input type="hidden" name="driver_id" value="<?php echo $row['driver_id']; ?>">
                                <input type="hidden" name="driver_status" value="Removed">
                                <button type="submit" name="change_driver_status" class="btn-remove" onclick="return confirm('Remove this driver?')">&#128683; Remove</button>
                            </form>
                        <?php elseif($row['status']=='Removed'): ?>
                            <form method="POST" style="display:inline">
                                <input type="hidden" name="driver_id" value="<?php echo $row['driver_id']; ?>">
                                <input type="hidden" name="driver_status" value="Approved">
                                <button type="submit" name="change_driver_status" class="btn-readd" onclick="return confirm('Add this driver back?')">&#43; Add Again</button>
                            </form>
                        <?php endif; ?>
                    </td>
                </tr>
            <?php endwhile; ?>
            </tbody>
        </table>
        </div>
    </div>

    <!-- ALL CABS -->
    <div class="tab-content <?php echo $active_tab=='cabs'?'active':''; ?>">
        <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Cab Number</th>
                    <th>Cab Type</th>
                    <th>AC Type</th>
                    <th>Driver Name</th>
                    <th>Driver Phone</th>
                    <th>Driver Status</th>
                    <th>Total Bookings</th>
                </tr>
            </thead>
            <tbody>
            <?php $i=1; while($row = $cabs->fetch_assoc()): ?>
                <tr>
                    <td><?php echo $i++; ?></td>
                    <td><?php echo htmlspecialchars($row['cab_number']); ?></td>
                    <td><?php echo htmlspecialchars($row['cab_type']); ?></td>
                    <td><?php echo htmlspecialchars($row['ac_type']); ?></td>
                    <td><?php echo htmlspecialchars($row['driver_name'] ?? 'Not Assigned'); ?></td>
                    <td><?php echo htmlspecialchars($row['driver_phone'] ?? '-'); ?></td>
                    <td>
                        <?php if($row['driver_status']=='Approved'): ?>
                            <span class="badge-approved">&#10003; Approved</span>
                        <?php elseif($row['driver_status']=='Pending'): ?>
                            <span class="badge-pending">&#9203; Pending</span>
                        <?php elseif($row['driver_status']=='Removed'): ?>
                            <span class="badge-removed">&#10007; Removed</span>
                        <?php else: ?>
                            -
                        <?php endif; ?>
                    </td>
                    <td><?php echo $row['total_bookings']; ?></td>
                </tr>
            <?php endwhile; ?>
            </tbody>
        </table>
        </div>
    </div>

</div>

</body>
</html>