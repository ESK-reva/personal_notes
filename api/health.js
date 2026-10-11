
export default function handler(req, res) {
    res.status(200).json({
        message: "SHREYA backend is running",
        version: "vercel-function"
    });
}
