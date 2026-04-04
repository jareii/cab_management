const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Jareena@2004',
    database: 'cab_management'
  });
  const [drivers] = await conn.execute('SELECT driver_id,name,email,phone FROM drivers');
  console.log('drivers', drivers);
  const [active] = await conn.execute("SELECT booking_id,status,driver_id,cab_id FROM booking WHERE status IN ('Confirmed','Picked')");
  console.log('active bookings', active);
  await conn.end();
})();