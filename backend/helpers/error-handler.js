function errorHandler(err, req, res, next) {
  console.error("Error:", err);
  if (err.name == "UnauthorizedError") {
    return res.status(401).json({ message: "the user is not authorizes" });
  }
  if (err.name == "validationError") {
    return res.status(401).json({ message: err });
  }

  return res.status(500).json({ message: err });
}

module.exports = errorHandler;
