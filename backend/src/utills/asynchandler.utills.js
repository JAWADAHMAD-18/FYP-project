const asyncHandler = (func) => {
  return (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch((err) => {
      if (next) return next(err);
      else console.error("AsyncHandler caught error:", err);
    });
  };
};

export default asyncHandler;
