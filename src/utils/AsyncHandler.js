// const asyncHandler = (requestHandler)=> {
//     return (req, res, next)=> {
//         Promise
//         .resolve(requestHandler(req, res, next))
//         .catch(err)=> next(err);
//         next();
//     }
// }

const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        data: err.data || null,
      });
    }
  };
};

export { asyncHandler };
