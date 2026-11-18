export function honeypot(req, res, next) {
  if (typeof req.body?.website === "string" && req.body.website.trim())
    return res.status(400).json({ ok: false, message: "Unable to submit this enquiry." });
  next();
}
