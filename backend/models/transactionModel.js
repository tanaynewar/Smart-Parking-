import db from '../config/db.js';
import { PAYMENT_STATUS } from '../config/constant.js';

const ALLOWED_SORTS = {
    "id-greatest": "transactions.id DESC",
    "id-least": "transactions.id",
    "amount-greatest": "transactions.transaction_amount DESC",
    "amount-least": "transactions.transaction_amount",
    "created-newest": "transactions.created_at DESC",
    "created-oldest": "transactions.created_at",
};

export const createTransaction = async (userId,transactionId,receiptNo,transactionAmount,transactionType ,paymentStatus,paymentMethod,paymentType) => {


    const [result] = await db.query(`
        INSERT INTO transactions (
            user_id,
            transaction_id,
            receipt_no,
            transaction_amount,
            transaction_type,
            payment_status,
            payment_method,
            payment_type
        )
        VALUES (?, ?, ?, ?, ?, ?,?,?) `, 
[userId,transactionId,receiptNo,transactionAmount,transactionType, paymentStatus,paymentMethod,paymentType]);

    return result;
};


export const getAllTransactions = async (
    search,
    status,
    type,
    sort,
    page,
    limit
) => {

    const conditions = [
        "transactions.deleted = false"
    ];

    const queryValues = [];

    // Status Filter
    if (status !== "all") {
        conditions.push(
            "payment_status = ?"
        );
        queryValues.push(status);
    }

    // Transaction Type Filter
    if (type !== "all") {
        conditions.push(
            "transaction_type = ?"
        );
        queryValues.push(type);
    }

    // Username Search
    const trimmedSearch =
        search?.trim() || "";

    if (trimmedSearch !== "") {
        conditions.push(
            "users.username LIKE ? or transactions.transaction_id LIKE ?"
        );
        queryValues.push(
            `%${trimmedSearch}%`,
            `%${trimmedSearch}%`
        );
    }

    const whereClause =
        conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

    const orderByClause = ALLOWED_SORTS[sort]
        ? `ORDER BY ${ALLOWED_SORTS[sort]}`
        : `ORDER BY ${ALLOWED_SORTS["id-greatest"]}`;

    const pageNum = Number(page) || 1;
    const lim = Number(limit) || 10;
    const offset = (pageNum - 1) * lim;

    const query = `
        SELECT transactions.*, users.username
        FROM transactions
        JOIN users
        ON transactions.user_id = users.id
        ${whereClause}
        ${orderByClause}
        LIMIT ? OFFSET ?
    `;

    const countQuery = `
        SELECT COUNT(*) AS totalTransactions
        FROM transactions
        JOIN users
        ON transactions.user_id = users.id
        ${whereClause}
    `;

    const [rows] = await db.query(
        query,
        [...queryValues, (lim),(offset)]
    );

    const [count] = await db.query(
        countQuery,
        queryValues
    );

    return {
        transactions: rows,
        totalTransactions: count[0].totalTransactions,
        currentPage: pageNum,
        transactionsPerPage: lim
    };
};
export const getTransactionById = async (id) => {

    const [rows] = await db.query(`
        SELECT *
        FROM transactions
        WHERE id = ? and deleted = false
    `, [id]);

    return rows[0];
};
export const getTransactionByTransactionId = async (transactionId) => {

    const [rows] = await db.query(`
        SELECT *
        FROM transactions
        WHERE transaction_id = ? AND deleted = false
    `, [transactionId]);

    return rows[0];
};

// ── UPDATED: now accepts page and limit for pagination ──
export const getUserTransactions = async (userId, page, limit) => {

    const pageNum = Number(page) || 1;
    const lim = Number(limit) || 10;
    const offset = (pageNum - 1) * lim;

    const [rows] = await db.query(`
        SELECT *
        FROM transactions
        WHERE user_id = ? AND deleted = false
        ORDER BY id DESC
        LIMIT ? OFFSET ?
    `, [userId, lim, offset]);

    const [count] = await db.query(`
        SELECT COUNT(*) AS totalTransactions
        FROM transactions
        WHERE user_id = ? AND deleted = false
    `, [userId]);

    return {
        transactions: rows,
        totalTransactions: count[0].totalTransactions,
        currentPage: pageNum,
        transactionsPerPage: lim
    };
};

export const updatePaymentStatus = async (transactionId,paymentStatus) => {

    const [result] = await db.query(`
        UPDATE transactions
        SET payment_status = ?
        WHERE transaction_id = ?
    `, [paymentStatus,transactionId]);

    return result;
};
export const deleteTransaction = async (transactionId) => {

    const [result] = await db.query(`

        update transactions set deleted = true , deletedAt = NOW()
        WHERE transaction_id = ?
    `, [transactionId]);

    return result;
};
export const getWalletSummary = async (
    userId
) => {

    const [transactions] =
        await db.query(
            `
            SELECT
    SUM(
        CASE
            WHEN transaction_type = 'credit'
            THEN transaction_amount
            ELSE 0
        END
    ) AS totalCredit,

    SUM(
        CASE
            WHEN transaction_type = 'debit'
            THEN transaction_amount
            ELSE 0
        END
    ) AS totalDebit

FROM transactions
WHERE user_id = ?
AND payment_status = ?
AND deleted = false
            `,
            [userId,PAYMENT_STATUS.SUCCESS]
        );

const totalCredit =
    Number(transactions[0].totalCredit || 0);

const totalDebit =
    Number(transactions[0].totalDebit || 0);

const [userRows] = await db.query(
    `
    SELECT wallet_balance
    FROM users
    WHERE id = ?
    `,
    [userId]
);
const walletBalance =
    Number(userRows[0]?.wallet_balance || 0);
    return {
    totalCredit,
    totalDebit,
    walletBalance
};
};


export const getReceiptData = async (receiptNo) => {
    const [rows] = await db.query(
        `SELECT t.*, u.username, u.email, u.car_number,
    u.phoneNumber
         FROM transactions t
         JOIN users u ON t.user_id = u.id
         WHERE t.receipt_no = ?`,
        [receiptNo]
    );

    return rows[0];
};