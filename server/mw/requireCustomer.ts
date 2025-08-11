import { RequestHandler } from 'express';

export const requireCustomer: RequestHandler = (req, res, next) => {
  const sid = req.cookies?.['hh_cust_sess'];
  
  // Check for customer session cookie and userId in session
  if (!sid || !req.session?.userId) {
    return res.status(401).json({ 
      error: 'Customer authentication required',
      code: 'CUSTOMER_AUTH_REQUIRED'
    });
  }
  
  // Ensure this is not an admin trying to use customer routes
  if (req.cookies?.['hh_admin_sess']) {
    return res.status(403).json({ 
      error: 'Admin users cannot access customer routes',
      code: 'INVALID_USER_TYPE'
    });
  }
  
  next();
};