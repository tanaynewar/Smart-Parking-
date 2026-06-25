import  jwt from "jsonwebtoken";
import {sendError,sendSuccess}from '../config/response.js';

const userAuth = async (req,res,next)=>{
    const{token} = req.cookies;
    if(!token){
        return sendError(res, 401, 'Not Authorized Login Again');



    }
    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        if(tokenDecode){
            req.user = tokenDecode
        }else{
            return sendError(res, 401, 'Not Authorized Login Again');

        }
        next()
    } catch (error) {
        return sendError(res, 500, error.message);
    }

    
}
export default userAuth;
