import db from '../config/db.js';
const ALLOWED_SORTS = {
  "id-greatest": "id DESC",
  "id-least": "id",
  "created-newest": "createdAt DESC",
  "created-oldest": "createdAt",
  az: "username",
  za: "username DESC",
};

const userModel = {

  async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },
  
  async findById(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    return rows[0] || null;
  },
  async findByCarNumber(carNumber) {
    const [rows] = await db.execute(
      'SELECT id, username, email, phoneNumber, car_number, vehicle_type, status, role FROM users WHERE car_number = ?',
      [carNumber]
    );
    return rows[0] || null;
  },
  async getAllUsers() {

    const [rows] = await db.execute(`
        SELECT id, username, email
        FROM users
        WHERE status = 'approved'
        ORDER BY username
    `);

    return rows;
},

  async create(car_number, username, email, passwordHash, phone,vehicle_type) {
    const [result] = await db.execute(
      'INSERT INTO users (car_number,username, email, password,phoneNumber,vehicle_type) VALUES (?,?, ?, ?,?,?)',
      [car_number, username, email, passwordHash, phone, Number(vehicle_type)]
    );
    return result.insertId;
  },

  async emailExists(email) {
    const [rows] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    return rows.length > 0;
  },

  async getUsers(search, status, role, sort, page, limit) {
  const conditions = [];
  const queryValues = [];

  if (status !== "all") {
    conditions.push("status = ?");
    queryValues.push(status);
  }

  if (role !== "all") {
    conditions.push("role = ?");
    queryValues.push(role);
  }

  const trimmedSearch = search.trim();

  if (trimmedSearch !== "") {
    const searchValue = `%${trimmedSearch}%`;

    conditions.push(
      "(username LIKE ? OR email LIKE ? OR phoneNumber LIKE ?)"
    );

    queryValues.push(
      searchValue,
      searchValue,
      searchValue
    );
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const orderByClause = ALLOWED_SORTS[sort]
    ? `ORDER BY ${ALLOWED_SORTS[sort]}`
    : "";

  const pageNum = Number(page) || 1;
  const lim = Number(limit) || 10;

  const offset = (pageNum - 1) * lim;

  const usersQuery = `
    SELECT id,car_number,username,email,phoneNumber,vehicle_type,role,status, createdAt
    FROM users
    ${whereClause}
    ${orderByClause}
    LIMIT ? OFFSET ?
  `;

  const usersQueryValues = [
    ...queryValues,
    String(lim),
    String(offset),
  ];

  const [rows] = await db.execute(
    usersQuery,
    usersQueryValues
  );

  const countQuery = `
    SELECT COUNT(*) AS totalUsers
    FROM users
    ${whereClause}
  `;

  const [count] = await db.execute(
    countQuery,
    queryValues
  );

  return [
    rows || null,
    count[0].totalUsers,
    pageNum,
    lim,
  ];
},
  async approveuser(id) {
    await db.execute(
      'update users set status = "approved" where id = ?',
      [id]
    )
  },
  async rejectuser(id) {
    await db.execute(
      'update users set status = "rejected" where id = ?',
      [id]
    )
  },
  async saveQRCode(userId,qrCode) {

    const [result] = await db.query(
        `
        UPDATE users
        SET qr_code = ?
        WHERE id = ?
        `,
        [qrCode, userId]
    );

    return result;
},
async saveResetToken(email, token, expiry) {
  await db.execute(
    `UPDATE users
     SET reset_token = ?, reset_token_expiry = ?
     WHERE email = ?`,
    [token, expiry, email]
  );
},
async findByResetToken(token) {
  const [rows] = await db.execute(
    `SELECT * FROM users
     WHERE reset_token = ? AND reset_token_expiry > ?`,
    [token, Date.now()]  
  );
  return rows[0] || null;
},async updatePassword(userId, hashedPassword) {
  await db.execute(
    `UPDATE users
     SET password = ?
     WHERE id = ?`,
    [hashedPassword, userId]
  );
},
async saveOTP(email, otp, expiry) {
  await db.execute(
    `
    UPDATE users
    SET reset_otp = ?, reset_otp_expiry = ?
    WHERE email = ?
    `,
    [otp, expiry, email]
  );
},
async verifyOTP(email, otp) {
  const [rows] = await db.execute(
    `
    SELECT *
    FROM users
    WHERE email = ?
      AND reset_otp = ?
      AND reset_otp_expiry > ?
    `,
    [email, otp, Date.now()]
  );

  return rows[0] || null;
},
async clearOTP(userId) {
  await db.execute(
    `
    UPDATE users
    SET reset_otp = NULL,
        reset_otp_expiry = NULL
    WHERE id = ?
    `,
    [userId]
  );
},
async updateWalletBalance(userId, newBalance) {

    const [result] = await db.execute(
        `
        UPDATE users
        SET wallet_balance = ?
        WHERE id = ?
        `,
        [newBalance, userId]
    );

    return result;
},
async updateVehicleType(userId, vehicleType) {

    const [result] = await db.execute(
        `
        UPDATE users
        SET vehicle_type = ?
        WHERE id = ?
        `,
        [vehicleType, userId]
    );

    return result;
},
async addMoneyToWallet(userId, amount) {

  const [result] = await db.execute(
    `
    UPDATE users
    SET wallet_balance = wallet_balance + ?
    WHERE id = ?
    `,
    [amount, userId]
  );

  return result;
},
async debitMoneyFromWallet(userId, amount) {

  const [result] = await db.execute(
    `
    UPDATE users
    SET wallet_balance = wallet_balance - ?
    WHERE id = ?
    `,
    [amount, userId]
  );

  return result;
},
async updateProfile(
    userId,
    username,
    email,
    phone,
    vehicleNumber,
    vehicle_type
) {

    const [result] = await db.execute(
        `
        UPDATE users
        SET
            username = ?,
            email = ?,
            phoneNumber = ?,
            car_number = ?,
            vehicle_type = ?
        WHERE id = ?
        `,
        [
            username,
            email,
            phone,
            vehicleNumber,
            vehicle_type,
            userId
        ]
    );

    return result;
},
async getUserById(userId) {

    const [rows] = await db.execute(
        `
        SELECT
            id,
            username,
            email,
            phoneNumber,
            car_number,
            vehicle_type
        FROM users
        WHERE id = ?
        `,
        [userId]
    );

    return rows[0] || null;
}
};



export default userModel;