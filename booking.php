<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

require 'db_connection.php';

$user_id   = $_SESSION['user_id'];
$user_name = $_SESSION['user_name'];
$success   = "";
$error     = "";

if (isset($_POST['book'])) {
    $pickup  = trim($_POST['pickup_location']);
    $drop    = trim($_POST['drop_location']);
    $cab_id  = $_POST['cab_id'];
    $date    = $_POST['booking_date'];
    $time    = date('H:i:s');

    $stmt = $conn->prepare("INSERT INTO booking (user_id, cab_id, pickup_location, drop_location, booking_date, booking_time, status) VALUES (?, ?, ?, ?, ?, ?, 'Confirmed')");
    $stmt->bind_param("iissss", $user_id, $cab_id, $pickup, $drop, $date, $time);

    if ($stmt->execute()) {
        $success = "Cab booked successfully!";
    } else {
        $error = "Booking failed. Please try again.";
    }
    $stmt->close();
}

// Filters
$ac_filter   = isset($_GET['ac'])   ? $_GET['ac']   : 'All';
$type_filter = isset($_GET['type']) ? $_GET['type'] : 'All';

$where = [];
if ($ac_filter != 'All')   $where[] = "c.ac_type = '$ac_filter'";
if ($type_filter != 'All') $where[] = "c.cab_type = '$type_filter'";
$where_sql = count($where) > 0 ? "WHERE " . implode(" AND ", $where) : "";

