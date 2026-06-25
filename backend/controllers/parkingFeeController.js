import parkingFeeModel from "../models/parkingFeeModel.js";
export const getAllFeesController = async (
    req,
    res
) => {

    try {

        const fees =
            await parkingFeeModel.getAllFees();

        return res.status(200).json({
            success: true,
            fees
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};
export const updateFeeController = async (
    req,
    res
) => {

    try {

        const {
            vehicleType,
            amount
        } = req.body;

        if (
            !vehicleType ||
            amount === undefined
        ) {

            return res.status(400).json({
                success: false,
                message: "Vehicle type and amount are required"
            });

        }

        const fee =
            await parkingFeeModel.getFeeByVehicleType(
                vehicleType
            );

        if (!fee) {

            return res.status(404).json({
                success: false,
                message: "Fee record not found"
            });

        }

        await parkingFeeModel.updateFee(
            vehicleType,
            amount
        );

        return res.status(200).json({
            success: true,
            message: "Fee updated successfully"
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};