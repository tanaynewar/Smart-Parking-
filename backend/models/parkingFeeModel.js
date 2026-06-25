import db from "../config/db.js";

const parkingFeeModel = {

    async getAllFees() {

        const [rows] = await db.execute(
            `
            SELECT *
            FROM parking_fees
            ORDER BY vehicle_type
            `
        );

        return rows;
    },

    async getFeeByVehicleType(vehicleType) {

        const [rows] = await db.execute(
            `
            SELECT *
            FROM parking_fees
            WHERE vehicle_type = ?
            `,
            [Number(vehicleType)]
        );
        console.log("Rows from getFeeByVehicleType:", rows);
        return rows[0] || null;
    },

    async updateFee(vehicleType, amount) {

        const [result] = await db.execute(
            `
            UPDATE parking_fees
            SET amount = ?
            WHERE vehicle_type = ?
            `,
            [amount, vehicleType]
        );

        return result;
    }

};

export default parkingFeeModel;