$cabs = $conn->query("
    SELECT c.cab_id, c.cab_number, c.cab_type, c.ac_type,
           d.name as driver_name, d.phone as driver_phone
    FROM cabs c
    LEFT JOIN drivers d ON c.driver_id = d.driver_id
    $where_sql
");

$conn->close();
?>
<!DOCTYPE html>
<html>
<head>
<title>Book a Cab - Cab Management System</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; font-family:Arial,sans-serif; }
body { background:#f4f6fb; }
.navbar { display:flex; justify-content:space-between; align-items:center; padding:16px 40px; background:white; box-shadow:0 2px 10px rgba(0,0,0,0.08); }
.logo { font-size:20px; font-weight:bold; color:#2c3e50; }
.nav-right { display:flex; align-items:center; gap:16px; }
.btn-logout { padding:8px 18px; background:#e74c3c; color:white; border:none; border-radius:6px; font-size:14px; text-decoration:none; }
.btn-back { padding:8px 18px; background:#6c757d; color:white; border:none; border-radius:6px; font-size:14px; text-decoration:none; }
.nav-right span { color:#555; font-size:14px; }
.page-title { padding:30px 40px 10px 40px; }
.page-title h2 { font-size:22px; color:#2c3e50; }
.page-title p { color:#888; font-size:14px; margin-top:4px; }
.container { display:flex; gap:30px; padding:20px 40px 40px 40px; }
.form-card { background:white; padding:30px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.06); flex:1; }
.form-card h3 { font-size:18px; color:#2c3e50; margin-bottom:20px; }
label { display:block; font-size:13px; color:#555; margin-bottom:5px; margin-top:14px; }
input, select { width:100%; padding:11px 14px; border:1px solid #ddd; border-radius:7px; font-size:14px; outline:none; }
input:focus, select:focus { border-color:#007bff; }
.btn-book { width:100%; padding:12px; background:#28a745; color:white; border:none; border-radius:7px; font-size:15px; cursor:pointer; margin-top:20px; }
.btn-book:hover { background:#218838; }
.success { background:#d4edda; color:#155724; padding:10px 14px; border-radius:6px; font-size:14px; margin-bottom:16px; }
.error { background:#ffe0e0; color:#c0392b; padding:10px 14px; border-radius:6px; font-size:14px; margin-bottom:16px; }
.cab-card-wrap { flex:1; }
.cab-card-wrap h3 { font-size:18px; color:#2c3e50; margin-bottom:10px; }
.filter-section { margin-bottom:16px; }
.filter-label { font-size:12px; color:#888; margin-bottom:6px; }
.filter-btns { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px; }
.filter-btn { padding:6px 14px; border:none; border-radius:20px; cursor:pointer; font-size:12px; text-decoration:none; }
.filter-btn.active { background:#007bff; color:white; }
.filter-btn:not(.active) { background:#e9ecef; color:#333; }
.cab-card { background:white; padding:16px 20px; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.06); margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; }
.cab-info h4 { font-size:14px; color:#2c3e50; margin-bottom:4px; }
.cab-info p { font-size:12px; color:#888; margin-top:2px; }
.badges { display:flex; flex-direction:column; gap:4px; align-items:flex-end; }
.badge-ac    { padding:4px 10px; background:#d4edda; color:#155724; border-radius:20px; font-size:11px; font-weight:bold; }
.badge-nonac { padding:4px 10px; background:#fff3cd; color:#856404; border-radius:20px; font-size:11px; font-weight:bold; }
.badge-type  { padding:4px 10px; background:#e8f4fd; color:#007bff; border-radius:20px; font-size:11px; font-weight:bold; }
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
    <h2>Book a Cab</h2>
    <p>Filter by type and AC preference, then fill your trip details</p>
</div>

<div class="container">

    <!-- BOOKING FORM -->
    <div class="form-card">
        <h3>Trip Details</h3>

        <?php if ($success): ?>
            <div class="success">✅ <?php echo $success; ?> <a href="dashboard.php">View Bookings</a></div>
        <?php endif; ?>
        <?php if ($error): ?>
            <div class="error">❌ <?php echo $error; ?></div>
        <?php endif; ?>

        <form action="booking.php" method="POST">
            <label>Pickup Location</label>
            <input type="text" name="pickup_location" placeholder="Enter pickup location" required>

            <label>Drop Location</label>
            <input type="text" name="drop_location" placeholder="Enter drop location" required>

            <label>Booking Date</label>
            <input type="date" name="booking_date" min="<?php echo date('Y-m-d'); ?>" required>

            <label>Select Cab</label>
            <select name="cab_id" required>
                <option value="">-- Select a Cab --</option>
                <?php
                $conn2 = new mysqli("127.0.0.1", "root", "Jareena@2004", "cab_management");
                $all_cabs = $conn2->query("
                    SELECT c.cab_id, c.cab_number, c.cab_type, c.ac_type,
                           d.name as driver_name
                    FROM cabs c
                    LEFT JOIN drivers d ON c.driver_id = d.driver_id
                    ORDER BY c.cab_type, c.ac_type
                ");
                $current_type = '';
                while($cab = $all_cabs->fetch_assoc()):
                    if($current_type != $cab['cab_type']):
                        if($current_type != '') echo "</optgroup>";
                        echo "<optgroup label='" . $cab['cab_type'] . "'>";
                        $current_type = $cab['cab_type'];
                    endif;
                    echo "<option value='" . $cab['cab_id'] . "'>";
                    echo $cab['cab_number'] . " (" . $cab['ac_type'] . ")";
                    echo " - Driver: " . ($cab['driver_name'] ?? 'Not Assigned');
                    echo "</option>";
                endwhile;
                if($current_type != '') echo "</optgroup>";
                $conn2->close();
                ?>
            </select>

            <button type="submit" name="book" class="btn-book">🚕 Book Now</button>
        </form>
    </div>

    <!-- AVAILABLE CABS -->
    <div class="cab-card-wrap">
        <h3>Available Cabs</h3>

        <div class="filter-section">
            <div class="filter-label">Filter by AC:</div>
            <div class="filter-btns">
                <a href="booking.php?ac=All&type=<?php echo $type_filter; ?>" class="filter-btn <?php echo $ac_filter=='All'?'active':''; ?>">All</a>
                <a href="booking.php?ac=AC&type=<?php echo $type_filter; ?>" class="filter-btn <?php echo $ac_filter=='AC'?'active':''; ?>">❄️ AC</a>
                <a href="booking.php?ac=Non-AC&type=<?php echo $type_filter; ?>" class="filter-btn <?php echo $ac_filter=='Non-AC'?'active':''; ?>">🌀 Non-AC</a>
            </div>

            <div class="filter-label">Filter by Type:</div>
            <div class="filter-btns">
                <a href="booking.php?ac=<?php echo $ac_filter; ?>&type=All"     class="filter-btn <?php echo $type_filter=='All'?'active':''; ?>">All</a>
                <a href="booking.php?ac=<?php echo $ac_filter; ?>&type=Mini"    class="filter-btn <?php echo $type_filter=='Mini'?'active':''; ?>">🚗 Mini</a>
                <a href="booking.php?ac=<?php echo $ac_filter; ?>&type=Sedan"   class="filter-btn <?php echo $type_filter=='Sedan'?'active':''; ?>">🚙 Sedan</a>
                <a href="booking.php?ac=<?php echo $ac_filter; ?>&type=SUV"     class="filter-btn <?php echo $type_filter=='SUV'?'active':''; ?>">🚐 SUV</a>
                <a href="booking.php?ac=<?php echo $ac_filter; ?>&type=Premium" class="filter-btn <?php echo $type_filter=='Premium'?'active':''; ?>">⭐ Premium</a>
            </div>
        </div>

        <?php if ($cabs && $cabs->num_rows > 0):
            while($cab = $cabs->fetch_assoc()): ?>
        <div class="cab-card">
            <div class="cab-info">
                <h4>🚕 <?php echo htmlspecialchars($cab['cab_number']); ?></h4>
                <p>Driver: <?php echo htmlspecialchars($cab['driver_name'] ?? 'Not Assigned'); ?></p>
                <p>Phone: <?php echo htmlspecialchars($cab['driver_phone'] ?? '-'); ?></p>
            </div>
            <div class="badges">
                <span class="badge-type"><?php echo htmlspecialchars($cab['cab_type']); ?></span>
                <?php if($cab['ac_type'] == 'AC'): ?>
                    <span class="badge-ac">❄️ AC</span>
                <?php else: ?>
                    <span class="badge-nonac">🌀 Non-AC</span>
                <?php endif; ?>
            </div>
        </div>
        <?php endwhile;
        else: ?>
        <p style="color:#888;padding:20px;background:white;border-radius:10px;">No cabs found for this filter.</p>
        <?php endif; ?>
    </div>
</div>

</body>
</html>
