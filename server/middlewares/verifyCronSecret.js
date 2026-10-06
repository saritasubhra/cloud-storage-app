// Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` on
// requests it makes to trigger a configured Cron Job (see vercel.json),
// using whatever value you've set for the CRON_SECRET environment
// variable in the project settings. This middleware checks for that
// exact header so the purge endpoint can't be triggered by anyone else
// who happens to find the URL.
const verifyCronSecret = (req, res, next) => {
  if (!process.env.CRON_SECRET) {
    // Fail closed rather than silently allowing unauthenticated access
    console.error("CRON_SECRET is not configured - refusing cron request");
    return res.status(500).json({
      success: false,
      message: "Server is not configured for this operation",
    });
  }

  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  next();
};

export default verifyCronSecret;
