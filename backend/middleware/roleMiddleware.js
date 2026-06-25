import {sendError,sendSuccess}from '../config/response.js';
const roleMiddleware = (req, res, next) => {
        
       if (req.user.role !== 1) {
            return sendError(res, 403, 'Access denied');
       }

        
         next()
 }

 export default roleMiddleware
 
